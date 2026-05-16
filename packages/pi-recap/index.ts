import type { AgentMessage } from "@earendil-works/pi-agent-core"
import { complete, type Message } from "@earendil-works/pi-ai"
import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent"
import {
  convertToLlm,
  serializeConversation,
} from "@earendil-works/pi-coding-agent"
import {
  formatAuthModelKey,
  formatModelPreference,
  getFastModelAuth,
  resolveInitialModelPreference,
  type RecapModelPreference,
} from "./models.js"
import { sanitizeRecapText } from "./sanitize.js"
import {
  clearNoModelWarning,
  clearWidget,
  notifyUser,
  showNoModelWarning,
  showWidget,
} from "./tui.js"

const RECAP_MAX_TOKENS = 160
const RECAP_REQUEST_TIMEOUT_MS = 4_000

const RECAP_SYSTEM_PROMPT = `You write compact rolling recaps for an AI coding-agent session.

Given the previous recap and the just-completed agent response, produce one updated plain-text sentence.
Include current status, key decisions, files or commands only if they matter, and the likely next action.
Target about 160 characters. Stay under 240 characters.
Do not add a label or prefix. Do not use markdown. Do not mention yourself as "the assistant".`

interface RecapState {
  sessionActive: boolean
  runId: number
  selectedModel: RecapModelPreference | undefined
  lastRecap: string
  abortController: AbortController | undefined
}

function createRecapState(): RecapState {
  return {
    sessionActive: false,
    runId: 0,
    selectedModel: undefined,
    lastRecap: "",
    abortController: undefined,
  }
}

function abortPendingGeneration(state: RecapState): void {
  state.abortController?.abort()
  state.abortController = undefined
}

function extractTextContent(
  content: readonly { readonly type: string; readonly text?: string }[],
): string {
  return content
    .filter(
      (item): item is { readonly type: string; readonly text: string } =>
        item.type === "text" && typeof item.text === "string",
    )
    .map((item) => item.text)
    .join("\n")
}

function buildPrompt(previousRecap: string, messages: AgentMessage[]): Message {
  const conversationText = serializeConversation(convertToLlm(messages))
  return {
    role: "user",
    content: [
      {
        type: "text",
        text: [
          "## Previous Recap",
          previousRecap || "none",
          "",
          "## Just-Completed Agent Response",
          conversationText,
        ].join("\n"),
      },
    ],
    timestamp: Date.now(),
  }
}

async function generateRecap(
  ctx: ExtensionContext,
  state: RecapState,
  messages: AgentMessage[],
): Promise<void> {
  if (!ctx.hasUI || messages.length === 0) return

  const runId = state.runId
  const auth = await getFastModelAuth(ctx, state.selectedModel)
  if (runId !== state.runId || !state.sessionActive) return

  if (!auth) {
    showNoModelWarning(ctx)
    return
  }

  const abortController = new AbortController()
  abortPendingGeneration(state)
  state.abortController = abortController

  try {
    const response = await complete(
      auth.model,
      {
        systemPrompt: RECAP_SYSTEM_PROMPT,
        messages: [buildPrompt(state.lastRecap, messages)],
      },
      {
        apiKey: auth.apiKey,
        ...(auth.headers ? { headers: auth.headers } : {}),
        maxTokens: RECAP_MAX_TOKENS,
        maxRetries: 0,
        cacheRetention: "none",
        timeoutMs: RECAP_REQUEST_TIMEOUT_MS,
        signal: abortController.signal,
      },
    )

    if (runId !== state.runId || !state.sessionActive) return
    if (response.stopReason !== "stop") return

    const recap = sanitizeRecapText(extractTextContent(response.content))
    if (!recap) return

    state.lastRecap = recap
    clearNoModelWarning(ctx)
    showWidget(ctx, recap)
  } catch {
    // Recaps are best-effort. Keep the previous recap on transient failures.
  } finally {
    if (state.abortController === abortController) {
      state.abortController = undefined
    }
  }
}

function registerRecapCommand(pi: ExtensionAPI, state: RecapState): void {
  pi.registerCommand("recap", {
    description: "pi-recap status",
    handler: async (args, ctx) => {
      const action = args.trim().split(/\s+/u)[0]?.toLowerCase() ?? ""

      if (!action || action === "help") {
        notifyUser(
          ctx,
          [
            "pi-recap commands",
            "/recap help - show this help",
            "/recap status - show selected and active model status",
          ].join("\n"),
          "info",
        )
        return
      }

      if (action === "status") {
        await notifyRecapStatus(ctx, state)
        return
      }

      notifyUser(ctx, "Use /recap [help|status]", "error")
    },
  })
}

async function notifyRecapStatus(
  ctx: ExtensionContext,
  state: RecapState,
): Promise<void> {
  const configuredModel = state.selectedModel
  const selectedModelLine = `selected model: ${formatModelPreference(configuredModel)}`
  let activeModelLine: string

  try {
    const auth = await getFastModelAuth(ctx, configuredModel)
    if (auth) {
      clearNoModelWarning(ctx)
      activeModelLine = `active model: ${formatAuthModelKey(auth)}`
    } else {
      showNoModelWarning(ctx)
      activeModelLine = "active model: none"
    }
  } catch {
    activeModelLine = "active model: unknown (auth check failed)"
  }

  const lastRecapLine = `last recap: ${state.lastRecap ? "available" : "none"}`
  notifyUser(
    ctx,
    ["pi-recap status", selectedModelLine, activeModelLine, lastRecapLine].join(
      "\n",
    ),
    "info",
  )
}

export default function (pi: ExtensionAPI): void {
  const state = createRecapState()

  registerRecapCommand(pi, state)

  pi.on("session_start", (_event, ctx) => {
    state.sessionActive = true
    state.runId++
    state.selectedModel = resolveInitialModelPreference(ctx.cwd)
    state.lastRecap = ""
    abortPendingGeneration(state)
    clearWidget(ctx)
    clearNoModelWarning(ctx)
  })

  pi.on("agent_start", () => {
    state.runId++
    abortPendingGeneration(state)
  })

  pi.on("agent_end", (event, ctx) => {
    void generateRecap(ctx, state, event.messages)
  })

  pi.on("session_shutdown", (_event, ctx) => {
    state.sessionActive = false
    state.runId++
    state.lastRecap = ""
    abortPendingGeneration(state)
    clearWidget(ctx)
    clearNoModelWarning(ctx)
  })
}
