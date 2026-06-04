---
name: features-theme-config
description: VitePress default theme configuration — nav, sidebar, logo, search, footer, editLink, and home page layout.
---

# Default Theme Config

Configure via `themeConfig` in `.vitepress/config.mts`:

```ts
export default defineConfig({
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      /* ... */
    ],
    sidebar: {
      /* ... */
    },
    footer: { message: 'Released under MIT License.' },
  },
})
```

## Navigation

```ts
nav: [
  { text: 'Guide', link: '/guide' },
  { text: 'API', link: '/api' },
  {
    text: 'Ecosystem',
    items: [
      { text: 'Vue', link: 'https://vuejs.org' },
      { text: 'Vite', link: 'https://vite.dev' },
    ],
  },
]
```

With `activeMatch` for custom active state matching.

## Sidebar

**Array** (same sidebar for all pages):

```ts
sidebar: [
  { text: 'Introduction', link: '/intro' },
  {
    text: 'Guide',
    items: [
      { text: 'Getting Started', link: '/guide/' },
      { text: 'Configuration', link: '/guide/config' },
    ],
  },
]
```

Collapsible: `{ text: 'Section', collapsed: true, items: [...] }`

**Object** (different sidebar per section):

```ts
sidebar: {
  '/guide/': [
    { text: 'Introduction', link: '/guide/' },
    /* ... */
  ],
  '/api/': [
    { text: 'API Reference', link: '/api/' },
    /* ... */
  ],
}
```

## Logo

```ts
logo: '/logo.svg'
// Light/Dark variants
logo: { light: '/light.svg', dark: '/dark.svg', alt: 'Logo' }
```

## Search

```ts
search: {
  provider: 'local',  // built-in local search
}
```

For Algolia:

```ts
search: {
  provider: 'algolia',
  options: {
    appId: '...',
    apiKey: '...',
    indexName: '...',
  },
}
```

## Footer

```ts
footer: {
  message: 'Released under MIT License.',
  copyright: '© 2024-present Your Name',
}
```

## Edit Link

```ts
editLink: {
  pattern: 'https://github.com/user/repo/edit/main/docs/:path',
  text: 'Edit this page',
}
```

## Social Links

```ts
socialLinks: [
  { icon: 'github', link: 'https://github.com/user/repo' },
  { icon: 'twitter', link: 'https://twitter.com/user' },
]
```

## Key Points

- Nav supports dropdown menus and external links
- Sidebar: array (global) or object (per-section); `collapsed` for foldable sections
- Local search via `provider: 'local'`; Algolia for production
- `editLink.pattern` with `:path` placeholder
- All theme options work with default theme only

<!--
Source references:
- https://vitepress.dev/reference/default-theme-config
- https://vitepress.dev/reference/default-theme-nav
- https://vitepress.dev/reference/default-theme-sidebar
-->
