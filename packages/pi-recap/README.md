# @tifan/pi-recap

Rolling session recap shown in the pi titlebar.

After each agent response, the previous recap and the latest exchange are sent to a fast model, which returns a single-sentence update of session state. Recaps are best-effort: transient failures keep the previous recap.

## Install

```bash
pi install npm:@tifan/pi-recap
```

## Commands

- `/recap status`: Show the selected model, the active model, and whether a recap is available.
- `/recap help`: List recap commands.

## Configuration

Set the recap model in `settings.json` (project or user scope):

```json
{
  "recap": {
    "model": "openai-codex/gpt-5.4-mini"
  }
}
```

Use `auto` or omit the key to fall back to the first available model from this list:

1. `openai-codex/gpt-5.4-mini`
2. `openai-codex/gpt-5.3-codex-spark`
3. `anthropic/claude-haiku-4-5`
4. `anthropic/claude-haiku-4-5-20251001`

## Credits

Fork of [`richtan/pi-tldr`](https://github.com/richtan/pi-tldr).

Changes from upstream:

- Recap runs after the agent finishes responding, not after every tool call. Matches Claude Code's behavior.

## License

[MIT](LICENSE)
