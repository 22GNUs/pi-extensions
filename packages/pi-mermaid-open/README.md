# @tifan/pi-mermaid-open

Extract Mermaid diagrams from recent pi assistant messages, render them to SVG, and open them in the system viewer.

The command scans the last 50 assistant messages for ` ```mermaid ` or ` ```mmd ` fences. If it finds more than one diagram, pi shows a picker with the message offset, diagram type, and title. Rendering uses `@mermaid-js/mermaid-cli` via `bunx`. SVGs are written under `<agent-dir>/artifacts/mermaid/` and opened with `open` on macOS, `xdg-open` on Linux, or `start` on Windows.

## Install

```bash
pi install npm:@tifan/pi-mermaid-open
```

## Commands

- `/mermaid-open`: Pick a Mermaid diagram from recent assistant messages, render it, and open the SVG.

## Release notes

See [CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE)
