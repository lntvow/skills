---
name: core-config
description: Vitest configuration — vitest.config.ts, test options, globals, environment, coverage, and include/exclude.
---

# Configuration

## Config File

`vitest.config.ts` (highest priority) or `test` field in `vite.config.ts`:

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // auto-import test/expect/vi
    environment: 'node', // 'node' | 'jsdom' | 'happy-dom'
    include: ['**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist'],
  },
})
```

Or extend Vite config:

```ts [vite.config.ts]
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
  },
})
```

Use `mergeConfig` for combining:

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: { globals: true },
  })
)
```

## Key Options

```ts
test: {
  globals: true,               // global test/expect/vi (no imports)
  environment: 'jsdom',        // DOM environment for browser-like tests
  setupFiles: ['./setup.ts'],  // run before each test file

  // Coverage (v8)
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    include: ['src/**'],
  },

  // Execution
  pool: 'threads',              // 'threads' | 'forks' | 'typescript'
  testTimeout: 5000,            // default 5s
  hookTimeout: 10000,

  // Watch
  watch: false,                 // disable for CI
  forceRerunTriggers: ['**/package.json'],

  // TypeScript
  typecheck: { enabled: true }, // enable type checking
}
```

## Vitest Defaults

Import default config values:

```ts
import { configDefaults } from 'vitest/config'

test: {
  exclude: [...configDefaults.exclude, 'packages/template/*'],
}
```

## Key Points

- `vitest.config.ts` takes priority over `vite.config.ts`
- `globals: true` avoids importing `test`/`expect`/`vi` in every file
- `environment: 'jsdom'` for DOM-dependent tests
- `coverage` uses v8 provider by default
- CI: set `watch: false` and use `vitest run`

<!--
Source references:
- https://vitest.dev/config/
-->
