---
name: core-features
description: Vite features — static asset imports, TypeScript, CSS modules, JSON imports, HMR, and import.meta.env.
---

# Features

## Static Asset Imports

Import assets as URLs (hashed in production):

```ts
import imgUrl from './img.png'
document.getElementById('hero').src = imgUrl
// dev: /src/img.png   build: /assets/img.2d8efhg.png
```

**Import modifiers**:

```ts
import workletURL from './worklet.js?url' // explicit URL
import imgUrl from './img.svg?no-inline' // never inline
import imgUrl2 from './img.png?inline' // force inline
import shader from './shader.glsl?raw' // raw string
```

Assets < 4 KiB (`assetsInlineLimit`) are inlined as base64. Git LFS placeholders excluded from inlining.

**CSS `url()` references** are auto-resolved the same way.

**TypeScript**: Add `vite/client` to `compilerOptions.types` in tsconfig for asset import types.

## `import.meta.env`

Built-in constants (statically replaced at build):

```ts
import.meta.env.MODE // 'development' | 'production'
import.meta.env.BASE_URL // from `base` config
import.meta.env.PROD // boolean
import.meta.env.DEV // boolean
import.meta.env.SSR // boolean
```

## TypeScript

Vite transpiles `.ts` via **Oxc Transformer** — no type checking. `isolatedModules: true` required.

- `import type` / `export type` for type-only imports
- `tsconfig.json` closest to each file is used
- Vite config values override tsconfig for shared options
- `target`, `paths`, `emitDecoratorMetadata` ignored or need opt-in

**Transpile only**: type checking is separate (`tsc --noEmit` or `vite-plugin-checker`).

## CSS

Import CSS files directly:

```ts
import './style.css'
```

CSS Modules: any file ending in `.module.css`:

```ts
import styles from './button.module.css'
// styles.className → hashed class name
```

## JSON

Import JSON as default export:

```ts
import pkg from './package.json'
console.log(pkg.version)
```

## HMR

Hot Module Replacement over native ESM. Uses `import.meta.hot` API:

```ts
if (import.meta.hot) {
  import.meta.hot.accept(newModule => {
    /* ... */
  })
  import.meta.hot.dispose(() => {
    /* cleanup */
  })
}
```

Framework plugins (Vue, React) provide HMR integration automatically.

## Key Points

- Asset imports return resolved URLs; `< 4 KiB` inlined by default
- `import.meta.env.*` values are statically replaced
- TypeScript: transpile only — no type checking in Vite
- CSS Modules with `.module.css` extension
- HMR via framework plugins for Vue/React

<!--
Source references:
- https://vite.dev/guide/features.html
- https://vite.dev/guide/assets.html
-->
