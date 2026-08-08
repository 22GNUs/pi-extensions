---
id: decision-001
title: Fixed editor uses terminal split
date: "2026-08-08 08:01"
status: accepted
---

## Context

Fixed editor must keep Pi's editor-adjacent TUI components visible while the transcript scrolls. Pi's public editor API does not control scroll-region layout.

## Decision

Use a terminal split to pin the existing footer, widgets, and editor in a fixed terminal region. Reuse those components instead of cloning their state or adding new styling.

## Consequences

Fixed editor keeps the existing component behavior and remains composable with other extensions. It depends on terminal-split layout behavior, while footer content, editor behavior, and autocomplete stay unchanged.
