---
name: core-presets
description: UnoCSS presets overview — presetWind3, presetIcons, presetTypography, presetAttributify, presetWebFonts.
---

# Presets

Presets bundle rules, variants, and theme. Core presets ship with the `unocss` package.

## `presetWind3`

Tailwind CSS v3 compatible utilities. The primary preset for most projects:

```ts
import { presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3()],
})
```

Covers flex, grid, spacing, typography, colors, borders, and all standard Tailwind utilities. UnoCSS is a Tailwind superset — all Tailwind knowledge applies.

## `presetIcons`

Icon utilities via Iconify. See [features-icons](features-icons.md).

## `presetTypography`

Prose/tailwind-typography classes:

```ts
import { presetTypography } from 'unocss'

presets: [presetTypography()]
```

Usage: `<article class="prose">...</article>`

## `presetAttributify`

Attribute-based utilities. See [features-attributify](features-attributify.md).

## `presetWebFonts`

Auto-import web fonts:

```ts
import { presetWebFonts } from 'unocss'

presets: [
  presetWebFonts({
    provider: 'google',
    fonts: { sans: 'Roboto', mono: ['Fira Code', 'Fira Mono:400,700'] },
  }),
]
```

Usage: `<div class="font-sans">` → auto-imports Roboto from Google Fonts.

## `presetRemToPx`

Convert rem to px (1rem = 16px default):

```ts
import { presetRemToPx } from 'unocss'

presets: [presetRemToPx({ baseFontSize: 4 })] // 1 unit = 0.25rem → 1px
```

## Community Presets

Many community presets exist for specific frameworks and design systems. Check the [UnoCSS docs](https://unocss.dev/presets/community) for the full list.

## Key Points

- `presetWind3` is the default choice — full Tailwind CSS compatibility
- Presets can be combined (e.g., Wind3 + Icons + Typography)
- Order matters — later presets override earlier ones
- Most presets from `unocss` package; community presets via `@unocss/preset-*`

<!--
Source references:
- https://unocss.dev/presets/
-->
