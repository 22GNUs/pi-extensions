---
"@tifan/pi-handoff": patch
---

Use Pi 0.78.1's new extension context APIs so `/handoff-session` records loaded skills and context file paths from system prompt options, and gates its custom UI with `ctx.mode`.
