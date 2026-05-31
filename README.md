# pi-extensions

A collection of [Pi coding agent](https://pi.dev) extensions.

## Packages

| package                                                          | description                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`@tifan/pi-copy-response`](packages/pi-copy-response)           | Pick, preview, and copy an assistant response.                     |
| [`@tifan/pi-friction`](packages/pi-friction)                     | Log workflow friction to `.pi/FRICTION.md`.                        |
| [`@tifan/pi-handoff`](packages/pi-handoff)                       | Transfer session context to a new session and query past sessions. |
| [`@tifan/pi-inline-skills`](packages/pi-inline-skills)           | Inline `$skill` autocomplete in the pi editor.                     |
| [`@tifan/pi-mermaid-open`](packages/pi-mermaid-open)             | Extract and open Mermaid diagrams from agent responses.            |
| [`@tifan/pi-preferred-thinking`](packages/pi-preferred-thinking) | Persist preferred thinking level per model.                        |
| [`@tifan/pi-recap`](packages/pi-recap)                           | One-line session recap on demand or after you have been away.      |
| [`@tifan/pi-titlebar-spinner`](packages/pi-titlebar-spinner)     | Spinner in the pi titlebar while the agent runs.                   |

## Install

```bash
pi install npm:@tifan/pi-<name>
```
