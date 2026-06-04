---
name: core-store-definition
description: Pinia store definition with defineStore — Option Stores vs Setup Stores, storeToRefs, and conventions.
---

# Store Definition

## `defineStore()`

Every store gets a unique string ID and a setup function or options object:

```ts
import { defineStore } from 'pinia'

// Setup Store (preferred with Composition API)
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  return { count, doubleCount, increment }
})

// Option Store
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: { doubleCount: state => state.count * 2 },
  actions: {
    increment() {
      this.count++
    },
  },
})
```

**Naming convention**: `use...Store` (e.g., `useUserStore`, `useCartStore`). One store per file.

## Setup Stores vs Option Stores

|              | Setup Stores             | Option Stores                      |
| ------------ | ------------------------ | ---------------------------------- |
| Style        | Composition API function | `state`/`getters`/`actions` object |
| `ref()`      | → state property         | N/A                                |
| `computed()` | → getter                 | N/A                                |
| `function()` | → action                 | N/A                                |
| Watchers     | ✅ native `watch`        | ❌ need plugins                    |
| Composables  | ✅ full support          | Limited to `state()`               |
| `$reset()`   | Manual                   | Built-in                           |

> **Instructions**: Prefer TypeScript. Use Setup Stores for new code unless the project uses Options API.

Setup store with watchers:

```ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<Item[]>([])
  watch(
    items,
    newItems => {
      localStorage.setItem('cart', JSON.stringify(newItems))
    },
    { deep: true }
  )
  return { items }
})
```

## `storeToRefs()`

> **Instructions**: Use `storeToRefs` when destructuring state from stores to maintain reactivity.

```ts
import { storeToRefs } from 'pinia'

const store = useCounterStore()
// ❌ Breaks reactivity
const { count, doubleCount } = store
// ✅ Preserves reactivity
const { count, doubleCount } = storeToRefs(store)
// Actions can be destructured directly
const { increment } = store
```

## Using the Store

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()
// Access: store.count, store.doubleCount, store.increment()
</script>
```

Stores are `reactive()`-wrapped — no `.value` needed on state/getters.

## Key Points

- Each store must have a **unique string ID**
- Setup Stores = Composition API, Option Stores = Options API
- `storeToRefs()` keeps reactivity when destructuring state/getters
- Actions can be destructured directly (they're functions, not refs)
- `$reset()` is built-in for Option Stores; manual for Setup Stores

<!--
Source references:
- https://pinia.vuejs.org/core-concepts/
- https://pinia.vuejs.org/core-concepts/state.html
-->
