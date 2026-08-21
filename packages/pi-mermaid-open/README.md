# @tifan/pi-mermaid-open

Find Mermaid diagrams that Pi left unrendered and show one in a terminal image popup.

The command scans the last 50 assistant messages for ` ```mermaid ` or ` ```mmd ` fences. It hides diagrams that Pi already rendered and labels skipped diagrams by reason, such as unsupported type or excessive width. Rendering uses `@mermaid-js/mermaid-cli` via `bunx` and PNG output. In TUI mode, Pi displays the PNG with its Kitty/iTerm2 image support and removes the temporary file when the popup closes. Outside TUI mode, the PNG is saved under `<agent-dir>/artifacts/mermaid/`.

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
