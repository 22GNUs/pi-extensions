import type { ExtensionContext, Theme } from "@earendil-works/pi-coding-agent"
import type { Component } from "@earendil-works/pi-tui"
import {
  truncateToWidth,
  visibleWidth,
  wrapTextWithAnsi,
} from "@earendil-works/pi-tui"
import { sanitizeRecapText } from "./sanitize.js"

const WIDGET_KEY = "pi-recap"
const MODEL_WARNING_WIDGET_KEY = "pi-recap-model-warning"
const NO_RECAP_MODEL_AUTH_MESSAGE = "no recap model authenticated"
const TITLE = " recap "
const MIN_BOX_WIDTH = 12

class WarningLine implements Component {
  private readonly theme: Theme
  private readonly message: string

  constructor(theme: Theme, message: string) {
    this.theme = theme
    this.message = message
  }

  invalidate(): void {}

  render(width: number): string[] {
    return [this.theme.fg("warning", truncateToWidth(this.message, width))]
  }
}

class PiRecapBox implements Component {
  private readonly theme: Theme
  private readonly recap: string

  constructor(theme: Theme, recap: string) {
    this.theme = theme
    this.recap = recap
  }

  invalidate(): void {}

  render(width: number): string[] {
    if (width < MIN_BOX_WIDTH) {
      return [truncateToWidth(`${TITLE.trim()}: ${this.recap}`, width)]
    }

    const contentWidth = width - 4
    const lines = wrapTextWithAnsi(this.recap, contentWidth)
    const contentLines = lines.length === 0 ? [""] : lines
    return [
      this.topBorder(width),
      ...this.contentLines(contentLines, contentWidth),
      this.bottomBorder(width),
    ]
  }

  private topBorder(width: number): string {
    const rightWidth = Math.max(1, width - visibleWidth(TITLE) - 2)
    return this.theme.fg("borderMuted", `╭${TITLE}${"─".repeat(rightWidth)}╮`)
  }

  private bottomBorder(width: number): string {
    return this.theme.fg("borderMuted", `╰${"─".repeat(width - 2)}╯`)
  }

  private contentLines(
    lines: readonly string[],
    contentWidth: number,
  ): string[] {
    return lines.map((line) => this.contentLine(line, contentWidth))
  }

  private contentLine(line: string, contentWidth: number): string {
    const padding = " ".repeat(Math.max(0, contentWidth - visibleWidth(line)))
    return [
      this.theme.fg("borderMuted", "│ "),
      this.theme.fg("text", line),
      padding,
      this.theme.fg("borderMuted", " │"),
    ].join("")
  }
}

export function clearWidget(ctx: ExtensionContext): void {
  if (!ctx.hasUI) return
  ctx.ui.setWidget(WIDGET_KEY, undefined)
}

export function clearNoModelWarning(ctx: ExtensionContext): void {
  if (!ctx.hasUI) return
  ctx.ui.setWidget(MODEL_WARNING_WIDGET_KEY, undefined)
}

export function showNoModelWarning(ctx: ExtensionContext): void {
  if (!ctx.hasUI) return
  ctx.ui.setWidget(
    MODEL_WARNING_WIDGET_KEY,
    (_tui, theme) => new WarningLine(theme, NO_RECAP_MODEL_AUTH_MESSAGE),
    { placement: "aboveEditor" },
  )
}

export function showWidget(ctx: ExtensionContext, recap: string): void {
  if (!ctx.hasUI) return

  const safeRecap = sanitizeRecapText(recap)
  if (!safeRecap) {
    clearWidget(ctx)
    return
  }

  ctx.ui.setWidget(
    WIDGET_KEY,
    (_tui, theme) => new PiRecapBox(theme, safeRecap),
  )
}

export function notifyUser(
  ctx: ExtensionContext,
  message: string,
  level: "info" | "error",
): void {
  if (!ctx.hasUI) return
  ctx.ui.notify(message, level)
}
