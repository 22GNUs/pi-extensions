# @tifan/pi-handoff

Transfer pi session context to a new session, and query past sessions for context, decisions, or code changes.

`/handoff` summarizes the current conversation with a fast model, opens a new session pre-filled with that summary plus your stated goal, and autosends after 10 seconds unless you edit the prompt or move the cursor. Loaded skills are listed so the new session can reload them.

## Install

```bash
pi install npm:@tifan/pi-handoff
```

## Commands

- `/handoff [goal]`: Generate a context summary and start a new session pre-loaded with it. Prompts for a goal if none is passed.

## Tools

- `session_query`: Answer a question about a previous pi session, given the full path to its `.jsonl` file and the question to ask.

## License

[MIT](LICENSE)
