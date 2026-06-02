import assert from "node:assert/strict"
import { test } from "node:test"
import {
  buildFixedClusterPaint,
  emergencyTerminalModeReset,
  resetScrollRegion,
  setScrollRegion,
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
