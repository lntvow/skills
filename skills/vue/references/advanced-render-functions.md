---
name: advanced-render-functions
description: Vue render functions with h(), JSX/TSX support, functional components, and when to use them over templates.
---

# Render Functions & JSX

Most components should use templates. Use render functions when you need full JavaScript power for dynamic rendering logic.

## `h()` Function

```ts
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    // h(tag, props, children)
    return () =>
      h('div', { class: 'counter' }, [h('span', count.value), h('button', { onClick: () => count.value++ }, '+')])
  },
}
```

## JSX / TSX

With proper build setup (`@vitejs/plugin-vue-jsx` for Vite), use TSX in `.tsx` files or with `<script setup lang="tsx">`:

```tsx
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return () => (
      <div class="counter">
        <span>{count.value}</span>
        <button onClick={() => count.value++}>+</button>
      </div>
    )
  },
}
```

## Slots in Render Functions

```ts
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => h('div', [slots.default?.(), slots.header?.({ title: 'Hello' })])
  },
}
```

## resolveComponent()

For resolving registered components by name in render functions:

```ts
import { h, resolveComponent } from 'vue'

export default {
  setup() {
    const MyComponent = resolveComponent('MyComponent')
    return () => h(MyComponent, { prop: 'value' })
  },
}
```

## Functional Components

Simple components that don't need state or lifecycle:

```ts
import type { FunctionalComponent } from 'vue'

const Heading: FunctionalComponent<{ level: number }> = (props, { slots }) => {
  return h(`h${props.level}`, {}, slots.default?.())
}
```

## When to Use Render Functions

- Dynamic tag/component resolution
- Programmatic element construction
- Library/utility components
- When JSX provides better readability for complex conditions

Prefer templates for 95% of components — they're optimized by the compiler.

## Key Points

- Use `h()` for programmatic VNode creation
- JSX requires `@vitejs/plugin-vue-jsx` (or equivalent)
- Access slots via `slots.default?.()` pattern
- Use `resolveComponent()` for named resolution
- Templates are compiled and optimized; render functions skip compilation optimizations

<!--
Source references:
- https://vuejs.org/guide/extras/render-function.html
- https://vuejs.org/api/render-function.html
-->
