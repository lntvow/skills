---
name: features-icons
description: UnoCSS icons — i- prefix, Iconify integration, custom collections, and CSS-based icon rendering.
---

# Icons

Use any icon from [Iconify](https://iconify.design) via CSS classes.

## Usage

Pattern: `i-<collection>-<icon>` or `i-<collection>:<icon>`

```html
<!-- Phosphor icons -->
<div class="i-ph-anchor-simple-thin" />
<!-- Material Design Icons -->
<div class="i-mdi-alarm text-orange-400" />
<!-- Logos -->
<div class="i-logos-vue text-3xl" />
<!-- Dark mode aware -->
<button class="i-carbon-sun dark:i-carbon-moon" />
<!-- Twemoji with hover -->
<div class="i-twemoji-grinning-face hover:i-twemoji-face-with-tears-of-joy" />
```

## Setup

```ts
import { presetIcons } from 'unocss'

export default defineConfig({
  presets: [presetIcons()],
})
```

Install icon data: `pnpm add -D @iconify-json/<collection>`. Browse [Icônes](https://icones.js.org/) for available collections.

## Configuration

```ts
presetIcons({
  scale: 1.2, // default icon size scale
  extraProperties: {
    // extra CSS on all icons
    'display': 'inline-block',
    'vertical-align': 'middle',
  },
  collections: {
    // custom collections
    custom: {
      logo: '<svg>...</svg>',
    },
  },
})
```

## CSS-Based Rendering

Icons render as pure CSS (no JS). Styled with standard utilities:

```html
<div class="i-mdi-home text-2xl text-blue-500 hover:text-blue-700" />
```

## Key Points

- `i-<collection>-<icon>` or `i-<collection>:<icon>` pattern
- Install `@iconify-json/<collection>` for each icon set
- Icons are CSS-based — no JavaScript required
- Style with standard color/size utilities
- Use `dark:` variant for dark mode icons

<!--
Source references:
- https://unocss.dev/presets/icons
-->
