# @tifan/pi-copy-response

Pick one assistant response from the current pi session, preview it, then copy it to the system clipboard.

<img width="1378" height="451" alt="picker" src="https://github.com/user-attachments/assets/fa3e9a1a-e0e4-4b61-b1c0-30631c12b21d" />

Use this when pi's built-in `/copy` is not enough. `/copy` copies only the last assistant response. This extension lets you choose an older response and preview the full text before copying it.

## Install

```bash
pi install npm:@tifan/pi-copy-response
```

## Commands

- `/copy-response`: Open a response picker, preview the selected assistant response on the right, and copy it.

The picker hides pi's footer while it is open, so long previews have more room.

## License

[MIT](LICENSE)
