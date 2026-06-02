# @tifan/pi-handoff

Start a fresh pi session from a handoff document, and query past sessions for context, decisions, or code changes.

`/handoff-session` requires an installed skill named exactly `handoff`. It reads that skill as the handoff policy, asks what the next session is for, generates a markdown handoff in your OS temp directory, then opens a new pi session with a prompt that points to the file. The prompt is left in the editor for review and manual submit.

## Install

```bash
pi install npm:@tifan/pi-handoff
```

You also need a `handoff` skill installed and discoverable by pi. For example, install or expose Matt Pocock's `handoff` skill, then run `/reload`.

## Commands

- `/handoff-session`: Generate a handoff from the current session and start a new session from it.

## Tools

- `session_query`: Answer a question about a previous pi session, given the full path to its `.jsonl` file and the question to ask.

## Behavior

- Uses the current selected model.
- Uses the installed `handoff` skill as the document policy.
- Writes stable, readable files under the OS temp directory, such as `/tmp/pi-handoffs/pi-handoff-2026-06-01-inline-skills.md`.
- Includes the previous session path when available, so the next agent can use `session_query` if the handoff omits a detail.
- Starts a clean session with native parent-session linking.
- Does not autosend.

## Release notes

See [CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE)
