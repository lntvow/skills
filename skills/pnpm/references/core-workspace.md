---
name: core-workspace
description: pnpm workspace configuration via pnpm-workspace.yaml — packages, workspace protocol, packageConfigs, and settings.
---

# Workspace Configuration

pnpm uses `pnpm-workspace.yaml` at the repo root to define workspaces. This is where **all non-auth pnpm config** belongs (since v11).

## packages

Define which directories contain workspace packages:

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - '!**/test/**'
```

The root package is always included. If `packages` is omitted, only the root is in the workspace.

## workspace: Protocol

Pin dependencies to local workspace packages. Prevents accidentally installing from registry:

```json
{
  "dependencies": {
    "foo": "workspace:*",
    "bar": "workspace:^",
    "baz": "workspace:~",
    "qux": "workspace:^1.5.0"
  }
}
```

On publish (`pnpm publish` / `pnpm pack`), `workspace:` versions are replaced with the actual package version. A bare `workspace:` is equivalent to `workspace:*`.

**Alias referencing**: `"bar": "workspace:foo@*"` — references `foo` under alias `bar`. Converts to `"bar": "npm:foo@1.0.0"` on publish.

**Relative path referencing**: `"foo": "workspace:../foo"` — resolved relative to the package.

## packageConfigs (v11+)

Per-package configuration replacing `.npmrc` files:

```yaml
packageConfigs:
  frontend-app:
    saveExact: true
  backend-service:
    savePrefix: '~'
```

Or with pattern matching:

```yaml
packageConfigs:
  - match: ['frontend-*', 'shared-ui']
    saveExact: true
    modulesDir: 'node_modules'
```

## Key Workspace Settings

Place these in `pnpm-workspace.yaml`:

```yaml
# Link workspace packages instead of downloading from registry
linkWorkspacePackages: true # false | deep

# Hard-link local deps instead of symlinking
injectWorkspacePackages: false

# Fail if --filter matches nothing
failIfNoMatch: true
```

## overrides

Force specific versions across the dependency graph (including peers):

```yaml
overrides:
  foo: '^2.0.0' # override all versions of foo
  bar@^2.1.0: '3.0.0' # only bar@^2.1.0
  qar@1>zoo: '2' # override zoo under qar@1
  foo@1.0.0>bar: '-' # remove bar from foo@1.0.0
```

## packageExtensions

Extend missing package metadata (peerDependencies, etc.):

```yaml
packageExtensions:
  react-redux:
    peerDependencies:
      react-dom: '*'
  react-redux@1:
    peerDependencies:
      react-dom: '*'
```

## Key Points

- All non-auth config goes in `pnpm-workspace.yaml`, not `.npmrc`
- Use `workspace:*` to always reference the local version
- `packageConfigs` replaces per-package `.npmrc` (v11+)
- `overrides` affects the full dependency graph including peer deps

<!--
Source references:
- https://pnpm.io/pnpm-workspace_yaml
- https://pnpm.io/workspaces
- https://pnpm.io/settings
-->
