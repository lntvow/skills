---
name: core-config
description: VitePress site configuration — config.mts, defineConfig, title, base, vite, vue, markdown, and build options.
---

# Site Configuration

## Config File

Config at `.vitepress/config.mts` (or `.js`/`.ts`/`.mjs`). Default export an object:

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'My Docs',
  description: 'A VitePress site',

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      /* ... */
    ],
    sidebar: {
      /* ... */
    },
  },
})
```

`defineConfig` provides TypeScript intellisense for both JavaScript and TypeScript.

## Async / Dynamic Config

```ts
import { defineConfig } from 'vitepress'

export default defineConfig(async () => {
  const posts = await fetch('https://cms.example.com/posts').then(r => r.json())
  return {
    title: 'My Blog',
    themeConfig: {
      sidebar: posts.map(p => ({ text: p.title, link: `/posts/${p.slug}` })),
    },
  }
})
```

Also supports top-level `await`.

## Key Site Options

**App-level**:

- `title` / `description` — site metadata
- `lang` — HTML lang attribute
- `base` — public base path (e.g., `'/docs/'`)
- `srcDir` — markdown source dir (default: project root)
- `srcExclude` — glob patterns to exclude from source
- `outDir` — build output (default: `.vitepress/dist`)
- `cleanUrls` — drop `.html` from URLs
- `lastUpdated` — show last git update timestamp

**Head & Meta**:

```ts
head: [
  ['link', { rel: 'icon', href: '/favicon.ico' }],
  ['meta', { name: 'theme-color', content: '#3c8772' }],
]
```

## Vite / Vue / Markdown Options

```ts
export default defineConfig({
  // Underlying Vite config
  vite: { server: { port: 8080 } },
  // Vue plugin options
  vue: {
    template: {
      compilerOptions: {
        /* ... */
      },
    },
  },
  // Markdown-It options
  markdown: {
    lineNumbers: true,
    anchor: { permalink: true },
    toc: { level: [2, 3] },
    config: md => {
      md.use(/* plugin */)
    },
  },
})
```

Use the built-in `vite` option — no separate `vite.config.ts` needed.

## Typed Theme Config

For custom themes, use `defineConfigWithTheme`:

```ts
import { defineConfigWithTheme } from 'vitepress'
import type { ThemeConfig } from 'my-theme'

export default defineConfigWithTheme<ThemeConfig>({
  themeConfig: {
    /* typed as ThemeConfig */
  },
})
```

## Key Points

- Config at `.vitepress/config.mts`; `defineConfig` for intellisense
- Configure Vite/Vue/Markdown-It through site config — no separate files
- Async config supported for dynamic data at build time
- `base` must match deployment path
- Custom themes: use `defineConfigWithTheme<YourThemeConfig>()`

<!--
Source references:
- https://vitepress.dev/reference/site-config
-->
