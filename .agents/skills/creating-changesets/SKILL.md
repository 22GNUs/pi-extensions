---
name: creating-changesets
description: Creates non-interactive Changesets release notes for this monorepo. Use when asked to add, write, create, or prepare changesets for package changes, especially instead of running `bun changeset` manually.
---

# Creating Changesets

Create Changesets files directly. Do not run `bun changeset` unless the user explicitly asks for the interactive flow.

## Workflow

1. Read staged files first to determine which packages changed:
   ```bash
   git diff --staged --name-only
   ```
2. If no relevant staged package files are present, ask which package or packages should get a changeset.
3. Inspect the staged package diffs:
   ```bash
   git diff --staged -- packages/<package-name>
   ```
4. Identify what already existed before the staged diff, then describe only the new user-facing behavior. Do not say "add" for a feature that was already present and only gained a refinement. For example, if a command already had a picker and the diff adds a preview pane, write "Add a full-text preview to the response picker", not "Add a response picker".
5. Choose the bump type:
   - `patch`: fixes, docs, internal behavior corrections.
   - `minor`: new user-facing commands, options, or capabilities.
   - `major`: breaking changes.
6. Prefer one changeset file per package when summaries differ.
7. Use one combined changeset only when the same release note accurately describes all packages.
8. Create a short, lowercase filename under `.changeset/`, for example:
   ```text
   .changeset/add-recap-config.md
   ```
9. Write concise frontmatter and one plain summary paragraph.

## Examples

Single package:

```md
---
"@tifan/pi-recap": minor
---

Add `/recap config` to choose and save the recap model from Pi.
```

Multiple packages with the same release note:

```md
---
"@tifan/pi-preferred-thinking": minor
"@tifan/pi-recap": minor
---

Add interactive configuration commands for model-related extension settings.
```

## Rules for this repository

- Do not bump versions in `package.json`.
- Do not publish packages.
- Do not edit existing changeset files unless the user asks.
- Keep summaries user-facing. Mention command names and behavior, not implementation details.
- Avoid overstating scope. Compare removed and added lines, then name the delta precisely.
- If repository instructions conflict with a direct user request to create a changeset, follow the direct request and create the smallest correct changeset file.
