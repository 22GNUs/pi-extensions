---
"@tifan/pi-fixed-editor": patch
---

Fix an infinite render loop on Pi 0.84+, which wraps the TUI in a re-resolving proxy. The compositor now captures the real underlying `render`, `doRender`, and `compositeLineAt` methods instead of the proxy's per-call wrappers, so the fixed editor loads and scrolls again.
