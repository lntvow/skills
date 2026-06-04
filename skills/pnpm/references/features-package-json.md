---
name: features-package-json
description: pnpm-specific package.json fields — dependenciesMeta, injected, devEngines, engines, configDependencies.
---

# package.json (pnpm-specific)

## dependenciesMeta.\*.injected

Hard-link a local workspace dependency instead of symlinking. Solves peer dependency conflicts where different consumers need different peer versions:

```json
{
  "dependencies": {
    "button": "workspace:*",
    "react": "16"
  },
  "dependenciesMeta": {
    "button": {
      "injected": true
    }
  }
}
```

Use when a workspace package is consumed by different projects with conflicting peer dependencies (e.g., one needs `react@16`, another needs `react@17`).

## devEngines

### devEngines.packageManager (v11+)

Specify pnpm version with a range (unlike the legacy `packageManager` field):

```json
{
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": ">=11.0.0 <12.0.0",
      "onFail": "download"
    }
  }
}
```

The resolved version is stored in `pnpm-lock.yaml`.

### devEngines.runtime

Auto-install required Node.js (or Deno/Bun) versions:

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "^24.4.0",
      "onFail": "download"
    }
  }
}
```

## engines

```json
{
  "engines": {
    "node": ">=22",
    "pnpm": ">=11"
  }
}
```

pnpm enforces its own version match during local dev.

## engines.runtime (v10.21+)

For dependencies that need specific Node.js versions:

```json
{
  "engines": {
    "runtime": {
      "name": "node",
      "version": "^24.11.0",
      "onFail": "download"
    }
  }
}
```

## configDependencies

Dependencies installed only for configuration purposes. Saved to a separate field and installed but not hoisted. Useful for shared ESLint/TypeScript configs.

```bash
pnpm add --config @company/eslint-config
```

## Key Points

- `injected: true` enables different peer resolution per consumer
- `devEngines.packageManager` supports version ranges (unlike `packageManager`)
- `devEngines.runtime` auto-downloads runtimes
- Settings go in `pnpm-workspace.yaml` since v11, NOT in `package.json` `pnpm` field

<!--
Source references:
- https://pnpm.io/package_json
- https://pnpm.io/config-dependencies
-->
