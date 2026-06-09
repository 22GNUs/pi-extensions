import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { AgentMessage } from "@earendil-works/pi-agent-core"
import { complete, type Message } from "@earendil-works/pi-ai"
import type { AutocompleteItem } from "@earendil-works/pi-tui"
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent"
import { buildSessionContext } from "@earendil-works/pi-coding-agent"
import { pickRenameModel } from "./model-picker.js"
import {
  deleteRenameConfig,
  formatAuthModelKey,
  formatModelPreference,
  formatRenameModelKey,
  getAuthenticatedTextModelPreferences,
  getRenameModelAuth,
  resolveInitialModelConfig,
  saveModelPreference,
  type RenameModelConfig,
} from "./models.js"
import { redactSecrets, sanitizeRenameText } from "./sanitize.js"

const execFileAsync = promisify(execFile)
const RENAME_MAX_TOKENS = 80
const RENAME_REQUEST_TIMEOUT_MS = 30_000

const RENAME_SYSTEM_PROMPT = `Name this coding-agent session.

Return one lowercase hyphen-separated session name only.
Use plain text, no quotes, no markdown, no trailing punctuation.
Prefer an action-oriented task name like fix-auth-callback or design-pi-rename.
Stay under 60 characters.`

interface SessionContextReader {
  buildSessionContext(): { messages: AgentMessage[] }
}

interface RenameState {
  modelConfig: RenameModelConfig
}

interface UserMessageContext {
  readonly first: string
  readonly recent: string[]
  readonly count: number
}

const RENAME_SUBCOMMANDS: AutocompleteItem[] = [
  {
    value: "status",
    label: "status",
    description: "Show model and rename status",
  },
  {
    value: "config",
    label: "config",
    description: "Choose the rename model",
  },
  {
    value: "help",
    label: "help",
    description: "List rename commands",
  },
]

function createRenameState(): RenameState {
  return {
    modelConfig: { kind: "missing" },
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }
  return value as Record<string, unknown>
}

interface HerdrTabInfo {
  readonly id: string
  readonly label?: string
  readonly number?: number
}

function extractTabId(stdout: string): string | undefined {
  const parsed = asRecord(JSON.parse(stdout) as unknown)
  const result = asRecord(parsed?.["result"])
  const pane = asRecord(result?.["pane"])
  const tabId = pane?.["tab_id"]
  return typeof tabId === "string" && tabId.trim() ? tabId : undefined
}

function extractTabInfo(stdout: string): HerdrTabInfo | undefined {
  const parsed = asRecord(JSON.parse(stdout) as unknown)
  const result = asRecord(parsed?.["result"])
  const tab = asRecord(result?.["tab"])
  const tabId = tab?.["tab_id"]

  if (typeof tabId !== "string" || !tabId.trim()) return undefined

  const label = tab?.["label"]
  const number = tab?.["number"]

  return {
    id: tabId,
    ...(typeof label === "string" ? { label } : {}),
    ...(typeof number === "number" ? { number } : {}),
  }
}

async function getCurrentHerdrTabId(): Promise<string | undefined> {
  const paneId = process.env["HERDR_PANE_ID"]?.trim()
  if (!paneId) return undefined

  const { stdout } = await execFileAsync("herdr", ["pane", "get", paneId])
  return extractTabId(stdout)
}

async function getCurrentHerdrTabInfo(): Promise<HerdrTabInfo | undefined> {
  const tabId = await getCurrentHerdrTabId()
  if (!tabId) return undefined

  const { stdout } = await execFileAsync("herdr", ["tab", "get", tabId])
  return extractTabInfo(stdout)
}

function isDefaultHerdrTabLabel(tab: HerdrTabInfo): boolean {
  const label = tab.label?.trim()
  if (!label) return true

  return typeof tab.number === "number" && label === String(tab.number)
}

async function renameCurrentHerdrTab(name: string): Promise<boolean> {
  const tabId = await getCurrentHerdrTabId()
  if (!tabId) return false

  await execFileAsync("herdr", ["tab", "rename", tabId, name])
  return true
}

async function renameCurrentHerdrTabIfDefault(name: string): Promise<boolean> {
  const tab = await getCurrentHerdrTabInfo()
  if (!tab || tab.label?.trim() === name || !isDefaultHerdrTabLabel(tab)) {
    return false
  }

  await execFileAsync("herdr", ["tab", "rename", tab.id, name])
  return true
}

async function resetCurrentHerdrTabIfNamed(name: string): Promise<boolean> {
  const tab = await getCurrentHerdrTabInfo()
  if (!tab || tab.label?.trim() !== name || tab.number === undefined) {
    return false
  }

  await execFileAsync("herdr", ["tab", "rename", tab.id, String(tab.number)])
  return true
}

function hasSessionContextReader(
  value: unknown,
): value is SessionContextReader {
  return (
    typeof value === "object" &&
    value !== null &&
    "buildSessionContext" in value &&
    typeof value.buildSessionContext === "function"
  )
}

function getCurrentSessionMessages(ctx: ExtensionContext): AgentMessage[] {
  if (hasSessionContextReader(ctx.sessionManager)) {
    return ctx.sessionManager.buildSessionContext().messages
  }

  return buildSessionContext(
    ctx.sessionManager.getEntries(),
    ctx.sessionManager.getLeafId(),
  ).messages
}

function extractTextContent(
  content:
    | string
    | readonly { readonly type: string; readonly text?: string }[],
): string {
  if (typeof content === "string") return content

  return content
    .filter(
      (item): item is { readonly type: string; readonly text: string } =>
        item.type === "text" && typeof item.text === "string",
    )
    .map((item) => item.text)
    .join("\n")
}

function hasTextContent(message: AgentMessage): message is AgentMessage & {
  content: string | readonly { readonly type: string; readonly text?: string }[]
} {
  return "content" in message
}

function getUserMessageContext(
  messages: readonly AgentMessage[],
): UserMessageContext | undefined {
  const userMessages: { index: number; text: string }[] = []

  for (const [index, message] of messages.entries()) {
    if (message.role !== "user" || !hasTextContent(message)) continue

    const text = redactSecrets(extractTextContent(message.content)).trim()
    if (text) userMessages.push({ index, text })
  }

  const firstMessage = userMessages[0]
  if (!firstMessage) return undefined

  const recentMessages = userMessages
    .slice(-3)
    .filter((message) => message.index !== firstMessage.index)

  return {
    first: firstMessage.text,
    recent: recentMessages.map((message) => message.text),
    count: 1 + recentMessages.length,
  }
}

function buildRenamePrompt(context: UserMessageContext): Message {
  const recent = context.recent.length
    ? context.recent
        .map((message, index) => `${index + 1}. ${message}`)
        .join("\n")
    : "none"

  return {
    role: "user",
    content: [
      {
        type: "text",
        text: `## Naming context\n\nFirst user message:\n${context.first}\n\nRecent user messages:\n${recent}`,
      },
    ],
    timestamp: Date.now(),
  }
}

function extractModelText(
  content:
    | string
    | readonly { readonly type: string; readonly text?: string }[],
): string {
  return extractTextContent(content)
}

function fallbackName(context: UserMessageContext): string | undefined {
  const latest = context.recent.at(-1) ?? context.first
  return sanitizeRenameText(latest)
}

async function generateRename(
  ctx: ExtensionContext,
  state: RenameState,
  context: UserMessageContext,
): Promise<
  | { readonly source: "model"; readonly name: string }
  | {
      readonly source: "fallback"
      readonly name: string
      readonly reason: string
    }
  | undefined
> {
  try {
    const modelAuth = await getRenameModelAuth(ctx, state.modelConfig)

    if (modelAuth.status === "ok") {
      const response = await complete(
        modelAuth.auth.model,
        {
          systemPrompt: RENAME_SYSTEM_PROMPT,
          messages: [buildRenamePrompt(context)],
        },
        {
          apiKey: modelAuth.auth.apiKey,
          ...(modelAuth.auth.headers
            ? { headers: modelAuth.auth.headers }
            : {}),
          maxTokens: RENAME_MAX_TOKENS,
          maxRetries: 0,
          cacheRetention: "none",
          timeoutMs: RENAME_REQUEST_TIMEOUT_MS,
        },
      )

      if (response.stopReason === "stop") {
        const name = sanitizeRenameText(extractModelText(response.content))
        if (name) return { source: "model", name }
      }

      const name = fallbackName(context)
      return name
        ? {
            source: "fallback",
            name,
            reason: `rename model stopped with ${response.stopReason}`,
          }
        : undefined
    }

    const name = fallbackName(context)
    if (!name) return undefined

    if (modelAuth.status === "invalid-config") {
      return {
        source: "fallback",
        name,
        reason: "invalid rename model config",
      }
    }

    const modelName = modelAuth.model
      ? formatRenameModelKey(modelAuth.model)
      : "unknown"
    return {
      source: "fallback",
      name,
      reason: `rename model is not authenticated: ${modelName}`,
    }
  } catch (error) {
    const name = fallbackName(context)
    if (!name) return undefined
    const reason = error instanceof Error ? error.message : String(error)
    return { source: "fallback", name, reason }
  }
}

async function applyRename(pi: ExtensionAPI, name: string): Promise<boolean> {
  pi.setSessionName(name)
  return renameCurrentHerdrTab(name)
}

async function runRenameCommand(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  state: RenameState,
): Promise<void> {
  const context = getUserMessageContext(getCurrentSessionMessages(ctx))
  if (!context) {
    ctx.ui.notify("No conversation to rename yet.", "warning")
    return
  }

  const result = await generateRename(ctx, state, context)
  if (!result) {
    ctx.ui.notify("Could not generate a session name.", "error")
    return
  }

  let renamedHerdr = false
  let herdrError: string | undefined

  try {
    renamedHerdr = await applyRename(pi, result.name)
  } catch (error) {
    herdrError = error instanceof Error ? error.message : String(error)
  }

  if (result.source === "fallback") {
    ctx.ui.notify(
      [
        `Session renamed with fallback: ${result.name}`,
        `Could not use rename model: ${result.reason}`,
        ...(herdrError ? [`Herdr tab rename failed: ${herdrError}`] : []),
      ].join("\n"),
      "warning",
    )
    return
  }

  if (herdrError) {
    ctx.ui.notify(
      `Session renamed, but Herdr tab rename failed: ${herdrError}`,
      "warning",
    )
    return
  }

  ctx.ui.notify(
    renamedHerdr
      ? `Session and Herdr tab renamed: ${result.name}`
      : `Session renamed: ${result.name}`,
    "info",
  )
}

function getRenameArgumentCompletions(
  prefix: string,
): AutocompleteItem[] | null {
  const query = prefix.trimStart().toLowerCase()
  const items = RENAME_SUBCOMMANDS.filter((item) =>
    item.value.startsWith(query),
  )
  return items.length > 0 ? items : null
}

async function configureRenameModel(
  ctx: ExtensionContext,
  state: RenameState,
): Promise<void> {
  const models = await getAuthenticatedTextModelPreferences(ctx)
  if (models.length === 0) {
    ctx.ui.notify(
      "No authenticated models available. Run /login or configure a model first.",
      "error",
    )
    return
  }

  const result = await pickRenameModel(ctx, models)
  if (result.action === "cancel") return

  try {
    if (result.action === "default") {
      deleteRenameConfig()
      state.modelConfig = { kind: "missing" }
      ctx.ui.notify("Rename model reset to default.", "info")
      return
    }

    saveModelPreference(result.model)
    state.modelConfig = { kind: "configured", model: result.model }
    ctx.ui.notify(
      `Rename model set to ${formatRenameModelKey(result.model)}.`,
      "info",
    )
  } catch (error) {
    const reason =
      error instanceof SyntaxError ? "invalid JSON" : "write failed"
    ctx.ui.notify(`Could not update rename config: ${reason}.`, "error")
  }
}

async function notifyRenameStatus(
  ctx: ExtensionContext,
  state: RenameState,
): Promise<void> {
  let selectedModelLine = `selected model: ${formatModelPreference(state.modelConfig)}`
  let activeModelLine: string

  try {
    const modelAuth = await getRenameModelAuth(ctx, state.modelConfig)
    if (modelAuth.status === "ok") {
      const suffix = modelAuth.source === "default" ? " (default)" : ""
      selectedModelLine = `selected model: ${formatAuthModelKey(modelAuth.auth)}${suffix}`
      activeModelLine = `active model: ${formatAuthModelKey(modelAuth.auth)}`
    } else if (modelAuth.status === "invalid-config") {
      activeModelLine = "active model: none (invalid config)"
    } else {
      activeModelLine = "active model: none"
    }
  } catch {
    activeModelLine = "active model: unknown (auth check failed)"
  }

  const context = getUserMessageContext(getCurrentSessionMessages(ctx))
  const herdrLine = `herdr tab: ${process.env["HERDR_PANE_ID"]?.trim() ? "available" : "unavailable"}`
  const contextLine = `context: ${context?.count ?? 0} user messages`

  ctx.ui.notify(
    [
      "pi-rename status",
      selectedModelLine,
      activeModelLine,
      herdrLine,
      contextLine,
    ].join("\n"),
    "info",
  )
}

function registerRenameCommand(pi: ExtensionAPI, state: RenameState): void {
  pi.registerCommand("rename", {
    description: "generate a session name",
    getArgumentCompletions: getRenameArgumentCompletions,
    handler: async (args, ctx) => {
      const action = args.trim().split(/\s+/u)[0]?.toLowerCase() ?? ""

      if (!action) {
        await runRenameCommand(pi, ctx, state)
        return
      }

      if (action === "help") {
        ctx.ui.notify(
          [
            "pi-rename commands",
            "/rename - generate and apply a session name",
            "/rename status - show model and rename status",
            "/rename config - choose the rename model",
            "/rename help - show this help",
          ].join("\n"),
          "info",
        )
        return
      }

      if (action === "status") {
        await notifyRenameStatus(ctx, state)
        return
      }

      if (action === "config") {
        await configureRenameModel(ctx, state)
        return
      }

      ctx.ui.notify("Use /rename [config|help|status]", "error")
    },
  })
}

export default function (pi: ExtensionAPI): void {
  const state = createRenameState()

  registerRenameCommand(pi, state)

  pi.on("session_start", async () => {
    state.modelConfig = resolveInitialModelConfig()

    const sessionName = pi.getSessionName()?.trim()
    if (!sessionName) return

    try {
      await renameCurrentHerdrTabIfDefault(sessionName)
    } catch {
      // Keep session startup quiet if Herdr is unavailable or rejects the rename.
    }
  })

  pi.on("session_shutdown", async (event) => {
    if (event.reason !== "quit") return

    const sessionName = pi.getSessionName()?.trim()
    if (!sessionName) return

    try {
      await resetCurrentHerdrTabIfNamed(sessionName)
    } catch {
      // Keep session shutdown quiet if Herdr is unavailable or rejects the rename.
    }
  })
}
