# pi-extensions

A collection of [pi coding agent](https://pi.dev) extensions.

## Packages

| Package                                                          | Description                                                           |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`@tifan/pi-autoname`](packages/pi-autoname)                     | Auto-name pi sessions and the current Herdr tab.                      |
| [`@tifan/pi-copy-response`](packages/pi-copy-response)           | Pick and copy an assistant response from the current pi session.      |
| [`@tifan/pi-fixed-editor`](packages/pi-fixed-editor)             | Keep the pi editor and footer fixed while the transcript scrolls.     |
| [`@tifan/pi-handoff`](packages/pi-handoff)                       | Transfer pi session context to a new session and query past sessions. |
| [`@tifan/pi-inline-skills`](packages/pi-inline-skills)           | Inline `/skill` autocomplete in the pi editor.                        |
| [`@tifan/pi-mermaid-open`](packages/pi-mermaid-open)             | Extract and open Mermaid diagrams from pi agent responses.            |
| [`@tifan/pi-preferred-thinking`](packages/pi-preferred-thinking) | Persist preferred thinking level per model in pi.                     |
| [`@tifan/pi-recap`](packages/pi-recap)                           | One-line session recap on demand or after you have been away.         |
| [`@tifan/pi-titlebar-spinner`](packages/pi-titlebar-spinner)     | Show a spinner in the pi titlebar while the agent runs.               |

Wondering which packages I use myself? See my [current pi settings](https://github.com/tifandotme/dotfiles/blob/master/dot_config/pi/private_settings.json).

## Install

```bash
pi install npm:@tifan/pi-<name>
```
