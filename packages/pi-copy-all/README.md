# @tifan/pi-copy-all

Copy every user and assistant message in the current pi session to the system clipboard.

Output is plain text. Each message is prefixed with `USER:` or `ASSISTANT:` and separated by a `---` rule. Image blocks become `[image]`. macOS only (uses `pbcopy`).

## Install

```bash
pi install npm:@tifan/pi-copy-all
```

## Commands

- `/copy-all`: Copy every user and assistant message in the active session to the clipboard.

## License

[MIT](LICENSE)
