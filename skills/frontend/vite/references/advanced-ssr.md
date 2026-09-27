---
name: advanced-ssr
description: Vite SSR — server-side rendering setup, environment API, conditional logic, and manifest.
---

# Server-Side Rendering (SSR)

## Basic Setup

Vite provides first-class SSR support. Use `vite build --ssr` for the server bundle:

```bash
vite build --ssr src/entry-server.js
```

## Conditional Logic

Use `import.meta.env.SSR` for code that differs between server and client:

```ts
if (import.meta.env.SSR) {
  // server-only code
}
```

Statically replaced at build — tree-shaken in the opposite bundle.

## Environment API

Vite's Environment API separates server and client environments:

```ts
// Access different environments
const serverEnv = vite.environments.ssr
const clientEnv = vite.environments.client
```

Each environment has its own module graph and plugin pipeline.

## SSR Manifest

```bash
vite build --ssrManifest
```

Generates `ssr-manifest.json` mapping module IDs to their client-side chunks for preloading.

## Build Options

```ts
export default defineConfig({
  build: {
    ssr: 'src/entry-server.ts',
    ssrManifest: true,
    ssrEmitAssets: true,
  },
})
```

## Server-Side Rendering with Frameworks

For **Vue**: Use `@vitejs/plugin-vue` with SSR — handled automatically in Nuxt.
For **React**: Use `@vitejs/plugin-react` with frameworks like Remix or custom setup.

## Key Points

- `vite build --ssr` builds server bundle separately
- `import.meta.env.SSR` for server/client conditional logic
- Environment API separates module graphs per environment
- `--ssrManifest` enables resource preloading
- Each environment has independent plugin pipeline

<!--
Source references:
- https://vite.dev/guide/ssr.html
- https://vite.dev/config/ssr-options.html
-->
