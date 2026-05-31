import {
  copyToClipboard,
  type ExtensionAPI,
} from "@earendil-works/pi-coding-agent"

type PickableMessage = {
  label: string
  text: string
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

export default function (pi: ExtensionAPI) {
  pi.registerCommand("copy-response", {
    description: "Pick an assistant response and copy it",
    handler: async (_args, ctx) => {
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

      const selected = await ctx.ui.select(
        "Copy assistant response:",
        messages.map((message) => message.label),
      )
      if (!selected) return

      const selectedMessage = messages.find(
        (message) => message.label === selected,
      )
      if (!selectedMessage) return

      await copyToClipboard(selectedMessage.text)
      ctx.ui.notify("Copied assistant response to clipboard", "info")
    },
  })
}
