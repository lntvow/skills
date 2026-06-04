---
name: best-practices-cli-runtime
description: VitePress CLI commands and runtime API — dev, build, preview, useData, useRoute, and built-in components.
---

# CLI & Runtime API

## CLI Commands

```bash
vitepress dev [root]       # start dev server
vitepress build [root]     # production build
vitepress preview [root]   # preview production build locally
vitepress init             # setup wizard
```

**`vitepress dev`** options:

```bash
vitepress dev --port 8080 --open --force
```

| Option          | Description                        |
| --------------- | ---------------------------------- |
| `--port <port>` | Specify port                       |
| `--open [path]` | Open browser                       |
| `--force`       | Re-bundle (ignore optimizer cache) |
| `--base <path>` | Override base path                 |
| `--cors`        | Enable CORS                        |

**`vitepress build`** options:

```bash
vitepress build --mpa --base /docs/ --outDir dist
```

| Option                         | Description                      |
| ------------------------------ | -------------------------------- |
| `--mpa`                        | Build in MPA mode (no hydration) |
| `--base <path>`                | Override base path               |
| `--outDir <dir>`               | Output directory                 |
| `--assetsInlineLimit <number>` | Inline threshold (default: 4096) |

## Runtime API

### `useData()`

```vue
<script setup>
import { useData } from 'vitepress'

const { site, theme, page, frontmatter, title, lang, isDark } = useData()
</script>
```

Key refs: `site` (SiteData), `theme` (themeConfig), `page` (current page), `frontmatter` (page frontmatter), `isDark` (dark mode), `lang`, `title`, `description`.

### `useRoute()`

```vue
<script setup>
import { useRoute } from 'vitepress'

const route = useRoute()
console.log(route.path, route.data, route.params)
</script>
```

### `useRouter()`

```ts
import { useRouter } from 'vitepress'

const router = useRouter()
router.go('/another-page')
```

### `<Content />`

Renders markdown content. Required in custom `Layout` components:

```vue
<template>
  <Content />
</template>
```

### `$frontmatter` (template)

```md
# {{ $frontmatter.title }}
```

## Key Points

- `vitepress` is shorthand for `vitepress dev` in current directory
- `useData()` returns reactive site/page/theme data
- `<Content />` is the markdown render outlet
- `$frontmatter` available in all `.md` templates
- Composables work in both `.md` and `.vue` files

<!--
Source references:
- https://vitepress.dev/reference/cli
- https://vitepress.dev/reference/runtime-api
-->
