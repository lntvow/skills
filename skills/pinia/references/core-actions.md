---
name: core-actions
description: Pinia actions — business logic, async operations, cross-store access, and $onAction.
---

# Actions

Actions are methods that contain business logic. They can be **async** and access the full store via `this`.

## Basic Definition

```ts
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++
    },
    randomize() {
      this.count = Math.round(100 * Math.random())
    },
  },
})
```

Call like regular methods:

```vue
<script setup>
const store = useCounterStore()
store.randomize()
</script>

<template>
  <button @click="store.increment()">+1</button>
</template>
```

## Async Actions

```ts
import { mande } from 'mande'
const api = mande('/api/users')

export const useUsers = defineStore('users', {
  state: () => ({ userData: null as User | null }),
  actions: {
    async registerUser(login: string, password: string) {
      try {
        this.userData = await api.post({ login, password })
      } catch (error) {
        return error // let the component handle it
      }
    },
  },
})
```

> **Instructions**: Keep API calls in separate composable functions rather than embedding them directly within store actions.

## Accessing Other Stores

```ts
import { useAuthStore } from './auth'

export const useSettingsStore = defineStore('settings', {
  state: () => ({ preferences: null }),
  actions: {
    async fetchPreferences() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) throw new Error('Unauthorized')
      this.preferences = await api.getPreferences(auth.userId)
    },
  },
})
```

## Setup Store Actions

```ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  function increment() {
    count.value++
  }
  async function fetchCount() {
    const res = await fetch('/api/count')
    count.value = await res.json()
  }
  return { count, increment, fetchCount }
})
```

## `$onAction()`

Subscribe to action calls (useful for logging/plugins):

```ts
const unsubscribe = store.$onAction(
  ({ name, store, args, after, onError }) => {
    console.log(`Action ${name} started with args:`, args)
    after(result => {
      console.log(`Action ${name} resolved:`, result)
    })
    onError(error => {
      console.error(`Action ${name} failed:`, error)
    })
  },
  true // detached: survives component unmount
)
```

## Key Points

- Actions can be **async** — use `await` for API calls
- Access `this` for store state/getters/other actions (not arrow functions)
- Call `useOtherStore()` inside actions to share state across stores
- Extract API logic into composables per instructions
- `$onAction()` for action lifecycle hooks

<!--
Source references:
- https://pinia.vuejs.org/core-concepts/actions.html
-->
