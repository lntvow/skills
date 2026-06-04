---
name: core-state
description: Pinia state — definition, TypeScript, $reset, $patch, $state, mapState, mapWritableState.
---

# State

## Definition

State is defined as a function returning the initial state object:

```ts
export const useUserStore = defineStore('user', {
  state: () => ({
    userList: [] as UserInfo[],
    user: null as UserInfo | null,
  }),
})
```

Or in Setup Stores:

```ts
export const useUserStore = defineStore('user', () => {
  const userList = ref<UserInfo[]>([])
  const user = ref<UserInfo | null>(null)
  return { userList, user }
})
```

Every state property must be declared upfront — no dynamic additions.

## TypeScript

Enable `strict` or `noImplicitThis` in `tsconfig.json`. Use type assertion for empty/null initial values:

```ts
state: () => ({
  items: [] as Item[],
  selected: null as Item | null,
})
```

Or type the return value:

```ts
interface State {
  items: Item[]
  selected: Item | null
}
state: (): State => ({ items: [], selected: null })
```

## Mutating State

Direct mutation (no wrappers needed):

```ts
const store = useCounterStore()
store.count++
```

Works with `v-model`:

```vue
<input v-model="store.count" type="number" />
```

### `$patch`

Batch multiple mutations:

```ts
store.$patch({
  count: store.count + 1,
  name: 'New Name',
})
// Or with a function for complex logic
store.$patch(state => {
  state.items.push({ name: 'New' })
  state.hasChanged = true
})
```

## `$reset()`

**Option Stores** — built-in:

```ts
const store = useCounterStore()
store.$reset() // resets to initial state()
```

**Setup Stores** — define manually:

```ts
defineStore('counter', () => {
  const count = ref(0)
  function $reset() {
    count.value = 0
  }
  return { count, $reset }
})
```

## `$state`

Replace the entire state (useful for SSR hydration):

```ts
store.$state = { count: 10, name: 'New' }
```

## Subscribing to Changes

```ts
store.$subscribe((mutation, state) => {
  console.log(mutation.type) // 'direct' | 'patch object' | 'patch function'
  console.log(mutation.storeId)
  console.log(mutation.payload)
})
// Detach after 2 seconds
store.$subscribe(callback, { detached: true })
```

## mapState / mapWritableState (Options API)

```ts
import { mapState, mapWritableState } from 'pinia'

// Readonly
...mapState(useCounterStore, ['count'])
...mapState(useCounterStore, { myCount: 'count', double: s => s.count * 2 })

// Writable (for v-model)
...mapWritableState(useCounterStore, ['count'])
```

## Key Points

- State function enables per-instance initial state (SSR-safe)
- Direct mutation — no mutations/setters like Vuex
- `$patch` for batched changes; functional form for complex logic
- `$reset()` must be defined manually in Setup Stores
- `$subscribe` for watching state changes; `detached: true` survives component unmount

<!--
Source references:
- https://pinia.vuejs.org/core-concepts/state.html
-->
