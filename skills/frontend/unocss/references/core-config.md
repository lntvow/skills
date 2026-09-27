---
name: core-config
description: UnoCSS configuration — uno.config.ts, defineConfig, presets, theme, shortcuts, and safelist.
---

# Configuration

## `uno.config.ts`

UnoCSS auto-detects `uno.config.{js,ts,mjs,mts}` at project root. Use dedicated config for best IDE support and HMR:

```ts [uno.config.ts]
import { defineConfig, presetWind3, presetIcons, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [presetWind3(), presetIcons()],
  transformers: [transformerDirectives()],
  shortcuts: { btn: 'py-2 px-4 rounded' },
  theme: { colors: { brand: '#3c8772' } },
  safelist: ['hidden', 'block'],
})
```

> **Instructions**: Look for `uno.config.*` to understand what presets, rules, and shortcuts are available. If unclear about the project setup, avoid attributify mode — use basic `class` usage.

## Key Options

### presets

Pre-built rule/theme/variant collections:

```ts
presets: [presetWind3(), presetIcons(), presetTypography()]
```

### shortcuts

Combine multiple utilities:

```ts
shortcuts: {
  'btn': 'py-2 px-4 font-semibold rounded-lg',
  'btn-primary': 'btn bg-blue-500 text-white hover:bg-blue-600',
}
```

### theme

Extend or override default theme values:

```ts
theme: {
  colors: { primary: '#3c8772', secondary: '#f59e0b' },
  breakpoints: { xs: '320px', sm: '640px', lg: '1024px' },
}
```

### safelist

Class names to always include regardless of usage detection:

```ts
safelist: ['hidden', 'block', 'flex', /^grid-cols-/]
```

### rules

Custom rules (see [core-rules-shortcuts](core-rules-shortcuts.md)).

### variants

Custom variants (see [features-variants](features-variants.md)).

## Integration

In `vite.config.ts`:

```ts
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [UnoCSS()],
})
```

For Nuxt, Astro, and other frameworks, see integration-specific packages.

## Key Points

- `uno.config.ts` at project root — auto-detected
- `defineConfig` for TypeScript intellisense
- Presets are the primary way to configure rules
- UnoCSS = Tailwind superset; standard Tailwind classes work with `presetWind3`

<!--
Source references:
- https://unocss.dev/guide/config-file
- https://unocss.dev/config/
-->
