---
name: features-variants
description: UnoCSS variants — hover, dark, responsive, group-hover, and custom variant authoring.
---

# Variants

Variants apply conditional styles: `hover:`, `dark:`, `sm:`, etc.

## Built-in Variants (via presets)

| Variant               | Example                   | Effect                                       |
| --------------------- | ------------------------- | -------------------------------------------- |
| `hover:`              | `hover:bg-blue-500`       | On hover                                     |
| `focus:`              | `focus:ring-2`            | On focus                                     |
| `active:`             | `active:scale-95`         | On active                                    |
| `dark:`               | `dark:bg-gray-800`        | Dark mode                                    |
| `sm:` / `md:` / `lg:` | `md:flex`                 | Responsive breakpoints                       |
| `group-hover:`        | `group-hover:opacity-100` | When parent has class `group` and is hovered |

All standard Tailwind variants work with `presetWind3`.

## Custom Variants

Define custom variants in config:

```ts
variants: [
  matcher => {
    if (!matcher.startsWith('hover:')) return matcher
    return {
      matcher: matcher.slice(6), // remove 'hover:' prefix
      selector: s => `${s}:hover`, // prepend :hover to selector
    }
  },
]
```

**How it works**: `hover:m-2` → variant strips `hover:` → matches `m-2` rule → produces `.hover\:m-2:hover { margin: 0.5rem; }`.

## Key Points

- Variants are processed before rules — prefix is stripped and passed through
- Built-in variants from presets cover most needs
- Custom variants: return `{ matcher, selector }` object
- `selector` callback transforms the generated CSS selector
- Variants chain: `dark:hover:bg-blue-600` goes through dark → hover → rule

<!--
Source references:
- https://unocss.dev/config/variants
-->
