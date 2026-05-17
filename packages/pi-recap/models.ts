import type { Api, Model } from "@earendil-works/pi-ai"
import type { ExtensionContext } from "@earendil-works/pi-coding-agent"
import { SettingsManager } from "@earendil-works/pi-coding-agent"

const SETTINGS_KEY = "recap"

export interface RecapModelPreference {
  readonly provider: string
  readonly id: string
}

export interface FastModelAuth {
  readonly model: Model<Api>
  readonly apiKey: string
  readonly headers: Record<string, string> | undefined
}

const FAST_MODEL_CANDIDATES: readonly RecapModelPreference[] = [
  { provider: "openai-codex", id: "gpt-5.4-mini" },
  { provider: "openai-codex", id: "gpt-5.3-codex-spark" },
  { provider: "anthropic", id: "claude-haiku-4-5" },
  { provider: "anthropic", id: "claude-haiku-4-5-20251001" },
]

interface SettingsModelValue {
  readonly present: boolean
  readonly value?: string
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

function parseModelSpec(value: string): RecapModelPreference | undefined {
  const trimmed = value.trim()
  if (!trimmed || trimmed === "auto") return undefined

  const separator = trimmed.indexOf("/")
  if (separator <= 0 || separator === trimmed.length - 1) return undefined

  return {
    provider: trimmed.slice(0, separator),
    id: trimmed.slice(separator + 1),
  }
}

function settingsModelValue(
  settings: Record<string, unknown>,
): SettingsModelValue {
  const section = settings[SETTINGS_KEY]
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    return { present: false }
  }

  const value = (section as Record<string, unknown>)["model"]
  return typeof value === "string"
    ? { present: true, value }
    : { present: "model" in (section as Record<string, unknown>) }
}

export function resolveInitialModelPreference(
  cwd: string,
): RecapModelPreference | undefined {
  const settings = SettingsManager.create(cwd)
  const projectModel = settingsModelValue(
    settings.getProjectSettings() as Record<string, unknown>,
  )
  if (projectModel.present) {
    return projectModel.value ? parseModelSpec(projectModel.value) : undefined
  }

  const userModel = settingsModelValue(
    settings.getGlobalSettings() as Record<string, unknown>,
  )
  return userModel.value ? parseModelSpec(userModel.value) : undefined
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
