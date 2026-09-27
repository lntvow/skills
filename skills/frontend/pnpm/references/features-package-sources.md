---
name: features-package-sources
description: Dependency sources beyond plain npm ranges — jsr:/crate:/pypi:, npm: aliases, git and tarball specs, purl, Python and Cargo ecosystems, and managed package managers.
---

# Package Sources

pnpm distinguishes **trusted** sources (npm registry, JSR, local filesystem, workspace) from **exotic** ones (remote tarballs, git). `blockExoticSubdeps: true` (default since v10.26.0) forbids *transitive* dependencies from using exotic sources.

```bash
pnpm add express@nightly            # dist-tag
pnpm add react@">=0.1.0 <0.2.0"     # range
pnpm add jsr:@hono/hono@4           # JSR (v10.9.0)
pnpm add lodash@npm:awesome-lodash  # alias
pnpm add crate:serde@^1.0.200       # Cargo (v12.4.0)
pnpm add pypi:httpx@0.28.1          # Python (v12.4.0)
pnpm add 'pkg:npm/express@4.18.2'   # purl (v12.5.0)
```

## Aliases

```bash
pnpm add lodash@npm:awesome-lodash          # alias
pnpm add lodash1@npm:lodash@1 lodash2@npm:lodash@2   # two majors side by side
```

For bulk rewrites, use the `.pnpmfile.mjs` `readPackage` hook and set `pkg.dependencies.lodash = 'npm:awesome-lodash@^1.0.0'`.

## Local and tarball

- `pnpm add ./some-directory` creates a symlink (equivalent to `pnpm link`).
- `pnpm add ./package.tar.gz` installs a local tarball; a remote tarball must start with `http://` or `https://`.

## Git

```bash
pnpm add kevva/is-positive
pnpm add github:user/repo#tag        # providers: github:, bitbucket:, gitlab:
pnpm add git+ssh://git@github.com:zkochan/is-negative.git#2.0.1
pnpm add user/repo#semver:^2.0.0
pnpm add user/repo#path:/packages/app   # subdirectory
pnpm add user/repo#beta\&path:/packages/app   # combine with &
```

- Refs: `#<commit>`, `#<branch>`, `#head...`, `#<tag>`, `#semver:<range>`, `#path:<dir>`.
- Since v12.0.0 the git specifier expresses **identity, not transport**: `user/repo`, `github:...`, `git+https://...` and `git+ssh://...` resolve identically; pnpm records a canonical HTTPS `git` resolution (never an SSH URL) for known hosts, and preserves unknown hosts or URLs with embedded credentials. Since v11.21.0 an SSH URL is only recorded when the specifier explicitly asks for it.
- Private repositories: configure git itself, e.g. `git config --global url."git@github.com:".insteadOf https://github.com/`.
- For a git dependency that needs building (v12.0.0-rc.6), pnpm uses the dependency's own `packageManager`/`devEngines.packageManager`, else the package manager implied by its lockfile, provisioning it if necessary.

## Python (experimental, v12.4.0)

```yaml
# pnpm-workspace.yaml
python:
  enabled: true
  executable: python3 # optional; otherwise auto-detected
  extras: [dev]
  groups: [test]
  versions: ['3.12', '3.13']
```

- Reads `pyproject.toml` and writes `pylock.toml`; `pnpm add pypi:httpx@0.28.1` or `pypi:'httpx>=0.28'`, `-D pypi:pytest`. A bare `name@version` becomes an exact `==` pin. Full PEP 508 (markers, extras) is supported.
- One `.venv` per project (a symlink into the store's `python-envs` since v12.5.0); pnpm refuses to take over a `.venv` it did not create. `pnpm run`/`pnpm exec` put `.venv/bin` (`.venv/Scripts` on Windows) first on `PATH`.
- `--lockfile-only`, `--frozen-lockfile` and `--offline` apply to Python dependencies too.
- Workspace/path sources via `[tool.uv.sources]` (`{ workspace = true }`, `{ path = "../shared", editable = true }`, v12.5.0); undeclared workspace requirements are refused rather than resolved from an index.
- Per-project overrides live in `pyproject.toml` under `[tool.pnpm.python]` (`extras`, `groups`, `shared-environment = true`).
- Approve Python build backends in `allowBuilds` with purl keys: `'pkg:pypi/hatchling': true`.
- Multi-environment locking (v12.5.0): `supportedArchitectures` + `python.versions` lock per platform × interpreter.
- Indexes: default `https://pypi.org/simple/`; configure with `registries` + `ecosystem: pypi` (and `packages` routing since v12.5.1). `python.indexUrl`/`python.extraIndexUrls` are **not** supported. Missing package: `ERR_PNPM_UNCLAIMED_PYTHON_PACKAGE`.

## Cargo (experimental, v12.4.0)

```yaml
cargo:
  enabled: true
```

- `pnpm add crate:serde@^1.0.200` writes `Cargo.toml` (without reformatting it) and regenerates `Cargo.lock`; a `Cargo.toml` alone is enough — pnpm never creates a `package.json` for it.
- Crates are recorded **only** in `Cargo.lock`, never in `pnpm-lock.yaml`.
- Install flow: sparse-index resolution → deterministic `Cargo.lock` (an existing one is used as-is) → checksum verification and unpack into the store → linking under `.pnpm/crates/crates-io` (with `.cargo-checksum.json`) → source replacement written into `.cargo/config.toml` inside `# >>> pnpm-managed cargo sources >>>` / `# <<< pnpm-managed cargo sources <<<` markers (content outside the markers is untouched).
- Registry: `registries: { https://index.crates.io/: { ecosystem: cargo } }` — only **one** Cargo index is allowed and a third-party `registry = "..."` in `Cargo.toml` is rejected.
- Auth: pnpm's URL-scoped credentials, plus `CARGO_REGISTRY_TOKEN` and `$CARGO_HOME/credentials.toml`.
- Git crates are vendored under `.pnpm/crates/git`; store slots are keyed by commit. `[patch]`/`[replace]` are honoured; Cargo's resolver is used when source overrides or direct git deps exist. Allowed git protocols: `file`, `git`, `http`, `https`, `ssh`, honouring `GIT_ALLOW_PROTOCOL`.

## Managing other package managers (v12.0.0-rc.6, pnpm 12)

```bash
pnpm add yarn@4          # records the project package manager (exact version in packageManager)
pnpm add npm@11          # writes devEngines.packageManager
pnpm add node@22         # declares a runtime (engines.runtime)
pnpm add bun@runtime:1.3.0
pnx yarn@4 install       # one-off provisioned run
pnpm add -g node@22      # install a real Node distribution globally
```

Registry packages are signature-verified before execution, and only one of `packageManager` / `devEngines.packageManager` may be present. `pnpm add <pm> --filter ...` fails with `ERR_PNPM_PACKAGE_MANAGER_IN_SELECTION`; to install a package manager *as a dependency* use `pnpm add yarn@npm:yarn@1.22.22` or `pnpm add yarn@yarnpkg/berry`. A non-pnpm package manager's resolved version is not written to `pnpm-lock.yaml`.

<!--
Source references:
- https://pnpm.io/package-sources
- https://pnpm.io/aliases
- https://pnpm.io/git
- https://pnpm.io/python
- https://pnpm.io/cargo
- https://pnpm.io/package-managers
-->
