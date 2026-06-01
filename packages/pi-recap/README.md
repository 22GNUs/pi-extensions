# @tifan/pi-recap

Show a one-line session recap on demand or after you have been away.

`pi-recap` helps you re-enter a session without rereading the transcript. It starts with why you opened the session, then adds the current state, important decisions, relevant files or commands, and the likely next action.

![Recap widget showing a generated session recap](https://raw.githubusercontent.com/tifandotme/pi-extensions/refs/heads/master/packages/pi-recap/assets/recap-widget-showing.webp)

## Install

```bash
pi install npm:@tifan/pi-recap
```

## Behavior

- `/recap` generates a fresh, goal-first recap and shows it above the editor.
- After each agent response, `pi-recap` waits 5 minutes. If you stay idle, it generates one automatic recap.
- On resume, `pi-recap` shows the saved recap if it is current. If it is stale or missing, it generates a fresh recap.
- The recap clears when you send a non-`/recap` message.

## Context

Recaps use pi's current session context. That means they follow the active branch and respect compaction.

A good recap should answer "what was I trying to do here?" before it summarizes the latest assistant response. For example:

> Deciding whether pi-inline-skills should switch from `$skill` to `/skill`. Recommendation is `/` only with commands winning; next decide whether leading `/skill` should expand.

`pi-recap` does not scrape the full session file or terminal history. It summarizes the same branch-aware, compaction-aware messages that pi keeps in context.

The latest recap is stored as a custom session entry. Recap entries do not participate in LLM context.

`/recap status` reports whether the stored recap is current, stale, or missing.

## Commands

- `/recap`: Generate and show a fresh recap.
- `/recap status`: Show selected model, active model, recap freshness, and whether the recap is visible.
- `/recap config`: Choose the recap model.
- `/recap help`: List recap commands.

Subcommands appear in autocomplete when you type `/recap `.

## Configuration

Run `/recap config` to choose the recap model.

![Recap model selector showing available model choices](https://raw.githubusercontent.com/tifandotme/pi-extensions/refs/heads/master/packages/pi-recap/assets/recap-model-selector.webp)

Choose `auto` to fall back to the first available model from this list:

1. `openai-codex/gpt-5.4-mini`
2. `openai-codex/gpt-5.3-codex-spark`
3. `anthropic/claude-haiku-4-5`
4. `anthropic/claude-haiku-4-5-20251001`

You can also edit `~/.config/pi/extensions/pi-recap.json` manually:

```json
{
  "model": "openai-codex/gpt-5.4-mini"
}
```

## License

[MIT](LICENSE)
