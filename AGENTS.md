# Agent Instructions

Monorepo of [pi-coding-agent](https://pi.dev) extensions. Each package in `packages/` is an independent pi extension published to npm under `@tifan/`.

## Structure

```
packages/
  pi-copy-all/
  pi-friction/
  pi-handoff/
  pi-inline-skills/
  pi-mermaid-open/
  pi-preferred-thinking/
  pi-recap/
  pi-titlebar-spinner/
```

Each package has:

- `package.json` with `"pi": { "extensions": [...] }` declaring entry points and `keywords: ["pi-package", "pi-extension"]`.
- One or more entry `.ts` files at the package root (flat, no `src/`).
- `tsconfig.json` extending `../../tsconfig.base.json`.
- `LICENSE` symlinked to the root `LICENSE`.
- `README.md` with install snippet, tools/commands list, and a `Credits` section if the package is a fork.

## Writing extensions

Extensions are TypeScript loaded by pi via [jiti](https://github.com/unjs/jiti). No build step. The entry point exports a default function receiving `ExtensionAPI`.

Available runtime imports (provided by pi at load time):

- `@earendil-works/pi-coding-agent` — extension types, components, utilities
- `@earendil-works/pi-tui` — TUI components
- `@earendil-works/pi-ai` — AI client types
- `@earendil-works/pi-agent-core` — agent message types
- `typebox` — schema definitions for tool parameters

Pi extension docs: https://pi.dev/docs/latest/extensions

## Checks after code changes

From the repo root:

```bash
bun run typecheck
bun run lint
bun run format
```

Fix errors before moving on. Keep typecheck before final format because type errors may need code changes, and formatting should be the last cleanup step.

## Adding a package

1. Create `packages/pi-<name>/`.
2. Copy the structure of an existing package: `package.json`, `tsconfig.json`, `README.md`, `LICENSE` (symlink → `../../LICENSE`).
3. Set `"name": "@tifan/pi-<name>"` and `"pi": { "extensions": ["./<entry>.ts"] }`.
4. Add `"publishConfig": { "access": "public", "provenance": true }`.

## Releases

This repo uses [Changesets](https://github.com/changesets/changesets) with the [`changesets/action`](https://github.com/changesets/action) auto-PR flow. Direct-to-master is fine.

1. After changes, run `bun changeset`. Select packages, bump level, write summary.
2. Commit the changeset file along with the code change and push to `master`.
3. The Release workflow opens or updates a "Version Packages" PR aggregating pending changesets.
4. Merge that PR to ship: the workflow runs `changeset publish` and pushes tags.

### First publish

The Release workflow uses npm OIDC trusted publishing (`id-token: write`, `publishConfig.provenance: true`). No `NPM_TOKEN` secret is needed at any point.

Before the first publish of a new package, pre-configure it on npmjs.com:

1. Sign in at npmjs.com → **Account settings** → **Trusted publishers** → **Add trusted publisher**.
2. For each `@tifan/pi-*` package name, add an entry with:
   - Publisher: GitHub Actions
   - Organization: `tifandotme`
   - Repository: `pi-extensions`
   - Workflow filename: `release.yml`
   - Environment: (leave empty)
3. Once all 8 entries exist, push the changeset to `master`. The workflow opens the Version PR; merging it runs `changeset publish`, which mints an OIDC token and publishes with provenance.

## Conventions

- TypeScript, no build step.
- Conventional Commits (`feat`, `fix`, `chore`, `docs`, ...). Lowercase subject, no period, header under 72 chars.
- One npm package per extension. No cross-package imports.
- Flat file layout inside each package (no `src/`).
- `master` is the default branch.
- Bun is the package manager; commit `bun.lock`.
