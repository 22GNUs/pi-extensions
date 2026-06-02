# Fixed editor uses terminal split

Fixed editor keeps Pi’s existing editor-adjacent TUI components visible by pinning them in a fixed terminal region while the transcript scrolls. We reuse the actual footer, widgets, and editor components instead of cloning their state or adding new styling, because cloning would break composability with other extensions and Pi’s public editor API does not control scroll-region layout.
