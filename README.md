# pi-extensions

[Pi coding-agent](https://pi.dev) extensions by Tifan.

## Packages

| package                                                          | description                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`@tifan/pi-copy-all`](packages/pi-copy-all)                     | Copy all assistant messages from the current session to the clipboard.   |
| [`@tifan/pi-friction`](packages/pi-friction)                     | Log workflow friction to `.pi/FRICTION.md`. Fork of `@howaboua/pi-vent`. |
| [`@tifan/pi-handoff`](packages/pi-handoff)                       | Transfer session context to a new session and query past sessions.       |
| [`@tifan/pi-inline-skills`](packages/pi-inline-skills)           | Inline `$skill` autocomplete in the pi editor.                           |
| [`@tifan/pi-mermaid-open`](packages/pi-mermaid-open)             | Extract and open Mermaid diagrams from agent responses.                  |
| [`@tifan/pi-preferred-thinking`](packages/pi-preferred-thinking) | Persist preferred thinking level per model.                              |
| [`@tifan/pi-recap`](packages/pi-recap)                           | Rolling session recap in the pi titlebar. Fork of `richtan/pi-tldr`.     |
| [`@tifan/pi-titlebar-spinner`](packages/pi-titlebar-spinner)     | Spinner in the pi titlebar while the agent runs.                         |

## Install

```bash
pi install npm:@tifan/pi-<name>
```

## Local development

Each package is a standalone TypeScript pi extension, loaded by pi via [jiti](https://github.com/unjs/jiti). No build step.

```bash
bun install
bun run typecheck
bun run lint
bun run format
```

To try a package locally without publishing:

```bash
pi install /absolute/path/to/pi-extensions/packages/pi-<name>
```

## Releases

Versions and changelogs are managed by [Changesets](https://github.com/changesets/changesets) with the [`changesets/action`](https://github.com/changesets/action) auto-PR flow.

1. Make changes, then `bun changeset` to record intent.
2. Commit and push the changeset file to `master`.
3. The action opens or updates a "Version Packages" PR.
4. Merging that PR triggers npm publish.
