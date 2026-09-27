---
name: core-workspace
description: pnpm workspaces — packages globs, the workspace: protocol, workspace settings, packageConfigs, and cycle handling.
---

# Workspaces

`pnpm-workspace.yaml` at the repo root defines the workspace. With the default settings (including the default `nodeLinker: isolated`) every project shares one root `pnpm-lock.yaml` and one root `node_modules`, with each project's dependencies symlinked into its own `node_modules` (see [settings-node-modules](settings-node-modules.md)).

## packages

```yaml
packages:
  - 'my-app' # direct subdirectory
  - 'packages/*' # one level below packages/
  - 'components/**' # any depth
  - '!**/test/**' # exclusion
```

- The **root package is always included**, even when custom globs are used.
- Patterns may use a `./` prefix and repeat slashes: `./packages/*` ≡ `packages//*`; `!./packages/legacy` ≡ `!packages/legacy`.
- `*` never matches a name starting with a dot, so `packages/*` skips `packages/.cache`.
- Omitting `packages` puts only the root package in the workspace.
- The workspace comes from `pnpm-workspace.yaml`, not from `package.json#workspaces`.

## workspace: protocol

```json
{
  "dependencies": {
    "foo": "workspace:*",
    "bar": "workspace:^",
    "baz": "workspace:~",
    "qux": "workspace:^1.5.0",
    "alias": "workspace:foo@*",
    "rel": "workspace:../foo"
  }
}
```

- Binds to the local project and **never falls back to the registry**: `workspace:2.0.0` fails when the local version does not match.
- Bare `workspace:` ≡ `workspace:*`.
- Replaced on `pnpm pack` / `pnpm publish`: `workspace:*`, `workspace:^`, `workspace:~` become the exact version, an explicit range (`workspace:^1.5.0`) stays a range, and aliases become `npm:foo@<version>`.
- Only required for linking when `linkWorkspacePackages` is `false`.

## Workspace settings

| Setting                       | Default    | Effect                                                                                                                                                       |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `linkWorkspacePackages`       | `false`    | `true` links directly declared local deps; `deep` also links them inside subdependencies. Plain transitive ranges still come from the registry otherwise.      |
| `injectWorkspacePackages`     | `false`    | Hard-link local deps into the virtual store instead of symlinking them (the project-wide form of `dependenciesMeta.*.injected`).                              |
| `dedupeInjectedDeps`          | `true`     | Deduplicate injected dependencies.                                                                                                                            |
| `syncInjectedDepsAfterScripts`| —          | v10.5.0. List of script names after which injected copies are re-synced.                                                                                      |
| `preferWorkspacePackages`     | `false`    | Prefer local versions when resolving a range (matters only when `saveWorkspaceProtocol` is off).                                                               |
| `sharedWorkspaceLockfile`     | `true`     | Single root lockfile and a single shared root `node_modules` (still the `isolated` symlinked layout, not a hoisted one). `false` gives every project its own lockfile — required for per-project `overrides`/`hoist`/`modulesDir`. |
| `saveWorkspaceProtocol`       | `rolling`  | What `pnpm add` writes: `rolling` + `savePrefix: ''` → `workspace:*`, `~` → `workspace:~`, `^` → `workspace:^`.                                                |
| `includeWorkspaceRoot`        | `false`    | Include the root project in recursive commands.                                                                                                               |
| `failIfNoMatch`               | `false`    | Fail when `--filter` matches nothing (CLI flag `--fail-if-no-match`).                                                                                         |
| `ignoreWorkspaceCycles`       | `false`    | Warn instead of failing on cycles; cyclic members lose ordering guarantees.                                                                                    |
| `disallowWorkspaceCycles`     | `false`    | Fail the install when the workspace contains cycles.                                                                                                           |

Recursive command scope differs: `install`, `list`, `outdated`, `update`, `publish`, `pack`, `remove`, `rebuild`, `why` include the root project; `run`, `exec`, `test`, `add` exclude it unless `includeWorkspaceRoot: true`.

## packageConfigs (v11.0.0)

Replaces per-project `.npmrc` files. Map form or pattern-rule array:

```yaml
packageConfigs:
  'project-1':
    saveExact: true
  - match: ['project-2', 'project-*']
    savePrefix: '~'
```

Settings that shape resolution or the `node_modules` layout (`overrides`, `hoist`, `modulesDir`, `saveExact`, `savePrefix`, and neighbours) apply per project only when `sharedWorkspaceLockfile: false`. With the default shared lockfile there is a single resolution, so pnpm reports the entries it ignored.

## Cycles

Cycles between workspace projects make script ordering impossible. pnpm prints `There are cyclic workspace dependencies` and recursive runs fail with `ERR_PNPM_TASK_CYCLE`. Break the cycle, fail fast with `disallowWorkspaceCycles: true`, or accept unordered execution via `ignoreWorkspaceCycles: true`.

<!--
Source references:
- https://pnpm.io/workspaces
- https://pnpm.io/settings
- https://pnpm.io/settings/cli
- https://pnpm.io/workspace-task-orchestration
-->
