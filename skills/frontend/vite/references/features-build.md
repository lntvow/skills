---
name: features-build
description: Vite production build — build.target, library mode, chunking, browser compatibility, CSS code splitting.
---

# Production Build

## Basic Build

```bash
vite build
```

Uses `<root>/index.html` as entry. Output in `dist/`.

## Browser Compatibility

Default target: `'baseline-widely-available'` (Chrome 111+, Firefox 114+, Safari 16.4+). Configure via `build.target`:

```ts
export default defineConfig({
  build: {
    target: 'es2020', // ES version
    target: ['chrome58', 'firefox57'], // browser targets
    target: 'esnext', // minimal transpilation
  },
})
```

Vite handles syntax transforms only — **no polyfills**. Use `@vitejs/plugin-legacy` for polyfills + legacy support.

## Library Mode

```ts
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      fileName: 'my-lib',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: ['vue'], // don't bundle vue
      output: { globals: { vue: 'Vue' } },
    },
  },
})
```

When `build.lib` is set, `cssCodeSplit` defaults to `false`, `assetsInlineLimit` is ignored (always inline).

## CSS Code Splitting

```ts
build: {
  cssCodeSplit: true,  // default: split CSS per async chunk
  cssCodeSplit: false, // single CSS file for entire project
}
```

## Chunking

Configure via `build.rolldownOptions.output.codeSplitting`:

```ts
build: {
  rolldownOptions: {
    output: {
      codeSplitting: 'auto',  // Rolldown handles splitting
    },
  },
}
```

## Key Options

```ts
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  assetsInlineLimit: 4096,        // bytes, 0 = never inline
  sourcemap: true,
  minify: 'oxc',                  // 'oxc' | 'terser' | 'esbuild' | false
  emptyOutDir: true,
  modulePreload: { polyfill: true },
  manifest: true,                 // generate manifest.json
}
```

## Key Points

- `build.target` controls transpile level; no polyfills included
- Library mode via `build.lib` with `rollupOptions.external`
- Default minifier is Oxc (`minify: 'oxc'`)
- `cssCodeSplit: true` splits CSS per async chunk
- Use `@vitejs/plugin-legacy` for legacy browser support

<!--
Source references:
- https://vite.dev/guide/build.html
- https://vite.dev/config/build-options.html
-->
