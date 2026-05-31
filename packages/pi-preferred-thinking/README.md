# @tifan/pi-preferred-thinking

Apply per-model thinking levels from `~/.config/pi/extensions/pi-preferred-thinking.json` when sessions start or models change.

<img width="718" height="258" alt="picker" src="https://github.com/user-attachments/assets/5f534314-ecc9-450f-80d6-49818d4a16b0" />

This extension is for model-specific preferences. Pi's built-in `defaultThinkingLevel` remains global, while `preferredThinking` lets you choose different levels for different models. Invalid or missing values are ignored.

## Install

```bash
pi install npm:@tifan/pi-preferred-thinking
```

## Configuration

Run `/preferred-thinking` to set or unset the preferred thinking level for the current model.

Valid levels: `off`, `minimal`, `low`, `medium`, `high`, `xhigh`.

The extension saves preferences in `~/.config/pi/extensions/pi-preferred-thinking.json`:

```json
{
  "preferredThinking": {
    "anthropic/claude-opus-4-7": "high",
    "openai-codex/gpt-5.4-mini": "minimal"
  }
}
```

## License

[MIT](LICENSE)
