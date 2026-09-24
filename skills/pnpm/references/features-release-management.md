---
name: features-release-management
description: pnpm's native release flow (pnpm change / version -r / lane / versioning settings), publishing, staged publishing, pack-app, and changesets.
---

# Release Management & Publishing

## Native release flow (v11.13.0)

Two halves: `pnpm change` records intents in Changesets format under `.changeset/`, `pnpm version -r` consumes them.

```bash
pnpm change --bump patch --summary "fix: ..." @scope/core   # interactive when no args
pnpm change status        # pending intents and the planned release
pnpm change check         # validate committed versions against epics/fixed groups (run in CI, v12.4.0)
pnpm version -r [--dry-run] [--filter <sel>]   # no version argument: consume intents
pnpm publish -r
```

- `pnpm version -r` bumps the named packages, propagates the bump to their `workspace:` dependents, writes changelogs, and records consumed intents in the committed, append-only `.changeset/ledger.yaml` (keyed `"@scope/core@1.3.0"` with `dir` and `intents`). A changeset file is deleted only after every project it names has released, which keeps cherry-picks and merge-backs safe.
- Recursive mode **never** creates git commits or tags; commit yourself, then `pnpm publish -r`.
- `pnpm version <spec>` on a single project still creates a commit and an annotated tag, requires a clean worktree, and supports `--no-git-tag-version`, `--no-commit-hooks`, `--sign-git-tag`, `--preid`, `-m/--message`, `--tag-version-prefix` (default `v`), `--allow-same-version`, `--json`.
- First releases (v11.16.0): a package debuts at the version already in its manifest when that version is unpublished; pending intents apply from the next release.
- `pnpm update --changeset` (v11.16.0) writes an intent for the bumps it performs.

## versioning.\* settings

```yaml
versioning:
  ignore: ['./packages/private-*']
  maxBump: minor # patch | minor | major
  fixed:
    - ['@example/core', '@example/utils'] # always released with one version
  lanes:
    '@example/cli': alpha
  epics:
    - lead: '@example/app'
      packages: ['./packages/**', '!./packages/private-*']
  changelog:
    storage: registry # registry (default) | repository
```

- `fixed` groups share the highest current version plus the largest needed bump; members must move lanes together and sit entirely inside or outside an epic.
- **Lanes** are release channels: `pnpm lane alpha --filter '@example/cli'`, back to the default with `pnpm lane main --filter ...`, membership listed by bare `pnpm lane`. Prereleases are versioned `X.Y.Z-<lane>.N`, and `N` resets when the stable target changes. Lane names are alphanumeric-with-dashes, never purely numeric.
- **Epics** band members under the lead's major: while the lead is on major `M`, members are constrained to `M*100…M*100+99`. Members move independently inside the band; a bump past the ceiling is rejected until the lead advances, and a new lead major re-bases members to the band floor. Selectors are pnpm package selectors evaluated in order (last match wins); the lead is never a member.
- `changelog.storage: registry` (default) commits nothing — sections are composed at publish time; `repository` keeps committed `CHANGELOG.md` files.
- With duplicate published names, reference a project by its `./`-prefixed workspace-relative directory in intents, `lanes`, `fixed` and `ignore`.

## Changesets (the standalone tool)

pnpm's built-in flow uses the same file format, so either works:

```bash
pnpm add -Dw @changesets/cli && pnpm changeset init
pnpm changeset                # author intents, commit .changeset/*.md
pnpm changeset version && pnpm install   # bump + lockfile
pnpm publish -r               # add --access=public for public scoped packages
```

CI: a `ci:publish` script running `pnpm publish -r`, driven by a workflow using `changesets/action@v1` with `pnpm/setup@v2` (e.g. `runtime: node@20`, `cache: true`) and `GITHUB_TOKEN` + `NPM_TOKEN` secrets.

## Publishing

`pnpm publish` has been a native implementation since v11 — it no longer delegates to the npm CLI. Fall back to `pnpm pack` + `npm publish <tgz>` if a feature is missing.

- `-r` publishes only versions that do not exist on the registry yet; the workspace-root `LICENSE` is included unless the package has its own.
- `--batch` (v11.7.0) publishes the recursive set in one `PUT /-/pnpm/v1/publish` request per registry, all-or-nothing (a registry that does not support it gives `ERR_PNPM_BATCH_PUBLISH_UNSUPPORTED`); since v11.24.0 credentials are validated before publishing and `publish`/`postpublish` run per group.
- `--skip-manifest-obfuscation` (v11.3.0) keeps the original `packageManager` field and lifecycle scripts (pnpm's own `pnpm` field is still removed).
- Safety flags: `--no-git-checks`, `--publish-branch <branch>` (default `master`/`main`), `--dry-run`, `--force`, `--report-summary` (writes `pnpm-publish-summary.json`), `--otp`, `--provenance`, `--tag`, `--access`.
- Per-package behaviour comes from `publishConfig` in the manifest — see [features-package-json](features-package-json.md).

**Staged publishing** (`pnpm stage`, v11.3.0): `publish` → `list` → `view <id>` → `approve [<id>...] [--otp]` / `reject` / `download <id>`. Since v12.0.0 several ids can be approved at once (one OTP for the batch, interactive when no id is given), and inside a workspace approvals follow dependency order so packages whose dependencies were not approved are skipped rather than shipped.

**Packing**: `pnpm pack` (`-r` since v10.11.0, `--out` with `%s`/`%v` placeholders, `--pack-destination`, `--pack-gzip-level`, `--json`). `pnpm pack-app` (v11.0.0, experimental) builds a standalone executable from a CJS entry with Node SEA (`--entry`, `--target os-arch[-libc]`, `--runtime node@>=25.5`, `--output-dir`, config under `pnpm.app`); the host needs Node v25.5+ (downloaded automatically when absent).

## Registry and workspace admin

```bash
pnpm access list packages|collaborators ; pnpm access get status <pkg> ; pnpm access set status=public|private ; pnpm access set mfa=… ; pnpm access grant|revoke
pnpm team create|destroy|add|rm|ls          # references always scoped: @myorg, @myorg:developers
pnpm repo [pkg] ; pnpm dist-tag add|rm|ls ; pnpm deprecate <pkg>[@range] "<msg>" ; pnpm unpublish [--force] ; pnpm star|unstar
pnpm --filter=<pkg> --prod deploy <dir>
```

`pnpm deploy` produces a portable, self-contained directory with its own lockfile and isolated `node_modules`. Since v12.2.0 it no longer needs `injectWorkspacePackages` (linked workspace deps become `file:` dependencies); an ambiguous peer fails with `ERR_PNPM_DEPLOY_AMBIGUOUS_PEER` — pin it with `overrides` or enable `injectWorkspacePackages`. It always creates a local virtual store, ignoring the global-virtual-store setting. Included files resolve in order: `files` in `package.json` → `.npmignore` → `.gitignore`. `--legacy` / `forceLegacyDeploy: true` selects the old implementation.

<!--
Source references:
- https://pnpm.io/versioning
- https://pnpm.io/using-changesets
- https://pnpm.io/cli/publish
- https://pnpm.io/cli/stage
- https://pnpm.io/cli/deploy
- https://pnpm.io/cli/pack-app
-->
