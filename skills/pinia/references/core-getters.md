---
name: core-getters
description: Pinia getters — computed store values, this access, argument passing, and TypeScript.
---

# Getters

Getters are computed values for store state. Equivalent to `computed()` in components.

## Basic Definition

```ts
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubleCount: state => state.count * 2,
  },
})
```

Access directly on the store:

```vue
<template>
  <p>{{ store.doubleCount }}</p>
</template>
```

## Using `this` to Access Other Getters

When accessing other getters via `this`, use a regular function (not arrow) and **explicitly type the return value** in TypeScript:

```ts
getters: {
  doubleCount(state) { return state.count * 2 },
  // Must annotate return type when using `this`
  doubleCountPlusOne(): number {
    return this.doubleCount + 1
  },
}
```

Arrow functions don't have `this`, so use `state` parameter instead:

```ts
getters: {
  doubleCount: (state) => state.count * 2,
  // Can't use this.doubleCount here → use state
}
```

## Passing Arguments

Getters can't accept parameters directly. Instead, **return a function**:

```ts
export const useUserStore = defineStore('user', {
  state: () => ({ users: [] as User[] }),
  getters: {
    getUserById: state => (id: number) => state.users.find(u => u.id === id),
  },
})
```

```vue
<template>
  <p>{{ store.getUserById(1)?.name }}</p>
</template>
```

Note: the returned function is **not cached** — each call re-executes the filter.

## Accessing Other Stores

```ts
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', {
  getters: {
    summary(state) {
      const user = useUserStore()
      return `${user.name}: ${state.items.length} items`
    },
  },
})
```

## Setup Store Getters

In Setup Stores, use `computed()`:

```ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  return { count, doubleCount }
})
```

## Key Points

- Arrow functions with `state` param for simple getters
- Regular functions with `this` for cross-getter access (must annotate return type)
- Return a function for parameterized getters (no caching)
- Setup Stores: use `computed()` directly

<!--
Source references:
- https://pinia.vuejs.org/core-concepts/getters.html
-->
