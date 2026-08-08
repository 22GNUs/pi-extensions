---
id: TASK-002
title: Fix pi-fixed-editor flicker and long-session responsiveness
status: In Progress
assignee:
  - "@amp"
created_date: "2026-06-10 17:32"
updated_date: "2026-08-08 07:41"
labels: []
dependencies: []
modified_files:
  - packages/pi-fixed-editor/src/terminal-split.ts
  - packages/pi-fixed-editor/tests/terminal-split.test.ts
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Address remaining pi-fixed-editor UX issues from the original TASK-001 scope: fixed editor flicker during frequent agent message updates and slower interaction in long sessions with many tool calls and messages.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Editor does not flicker while agent activity causes frequent message updates
- [ ] #2 Rendering work is reduced for long sessions so editor responsiveness is closer to a fresh session
- [ ] #3 Changes preserve fixed editor/footer behavior and transcript scrolling behavior
- [ ] #4 Targeted tests or measurable checks cover repaint stability and long-session rendering work

<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Review the fixed-editor streaming rendering change.
2. Add a patch changeset for @tifan/pi-fixed-editor.
3. Run the package and repository checks.
4. Verify the extension in regular TUI mode, then close the task.

<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

Added a patch changeset for the streaming-flicker fix. Manual verification in regular TUI mode is pending.
<!-- SECTION:NOTES:END -->
