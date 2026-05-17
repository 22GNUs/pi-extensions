# @tifan/pi-friction

Append workflow-friction feedback to `.pi/FRICTION.md` in the project root.

Use it after a repeated manual workaround, a second hook or tool failure with the same root cause, or any project instruction, doc, or tooling that causes avoidable backtracking. Each call appends a timestamped entry. The file is a feedback log meant to later become automation, docs, or workflow fixes.

## Install

```bash
pi install npm:@tifan/pi-friction
```

## Tools

- `vent`: Append a friction entry to `.pi/FRICTION.md` with an optional short trigger label.

## Credits

Fork of [`@howaboua/pi-vent`](https://pi.dev/packages/@howaboua/pi-vent?name=pi-vent).

Changes from upstream:

- Renamed to `pi-friction`.
- Writes to `.pi/FRICTION.md` instead of `.pi/VENT.md`.

## License

[MIT](LICENSE)
