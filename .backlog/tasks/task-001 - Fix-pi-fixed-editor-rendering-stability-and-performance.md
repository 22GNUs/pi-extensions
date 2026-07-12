---
id: TASK-001
title: Add visible transcript scrollbar to pi-fixed-editor
status: Done
assignee:
  - "@pi"
created_date: "2026-06-10 17:10"
updated_date: "2026-06-10 17:37"
labels: []
dependencies: []
modified_files:
  - packages/pi-fixed-editor/src/terminal-split.ts
  - packages/pi-fixed-editor/tests/terminal-split.test.ts
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Show a right-side scrollbar in the scrollable transcript area while the fixed editor/footer cluster remains pinned at the bottom. The scrollbar should reflect the transcript viewport position during mouse wheel and keyboard scrolling.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Transcript viewport shows a right-side scrollbar only when transcript content exceeds visible transcript rows
- [x] #2 Scrollbar reserves the rightmost transcript column so it does not overwrite message text
- [x] #3 Scrollbar thumb position and size reflect the current transcript scroll offset and visible range
- [x] #4 Mouse wheel, PageUp/PageDown, Enter-to-bottom, target jumps, and selection repaint keep the scrollbar in sync
- [x] #5 Scrollbar uses a dim track and normal thumb, and is excluded from text selection/copy
- [x] #6 Fixed editor/footer rendering remains unchanged and does not include the scrollbar

<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Add transcript scrollbar geometry based on root line count, visible transcript rows, and scroll offset.
2. Reserve one rightmost transcript column only when transcript content overflows.
3. Decorate transcript viewport rows with a dim track and normal thumb without changing fixed editor/footer paint.
4. Keep scrollbar synchronized across mouse wheel, PageUp/PageDown, Enter-to-bottom, target jumps, and selection repaint.
5. Add targeted terminal-split tests for visibility, geometry movement, selection exclusion, and fixed cluster isolation.

<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

Implemented transcript-only scrollbar rendering in terminal-split. The scrollbar reserves the rightmost transcript column only when root content overflows, uses a dim track and normal thumb, updates with scroll state, and is excluded from root text selection. Added targeted tests for visibility, thumb movement, selection exclusion, and existing enter-to-bottom behavior.

<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->

Added a visible transcript scrollbar to pi-fixed-editor while keeping the fixed editor/footer cluster unchanged.

Changes:

- Reserved the transcript viewport's rightmost column only when transcript content overflows.
- Added scrollbar geometry based on visible transcript rows and scroll position.
- Rendered a dim track with a normal thumb across transcript rows only.
- Excluded the scrollbar column from root text selection/copy.
- Added targeted terminal-split tests for visibility, thumb movement, selection exclusion, and enter-to-bottom behavior.

Tests:

- bun run typecheck
- bun run lint
- node --experimental-strip-types --test packages/pi-fixed-editor/tests/terminal-split.test.ts

<!-- SECTION:FINAL_SUMMARY:END -->
