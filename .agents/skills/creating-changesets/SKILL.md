---
name: creating-changesets
description: Creates non-interactive Changesets release notes for this monorepo. Use when asked to add, write, create, or prepare changesets for package changes, especially instead of running `bun changeset` manually.
---

# Creating Changesets

Create Changesets files directly. Do not run `bun changeset` unless the user explicitly asks for the interactive flow.

## Workflow

1. If the package is not provided, ask which package or packages should get a changeset before inspecting diffs.
2. Inspect the relevant package diffs:
   ```bash
   git diff -- packages/<package-name>
   ```
3. Choose the bump type:
   - `patch`: fixes, docs, internal behavior corrections.
   - `minor`: new user-facing commands, options, or capabilities.
   - `major`: breaking changes.
4. Prefer one changeset file per package when summaries differ.
5. Use one combined changeset only when the same release note accurately describes all packages.
6. Create a short, lowercase filename under `.changeset/`, for example:
   ```text
   .changeset/add-recap-config.md
   ```
7. Write concise frontmatter and one plain summary paragraph.

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
- If repository instructions conflict with a direct user request to create a changeset, follow the direct request and create the smallest correct changeset file.
