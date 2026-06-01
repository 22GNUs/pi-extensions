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
- `/recap status`: Show the selected model, active model, recap freshness, and whether the recap is visible.
- `/recap config`: Choose an authenticated recap model.
- `/recap help`: List recap commands.

## Configuration

Out of the box, `pi-recap` uses this default model when it is authenticated:

```text
openai-codex/gpt-5.4-mini
```

Run `/recap config` to choose a different authenticated model. The picker shows models available in pi that already have usable auth, and it includes search.

![Recap model selector showing available model choices](https://raw.githubusercontent.com/tifandotme/pi-extensions/refs/heads/master/packages/pi-recap/assets/recap-model-selector.webp)

After you choose a model, `pi-recap` uses only that model. If it is no longer authenticated, recap generation fails visibly instead. Choose `Use default` in `/recap config` to delete the config file and return to the default.

You can also edit `~/.config/pi/extensions/pi-recap.json` manually:

```json
{
  "model": "openai-codex/gpt-5.4-mini"
}
```

## License

[MIT](LICENSE)
