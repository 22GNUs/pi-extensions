# @tifan/pi-preferred-thinking

Persist a preferred thinking level per model in pi's `settings.json`. When you switch models, the extension restores the level you last set for that model.

## Install

```bash
pi install npm:@tifan/pi-preferred-thinking
```

## Configuration

Add a `preferredThinking` map keyed by `<provider>/<model-id>` in `settings.json`:

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
