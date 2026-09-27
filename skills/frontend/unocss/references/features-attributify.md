---
name: features-attributify
description: UnoCSS attributify mode — attribute-based utilities, grouping, prefix configuration.
---

# Attributify Mode

Separate utilities into HTML attributes for better readability:

```html
<!-- Standard class usage -->
<button
  class="bg-blue-400 hover:bg-blue-500 text-sm text-white font-mono font-light py-2 px-4 rounded border-2 border-blue-200"
>
  <!-- Attributify mode -->
  <button bg="blue-400 hover:blue-500" text="sm white" font="mono light" p="y-2 x-4" border="2 rounded blue-200">
    Button
  </button>
</button>
```

## Setup

```ts
import { presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetAttributify(), presetWind3()],
})
```

`presetAttributify` must come before `presetWind3`.

## Grouping

Related utilities grouped by attribute prefix:

```html
<div bg="blue-400 hover:blue-500 dark:blue-500" text="sm white" p="x-4 y-2" flex="~ col" border="~ rounded gray-200" />
```

## Prefix

Avoid attribute name conflicts:

```ts
presetAttributify({ prefix: 'un-' })
```

```html
<button un-bg="blue-400" un-text="white">Button</button>
```

## When to Use

Use attributify when the project config explicitly includes `presetAttributify`. If unsure about the project setup, stick with standard `class` usage.

## Key Points

- `presetAttributify()` enables attribute-based utilities
- Order: attributify preset before Wind3 preset
- Attributes map to utility prefixes (bg → background, text → color/font-size, p → padding)
- Standard `class` usage still works alongside attributify
- Use `prefix` option to avoid conflicts with other attributes

<!--
Source references:
- https://unocss.dev/presets/attributify
-->
