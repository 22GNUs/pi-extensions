import { spawn } from "node:child_process"
import { mkdir } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { getAgentDir, type ExtensionAPI } from "@earendil-works/pi-coding-agent"

type TextBlock = {
  type: "text"
  text: string
}

type AssistantMessage = {
  role: "assistant"
  content: unknown
}

type MessageEntry = {
  type: "message"
  id: string
  message: unknown
}

type MermaidDiagram = {
  source: string
  diagramType: string
  label: string
  messageOffset: number
  discoveredIndex: number
}

const SCAN_ASSISTANT_MESSAGE_LIMIT = 50
const OUTPUT_DIR = path.join(getAgentDir(), "artifacts", "mermaid")
const MERMAID_FENCE_PATTERN = /```\s*(mermaid|mmd)\b[^\n]*\n([\s\S]*?)```/gi
const KNOWN_TYPES = [
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram",
  "erDiagram",
  "flowchart",
  "graph",
  "gantt",
  "journey",
  "pie",
  "mindmap",
  "timeline",
]

function isTextBlock(value: unknown): value is TextBlock {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "text" &&
    "text" in value &&
    typeof value.text === "string"
  )
}

function isAssistantMessage(value: unknown): value is AssistantMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "role" in value &&
    value.role === "assistant" &&
    "content" in value
  )
}

function isMessageEntry(value: unknown): value is MessageEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "message" &&
    "id" in value &&
    typeof value.id === "string" &&
    "message" in value
  )
}

function getAssistantText(message: AssistantMessage): string {
  if (!Array.isArray(message.content)) return ""
  return message.content
    .filter(isTextBlock)
    .map((block) => block.text)
    .join("\n")
}

function trimOuterBlankLines(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n")
  while (lines.length > 0 && lines[0]?.trim() === "") lines.shift()
  while (lines.length > 0 && lines.at(-1)?.trim() === "") lines.pop()
  return lines.join("\n")
}

function classifyDiagram(source: string): string {
  const firstMeaningfulLine = source
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("%%"))

  if (!firstMeaningfulLine) return "mermaid"

  for (const type of KNOWN_TYPES) {
    if (
      firstMeaningfulLine === type ||
      firstMeaningfulLine.startsWith(`${type} `)
    ) {
      return type
    }
  }

  return firstMeaningfulLine.split(/\s+/)[0] ?? "mermaid"
}

function extractTitle(source: string): string | undefined {
  for (const line of source.split("\n")) {
    const trimmed = line.trim()
    const match = /^title\s+(.+)$/i.exec(trimmed)
    if (match?.[1]) return match[1].trim()
  }
  return undefined
}

function relativeMessageLabel(offset: number): string {
  if (offset === 1) return "latest assistant message"
  return `${offset} assistant messages ago`
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "unnamed"
}

function timestampForFilename(date = new Date()): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "")
}

function conciseError(stderr: string, stdout: string): string {
  const text = `${stderr}\n${stdout}`
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join("\n")
  return text || "Unknown error"
}

function discoverDiagrams(entries: readonly unknown[]): MermaidDiagram[] {
  const assistantMessages = entries
    .filter(isMessageEntry)
    .map((entry) => entry.message)
    .filter(isAssistantMessage)
    .slice(-SCAN_ASSISTANT_MESSAGE_LIMIT)
    .toReversed()

  const diagrams: MermaidDiagram[] = []

  assistantMessages.forEach((message, messageIndex) => {
    const text = getAssistantText(message)
    for (const match of text.matchAll(MERMAID_FENCE_PATTERN)) {
      const source = trimOuterBlankLines(match[2] ?? "")
      if (!source) continue

      const discoveredIndex = diagrams.length + 1
      const diagramType = classifyDiagram(source)
      const label = extractTitle(source) ?? `${diagramType} ${discoveredIndex}`

      diagrams.push({
        source,
        diagramType,
        label,
        messageOffset: messageIndex + 1,
        discoveredIndex,
      })
    }
  })

  return diagrams
}

function pickerLabel(diagram: MermaidDiagram): string {
  return [
    `${diagram.discoveredIndex}. ${relativeMessageLabel(diagram.messageOffset)}`,
    diagram.diagramType,
    diagram.label,
  ].join(" · ")
}

async function createSvgArtifactPath(diagram: MermaidDiagram): Promise<string> {
  await mkdir(OUTPUT_DIR, { recursive: true })
  const baseName = [
    timestampForFilename(),
    slugify(diagram.diagramType),
    slugify(diagram.label),
  ].join("-")
  return path.join(OUTPUT_DIR, `${baseName}.svg`)
}

async function renderMermaidToSvg(
  source: string,
  svgPath: string,
): Promise<{
  ok: boolean
  error?: string
}> {
  return new Promise((resolve) => {
    const command = os.platform() === "win32" ? "bunx.cmd" : "bunx"
    const child = spawn(command, [
      "-y",
      "@mermaid-js/mermaid-cli",
      "-i",
      "-",
      "-o",
      svgPath,
    ])

    let stdout = ""
    let stderr = ""

    child.stdout.setEncoding("utf-8")
    child.stderr.setEncoding("utf-8")
    child.stdout.on("data", (chunk) => {
      stdout += chunk
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk
    })

    child.on("error", (error) => {
      resolve({ ok: false, error: error.message })
    })

    child.on("close", (code) => {
      resolve(
        code === 0
          ? { ok: true }
          : { ok: false, error: conciseError(stderr, stdout) },
      )
    })

    child.stdin.end(source)
  })
}

async function openSvg(
  pi: ExtensionAPI,
  svgPath: string,
): Promise<{
  ok: boolean
  error?: string
}> {
  const platform = os.platform()
  if (platform === "darwin") {
    const result = await pi.exec("open", [svgPath])
    return result.code === 0
      ? { ok: true }
      : { ok: false, error: conciseError(result.stderr, result.stdout) }
  }

  if (platform === "linux") {
    const result = await pi.exec("xdg-open", [svgPath])
    return result.code === 0
      ? { ok: true }
      : { ok: false, error: conciseError(result.stderr, result.stdout) }
  }

  if (platform === "win32") {
    const result = await pi.exec("cmd", ["/c", "start", "", svgPath])
    return result.code === 0
      ? { ok: true }
      : { ok: false, error: conciseError(result.stderr, result.stdout) }
  }

  return { ok: false, error: `Unsupported platform: ${platform}` }
}

export default function (pi: ExtensionAPI): void {
  pi.registerCommand("mermaid-open", {
    description: "Open a Mermaid diagram from recent assistant messages as SVG",
    handler: async (_args, ctx) => {
      await ctx.waitForIdle()

      const diagrams = discoverDiagrams(ctx.sessionManager.getBranch())
      if (diagrams.length === 0) {
        ctx.ui.notify(
          "No Mermaid diagrams found in recent assistant messages.",
          "info",
        )
        return
      }

      let selected = diagrams[0]
      if (ctx.mode === "tui" && diagrams.length > 1) {
        const labels = diagrams.map(pickerLabel)
        const choice = await ctx.ui.select("Open Mermaid diagram:", labels)
        if (!choice) return
        selected = diagrams[labels.indexOf(choice)]
      }

      if (!selected) return

      let svgPath: string
      try {
        svgPath = await createSvgArtifactPath(selected)
      } catch (error) {
        ctx.ui.notify(
          `Failed to create Mermaid artifact path: ${error instanceof Error ? error.message : String(error)}`,
          "error",
        )
        return
      }

      const renderResult = await renderMermaidToSvg(selected.source, svgPath)
      if (!renderResult.ok) {
        ctx.ui.notify(
          `Mermaid render failed\nError: ${renderResult.error ?? "Unknown error"}`,
          "error",
        )
        return
      }

      if (ctx.mode !== "tui") {
        ctx.ui.notify(`Rendered Mermaid SVG: ${svgPath}`, "info")
        return
      }

      const openResult = await openSvg(pi, svgPath)
      if (!openResult.ok) {
        ctx.ui.notify(
          `Rendered SVG but failed to open it.\nSVG: ${svgPath}\nError: ${openResult.error ?? "Unknown error"}`,
          "warning",
        )
        return
      }

      ctx.ui.notify(`Opened Mermaid SVG: ${svgPath}`, "info")
    },
  })
}
