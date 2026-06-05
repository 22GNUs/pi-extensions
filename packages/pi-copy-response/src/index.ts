import {
  copyToClipboard,
  getMarkdownTheme,
  type ExtensionAPI,
} from "@earendil-works/pi-coding-agent"
import {
  getKeybindings,
  Markdown,
  truncateToWidth,
  visibleWidth,
  type Component,
} from "@earendil-works/pi-tui"

type PickableMessage = {
  label: string
  text: string
}

type PickerTheme = {
  bold(text: string): string
  fg(key: "accent" | "muted" | "text", text: string): string
}

function textFromContent(content: unknown) {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""

  return content
    .map((block) => {
      if (!block || typeof block !== "object") return ""
      if (!("type" in block)) return ""

      if (
        block.type === "text" &&
        "text" in block &&
        typeof block.text === "string"
      ) {
        return block.text
      }

      if (block.type === "image") return "[image]"

      return ""
    })
    .filter(Boolean)
    .join("\n")
}

function firstLine(text: string) {
  return (
    text
      .split("\n")
      .find((line) => line.trim())
      ?.trim() ?? "[empty]"
  )
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}

function padToWidth(text: string, width: number) {
  return `${truncateToWidth(text, width)}${" ".repeat(
    Math.max(0, width - visibleWidth(text)),
  )}`
}

function renderPreview(text: string, width: number, maxLines: number) {
  const renderedLines = new Markdown(text, 0, 0, getMarkdownTheme()).render(
    width,
  )
  const lines = renderedLines.slice(0, maxLines)

  if (lines.length < renderedLines.length) {
    lines.push("…")
  }

  return lines
}

class ResponsePicker implements Component {
  private selectedIndex = 0

  constructor(
    private readonly messages: PickableMessage[],
    private readonly theme: PickerTheme,
    private readonly done: (message: PickableMessage | undefined) => void,
  ) {}

  invalidate() {}

  render(width: number) {
    const listWidth = Math.min(44, Math.max(24, Math.floor(width * 0.35)))
    const previewWidth = Math.max(20, width - listWidth - 3)
    const selectedMessage = this.messages[this.selectedIndex]
    const previewLines = selectedMessage
      ? renderPreview(selectedMessage.text, previewWidth, 18)
      : []
    const rowCount = Math.max(this.messages.length, previewLines.length, 1)
    const lines = [
      this.theme.fg("accent", this.theme.bold("Copy assistant response:")),
      this.theme.fg("muted", "↑↓/jk navigate  enter select  esc cancel"),
      "",
    ]

    for (let index = 0; index < rowCount; index++) {
      const message = this.messages[index]
      const isSelected = index === this.selectedIndex
      const prefix = isSelected ? "→ " : "  "
      const label = message ? `${prefix}${message.label}` : ""
      const styledLabel = isSelected
        ? this.theme.fg("accent", padToWidth(label, listWidth))
        : this.theme.fg("text", padToWidth(label, listWidth))
      const preview = previewLines[index] ?? ""

      lines.push(
        `${styledLabel} ${this.theme.fg("muted", "│")} ${truncateToWidth(
          preview,
          previewWidth,
        )}`,
      )
    }

    return lines
  }

  handleInput(keyData: string) {
    const kb = getKeybindings()

    if (kb.matches(keyData, "tui.select.up") || keyData === "k") {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1)
      return
    }

    if (kb.matches(keyData, "tui.select.down") || keyData === "j") {
      this.selectedIndex = Math.min(
        this.messages.length - 1,
        this.selectedIndex + 1,
      )
      return
    }

    if (kb.matches(keyData, "tui.select.confirm") || keyData === "\n") {
      this.done(this.messages[this.selectedIndex])
      return
    }

    if (kb.matches(keyData, "tui.select.cancel")) {
      this.done(undefined)
    }
  }
}

class HiddenFooter implements Component {
  invalidate() {}

  render() {
    return []
  }
}

export default function (pi: ExtensionAPI) {
  pi.registerCommand("copy-response", {
    description: "Pick an assistant response and copy it",
    handler: async (_args, ctx) => {
      if (ctx.mode !== "tui") {
        ctx.ui.notify("copy-response requires interactive TUI mode.", "error")
        return
      }

      await ctx.waitForIdle()

      const messages = ctx.sessionManager
        .getBranch()
        .filter((entry) => entry.type === "message")
        .map((entry) => entry.message)
        .flatMap((message): PickableMessage[] => {
          if (message.role !== "assistant" || !("content" in message)) return []

          const text = textFromContent(message.content).trim()
          if (!text) return []

          return [
            {
              label: truncate(firstLine(text), 80),
              text,
            },
          ]
        })

      if (messages.length === 0) {
        ctx.ui.notify("No assistant responses to copy", "info")
        return
      }

      ctx.ui.setFooter(() => new HiddenFooter())
      const selectedMessage = await ctx.ui
        .custom<PickableMessage | undefined>(
          (_tui, theme, _keybindings, done) =>
            new ResponsePicker(messages, theme, done),
        )
        .finally(() => ctx.ui.setFooter(undefined))
      if (!selectedMessage) return

      await copyToClipboard(selectedMessage.text)
      ctx.ui.notify("Copied assistant response to clipboard", "info")
    },
  })
}
