---
name: features-frontmatter
description: VitePress frontmatter configuration — title, layout, hero, features, navbar, sidebar, and page-level overrides.
---

# Frontmatter

Page-level configuration via YAML frontmatter in `.md` files:

```yaml
---
title: My Page
description: A custom description
layout: doc
navbar: true
sidebar: true
---
```

## Common Options

```yaml
title: Page Title # override site title
titleTemplate: 'Suffix' # title suffix
description: Page description # meta description
head: # extra <head> tags
  - - meta
    - name: keywords
      content: vue, vitepress
```

## Layouts

```yaml
layout: doc     # default documentation layout
layout: home    # landing page with hero
layout: page    # blank layout (no default styles)
```

## Home Page (`layout: home`)

```yaml
---
layout: home

hero:
  name: My Project
  text: A fast static site generator
  tagline: Built with Vite and Vue
  image:
    src: /logo.svg
    alt: Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/user/repo

features:
  - icon: 🚀
    title: Fast
    details: Instant dev server and fast builds
  - icon: 🎨
    title: Vue-Powered
    details: Use Vue components in markdown
  - icon: 📝
    title: Markdown-Centered
    details: Write content with Markdown extensions
---
```

## Theme Overrides

```yaml
navbar: false # hide navbar
sidebar: false # hide sidebar
aside: false # hide right sidebar (TOC)
outline: deep # heading levels in TOC (number | 'deep' | false)
lastUpdated: true # show last updated timestamp
editLink: true # show edit link
prev: 'Previous Page' # custom prev link text
next: 'Next Page' # custom next link text
footer: false # hide footer
pageClass: 'custom-class' # add CSS class to <html>
```

## Key Points

- Frontmatter between `---` markers at top of `.md` files
- `layout: home` enables hero/features sections
- `$frontmatter` global in Vue expressions
- Overrides site-level and theme-level config per page
- `navbar: false` / `sidebar: false` to hide globally-set elements

<!--
Source references:
- https://vitepress.dev/reference/frontmatter-config
-->
