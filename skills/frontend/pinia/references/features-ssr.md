---
name: features-ssr
description: Pinia SSR — server-side rendering, state hydration, Nuxt integration, and outside-component usage.
---

# SSR (Server-Side Rendering)

## Basic Setup

Pinia works with SSR out of the box when `useStore()` is called inside `setup()`:

```vue
<script setup>
const store = useMainStore() // ✅ auto-detects the correct pinia instance
</script>
```

## Outside `setup()` — Pass `pinia` Manually

In router guards, `serverPrefetch`, or other non-component contexts:

```ts
const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

router.beforeEach(to => {
  const main = useMainStore(pinia) // ✅ pass pinia instance
  if (to.meta.requiresAuth && !main.isLoggedIn) return '/login'
})
```

Pinia adds `$pinia` to the app, accessible in Options API:

```ts
export default {
  serverPrefetch() {
    const store = useStore(this.$pinia)
  },
}
```

## State Hydration

Serialize server state into HTML, then hydrate on client:

```ts
// Server
import devalue from 'devalue'

const pinia = createPinia()
app.use(pinia)
// ... render app ...
const state = devalue(pinia.state.value) // serialize & escape XSS
// Inject into HTML: <script>window.__pinia = ${state}</script>
```

```ts
// Client
const pinia = createPinia()
// Hydrate before any useStore() call
if (window.__pinia) {
  pinia.state.value = JSON.parse(window.__pinia)
}
app.use(pinia)
```

Always use a serializer that handles XSS (e.g., [devalue](https://github.com/Rich-Harris/devalue)). `JSON.stringify` is fast but doesn't escape `<script>` tags.

## SPA Usage

In SPAs, `useStore()` works after `app.use(pinia)`:

```ts
const pinia = createPinia()
app.use(pinia)

// ✅ Works — pinia is active
const store = useUserStore()

// ❌ Fails — called before pinia is created
const store2 = useUserStore()
```

Defer `useStore()` calls inside functions that run after app initialization (e.g., router guards).

## Nuxt

Nuxt handles SSR automatically with `@pinia/nuxt`. No manual hydration needed.

## Key Points

- `useStore()` auto-detects pinia inside `setup()` — works for SSR
- Outside `setup()`: pass `pinia` instance to `useStore(pinia)`
- Serialize `pinia.state.value` server-side; hydrate before any `useStore()` on client
- Use `devalue` or similar for XSS-safe serialization
- In SPAs, ensure `app.use(pinia)` before any `useStore()` calls

<!--
Source references:
- https://pinia.vuejs.org/ssr/
- https://pinia.vuejs.org/core-concepts/outside-component-usage.html
-->
