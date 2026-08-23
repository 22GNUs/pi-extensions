# @tifan/pi-rename

Generate session names for pi and Herdr.

## Install

```bash
pi install npm:@tifan/pi-rename
```

This package requires Pi 0.84.2 or newer.

## How it works

Run `/rename` to generate a fresh hyphen-separated session name. The extension applies the name to the pi session and, when pi is running inside Herdr, to the current Herdr tab.

When a named session starts or resumes in Herdr, the extension also applies the saved pi session name to the current tab if the tab still has its default Herdr label.

`/rename` builds naming context from the first user message plus up to three latest user messages. It ignores assistant replies, tool output, and attachments. Before sending context to the rename model, it redacts common secrets.

If the rename model is unavailable, `/rename` falls back to a local name from the latest user message.

## Commands

- `/rename`: Generate and apply a session name.
- `/rename status`: Show model and rename status.
- `/rename config`: Choose a rename model.
- `/rename help`: List rename commands.

Manual names are not supported. Use pi's built-in `/name` command when you want an exact name.

## Configuration

Out of the box, `pi-rename` uses this default model: `openai-codex/gpt-5.6-luna`.

Run `/rename config` to choose a different model.

After you choose a model, `pi-rename` uses only that model. Choose `Use default` in `/rename config` to return to the default.

You can also edit `~/.config/pi/extensions/pi-rename.json` manually:

```json
{
  "model": "openai-codex/gpt-5.6-luna"
}
```

## Herdr behavior

Herdr tab renaming requires the `herdr` CLI. If it is unavailable, the extension still renames the pi session.

The extension uses `HERDR_PANE_ID` to find the current Herdr pane, then renames that pane's tab.

On session startup or resume, it only auto-renames tabs that still have the default Herdr label, such as the tab number. It does not overwrite custom Herdr tab labels.

On quit, the Herdr tab keeps the last session name.

If pi is not running inside Herdr, only the pi session name is updated.

## Release notes

See [CHANGELOG.md](https://github.com/tifandotme/pi-extensions/blob/master/packages/pi-rename/CHANGELOG.md)

## License

[MIT](https://github.com/tifandotme/pi-extensions/blob/master/LICENSE)
