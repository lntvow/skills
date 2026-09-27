---
name: features-package-json
description: pnpm-specific package.json fields — alternative manifests, engines, devEngines, dependenciesMeta.injected, peer specs, and publishConfig.
---

# package.json (pnpm-specific)

## Alternative manifests

`package.json5` (JSON5) and `package.yaml` are read instead of `package.json` when present.

## engines

```json
{ "engines": { "node": ">=22", "pnpm": ">=11" } }
```

A mismatch in the project itself always fails; when the package is consumed as a dependency it only warns unless `engineStrict: true`.

`engines.runtime` (v10.21.0) binds an app to a Node runtime, which is then used to run its `postinstall`:

```json
{ "engines": { "runtime": { "name": "node", "version": "^24.11.0", "onFail": "download" } } }
```

## devEngines

```json
{
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": ">=11 <13",
      "onFail": "download"
    },
    "runtime": { "name": "node", "version": "^24.4.0", "onFail": "download" }
  }
}
```

- `devEngines.packageManager` (v11.0.0) accepts a **range**, unlike the legacy `packageManager` field, and its resolved version is stored in the lockfile as `packageManagerDependencies`. Failure behaviour is controlled by `pmOnFail`.
- `devEngines.runtime` (v10.14.0) accepts an object or array and supports `node`, `deno` and `bun`; the resolved exact version and checksum go into the lockfile. Since v12.0.0-rc.2 even a bare `node` follows the pin (toggle with `globalShims`, bypass with `PNPM_SHIM_BYPASS=1`).
- Since v12.0.0-rc.6 these fields may also name `npm`, `yarn` or `bun`; a non-pnpm package manager is recorded in a separate environment lockfile under the pnpm home, not in `packageManagerDependencies` (see [features-package-sources](features-package-sources.md)).

## dependenciesMeta.\*.injected

Install a local workspace dependency as a hard-linked copy in the virtual store instead of a symlink, so each consumer resolves peers on its own:

```json
{
  "dependencies": { "button": "workspace:*", "react": "16" },
  "dependenciesMeta": { "button": { "injected": true } }
}
```

Use it when different consumers need different peer versions of the same local package (e.g. one on `react@16`, one on `react@17`). Copies must be re-synced after a rebuild (`pnpm install`, `prepare`, or `syncInjectedDepsAfterScripts`).

## peerDependencies specs

Peers must be semver, `workspace:`, `catalog:`, or (v11.14.0) a scheme-carrying spec such as `work:5.x.x`, `npm:alias`, `file:` or a git/URL. A version-less spec means `*`. A bare `name@version` is rejected: `ERR_PNPM_INVALID_PEER_DEPENDENCY_SPECIFICATION`. Use `peerDependenciesMeta.<name>.optional: true` to allow omission.

## publishConfig

Applied while packing, so overrides are baked into the published manifest:

| Field                                        | Notes                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `bin`, `main`, `module`, `browser`, `types`/`typings`, `exports`, `esnext`, `es2015`, `unpkg`, `umd:main`, `typesVersions` | Override the packaged entry points. |
| `cpu`, `os`                                  | Override platform restrictions.                                            |
| `engines`                                    | Override `engines` (v10.22.0).                                             |
| `name`                                       | Rename only the published artifact (v11.18.0) — manifest, lockfile and dependents keep the old name. |
| `registry`                                   | Overrides the `registry` setting, registry scope routing and `--registry`; matched against `.npmrc` auth. With `publish -r` each package uses its own registry. |
| `access`                                     | `public`/`restricted` (v11.2.0); unscoped packages cannot be `restricted`.  |
| `directory` / `linkDirectory`                | Publish a subdirectory (needs its own `package.json`); symlink it back during development. |
| `executableFiles`                            | Extra archive entries marked executable (`bin` entries always are).        |

## Configuration dependencies

`configDependencies` in `pnpm-workspace.yaml` installs configuration-only packages before regular dependencies (added with `pnpm add --config <pkg>`). Names matching `pnpm-plugin-*`, `@*/pnpm-plugin-*` or `@pnpm/plugin-*` auto-load their `pnpmfile.mjs`. They may not declare regular `dependencies` or lifecycle scripts, and their `optionalDependencies` are allowed exactly one level deep with exact versions only. See [features-lockfile](features-lockfile.md) for how they appear in the lockfile.

<!--
Source references:
- https://pnpm.io/package_json
- https://pnpm.io/config-dependencies
- https://pnpm.io/how-peers-are-resolved
-->
