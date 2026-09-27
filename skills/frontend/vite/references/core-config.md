---
name: core-config
description: Vite configuration with vite.config.ts, defineConfig, and shared options — root, base, plugins, resolve, define, publicDir.
---

# Configuration

## `vite.config.ts`

Always use ESM and TypeScript. Wrap with `defineConfig()` for IDE type hints:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  // shared options
  root: '.',
  base: '/',
  plugins: [],
  publicDir: 'public',
  resolve: { alias: { '@': '/src' } },
  define: { __VERSION__: JSON.stringify('1.0.0') },
})
```

## Key Shared Options

### root

Project root (where `index.html` lives). Default: `process.cwd()`.

### base

Public base path. Set to `'/my-app/'` for nested deployments, `'./'` for relative paths.

```ts
base: '/my-app/'
```

Import paths, CSS `url()`, and HTML asset refs are auto-adjusted.

### plugins

Array of plugin instances. Falsy plugins ignored; arrays flattened.

```ts
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

plugins: [vue(), legacy({ targets: ['defaults'] })]
```

### resolve.alias

```ts
resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components',
  },
}
```

### define

Global constant replacements. Values must be JSON-stringifiable or a single identifier:

```ts
define: {
  __APP_VERSION__: JSON.stringify('v1.0.0'),
  __API_URL__: 'window.__backend_api_url',
}
```

Add type declarations in `vite-env.d.ts`:

```ts
declare const __APP_VERSION__: string
```

### publicDir

Static assets directory. Files served at `/` during dev, copied to `outDir` during build. Default: `'public'`. Set to `false` to disable.

## TypeScript Config

Key `tsconfig.json` requirements:

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  }
}
```

- `isolatedModules: true` — required; Oxc transpiles per-file without type info
- `target` in tsconfig is **ignored** — use `build.target` instead
- `paths` requires `resolve.tsconfigPaths: true` (has perf cost, discouraged)
- For type checking: run `tsc --noEmit` separately

## Key Points

- `vite.config.ts` with ESM + `defineConfig()` is standard
- `isolatedModules: true` is required for TypeScript
- `define` values are statically replaced at build
- `vite/client` types enable asset import types
- Vite ignores tsconfig `target` — use `build.target`

<!--
Source references:
- https://vite.dev/config/shared-options.html
- https://vite.dev/guide/features.html
-->
