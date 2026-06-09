import assert from "node:assert/strict"
import { test } from "node:test"
import {
  buildFixedClusterPaint,
  emergencyTerminalModeReset,
  resetScrollRegion,
  setScrollRegion,
  TerminalSplitCompositor,
  type TerminalLike,
} from "../src/terminal-split.ts"

test("renders terminal scroll region escape sequences", () => {
  assert.equal(setScrollRegion(1, 20), "\x1b[1;20r")
  assert.equal(resetScrollRegion(), "\x1b[r")
})

test("paints the fixed cluster at the bottom of the terminal", () => {
  const output = buildFixedClusterPaint(
    { lines: ["editor", "footer"], cursor: null },
    10,
    80,
    false,
  )

  assert.ok(output.includes("\x1b[9;1H"))
  assert.ok(output.includes("editor"))
  assert.ok(output.includes("\x1b[10;1H"))
  assert.ok(output.includes("footer"))
})

test("emergency reset restores terminal modes", () => {
  const output = emergencyTerminalModeReset()

  assert.ok(output.includes("\x1b[r"))
  assert.ok(output.includes("\x1b[?1006l"))
  assert.ok(output.includes("\x1b[?1049l"))
})

test("plain enter scrolls the transcript back to the bottom", () => {
  let inputListener:
    | ((data: string) => { consume?: boolean } | undefined)
    | null = null
  let renderRequests = 0
  const rootLines = Array.from({ length: 10 }, (_, index) => `line ${index}`)
  const terminal: TerminalLike = {
    columns: 80,
    rows: 6,
    write: () => {},
  }
  const tui = {
    children: [],
    render: () => rootLines,
    requestRender: () => {
      renderRequests += 1
    },
    addInputListener: (
      listener: (data: string) => { consume?: boolean } | undefined,
    ) => {
      inputListener = listener
      return () => {
        inputListener = null
      }
    },
    hasOverlay: () => false,
  }
  const compositor = new TerminalSplitCompositor({
    tui,
    terminal,
    renderCluster: () => ({ lines: ["editor", "footer"], cursor: null }),
  })

  compositor.install()
  try {
    assert.ok(inputListener)
    assert.equal(inputListener("\x1b[5~")?.consume, true)
    assert.deepEqual(tui.render(), ["line 0", "line 1", "line 2", "line 3"])

    assert.equal(inputListener("\r"), undefined)

    assert.deepEqual(tui.render(), ["line 6", "line 7", "line 8", "line 9"])
    assert.equal(renderRequests, 2)
  } finally {
    compositor.dispose({ resetExtendedKeyboardModes: true })
  }
})
