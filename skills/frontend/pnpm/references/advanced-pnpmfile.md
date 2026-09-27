---
name: advanced-pnpmfile
description: pnpm hooks — .pnpmfile.mjs/.cjs, readPackage/updateConfig/afterAllResolved/beforePacking/preResolution, finders, and custom resolvers/fetchers.
---

# pnpmfile Hooks

```yaml
pnpmfile: ['.pnpmfile.mjs'] # default; `.pnpmfile.cjs` is CommonJS
globalPnpmfile: null # single path, applied to every project
ignorePnpmfile: false
```

The file sits next to the lockfile (the workspace root when the lockfile is shared) and exports hooks ESM-style: `export const hooks = { ... }`. Since v12.3.0 the file is loaded by `run`, `exec`, `rebuild`, script shortcuts (`pnpm test`), `link`, `outdated`, `import`, `pack`, `publish` and `stage publish`.

| Hook                                | Purpose                                                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `readPackage(pkg, context)`         | Mutate a dependency manifest just before resolution; never written to disk, so the lockfile must be recreated for changes to apply. Cannot suppress builds (use `allowBuilds`). |
| `updateConfig(config)` (v10.8.0)    | Rewrite the resolved configuration (fully resolved including `.npmrc`, CLI and defaults since v12.4.1); `config.registriesByScope` and `config.configByUri` drive routing and credentials. |
| `afterAllResolved(lockfile, context)` | Mutate the lockfile before it is written.                                                                           |
| `beforePacking(pkg)` (v10.28.0)     | Mutate the manifest placed in the tarball for `pack`/`publish` only.                                                  |
| `preResolution(options)`            | `Promise<void>`; receives `existsCurrentLockfile`, `currentLockfile`, `existsNonEmptyWantedLockfile`, `wantedLockfile`, `lockfileDir`, `storeDir`, `registries`. |
| `importPackage`                     | Deprecated in v11.23.0 (slows installs, removal planned).                                                             |
| `filterLog`                         | Deprecated in v12.0.0 and ignored; use `loglevel`.                                                                    |
| `fetchers`                          | Removed in v11.0.0 — use top-level `fetchers`.                                                                        |

```js
// .pnpmfile.mjs
export const hooks = {
  readPackage(pkg) {
    pkg.dependencies.lodash = 'npm:awesome-lodash@^1.0.0'
    return pkg
  },
}
```

## Finders (v10.16.0)

`export const finders = { react17: ctx => ... }` adds predicates for `pnpm list` / `pnpm why --find-by=react17`. The context exposes `name`, `version` and `readManifest()`; return `true` to include, `false` to skip, or a string to include and annotate:

```js
export const finders = {
  react17: (ctx) => ctx.readManifest().peerDependencies?.react === '^17.0.0' && 'react 17 peer',
}
```

## Custom resolvers and fetchers (v11.0.0)

Registered as top-level exports in `.pnpmfile.cjs`:

```js
export const resolvers = [myResolver]
export const fetchers = [myFetcher]
```

- `CustomResolver`: `canResolve(wantedDependency)` receives `{ alias, bareSpecifier }`; `resolve(wantedDependency, opts)` gets `{ lockfileDir, projectDir, preferredVersions }` and returns `{ id, resolution }`. Custom resolution types must be prefixed `custom:`.
- `shouldRefreshResolution(depPath, pkgSnapshot)` forces a full re-resolution; ignored under a frozen lockfile.
- `CustomFetcher`: `canFetch(pkgId, resolution)` and `fetch(cafs, resolution, opts, fetchers)` with `{ lockfileDir, filesIndexFile, onStart, onProgress }`; it returns `{ filesIndex, manifest?, requiresBuild?, local? }` or delegates to a built-in (`remoteTarball`, `localTarball`, `gitHostedTarball`, `directory`, `git` — delegation added in v11.12.0). `requiresBuild` is inferred from `preinstall`/`install`/`postinstall` or the presence of `binding.gyp`/`.hooks/`.
- `canResolve`, `canFetch` and `shouldRefreshResolution` run per dependency — keep them cheap.

<!--
Source references:
- https://pnpm.io/pnpmfile
- https://pnpm.io/finders
-->
