# Context

## Glossary

### Recap model

The single concrete model pi-recap uses to generate session recaps after the user configures one. Before config exists, pi-recap uses its default recap model when that model is authenticated.

### Autoname

A pi extension behavior that chooses a short task name for the current session and applies the same name to both the pi session display name and the current Herdr tab.

### Handoff

A durable markdown artifact that summarizes the current session so another agent or a future session can continue the work.

### Handoff session

A new pi session started from a handoff generated from the current pi session. The pi-handoff extension requires a discoverable skill named exactly `handoff` and uses that skill as the policy source for the generated artifact. The command takes no slash args; it asks for the next session focus with a one-line input. Handoff generation uses the current selected model with no model-specific config. The artifact uses a stable, readable temp-file name. The new session references the generated temp-file handoff instead of inlining it, and leaves the prompt in the editor for manual submission.

### Session query

A tool-assisted lookup against a previous pi `.jsonl` session file.

### Fixed editor

A pi extension behavior that keeps the editor and footer visible at the bottom of the terminal while the transcript scrolls. It does not change footer content, editor behavior, or autocomplete.
