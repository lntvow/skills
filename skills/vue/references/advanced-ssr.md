---
name: advanced-ssr
description: Vue Server-Side Rendering fundamentals — SSR API, hydration, and server/client code separation.
---

# Server-Side Rendering (SSR)

Vue supports rendering components to HTML strings on the server and "hydrating" them on the client.

## Basic SSR with renderToString()

```ts [server.ts]
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const app = createSSRApp({
  template: '<div>Hello SSR</div>',
})

const html = await renderToString(app)
```

## Hydration on Client

```ts [client.ts]
import { createSSRApp } from 'vue'

const app = createSSRApp(/* ... */)
app.mount('#app', true) // true enables hydration
```

## SSR Context

Share per-request data via `ssrContext`:

```ts
// Server
const ssrContext = {}
const html = await renderToString(app, ssrContext)

// Component (server-side)
import { useSSRContext } from 'vue'

export default {
  setup() {
    const ctx = useSSRContext()
    // ctx is shared across the component tree for this request
  },
}
```

## Server-Only vs Client-Only Code

**Lifecycle hooks NOT called during SSR**: `onMounted`, `onUpdated`, `onUnmounted`

```ts
import { onMounted, ref } from 'vue'

const el = ref(null)
onMounted(() => {
  // Only runs on client
  el.value?.focus()
})
```

**Client-only components** — use `<ClientOnly>`:

```vue
<template>
  <ClientOnly>
    <InteractiveChart />
    <template #fallback>
      <ChartPlaceholder />
    </template>
  </ClientOnly>
</template>
```

**Imperative client-only code**:

```ts
import { onMounted } from 'vue'

onMounted(() => {
  // Access window, document, etc. safely
  window.addEventListener('resize', handler)
})
```

## Key SSR Considerations

- Avoid stateful singletons (modules are shared across requests)
- Use `onMounted()` for browser-only code (`window`, `document`)
- Hydration mismatch warnings: ensure server and client render the same markup
- Components with `async setup()` need `<Suspense>` on both server and client
- Build considerations: SSR requires separate server and client bundles

## Key Points

- `renderToString()` renders Vue app to HTML string
- `app.mount('#app', true)` enables hydration
- `useSSRContext()` for per-request shared data
- `onMounted` / `onUnmounted` are client-only
- `<ClientOnly>` wraps components that only work in browser

<!--
Source references:
- https://vuejs.org/guide/scaling-up/ssr.html
- https://vuejs.org/api/ssr.html
-->
