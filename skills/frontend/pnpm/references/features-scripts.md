---
name: features-scripts
description: pnpm script execution — hidden scripts, lifecycle hooks, script env vars, dependency build approval (allowBuilds), and the build-related settings.
---

# Scripts, Lifecycle & Build Approval

## Script rules

- **Hidden scripts** (v11.0.0): a script whose name starts with `.` cannot be run directly (`pnpm run .helper` fails), is omitted from listings, and is callable from other scripts: `"build": "pnpm run .helper && tsc"`.
- Built-in commands `clean`, `setup`, `deploy` and `rebuild` yield to a same-named user script (v11.0.0). Force the built-in with `pnpm pm <name>` — the same escape hatch applies to any command shadowed by a script (e.g. `pnpm pm tasks status`).
- `pre<cmd>`/`post<cmd>` hooks run automatically unless `enablePrePostScripts: false`.
- Script execution uses `scriptShell` (path; relative paths resolve from the workspace root since v12.4.0) or the JS bash-like `shellEmulator: true` for cross-platform POSIX syntax.

```bash
pnpm run "/^watch:.*/"       # regex selector — quoted, slash-delimited
pnpm run build -- --flag     # args after the script name go to the script
pnpm -r run build            # recursive, ordered by the task graph
pnpm --if-present build      # no error when the script is missing
```

Regex flags are unsupported (`ERR_PNPM_UNSUPPORTED_SCRIPT_COMMAND_FORMAT`), matching is non-anchored, and an exact script name always wins over a regex. Since v12.2.0 matching scripts run concurrently (bounded by `--workspace-concurrency`); `--sequential` runs them one by one.

## Environment of a script

- `PATH` gets the project's `node_modules/.bin`, plus `<workspace root>/node_modules/.bin` in a workspace.
- Only `npm_package_name`, `npm_package_version` and `npm_lifecycle_event` are set; `npm_command=run-script`. Since v11 `npm_config_*` is **not** populated from pnpm's config (matching Yarn).
- `-r exec` exposes `PNPM_PACKAGE_NAME` per project; use `--shell-mode`/`-c` for the shell to expand it.

## Hooks

| Hook                 | When                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| `pnpm:devPreinstall` | Before any dependency is installed, on a local `pnpm install` of the project itself (root `package.json` only; also runs in CI). |
| `preinstall` / `install` / `postinstall` | Dependency build scripts — **not run by default** since v10 and subject to approval (below). |

## Build approval

Dependency install scripts are blocked unless approved. Since v11 the old `onlyBuiltDependencies` / `neverBuiltDependencies` / `ignoredBuiltDependencies` settings are gone — use `allowBuilds`, a map of package matchers to `true`/`false`.

```yaml
allowBuilds:
  esbuild: true
  core-js: false
  'nx@21.6.4 || 21.6.5': true
  nx@21.6.0: false
  # git-hosted deps: approve by repository URL (no #ref) or by exact resolved path
  'foo@git+ssh://git@example.com/org/foo.git': true
  'bar@git+https://github.com/org/bar.git#abc123': true
strictDepBuilds: true # default: unreviewed build scripts fail the install (ERR_PNPM_IGNORED_BUILDS)
dangerouslyAllowAllBuilds: false # runs every dependency's scripts, including transitive ones
ignoreScripts: false # skip all package.json scripts in projects and dependencies (.pnpmfile.mjs still runs)
```

- Unlisted packages are treated as *unreviewed*: with `strictDepBuilds: true` (default) the install exits non-zero, with `false` it only warns.
- During install, newly ignored builds are appended to `pnpm-workspace.yaml` with a placeholder value for you to flip to `true`/`false`.
- Git-hosted packages can never be approved by bare name — approve the repository URL or the exact resolved path. Denials by name do apply to git sources.
- Since v12.4.0 a patch that adds an install script or `binding.gyp` makes the package buildable and be listed under ignored builds.
- Approve interactively or from the CLI: `pnpm approve-builds` (or `esbuild !core-js` to include denials, `--all` for everything, `-g` for global packages), `pnpm add --allow-build=esbuild`, `pnpm add --allow-build='!esbuild'` (v12.4.0), and `pnpm ignored-builds` to list what was skipped.

## Other build settings

| Setting               | Default   | Effect                                                                                         |
| --------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `verifyDepsBeforeRun` | `install` | Check dependency state before `pnpm run`/`exec`: `install` (silently installs), `warn`, `prompt`, `error`, `false`. |
| `nodeOptions`         | `null`    | `NODE_OPTIONS` passed to lifecycle scripts only; keep existing values with `${NODE_OPTIONS:- } …`. |
| `childConcurrency`    | `5`       | Max concurrent child processes while building `node_modules`.                                   |
| `sideEffectsCache`    | `true`    | Cache and reuse install-hook build artifacts; object form has `read`/`write`/`remote` (pnpr artifact sharing, v12.0.0). |
| `unsafePerm`          | `false` as root, else `true` | UID/GID switching for scripts; explicitly `false` breaks non-root installs. |
| `requiredScripts`     | —         | Scripts every workspace project must have or `pnpm -r run` fails.                               |

<!--
Source references:
- https://pnpm.io/scripts
- https://pnpm.io/settings/build
- https://pnpm.io/cli/approve-builds
- https://pnpm.io/cli/run
- https://pnpm.io/supply-chain-security
-->
