---
name: core-catalogs
description: pnpm Catalogs — centralized dependency version management across monorepo packages.
---

# Catalogs

Catalogs define dependency version ranges as named constants in `pnpm-workspace.yaml`. Referenced via the `catalog:` protocol in `package.json`.

## Default Catalog

```yaml
catalog:
  react: ^18.3.1
  react-dom: ^18.3.1
  typescript: ^5.5.0
```

```json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:"
  }
}
```

`catalog:` is shorthand for `catalog:default`.

## Named Catalogs

Multiple catalogs for different version sets (e.g., migration scenarios):

```yaml
catalogs:
  react17:
    react: ^17.0.2
    react-dom: ^17.0.2
  react18:
    react: ^18.3.1
    react-dom: ^18.3.1
```

```json
{
  "dependencies": {
    "react": "catalog:react18"
  }
}
```

## Where catalog: Works

- `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies` in `package.json`
- `overrides` in `pnpm-workspace.yaml`

## Publishing

`catalog:` protocol is replaced with actual version on `pnpm publish`/`pnpm pack` — same as `workspace:` protocol.

## CLI Integration

```bash
pnpm add react --save-catalog           # add to default catalog
pnpm add react --save-catalog-name react18  # add to named catalog
```

## Migration Codemod

For existing workspaces:

```bash
pnpx codemod pnpm/catalog
```

## Settings

```yaml
# 'strict': fail on unused catalog entries; 'warn': warn
catalogMode: strict
```

## Key Points

- One place to bump a dependency version across all packages
- Default catalog = top-level `catalog` key; named catalogs under `catalogs` key
- `catalog:` shorthand = `catalog:default`
- Replaced on publish like `workspace:` protocol

<!--
Source references:
- https://pnpm.io/catalogs
-->
