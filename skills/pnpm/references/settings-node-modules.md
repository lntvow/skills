---
name: settings-node-modules
description: pnpm install layout and storage settings — nodeLinker, hoisting, virtual store, packageImportMethod, storeDir, frozenStore, and lockfile settings.
---

# node_modules Layout, Hoisting & Store

## Linkers

```yaml
nodeLinker: isolated # default | hoisted | pnp
modulesDir: node_modules # where deps are installed
enableModulesDir: true # false = write no node_modules at all (FUSE setups)
symlink: true # false = virtual store without symlinks (pnp)
```

- `isolated` (default): symlinked layout — **semi-strict**. Project code can only resolve the dependencies it declares, but packages inside the virtual store still have access to hoisted (undeclared) dependencies, so the boundary is not absolute.
- `hoisted`: flat npm-like `node_modules`, no symlinks. Needed for React Native, some serverless bundlers and other symlink-hostile tooling; all strictness is lost.
- `pnp`: Yarn-style Plug'n'Play.

### Isolated layout

All files in `node_modules` are **hard links** into the content-addressable store; the only real directories are under `node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>`. Dependencies are relative symlinks between those directories (`../.pnpm/foo@1.0.0/node_modules/bar -> ../../bar@1.0.0/node_modules/bar`), and project deps are symlinked at the root (`node_modules/foo -> ./.pnpm/foo@1.0.0/node_modules/foo`). Directory depth stays constant regardless of graph depth. Node follows the symlink to the real directory, which is what keeps the dependency boundaries (`hoist: false` removes the hoisted escape hatch; `publicHoistPattern` publishes it at the root).

Consequence for debugging: code outside `node_modules` — including a Node process launched outside pnpm — cannot resolve a dependency the project did not declare. With the global virtual store pnpm injects an `--import` resolve hook through `NODE_OPTIONS` (see [features-global-packages](features-global-packages.md)); disable only if you also stop relying on hoisting.

| Setting                    | Default               | Effect                                                                                       |
| -------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `virtualStoreDir`          | `node_modules/.pnpm`  | Where the real packages live; can shorten Windows paths. Never share it between projects.      |
| `virtualStoreDirMaxLength` | 120 (Linux/macOS), 60 (Windows) | Max directory-name length inside the virtual store.                                 |
| `virtualStoreOnly`         | `false` (v11.0.0)     | Fill only the virtual store — no importer links, hoist, bins or lifecycle (Nix pre-population). |
| `virtualStoreType`         | `project` (v11.23.0)  | `global` switches to a machine-wide virtual store (legacy name `enableGlobalVirtualStore`).     |
| `packageImportMethod`      | `auto`                | `auto`/`hardlink`/`copy`/`clone`/`clone-or-copy`. `auto` prefers hardlink→clone→copy on Linux, clone→hardlink→copy on macOS/Windows. |
| `modulesCacheMaxAge`       | 10080 (minutes)       | How often orphaned packages are cleaned out of `node_modules`.                                 |
| `dlxCacheMaxAge`           | 1440 (minutes)        | Expiry of the `dlx` cache.                                                                     |
| `nodeExperimentalPackageMap` | `false` (v11.8.0)   | Write `node_modules/.package-map.json` and pass `--experimental-package-map`.                   |
| `nodePackageMapType`       | `standard` (v11.8.0)  | `loose` also maps hoisted-reachable packages.                                                  |

## Hoisting

By default hoisting is only a compatibility escape hatch into the hidden `node_modules/.pnpm/node_modules` directory: it leaves project-side resolution unchanged. `publicHoistPattern` (or its shorthand `shamefullyHoist`) is what publishes hoisted packages at the root and thereby makes phantom dependencies resolvable again.

| Setting                 | Default | Effect                                                                                                       |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `hoist`                 | `true`  | Hoist deps into `node_modules/.pnpm/node_modules` (paranoia-free compat). `false` clears `hoistPattern`.       |
| `hoistPattern`          | `['*']` | Which packages to hoist there; supports `!` exclusions and matches workspace project names.                    |
| `publicHoistPattern`    | `[]`    | Hoist into the root `node_modules`, making phantom dependencies visible to the app.                            |
| `hoistWorkspacePackages`| `true`  | Treat workspace projects as hoist candidates (direct deps win over a same-named project).                      |
| `shamefullyHoist`       | `false` | Shorthand for `publicHoistPattern: ['*']`. Last resort for tools that resolve from the root.                   |
| `hoistingLimits`        | `none`  | v11.5.0, only with `nodeLinker: hoisted`: `none`/`workspaces`/`dependencies` (Yarn's `nmHoistingLimits`).        |

## Store

| Setting                    | Default                                                                                                  | Effect                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `storeDir`                 | first of `$PNPM_HOME/store`, `$XDG_DATA_HOME/pnpm/store`, OS data dir (`~/AppData/Local/pnpm/store`, `~/Library/pnpm/store`, `~/.local/share/pnpm/store`) | Content-addressable store. Must sit on the same filesystem as the install for hardlinking, so it is per-drive; extreme sandboxes fall back to `node_modules/.pnpm-store`. |
| `verifyStoreIntegrity`     | `true`                                                                                                   | Verify file integrity before linking (guards against accidental, not malicious, corruption). |
| `strictStorePkgContentCheck` | `true`                                                                                                 | Strictly check package name/version recorded in the store, `false` tolerates registries with duplicate content. |
| `frozenStore`              | `false` (v11.7.0)                                                                                        | Read-only store install (Nix, read-only layers); combine with `--offline --frozen-lockfile`, needs Node ≥ 22.15/23.11/24. |
| `useRunningStoreServer`    | `false`                                                                                                  | Deprecated; installs only when a store server is running.               |

Deleting the store does not break existing projects (their `node_modules` hold more hard links than the store) but global installs may need to be reinstalled. Inspect it with `pnpm store path`, `pnpm store status` and `pnpm store prune`.

## Lockfile settings

| Setting                              | Default | Effect                                                                     |
| ------------------------------------ | ------- | -------------------------------------------------------------------------- |
| `lockfile`                           | `true`  | `false` neither reads nor writes `pnpm-lock.yaml`.                          |
| `preferFrozenLockfile`               | `true`  | Skip resolution entirely (headless install) when the lockfile satisfies manifests. |
| `lockfileIncludeTarballUrl`          | `false` | Record the full tarball URL for every entry.                                |
| `gitBranchLockfile`                  | `false` | Per-branch lockfiles to avoid merge conflicts — see [features-lockfile](features-lockfile.md). |
| `mergeGitBranchLockfilesBranchPattern` | `null` | Branch-name patterns whose lockfiles are merged automatically (supports `!`). |
| `peersSuffixMaxLength`               | `1000`  | Cap on the peer suffix in lockfile keys; longer names switch to a hash.      |

<!--
Source references:
- https://pnpm.io/settings/node-modules
- https://pnpm.io/settings/store
- https://pnpm.io/symlinked-node-modules-structure
- https://pnpm.io/global-virtual-store
-->
