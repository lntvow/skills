---
name: core-routing
description: VitePress file-based routing — page mapping, internal links, dynamic routes, clean URLs, and path rewrites.
---

# Routing

## File-Based Routing

Pages map from directory structure:

```
docs/
├── index.md              → /
├── guide/
│   ├── index.md          → /guide/
│   └── getting-started.md → /guide/getting-started
└── about.md              → /about
```

`index.md` in a directory → `index.html` (accessible as `/dir/`).

## Project Root vs Source Directory

- **Project root**: where `.vitepress/` lives
- **Source directory** (`srcDir`): where `.md` files live (default: same as root)

```ts
export default defineConfig({
  srcDir: 'src', // markdown in ./src/
})
```

## Linking Between Pages

Omit file extensions — VitePress generates final URLs:

```md
<!-- ✅ Correct -->

[Guide](./getting-started)
[Home](/)
[Section](/guide/#heading)

<!-- ❌ Avoid -->

[Guide](./getting-started.md)
[Guide](./getting-started.html)
```

Internal links → SPA router navigation. External links → `target="_blank" rel="noreferrer"`.

## Dynamic Routes

Create `[param].md` files for dynamic paths:

```
docs/
└── posts/
    └── [slug].md        → /posts/:slug
```

Access params in Vue expressions:

```md
Post: {{ $params.slug }}
```

Generate paths via `paths` loader in a `.paths.js` file:

```js [posts/[slug].paths.js]
export default {
  paths() {
    return [{ params: { slug: 'hello-world' } }, { params: { slug: 'another-post' } }]
  },
}
```

## Clean URLs

```ts
export default defineConfig({
  cleanUrls: true, // drop .html suffix
})
```

## Path Rewrites

```ts
export default defineConfig({
  rewrites: {
    'src/:pkg/(.*)': ':pkg/(.*)', // remap paths at build
  },
})
```

## Key Points

- File structure = URL structure; `index.md` = `/dir/`
- Omit `.md`/`.html` in links for clean URLs
- `[param].md` + `.paths.js` for dynamic routes
- Internal links use SPA router; external links open in new tab
- `rewrites` for remapping source paths to output URLs

<!--
Source references:
- https://vitepress.dev/guide/routing
-->
