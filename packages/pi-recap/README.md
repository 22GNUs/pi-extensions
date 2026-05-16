# @tifan/pi-recap

Rolling session recap shown in the pi titlebar. After each agent response, the previous recap and the latest exchange are sent to a fast model, which produces a single-sentence update of session state.

## Install

```bash
pi install npm:@tifan/pi-recap
```

## Commands

- `/recap status` — show selected model, active model, and whether a recap is available.

## Credits

Fork of [`richtan/pi-tldr`](https://github.com/richtan/pi-tldr).

Changes from upstream:

- Recap runs after the agent finishes responding, not after every tool call. Similar to Claude Code's behaviour.

## License

[MIT](LICENSE)
