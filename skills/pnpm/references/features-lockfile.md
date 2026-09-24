---
name: features-lockfile
description: pnpm-lock.yaml internals — the two-document format, env lockfile, frozen installs, per-branch lockfiles, config dependencies, and patched dependencies.
---

# Lockfile & Patches

`pnpm-lock.yaml` must be committed. Merging it is normally just `pnpm install` — pnpm resolves the conflict, but it keeps the most recent side rather than proving the result correct, so review before committing.

## Two documents in one file

`pnpm-lock.yaml` may contain **two YAML documents**, both with `lockfileVersion: '9.0'`:

1. an **env lockfile** — `configDependencies` and `packageManagerDependencies` plus their `packages`/`snapshots`;
2. the **project lockfile** — `importers` (your manifests) plus `packages`/`snapshots`.

The env document is present when the project has config dependencies or records a resolved pnpm version (declared `devEngines.packageManager`, or pinned through the legacy `packageManager` with pnpm ≥ 12). `pmOnFail: ignore` disables that recording.

Tooling implications:

- A first line of `---` means there are two documents. Use a multi-document reader (`loadAll(...).at(-1)` for the project graph) — single-document readers either error or silently return the env document.
- Update bots and dependency-graph tools want the **last** document; vulnerability scanners and SBOM tooling must read **all** documents (config dependencies install into `node_modules/.pnpm-config` and appear only in the env document). Scanners reading just the first document report zero dependencies and zero vulnerabilities.
- Never merge the two documents into one object — both use the `.` importer key and would overwrite each other. `pnpm audit` reads both correctly.
- Since v11.23.0 a frozen install does not rewrite that block: a missing or mismatching pinned pnpm version fails with `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE`.
- `resolution.revision` on a `packages` entry marks a registry revision (v12.0.0) — see [features-registries](features-registries.md).

## Frozen installs and CI

- `--frozen-lockfile` is implied when CI is detected (ci-info: `CI`, `CONTINUOUS_INTEGRATION`, `BUILD_NUMBER`, `RUN_ID`) and a lockfile exists, and `preferFrozenLockfile: true` (default) skips resolution entirely whenever the lockfile already satisfies the manifests. Since v11 a lockfile written by a newer pnpm major fails the CI install instead of being silently rewritten.
- `pnpm ci` = `pnpm clean` + `pnpm install --frozen-lockfile`; `pnpm fetch` populates the virtual store from the lockfile alone (Docker layer caching) — local `file:` dependencies are skipped there.
- Since v11.4.0 an integrity mismatch is fatal (`ERR_PNPM_TARBALL_INTEGRITY`) and only `--update-checksums` bypasses it.

## Per-branch lockfiles

```yaml
gitBranchLockfile: true
mergeGitBranchLockfilesBranchPattern: [main, 'release*']
```

Each branch gets `pnpm-lock.<branch>.yaml` (a `/` in the branch name becomes `!`, so `feature/1` → `pnpm-lock.feature!1.yaml`) to keep merge conflicts away. Merge them back with `pnpm install --merge-git-branch-lockfiles`.

## Patched dependencies

```bash
pnpm patch <pkg>@<version>      # unpack into a temp dir (--edit-dir <dir>, --ignore-existing)
pnpm patch-commit <dir>         # store the patch and record patchedDependencies
pnpm patch-remove <pkg...>
```

Patches live in `patchesDir` (CLI `--patches-dir`) and are recorded in `pnpm-workspace.yaml` as `patchedDependencies`. Selection priority is exact version > version range > package name; `*` behaves like the bare name but keeps patch failures fatal. Keep ranges non-overlapping. `allowUnusedPatches: true` (v10.7.0, formerly `allowNonAppliedPatches`) stops unused patches from failing the install; `ignorePatchFailures` was removed in v11. A patch that adds an install script or `binding.gyp` makes the package buildable and it must pass `allowBuilds`.

## Configuration dependencies and the env lockfile

`configDependencies` entries are installed before any regular dependency and their checksums are recorded in the env document. They cannot have regular `dependencies`, cannot define lifecycle scripts, and their `optionalDependencies` are one level deep with exact versions only. Because they install first, `.pnpmfile.mjs` hooks can import shared logic from `.pnpm-config/<pkg>`; patches shipped by a config dependency are referenced as `node_modules/.pnpm-config/<pkg>/<file>.patch` in `patchedDependencies`.

<!--
Source references:
- https://pnpm.io/lockfile
- https://pnpm.io/git_branch_lockfiles
- https://pnpm.io/config-dependencies
- https://pnpm.io/cli/patch
- https://pnpm.io/cli/install
-->
