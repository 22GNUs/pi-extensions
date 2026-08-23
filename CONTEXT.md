# Context

## Glossary

### Recap model

The single concrete model pi-recap uses to generate session recaps after the user configures one. Before config exists, pi-recap uses its default recap model when that model is authenticated.

### Session rename

A pi extension behavior that generates a short task name from bounded user-message context and applies the same name to both the pi session display name and the current Herdr tab.

### Handoff

A durable markdown artifact that summarizes the current session so another agent or a future session can continue the work.

### Handoff request

A submitted prompt containing a standalone `-handoff` token. The text around the token becomes the focus for the next handoff session. If no text remains, the request means continue the current work.

### Handoff session

A new pi session created from a handoff artifact so another agent or future session can continue the work. It keeps a link to the previous session when available and starts the continuation work automatically.

### Session query

A tool-assisted lookup against a previous pi `.jsonl` session file.

### Fixed editor

A pi extension behavior that keeps the editor and footer visible at the bottom of the terminal while the transcript scrolls. It does not change footer content, editor behavior, or autocomplete.

### Fullscreen TUI mode

Pi's experimental native interactive mode that keeps the transcript in an application-owned scroll region while queued messages, status, widgets, editor, and footer stay fixed at the bottom of the terminal.

### Draft stash

A session-owned temporary holding slot for one text draft. Stashing clears the editor so the user can submit another message. When that message is submitted, the held draft immediately returns to the editor while the agent works. A pending draft survives leaving and resuming its session.
