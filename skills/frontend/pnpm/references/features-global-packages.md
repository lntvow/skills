---
name: features-global-packages
description: Global installs (isolated install groups, comma vs space separated), the global virtual store, project-aware shims, runtimes, and global build approval.
---

# Global Packages

```bash
pnpm add -g <pkg>          # never use sudo: ERR_PNPM_SUDO_NOT_SUPPORTED
pnpm remove -g <pkg>
pnpm update -g [pkg]
pnpm list -g [--json|--parseable]
```

`pnpm install -g` without arguments is not supported.

## Isolated installations (v11)

Every package — or every group of packages installed together — gets its own isolated install directory with its own `package.json`, `node_modules/` and lockfile under `{pnpmHomeDir}/global/v11/{hash}/`, where the hash derives from the set of packages installed together. Global packages therefore cannot disturb each other through peer conflicts or hoisting.

```bash
pnpm add -g typescript && pnpm add -g prettier   # two separate installs
pnpm add -g eslint prettier                     # still two: space-separated = one install each
pnpm add -g eslint,prettier                     # ONE install group, sharing a node_modules tree
pnpm add -g eslint,prettier typescript          # mixed: a group plus a standalone package
```

- Space-separated packages can be removed independently (`pnpm remove -g eslint` leaves `prettier`).
- Comma-separated packages form one group: they share a `node_modules` tree and lockfile so peers resolve against each other, and removing any of them removes the whole group.

## Directory layout

```text
{pnpmHomeDir}/global/v11/
├── {hash}          → symlink → ./{hash}-target/
├── {hash}-target/  ← real project dir: package.json, pnpm-lock.yaml, node_modules/
└── store/          ← shared global virtual store
```

The `{hash}` symlinks are how pnpm enumerates active installs; orphaned targets are eventually collected by `pnpm store prune`. Binaries live in `{pnpmHomeDir}/bin/` (a subdirectory of `PNPM_HOME`, so `global/` and `store/` stay out of shell completion); print it with `pnpm bin -g`, and run `pnpm setup` after upgrading so that directory is on `PATH`.

`pnpm list -g` (default `--depth=0`) always works. `--depth>0` only works with a single install group or a narrowed request (`pnpm list -g eslint --depth=1`); otherwise pnpm errors with `ERR_PNPM_GLOBAL_LS_DEPTH_NOT_SUPPORTED`.

## Global virtual store (GVS)

```yaml
virtualStoreType: global # canonical since v11.23.0; legacy enableGlobalVirtualStore
```

- The virtual store becomes machine-wide at `<store>/links/`, and project `node_modules` contains only symlinks into it — no per-project `.pnpm`. Package directories are named by a hash of the dependency graph, so identical graphs (peers included) share one directory.
- Default: **off** for project installs (experimental), **on** for `pnpm dlx`/`pnx` and global installs, and automatically disabled in CI (where a warm per-project cache would be lost).
- Since v11.23.0 every process pnpm spawns (`pnpm run`, `pnpm exec`, lifecycle scripts, dlx tools) receives a resolve hook through `NODE_OPTIONS --import`, because `NODE_PATH` cannot help ESM. A `node` started outside pnpm gets nothing, and `extendNodePath: false` disables the mechanism entirely. GVS shares writable state, so store permissions become part of the trust boundary.

## Project-aware shims and runtimes (pnpm 12)

`pnpm shim add|ls|rm` creates command shims that resolve per project: a package manager from `packageManager`/`devEngines.packageManager`, other runtimes from `devEngines.runtime`/`engines.runtime` (downloaded into the global virtual store), and anything else from the project's `node_modules/.bin`. The policy is the machine-level `globalShims` setting (`auto`, `prompt`, `always`, `false`) with a trust prompt remembered per project; non-interactive runs fall back to the global version. Errors: `ERR_PNPM_SHIM_NO_BINS`, `ERR_PNPM_SHIM_BIN_CONFLICT`, `ERR_PNPM_SHIMS_DISABLED`; bypass a single command with `PNPM_SHIM_BYPASS=1`. Shims are native executables since v12.3.0 (`<name>.exe` on Windows).

`pnpm runtime set|add|remove|list <node|deno|bun>` replaces the deprecated `pnpm env` (alias `rt`). Node runtimes no longer ship `npm`/`npx`/`corepack` since v11.0.0 — install them with `pnpm add -g npm`.

## Build scripts of global packages

Approval is required just as for projects: answer the interactive prompt, pass `--allow-build=esbuild`, or run `pnpm approve-builds -g` (v11.24.0), which aggregates every install group, asks once, writes a single `allowBuilds` policy into the global packages directory's `pnpm-workspace.yaml`, and rebuilds only the affected groups. `pnpm add -g .` from a package directory registers its `bin` entries globally.

<!--
Source references:
- https://pnpm.io/global-packages
- https://pnpm.io/global-virtual-store
- https://pnpm.io/cli/runtime
- https://pnpm.io/cli/shim
- https://pnpm.io/cli/approve-builds
-->
