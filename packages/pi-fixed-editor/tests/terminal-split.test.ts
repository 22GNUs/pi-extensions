import assert from "node:assert/strict"
import { test } from "node:test"
import { type Component, type Terminal, TUI } from "@earendil-works/pi-tui"
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

test("deletes Kitty images when rendering after scrolling", () => {
  const writes: string[] = []
  let scheduledRenders = 0
  const terminal: Terminal = {
    columns: 80,
    rows: 6,
    kittyProtocolActive: false,
    start: () => {},
    stop: () => {},
    drainInput: async () => {},
    write: (data) => writes.push(data),
    moveBy: () => {},
    hideCursor: () => {},
    showCursor: () => {},
    clearLine: () => {},
    clearFromCursor: () => {},
    clearScreen: () => {},
    setTitle: () => {},
    setProgress: () => {},
  }
  const imageId = 42
  const image = `\x1b_Ga=T,f=100,q=2,C=1,c=10,r=2,i=${imageId};AAAA\x1b\\`
  const rootLines = [
    image,
    "",
    "line 2",
    "line 3",
    "line 4",
    "line 5",
    "line 6",
    "line 7",
  ]
  const root: Component = {
    render: () => rootLines,
    invalidate: () => {},
  }
  const tui = new TUI(terminal)
  tui.addChild(root)
  const compositor = new TerminalSplitCompositor({
    tui,
    terminal,
    renderCluster: () => ({ lines: ["editor", "footer"], cursor: null }),
  })
  const handleInput = Reflect.get(tui, "handleInput")
  assert.equal(typeof handleInput, "function")

  compositor.install()
  try {
    assert.ok(writes.join("").includes("\x1b[?1049h"))
    writes.length = 0
    Reflect.get(tui, "doRender").call(tui)
    assert.equal(writes.filter((write) => write.includes("footer")).length, 1)
    tui.requestRender = () => {
      scheduledRenders += 1
    }
    writes.length = 0

    handleInput.call(tui, "\x1b[5~")
    assert.equal(writes.length, 0)
    assert.equal(scheduledRenders, 1)
    Reflect.get(tui, "doRender").call(tui)
    writes.length = 0

    handleInput.call(tui, "\x1b[6~")
    Reflect.get(tui, "doRender").call(tui)

    assert.match(
      writes.join(""),
      new RegExp(`\\x1b_Ga=d,d=I,i=${imageId},q=2\\x1b\\\\`),
    )
  } finally {
    compositor.dispose({ resetExtendedKeyboardModes: true })
  }
})

test("rapid scrolling defers full transcript rendering", () => {
  let inputListener:
    | ((data: string) => { consume?: boolean } | undefined)
    | null = null
  let synchronousRenders = 0
  let renderRequests = 0
  const rootLines = Array.from({ length: 1000 }, (_, index) => `line ${index}`)
  const terminal: TerminalLike = {
    columns: 80,
    rows: 24,
    write: () => {},
  }
  const tui = {
    children: [],
    render: () => rootLines,
    doRender: () => {
      synchronousRenders += 1
      tui.render()
    },
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
    tui.render()
    assert.ok(inputListener)

    for (let index = 0; index < 100; index++) {
      inputListener("\x1b[<64;1;1M")
    }

    assert.equal(synchronousRenders, 0)
    assert.ok(renderRequests > 0)
  } finally {
    compositor.dispose({ resetExtendedKeyboardModes: true })
  }
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
    renderRequests = 0

    assert.equal(inputListener("\r"), undefined)

    assert.deepEqual(tui.render(), ["line 6", "line 7", "line 8", "line 9"])
    assert.equal(renderRequests, 1)
  } finally {
    compositor.dispose({ resetExtendedKeyboardModes: true })
  }
})
