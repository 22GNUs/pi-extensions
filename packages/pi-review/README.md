# @tifan/pi-review

> [!NOTE]
> This package is intentionally not published to npm

Add a practical code review workflow to pi.

`pi-review` provides `/review` and `/end-review` commands for reviewing uncommitted changes, branches, commits, GitHub pull requests, or folder snapshots. It can run reviews in an empty branch, then return with a summary or queue fixes.

## Commands

- `/review`: Choose a review target interactively.
- `/review uncommitted`: Review staged, unstaged, and untracked changes.
- `/review branch <branch>`: Review changes against a base branch.
- `/review commit <sha>`: Review one commit.
- `/review pr <number-or-url>`: Check out and review a GitHub pull request with `gh`.
- `/review folder <paths...>`: Review files or folders as a snapshot.
- `/review ... --extra "focus on performance"`: Add one-off review instructions.
- `/end-review`: Return from a review branch, optionally summarize or queue fixes.

## Review instructions

To customize reviews for a project, add `<project_root>/REVIEW.md`. Its contents are appended to the review prompt as plain text.

## Requirements

- Git for all review commands.
- GitHub CLI (`gh`) only for `/review pr`. Sign in with `gh auth login` and verify with `gh auth status` before reviewing a PR.

## Credits

Forked from [`earendil-works/pi-review`](https://github.com/earendil-works/pi-review).

## License

[MIT](https://github.com/tifandotme/pi-extensions/blob/master/LICENSE)
