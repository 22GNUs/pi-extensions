# @tifan/pi-mermaid-open

Extract Mermaid diagrams from recent pi assistant messages, render them to SVG, and open them in the system viewer.

Scans the last 50 assistant messages for ` ```mermaid ` (or `mmd`) fences. If more than one diagram is found, a picker shows the message offset, diagram type, and title. Rendering uses `@mermaid-js/mermaid-cli` via `bunx`. SVGs are written under `<agent-dir>/artifacts/mermaid/` and opened with `open` (macOS), `xdg-open` (Linux), or `start` (Windows).

## Install

```bash
pi install npm:@tifan/pi-mermaid-open
```

## Commands

- `/mermaid-open`: Pick a Mermaid diagram from recent assistant messages, render it, and open the SVG.

## License

[MIT](LICENSE)
