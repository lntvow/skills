---
name: features-plugins
description: Pinia plugin system — adding global properties, augmenting state, wrapping actions, and SSR-safe plugin state.
---

# Plugins

Pinia plugins extend all stores. Add global objects, new state properties, or intercept actions.

## Basic Plugin

```ts
import { createPinia } from 'pinia'

function myPlugin(context) {
  // context.pinia   — the pinia instance
  // context.app     — the Vue app
  // context.store   — the store being created
  // context.options — defineStore options
  return { secret: 'the cake is a lie' }
}

const pinia = createPinia()
pinia.use(myPlugin)
```

## Adding Global Properties

Return an object to add properties to every store:

```ts
pinia.use(() => ({ hello: 'world' }))
// All stores now have store.hello
```

Or set directly on store (must register for devtools):

```ts
pinia.use(({ store }) => {
  store.hello = 'world'
  if (process.env.NODE_ENV === 'development') {
    store._customProperties.add('hello')
  }
})
```

Refs are auto-unwrapped:

```ts
const sharedRef = ref('shared')
pinia.use(({ store }) => {
  store.individual = ref('secret') // per-store
  store.shared = sharedRef // shared across all stores
})
```

## Adding New State (SSR-safe)

Add state that survives SSR serialization — set on both `store` and `store.$state`:

```ts
import { toRef, ref } from 'vue'

pinia.use(({ store }) => {
  if (!Object.hasOwn(store.$state, 'hasError')) {
    const hasError = ref(false)
    store.$state.hasError = hasError // serializable
  }
  store.hasError = toRef(store.$state, 'hasError') // reactive access
})
```

## Wrapping / Intercepting Actions

```ts
pinia.use(({ store }) => {
  const originalDispatch = store.$onAction
  store.$onAction(context => {
    console.log(`[${store.$id}] ${context.name}`, context.args)
    context.after(result => console.log('  → resolved', result))
    context.onError(err => console.error('  → failed', err))
  })
})
```

## App-level Injection in Plugins

Pass router or other app-level instances:

```ts
import { createRouter } from 'vue-router'

function routerPlugin({ app, store }) {
  const router = app.config.globalProperties.$router
  store.router = router
}

const router = createRouter(/* ... */)
const pinia = createPinia()
pinia.use(routerPlugin)
```

## Key Points

- `pinia.use(fn)` registers plugins before `app.use(pinia)`
- Returned properties auto-register in devtools; direct assignments need `_customProperties.add()`
- For SSR plugin state: set on both `store` and `store.$state`
- Plugin state changes don't trigger subscriptions (run before store is active)
- `$reset()` won't reset plugin-added state by default — override it

<!--
Source references:
- https://pinia.vuejs.org/core-concepts/plugins.html
-->
