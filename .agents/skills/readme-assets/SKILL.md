---
name: readme-assets
description: Standardizes README image assets for packages that must render on GitHub, npm, and pi.dev. Use when adding, converting, optimizing, moving, or linking README assets, screenshots, GIFs, diagrams, or images in Markdown package docs.
---

# README Assets

## Defaults

- Use WebP for screenshots and static README images unless animation or transparency needs another format.
- Store package images under `packages/<package>/assets/`.
- Use absolute raw GitHub URLs, not relative paths, so images render on GitHub, npm, and pi.dev.
- Use descriptive alt text.

## URL format

```md
![Describe the image](https://raw.githubusercontent.com/tifandotme/pi-extensions/refs/heads/master/packages/<package>/assets/<image>.webp)
```

## Workflow

1. Put images in the package `assets/` directory.
2. Convert PNG/JPEG screenshots to `.webp` with `cwebp` when available.
3. Update README links to the raw GitHub URL format above.
4. Remove superseded image files only when the README no longer references them.
5. Verify no stale image references remain:

```bash
rg -n "assets/.*\.(png|jpg|jpeg)|images/|\.png|\.jpg|\.jpeg" README.md packages/*/README.md
```

## Optimization

- Prefer the default `cwebp` output first. It is usually enough for terminal or UI screenshots.
- If files remain large, try `cwebp -m 6 -q 75 input.png -o output.webp` and compare visual quality before replacing.
- Do not over-optimize small screenshots for marginal savings.

## Compatibility notes

- GitHub READMEs support relative paths, but npm and pi.dev may not preserve the same repository context.
- Raw GitHub URLs are the safest shared format across GitHub, npm, and pi.dev.
