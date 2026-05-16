# Changesets

This directory holds [Changesets](https://github.com/changesets/changesets). Each `.md` file describes intent to bump one or more packages, with a changelog summary.

Run `bun changeset` to author one. Commit the resulting file alongside the code change.

The Release workflow consumes these files: it opens a "Version Packages" PR that bumps package versions and updates changelogs, then publishes to npm when that PR is merged.
