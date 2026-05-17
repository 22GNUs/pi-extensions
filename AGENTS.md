# Agent Instructions

Monorepo of [pi-coding-agent](https://pi.dev) extensions. Each package in `packages/` is an independent pi extension published to npm under `@tifan/`.

Releases are handled manually. Don't run `bun changeset`, `npm publish`, edit files under `.changeset/`, or bump versions in `package.json`.

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

## Local development

Install dependencies once at the repo root:

```bash
bun install
```

To try a package without publishing:

```bash
pi install /absolute/path/to/pi-extensions/packages/pi-<name>
```

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
5. Stop there and tell Tifan. The first publish of a new package is manual.

## Conventions

- TypeScript, no build step.
- Conventional Commits (`feat`, `fix`, `chore`, `docs`, ...). Lowercase subject, no period, header under 72 chars.
- One npm package per extension. No cross-package imports.
- Flat file layout inside each package (no `src/`).
- `master` is the default branch.
- Bun is the package manager; commit `bun.lock`.
