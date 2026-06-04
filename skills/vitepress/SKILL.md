---
name: vitepress
description: VitePress static site generator — configuration, markdown extensions, routing, theme customization, data loading, and frontmatter. Used when building documentation sites, blogs, or static sites with VitePress.
metadata:
  author: lntvow
  version: '2026.6.4'
  source: Generated from https://github.com/vuejs/vitepress, scripts located at https://github.com/lntvow/skills
---

> The skill is based on VitePress v2, generated at 2026-06-04.

VitePress is a Vue-powered static site generator. Config file is `.vitepress/config.mts`. Use frontmatter for page-level configuration. Prefer Vue components over raw HTML for custom themes.

## Core References

| Topic       | Description                                                             | Reference                                    |
| ----------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| Site Config | `config.mts`, `defineConfig`, title, base, vite, vue, markdown options  | [core-config](references/core-config.md)     |
| Routing     | File-based routing, internal/external links, dynamic routes, clean URLs | [core-routing](references/core-routing.md)   |
| Markdown    | Frontmatter, code blocks, containers, emoji, table of contents, links   | [core-markdown](references/core-markdown.md) |

## Feature References

### Default Theme

| Topic        | Description                                                              | Reference                                                    |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Theme Config | `themeConfig` — nav, sidebar, logo, search, footer, editLink, carbon ads | [features-theme-config](references/features-theme-config.md) |

### Content & Data

| Topic        | Description                                                                | Reference                                                    |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Data Loading | `.data.js` loaders, `createContentLoader`, build-time data fetching        | [features-data-loading](references/features-data-loading.md) |
| Frontmatter  | `title`, `layout`, `hero`, `features`, `navbar`, `sidebar` per-page config | [features-frontmatter](references/features-frontmatter.md)   |

## Advanced

| Topic        | Description                                                            | Reference                                                    |
| ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| Custom Theme | Theme entry, `Layout` component, `enhanceApp`, extending default theme | [advanced-custom-theme](references/advanced-custom-theme.md) |

## Best Practices

| Topic         | Description                                                         | Reference                                                              |
| ------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| CLI & Runtime | `vitepress dev/build/preview`, `useData`, `useRoute`, `<Content />` | [best-practices-cli-runtime](references/best-practices-cli-runtime.md) |
