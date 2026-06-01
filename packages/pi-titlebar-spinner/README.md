# @tifan/pi-titlebar-spinner

Show a braille spinner in the pi titlebar while the agent runs.

The spinner starts on `agent_start` and stops on `agent_end` or `session_shutdown`. When it stops, the extension restores the default `π - [session - ]cwd` title.

[add image: titlebar spinner while agent runs]

- The titlebar while the spinner is active.
- The restored titlebar after the agent finishes.

## Install

```bash
pi install npm:@tifan/pi-titlebar-spinner
```

## License

[MIT](LICENSE)
