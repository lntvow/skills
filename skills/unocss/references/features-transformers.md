---
name: features-transformers
description: UnoCSS transformers — transformerDirectives, transformerVariantGroup, and custom transformers.
---

# Transformers

Transformers modify source code to support conventions like `@apply` and variant groups.

## `transformerDirectives`

Enables `@apply`, `@screen`, and `theme()` CSS directives:

```ts
import { transformerDirectives } from 'unocss'
```

```css
.custom-btn {
  @apply py-2 px-4 bg-blue-500 text-white rounded;
}
.custom-text {
  font-size: theme('fontSize.xl');
}
```

## `transformerVariantGroup`

Group variants with parentheses:

```html
<!-- Without transformer -->
<div class="hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100">
  <!-- With transformer -->
  <div class="hover:(bg-gray-100 text-gray-900) dark:hover:(bg-gray-800 text-gray-100)"></div>
</div>
```

## Custom Transformer

```ts
import { SourceCodeTransformer } from 'unocss'

export default function myTransformer(): SourceCodeTransformer {
  return {
    name: 'my-transformer',
    enforce: 'pre', // optional: 'pre' | 'post'
    idFilter(id) {
      return id.match(/\.[tj]sx$/)
    },
    async transform(code, id, { uno }) {
      code.appendRight(0, '/* transformed */')
    },
  }
}
```

Register in config: `transformers: [myTransformer()]`.

## Key Points

- `transformerDirectives` enables `@apply` in CSS
- `transformerVariantGroup` allows `hover:(...)` grouped syntax
- Custom transformers implement `SourceCodeTransformer` interface
- `enforce: 'pre'` runs before other transformers
- `idFilter` controls which files get transformed

<!--
Source references:
- https://unocss.dev/config/transformers
-->
