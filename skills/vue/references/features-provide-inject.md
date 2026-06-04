---
name: features-provide-inject
description: Vue dependency injection with provide() and inject() — avoid prop drilling across deep component trees.
---

# Provide / Inject

Provide data from an ancestor to all descendants without passing props through every level.

## Basic Usage

```ts [Ancestor.vue]
import { provide, ref } from 'vue'

const theme = ref('light')
const updateTheme = (t: string) => {
  theme.value = t
}

provide('theme', theme)
provide('updateTheme', updateTheme)
```

```ts [Descendant.vue]
import { inject } from 'vue'

const theme = inject('theme') // Ref<string> | undefined
const updateTheme = inject('updateTheme') // Function | undefined
```

## With Type Safety (InjectionKey)

```ts [keys.ts]
import type { InjectionKey, Ref } from 'vue'

export const themeKey = Symbol() as InjectionKey<Ref<string>>
```

```ts [Ancestor.vue]
import { provide, ref } from 'vue'
import { themeKey } from './keys'

provide(themeKey, ref('light'))
```

```ts [Descendant.vue]
import { inject } from 'vue'
import { themeKey } from './keys'

const theme = inject(themeKey) // Ref<string> — typed, no undefined
```

## With Default Values

```ts
import { inject, ref } from 'vue'

// Default value if not provided
const theme = inject('theme', ref('light'))

// Factory function for complex defaults
const config = inject('config', () => ({
  apiUrl: '/api',
  timeout: 5000,
}))
```

## Making Provided Data Readonly

```ts [Ancestor.vue]
import { provide, ref, readonly } from 'vue'

const count = ref(0)
provide('count', readonly(count)) // descendants can't mutate directly

function increment() {
  count.value++
}
provide('increment', increment) // only via exposed function
```

## Reactive Provide (App-level)

Use `app.provide()` for globally available dependencies:

```ts [main.ts]
import { createApp } from 'vue'

const app = createApp(App)
app.provide('apiClient', createApiClient())
app.mount('#app')
```

## Key Points

- Use `InjectionKey<T>` for type-safe injection
- Provide mutation methods alongside readonly state
- `provide()` can be called at app level, component level, or in composables
- Values provided are NOT reactive by default — provide `ref`/`reactive` for reactivity
- Prefer provide/inject over prop drilling for deeply nested dependencies

<!--
Source references:
- https://vuejs.org/guide/components/provide-inject.html
- https://vuejs.org/api/composition-api-dependency-injection.html
-->
