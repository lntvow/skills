---
name: best-practices-performance
description: Vue performance optimization — shallowRef, v-once, v-memo, computed stability, lazy loading, and list virtualization.
---

# Performance Optimization

## Use shallowRef() for Large Data

> From instructions: "Prefer using `shallowRef` over `ref` if the deep reactivity is not used."

```ts
import { shallowRef, triggerRef } from 'vue'

// Large API responses, immutable data patterns — use shallowRef
const items = shallowRef<Item[]>([])

// Replace wholesale instead of mutating
async function loadItems() {
  items.value = await fetchItems()
}

// Or mutate then trigger manually
items.value.push(newItem)
triggerRef(items)
```

## Props Stability

Pass computed booleans rather than IDs to minimize child re-renders:

```vue
<!-- ❌ Every item re-renders -->
<ListItem v-for="item in list" :id="item.id" :active-id="activeId" />

<!-- ✅ Only changed items re-render -->
<ListItem v-for="item in list" :id="item.id" :active="item.id === activeId" />
```

## v-once

Render once, never update:

```vue
<template>
  <div v-once>
    <h1>{{ expensiveComputation() }}</h1>
  </div>
</template>
```

## v-memo

Conditionally skip subtree updates:

```vue
<template>
  <div v-memo="[valueA, valueB]">
    <!-- Only re-renders when valueA or valueB changes -->
    <ExpensiveSubtree />
  </div>
</template>

<!-- Optimize v-for lists -->
<div v-for="item in list" :key="item.id" v-memo="[item.id === selected]">
  <!-- Only re-renders when item selection changes -->
</div>
```

## Computed Stability (3.4+)

A computed only triggers effects when its return value changes. Optimize object-returning computeds by returning old reference when content is unchanged:

```ts
const computedObj = computed(oldValue => {
  const newValue = { isEven: count.value % 2 === 0 }
  if (oldValue && oldValue.isEven === newValue.isEven) {
    return oldValue // preserves referential equality
  }
  return newValue
})
```

## Lazy Loading / Code Splitting

```ts
import { defineAsyncComponent } from 'vue'

const AdminPanel = defineAsyncComponent(() => import('./AdminPanel.vue'))
const Chart = defineAsyncComponent({
  loader: () => import('./Chart.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200, // show loading after 200ms
  timeout: 3000, // error after 3s
})
```

## Virtualize Large Lists

For lists with 1000+ items, use virtualization libraries. Vue's deep reactivity has overhead on 100,000+ property accesses per render — use `shallowRef` for such data.

Recommended libraries: `vue-virtual-scroller`, `vue-virtual-scroll-grid`, `vueuc/VVirtualList`

## Key Points

- `shallowRef` is the default choice for large data structures — deep reactivity is expensive
- Stabilize child component props to minimize re-renders
- `v-once` for static content; `v-memo` for conditional memoization
- `defineAsyncComponent` for route-level / feature-level code splitting
- Virtualize lists with 1000+ items

<!--
Source references:
- https://vuejs.org/guide/best-practices/performance.html
- https://vuejs.org/api/reactivity-advanced.html#shallowref
- https://vuejs.org/api/built-in-directives.html#v-once
- https://vuejs.org/api/built-in-directives.html#v-memo
-->
