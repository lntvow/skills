---
name: core-catalogs
description: pnpm catalogs — shared dependency version ranges in pnpm-workspace.yaml, the catalog: protocol, and catalogMode/catalogPrune.
---

# Catalogs

Catalogs define dependency ranges once in `pnpm-workspace.yaml` and are referenced with the `catalog:` protocol, so a bump touches one line instead of every `package.json`.

## Defining catalogs

```yaml
catalog: # singular field → catalog named "default"
  react: ^18.3.1
  redux: ^5.0.1

catalogs: # plural field → arbitrarily named catalogs
  react17:
    react: ^17.0.2
    react-dom: ^17.0.2
```

```json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:default",
    "redux": "catalog:react17"
  }
}
```

`catalog:` is shorthand for `catalog:default`; a name after the colon selects a named catalog. Both fields can coexist (typical migration scenario).

## Where catalog: is allowed

- `package.json`: `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`
- `pnpm-workspace.yaml`: `overrides`

`catalog:` is replaced on `pnpm pack`/`pnpm publish`, like `workspace:`.

## Catalog entries

Entries are ordinary specs, so they may hold workspace or local ranges:

```yaml
catalog:
  '@example/utils': workspace:^ # v12.2.0 — expands to workspace:^ at each consumer
  '@example/local': file:../local # v12.6.0 — file:/link: specs allowed
```

Relative and bare paths inside a catalog resolve from the directory holding `pnpm-workspace.yaml`. Since v12.3.0 a location-carrying specifier (local path, local tarball, tarball URL, `workspace:<path>`) is never moved into a catalog by `pnpm add`.

## Related settings

```yaml
# manual (default) | strict | prefer
catalogMode: prefer
# remove catalog entries that nothing references during install (v11.22.0)
catalogPrune: true
```

| `catalogMode` | Meaning                                                                            |
| ------------- | ---------------------------------------------------------------------------------- |
| `manual`      | Default. `pnpm add` never writes to the catalog.                                    |
| `strict`      | Catalog versions are the only allowed source; adding outside a catalog range errors. |
| `prefer`      | Prefer the catalog version, fall back to resolving directly when incompatible.       |

`catalogPrune`'s deprecated spelling is `cleanupUnusedCatalogs` (v10.15.0); when both are set, `catalogPrune` wins.

## CLI

```bash
pnpm add react --save-catalog              # add to the default catalog (v10.12.1)
pnpm add react --save-catalog-name react17 # add to a named catalog
```

`pnpm update` on a `catalog:` dependency rewrites the entry in `pnpm-workspace.yaml`, not the manifest.

## Migration

```bash
pnpx codemod pnpm/catalog
```

## Key points

- One place to bump a shared version; fewer `package.json` merge conflicts.
- `catalog:` = `catalog:default`; named catalogs live under `catalogs:`.
- Replaced on publish exactly like `workspace:`.

<!--
Source references:
- https://pnpm.io/catalogs
- https://pnpm.io/settings/other
-->
