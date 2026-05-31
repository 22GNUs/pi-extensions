import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import type { Api, Model } from "@earendil-works/pi-ai"
import {
  getAgentDir,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent"

const CONFIG_PATH = path.join(getAgentDir(), "extensions", "pi-recap.json")
const CONFIG_DIR = path.dirname(CONFIG_PATH)

export interface RecapModelPreference {
  readonly provider: string
  readonly id: string
}

export interface FastModelAuth {
  readonly model: Model<Api>
  readonly apiKey: string
  readonly headers: Record<string, string> | undefined
}

export const FAST_MODEL_CANDIDATES: readonly RecapModelPreference[] = [
  { provider: "openai-codex", id: "gpt-5.4-mini" },
  { provider: "openai-codex", id: "gpt-5.3-codex-spark" },
  { provider: "anthropic", id: "claude-haiku-4-5" },
  { provider: "anthropic", id: "claude-haiku-4-5-20251001" },
]

interface RecapConfig extends Record<string, unknown> {
  model?: unknown
}

export function formatModelPreference(
  configuredModel?: RecapModelPreference,
): string {
  return configuredModel ? formatRecapModelKey(configuredModel) : "auto"
}

export function formatRecapModelKey({
  provider,
  id,
}: RecapModelPreference): string {
  return `${provider}/${id}`
}

export function formatAuthModelKey(auth: FastModelAuth): string {
  return `${auth.model.provider}/${auth.model.id}`
}

export function parseModelSpec(
  value: string,
): RecapModelPreference | undefined {
  const trimmed = value.trim()
  if (!trimmed || trimmed === "auto") return undefined

  const separator = trimmed.indexOf("/")
  if (separator <= 0 || separator === trimmed.length - 1) return undefined

  return {
    provider: trimmed.slice(0, separator),
    id: trimmed.slice(separator + 1),
  }
}

function readConfig(): RecapConfig {
  try {
    const content = readFileSync(CONFIG_PATH, "utf-8")
    const config = JSON.parse(content) as unknown
    return config && typeof config === "object" && !Array.isArray(config)
      ? (config as RecapConfig)
      : {}
  } catch (error) {
    if (error instanceof SyntaxError) throw error
    return {}
  }
}

export function saveModelPreference(
  modelPreference: RecapModelPreference | undefined,
): void {
  const config = readConfig()
  config.model = modelPreference ? formatRecapModelKey(modelPreference) : "auto"
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf-8")
}

export function resolveInitialModelPreference():
  | RecapModelPreference
  | undefined {
  try {
    const config = readConfig()
    return typeof config.model === "string"
      ? parseModelSpec(config.model)
      : undefined
  } catch {
    return undefined
  }
}

async function getModelAuth(
  ctx: ExtensionContext,
  modelPreference: RecapModelPreference,
): Promise<FastModelAuth | undefined> {
  const model = ctx.modelRegistry.find(
    modelPreference.provider,
    modelPreference.id,
  )
  if (!model) return undefined

  const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model)
  return auth.ok && auth.apiKey
    ? {
        model,
        apiKey: auth.apiKey,
        headers: auth.headers,
      }
    : undefined
}

export async function getFastModelAuth(
  ctx: ExtensionContext,
  configuredModel?: RecapModelPreference,
): Promise<FastModelAuth | undefined> {
  if (configuredModel) {
    const configuredAuth = await getModelAuth(ctx, configuredModel)
    if (configuredAuth) return configuredAuth
  }

  const candidates = configuredModel
    ? FAST_MODEL_CANDIDATES.filter(
        (model) =>
          formatRecapModelKey(model) !== formatRecapModelKey(configuredModel),
      )
    : FAST_MODEL_CANDIDATES

  const results = await Promise.all(
    candidates.map((model) => getModelAuth(ctx, model)),
  )
  return results.find((auth) => auth !== undefined)
}
