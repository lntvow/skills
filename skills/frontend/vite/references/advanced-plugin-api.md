---
name: advanced-plugin-api
description: Authoring Vite plugins — inline plugins, transform hook, virtual modules, Vite-specific hooks, conventions.
---

# Plugin API

## Plugin Structure

```ts
export default function myPlugin(options = {}) {
  return {
    name: 'my-plugin', // required: unique name
    enforce: 'pre', // optional: 'pre' | 'post'
    apply: 'build', // optional: 'serve' | 'build'
    // Rolldown hooks + Vite-specific hooks
  }
}
```

## Transform Hook

```ts
const fileRegex = /\.(custom)$/

export default function myPlugin() {
  return {
    name: 'transform-custom',
    transform: {
      filter: { id: fileRegex },
      handler(code, id) {
        return { code: compileToJS(code), map: null }
      },
    },
  }
}
```

## Virtual Modules

```ts
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedId = '\0' + virtualModuleId

  return {
    name: 'virtual-modules',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedId
    },
    load(id) {
      if (id === resolvedId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Usage: `import { msg } from 'virtual:my-module'`

Update types for virtual modules:

```ts [vite-env.d.ts]
declare module 'virtual:my-module' {
  export const msg: string
}
```

## Vite-Specific Hooks

| Hook                             | When                                   |
| -------------------------------- | -------------------------------------- |
| `config(config, env)`            | Modify Vite config before resolved     |
| `configResolved(config)`         | After config is fully resolved         |
| `configureServer(server)`        | Configure dev server (add middlewares) |
| `configurePreviewServer(server)` | Configure preview server               |
| `transformIndexHtml(html, ctx)`  | Transform `index.html`                 |
| `handleHotUpdate(ctx)`           | Custom HMR handling                    |

## Conventions

- Name: `vite-plugin-` prefix; `rolldown-plugin-` for Rolldown-compatible
- Framework-specific: `vite-plugin-vue-`, `vite-plugin-react-`
- Factory function returning plugin object with options
- `name` field for debugging; flat `plugins` array (presets flattened)

## Key Points

- Vite plugins extend Rolldown's plugin interface
- `name` field is required and must be unique
- Virtual modules start with `virtual:` + resolved to `\0` prefix
- `enforce: 'pre'` for before-Vite; `enforce: 'post'` for after build plugins
- Use `vite-plugin-inspect` to debug plugin transformations

<!--
Source references:
- https://vite.dev/guide/api-plugin.html
-->
