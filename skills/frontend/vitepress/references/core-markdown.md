---
name: core-markdown
description: VitePress Markdown extensions — frontmatter, code blocks, custom containers, emoji, tables, table of contents.
---

# Markdown Extensions

## Frontmatter

YAML frontmatter at the top of `.md` files:

```yaml
---
title: My Page
description: Page description
editLink: true
---
```

Access via `$frontmatter` in Vue expressions: `{{ $frontmatter.title }}`.

## Code Blocks

Syntax highlighting via Shiki. Line highlighting:

````md
```js{1,3-5}
const a = 1        // highlighted
const b = 2
const c = 3        // highlighted
function foo() {}  // highlighted
```
````

**Code groups**:

````md
::: code-group

```npm
npm install vitepress
```

```pnpm
pnpm add vitepress
```

:::
````

## Custom Containers

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

::: details Click me
This is a details block with a custom title.
:::
```

**Custom titles**:

```md
::: danger STOP
Danger zone, do not proceed
:::
```

## GitHub-Style Tables

```md
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |
```

## Emoji

`:tada:` → 🎉 `:100:` → 💯

## Table of Contents

```md
[[toc]]
```

Configure depth: `markdown.toc: { level: [2, 3] }`

## Links

Internal links converted to SPA router links:

```md
[Getting Started](./getting-started) # relative
[Home](/guide/) # absolute
[Guide Section](/guide/#section) # with anchor
```

## Header Anchors

Auto-generated. Custom anchors:

```md
# My Heading {#custom-id}
```

## Key Points

- YAML frontmatter between `---` for page-level config
- `{lines}` after code fence language for line highlighting
- `::: type` for custom containers (info/tip/warning/danger/details)
- `[[toc]]` for table of contents
- Internal links omit extensions; external auto `target="_blank"`

<!--
Source references:
- https://vitepress.dev/guide/markdown
-->
