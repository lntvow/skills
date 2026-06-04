---
name: features-composables
description: Composable patterns — extracting and reusing stateful logic in Vue with Composition API.
---

# Composables

Composables are functions that encapsulate **stateful logic** using Vue's Composition API. By convention, names start with `use`.

## Basic Pattern

```ts [useMouse.ts]
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<script setup lang="ts">
import { useMouse } from './useMouse'
const { x, y } = useMouse()
// Each component instance gets its own state
</script>
```

## Accepting Reactive State

Don't pass raw values — accept refs or getters so the composable can react to changes:

```ts [useFetch.ts]
import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'

export function useFetch(url: MaybeRefOrGetter<string>) {
  const data = ref(null)
  const error = ref(null)

  watchEffect(() => {
    data.value = null
    error.value = null
    fetch(toValue(url))
      .then(res => res.json())
      .then(json => (data.value = json))
      .catch(err => (error.value = err))
  })

  return { data, error }
}
```

**`toValue()`** (3.3+): Normalizes refs, getters, and plain values into a plain value inside a reactive context:

```ts
import { toValue } from 'vue'
// toValue(ref) → ref.value
// toValue(() => x) → x (tracks reactivity)
// toValue('hello') → 'hello'
```

## Composition Pattern

Composables can call other composables — compose small units into complex logic:

```ts
import { ref } from 'vue'
import { useEventListener } from './useEventListener'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  useEventListener(window, 'mousemove', e => {
    x.value = e.pageX
    y.value = e.pageY
  })
  return { x, y }
}
```

## Async Composables

Handle loading, error, and data states explicitly:

```ts
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const data = shallowRef<T | null>(null) // shallowRef for large data
  const error = ref<Error | null>(null)
  const pending = ref(false)

  async function execute() {
    pending.value = true
    error.value = null
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      pending.value = false
    }
  }

  return { data, error, pending, execute }
}
```

## Conventions

- Name starts with `use` (e.g., `useMouse`, `useFetch`)
- Return refs from composables (not raw values)
- Clean up side effects (`onUnmounted`, `watch` stop handles)
- Each component instance gets independent state (use `createSharedComposable` from VueUse for shared state)
- Accept `MaybeRefOrGetter<T>` for reactive inputs; use `toValue()` to normalize

## Key Points

- Composables encapsulate stateful logic — different from utility functions
- Return refs, not plain values
- Accept reactive inputs via `MaybeRefOrGetter<T>` pattern
- Use `shallowRef` for large async data
- Clean up subscriptions in `onUnmounted` or via `watch`/`watchEffect` return handles

<!--
Source references:
- https://vuejs.org/guide/reusability/composables.html
- https://vuejs.org/api/reactivity-utilities.html#tovalue
-->
