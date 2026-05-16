# @tifan/pi-friction

Append workflow-friction feedback to `.pi/FRICTION.md` in the project root.

Use it after repeated manual workarounds, repeated hook/tool failures with the same root cause, or any project instructions, docs, or tooling that cause avoidable backtracking. Each call appends a timestamped entry; the file is meant as a feedback log to later turn into automation, docs, or workflow fixes.

## Install

```bash
pi install npm:@tifan/pi-friction
```

## Tools

- `vent` — append a friction entry to `.pi/FRICTION.md` with optional trigger label.

## Credits

Fork of [`@howaboua/pi-vent`](https://pi.dev/packages/@howaboua/pi-vent?name=pi-vent).

Changes from upstream:

- Package renamed to `pi-friction`.
- Writes to `.pi/FRICTION.md` instead of `.pi/VENT.md`.

## License

[MIT](LICENSE)
