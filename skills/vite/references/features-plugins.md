---
name: features-plugins
description: Using Vite plugins — adding, enforcing order, conditional application, and official plugin recommendations.
---

# Plugins

## Adding Plugins

Install and add to `plugins` array:

```ts
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), legacy({ targets: ['defaults', 'not IE 11'] })],
})
```

Falsy plugins ignored; arrays flattened. Preset plugins can return arrays of plugins.

## Enforcing Order

Control when a plugin runs relative to Vite's core:

```ts
plugins: [
  {
    name: 'my-plugin',
    enforce: 'pre', // before Vite core plugins
    // ...
  },
  // default: after Vite core plugins
  // 'post': after Vite build plugins
]
```

## Conditional Application

Apply plugin only during serve or build:

```ts
plugins: [
  {
    name: 'build-only',
    apply: 'build', // only during vite build
    // ...
  },
  {
    name: 'serve-only',
    apply: 'serve', // only during vite dev
    // ...
  },
]
```

Omit `apply` to run in both.

## Official Plugins

| Plugin                  | Purpose                 |
| ----------------------- | ----------------------- |
| `@vitejs/plugin-vue`    | Vue 3 SFC support + HMR |
| `@vitejs/plugin-react`  | React Fast Refresh      |
| `@vitejs/plugin-legacy` | Legacy browser support  |

## Finding Plugins

Check [Vite Plugin Registry](https://registry.vite.dev/plugins). Many Rollup/Rolldown plugins work directly in Vite.

## Key Points

- Plugins extend Rolldown's interface with Vite-specific hooks
- `enforce: 'pre'` | `'post'` controls ordering vs core plugins
- `apply: 'build'` | `'serve'` for conditional execution
- Check Features Guide before adding a plugin — many needs are built-in

<!--
Source references:
- https://vite.dev/guide/using-plugins.html
- https://vite.dev/plugins/
-->
