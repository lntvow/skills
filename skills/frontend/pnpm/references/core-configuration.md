---
name: core-configuration
description: Where pnpm settings live — pnpm-workspace.yaml vs global config.yaml vs .npmrc — plus precedence, YAML syntax rules, env interpolation, and setting renames.
---

# Configuration

Since v11 pnpm reads settings from **`pnpm-workspace.yaml`** (project) and the global **`config.yaml`**. Only auth and registry settings come from `.npmrc`. The `pnpm` field of `package.json` is no longer read.

| Config                    | Location                                                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Project settings          | `<workspace root>/pnpm-workspace.yaml`                                                                                              |
| Global settings           | `~/.config/pnpm/config.yaml` (Windows `%LOCALAPPDATA%\pnpm\config\config.yaml`, macOS `~/Library/Preferences/pnpm/config.yaml`)     |
| Auth / registry (INI)     | `<workspace root>/.npmrc` → `<config dir>/auth.ini` → `~/.npmrc`                                                                     |

`pnpm config get|set|delete` edits these files (default location is global; add `--location=project` for the project file).

## Precedence (high → low)

1. CLI flags
2. `pnpm_config_*` / `PNPM_CONFIG_*` env vars
3. `packageConfigs` entry for that project
4. project `pnpm-workspace.yaml`
5. global `config.yaml`
6. built-in defaults

`npm_config_*` is **not** read since v11. Env vars override files but never CLI flags: `pnpm_config_save_exact=true pnpm add foo`.

## YAML syntax rules

- Keys are **camelCase** (`shamefullyHoist`, `autoInstallPeers`, `nodeLinker`). Kebab-case exists only as CLI flags (`--node-linker`) and env names (`pnpm_config_node_linker`).
- Namespaced settings are **nested objects**, never dotted keys:

```yaml
update:
  ignoreDeps: [react]
peerDependencyRules:
  ignoreMissing: [react-dom]
sideEffectsCache:
  read: true
```

- Values support `${NAME}`, `${NAME-fallback}` and `${NAME:-fallback}` interpolation. Since v11.5.3 it is **not** applied to `registry`, nor to the URL values/keys of `registries`/`namedRegistries` — such values are silently ignored, so a committed repo cannot leak env secrets to an attacker-controlled registry. Put dynamic registry URLs in the global config or on the CLI.
- Machine-level settings are ignored (with a warning) in a project file since v11.22.0: `bin`, `configDir`, `dir`, `globalBinDir`, `globalDir`, `npmrcAuthFile`, `pnpmHomeDir`, `stateDir`, `userconfig`, `workspaceDir`, plus `tools`, `globalShims` and `macosBackup.*`. `pnpm config set` rejects them with `ERR_PNPM_CONFIG_SET_NOT_A_PROJECT_SETTING`. `cacheDir` and `storeDir` are still allowed.
- CLI-only options: `--cpu`, `--os`, `--libc`, `--find-by`.

## Top-level keys of pnpm-workspace.yaml

| Key                                                                            | Reference                                                                                     |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `packages`, `packageConfigs`                                                   | [core-workspace](core-workspace.md)                                                            |
| `catalog`, `catalogs`                                                          | [core-catalogs](core-catalogs.md)                                                              |
| `overrides`, `packageExtensions`, `registries`, `allowBuilds`                   | [settings-dependency-resolution](settings-dependency-resolution.md)                            |
| `tasks`, `concurrencyGroups`, `pipelines`, `pipelineBase`                       | [features-task-orchestration](features-task-orchestration.md)                                  |
| `patchedDependencies`, `configDependencies`                                     | [features-lockfile](features-lockfile.md)                                                      |
| `pnpmfile`, `globalPnpmfile`, `ignorePnpmfile`                                  | [advanced-pnpmfile](advanced-pnpmfile.md)                                                      |
| `versioning.*`                                                                  | [features-release-management](features-release-management.md)                                  |
| `python.*`, `cargo.*`                                                           | [features-package-sources](features-package-sources.md)                                        |

## Renamed and removed settings

| Old                                                                                     | New                                                        |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `onlyBuiltDependencies`, `onlyBuiltDependenciesFile`, `neverBuiltDependencies`, `ignoredBuiltDependencies`, `ignoreDepScripts` | `allowBuilds` (map)                                        |
| `managePackageManagerVersions`, `packageManagerStrict`, `packageManagerStrictVersion`, `COREPACK_ENABLE_STRICT` | `pmOnFail`                                                 |
| `updateConfig.ignoreDependencies`                                                        | `update.ignoreDeps`                                        |
| `cleanupUnusedCatalogs`                                                                 | `catalogPrune`                                             |
| `sideEffectsCacheReadonly`                                                               | `sideEffectsCache: { read: true, write: false }`            |
| `enableGlobalVirtualStore`                                                               | `virtualStoreType`                                         |
| `namedRegistries`                                                                        | `registries` entry `prefix` (deprecated in v11.23.0)        |
| `remoteSideEffectsCache` / its `organization`                                            | `sideEffectsCache.remote` / its `org`                      |

Also gone: `ignorePatchFailures`, `hooks.fetchers` (use top-level `fetchers`), `useRunningStoreServer` (deprecated). Migrate a v10 repo with `pnpx codemod run pnpm-v10-to-v11`.

## Pitfalls

- A misspelled setting fails silently; only machine-level keys warn.
- A workspace without `pnpm-workspace.yaml` links nothing: since v12.4.1 a root `package.json` with a non-empty `workspaces` array only logs a warning.

<!--
Source references:
- https://pnpm.io/settings
- https://pnpm.io/configuring
- https://pnpm.io/npmrc
- https://pnpm.io/cli/config
- https://pnpm.io/migration
-->
