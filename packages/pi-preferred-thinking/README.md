# @tifan/pi-preferred-thinking

Apply per-model thinking levels from `~/.config/pi/extensions/pi-preferred-thinking.json` when sessions start or models change.

This extension is for model-specific preferences. Pi's built-in `defaultThinkingLevel` remains global, while `preferredThinking` lets you choose different levels for different models. Invalid or missing values are ignored.

## Install

```bash
pi install npm:@tifan/pi-preferred-thinking
```

## Configuration

Create `~/.config/pi/extensions/pi-preferred-thinking.json` with a `preferredThinking` map keyed by `<provider>/<model-id>`:

```json
{
  "preferredThinking": {
    "anthropic/claude-opus-4-7": "high",
    "openai-codex/gpt-5.4-mini": "minimal"
  }
}
```

Valid levels: `off`, `minimal`, `low`, `medium`, `high`, `xhigh`.

## License

[MIT](LICENSE)
