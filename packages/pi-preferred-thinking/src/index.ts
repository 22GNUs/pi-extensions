import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import {
  getAgentDir,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent"

type ThinkingLevel = Parameters<ExtensionAPI["setThinkingLevel"]>[0]

type PreferredThinkingConfig = Record<string, unknown> & {
  preferredThinking?: Record<string, unknown>
}

const CONFIG_PATH = path.join(
  getAgentDir(),
  "extensions",
  "pi-preferred-thinking.json",
)
const CONFIG_DIR = path.dirname(CONFIG_PATH)
const UNSET_OPTION = "unset"
const VALID_THINKING_LEVELS = new Set<ThinkingLevel>([
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
])
const THINKING_LEVEL_OPTIONS: readonly ThinkingLevel[] = [
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
]

function getModelKey(provider: string, modelId: string): string {
  return `${provider}/${modelId}`
}

function readConfig(): PreferredThinkingConfig {
  try {
    const content = readFileSync(CONFIG_PATH, "utf-8")
    const config = JSON.parse(content) as unknown
    return config && typeof config === "object" && !Array.isArray(config)
      ? (config as PreferredThinkingConfig)
      : {}
  } catch (error) {
    if (error instanceof SyntaxError) throw error
    return {}
  }
}

function readPreferredThinking(): Readonly<Record<string, ThinkingLevel>> {
  try {
    const config = readConfig()
    const configured = config.preferredThinking
    if (!configured || typeof configured !== "object") return {}

    const preferredThinking: Record<string, ThinkingLevel> = {}
    for (const [modelKey, level] of Object.entries(configured)) {
      if (
        typeof level === "string" &&
        VALID_THINKING_LEVELS.has(level as ThinkingLevel)
      ) {
        preferredThinking[modelKey] = level as ThinkingLevel
      }
    }

    return preferredThinking
  } catch {
    return {}
  }
}

function savePreferredThinking(
  modelKey: string,
  level: ThinkingLevel | undefined,
): void {
  const config = readConfig()
  const configured = config.preferredThinking
  const preferredThinking =
    configured && typeof configured === "object" && !Array.isArray(configured)
      ? { ...configured }
      : {}

  if (level) {
    preferredThinking[modelKey] = level
  } else {
    delete preferredThinking[modelKey]
  }

  config.preferredThinking = preferredThinking
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf-8")
}

function applyPreferredThinking(
  pi: ExtensionAPI,
  provider: string,
  modelId: string,
): void {
  const modelKey = getModelKey(provider, modelId)
  const preferredThinking = readPreferredThinking()[modelKey]
  if (!preferredThinking) return

  if (pi.getThinkingLevel() !== preferredThinking) {
    pi.setThinkingLevel(preferredThinking)
  }
}

async function configurePreferredThinking(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
): Promise<void> {
  if (!ctx.model) {
    ctx.ui.notify("No current model selected.", "error")
    return
  }

  const modelKey = getModelKey(ctx.model.provider, ctx.model.id)
  const current = readPreferredThinking()[modelKey] ?? UNSET_OPTION
  const selected = await ctx.ui.select(
    `Preferred thinking for ${modelKey} (current: ${current})`,
    [...THINKING_LEVEL_OPTIONS, UNSET_OPTION],
  )
  if (selected === undefined) return

  const level = VALID_THINKING_LEVELS.has(selected as ThinkingLevel)
    ? (selected as ThinkingLevel)
    : undefined

  try {
    savePreferredThinking(modelKey, level)
  } catch (error) {
    const reason =
      error instanceof SyntaxError ? "invalid JSON" : "write failed"
    ctx.ui.notify(
      `Could not update preferred thinking config: ${reason}.`,
      "error",
    )
    return
  }

  if (level) {
    pi.setThinkingLevel(level)
    ctx.ui.notify(`Preferred thinking for ${modelKey} set to ${level}.`, "info")
  } else {
    ctx.ui.notify(`Preferred thinking for ${modelKey} unset.`, "info")
  }
}

export default function (pi: ExtensionAPI): void {
  pi.registerCommand("preferred-thinking", {
    description: "set the preferred thinking level for the current model",
    handler: async (_args, ctx) => {
      await configurePreferredThinking(pi, ctx)
    },
  })

  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.model) return
    applyPreferredThinking(pi, ctx.model.provider, ctx.model.id)
  })

  pi.on("model_select", async (event) => {
    applyPreferredThinking(pi, event.model.provider, event.model.id)
  })
}
