---
name: features-data-loading
description: VitePress build-time data loading — .data.js loaders, createContentLoader, watch mode, and local file processing.
---

# Build-Time Data Loading

Data loaders execute **only at build time**. Results serialized as JSON in the client bundle.

## Basic Loader

File must end in `.data.js` or `.data.ts`:

```js [posts.data.js]
export default {
  load() {
    return { posts: ['a', 'b', 'c'] }
  },
}
```

Import in `.md` or `.vue` files:

```vue
<script setup>
import { data } from './posts.data.js'
</script>

<pre>{{ data }}</pre>
<!-- { "posts": ["a","b","c"] } -->
```

The loader exports `load()` — VitePress calls it and exposes result as the `data` named export. Async `load()` works natively.

## Watching Local Files

```js [posts.data.js]
import fs from 'node:fs'
import { parse } from 'csv-parse/sync'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    return watchedFiles.map(file => parse(fs.readFileSync(file, 'utf-8'), { columns: true, skip_empty_lines: true }))
  },
}
```

`watch` globs trigger HMR when files change. `load()` receives absolute paths of matched files.

## `createContentLoader`

Generate indexes/archives from Markdown content:

```js [posts.data.js]
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true, // include raw markdown source
  render: true, // include rendered HTML
  excerpt: true, // include excerpt
  transform(raw) {
    return raw.sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))
  },
})
```

Returns `ContentData[]`:

```ts
interface ContentData {
  url: string
  frontmatter: Record<string, any>
  src?: string
  html?: string
  excerpt?: string
}
```

## Key Points

- `.data.js/.ts` files run only at build time (Node.js)
- `load()` return value exposed as `data` named export
- Use `watch` globs for HMR on local file changes
- `createContentLoader` for common archive/index pages
- Beware bundle size — avoid `render: true` for large content sets

<!--
Source references:
- https://vitepress.dev/guide/data-loading
-->
