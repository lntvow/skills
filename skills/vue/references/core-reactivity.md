---
name: core-reactivity
description: Vue 3 reactivity system — ref, reactive, computed, watch, shallowRef, and when to use each.
---

# Core Reactivity

Vue 3's reactivity system is based on JavaScript Proxies. Use Composition API with `<script setup lang="ts">` as the default.

## ref() vs reactive()

Prefer `ref()` for primitives and for values that will be replaced. Prefer `reactive()` only for form objects or collections where deep reactivity is needed throughout.

```ts
import { ref, reactive } from 'vue'

// ✅ Prefer ref for primitives
const count = ref<number>(0)
const name = ref<string>('')

// ✅ reactive for forms / nested objects needing deep tracking
const form = reactive({
  email: '',
  password: '',
})

// ❌ Avoid: reactive with primitives (not allowed)
// const count = reactive(0) // TypeError
```

### ref() unwrapping rules

- refs auto-unwrap in templates — no `.value` needed
- refs auto-unwrap when nested inside `reactive()` objects
- refs do **NOT** unwrap in reactive arrays or `Map`/`Set`

```ts
const count = ref(1)
const obj = reactive({ count })
obj.count++ // works, auto-unwrapped

const arr = reactive([ref('hello')])
arr[0].value // must use .value in arrays
```

## shallowRef() — Performance Optimization

Use `shallowRef()` when deep reactivity is **not** needed — especially for large data structures, API responses, or external state. The instruction from `instructions/vue.md` states: **prefer `shallowRef` over `ref` if the deep reactivity is not used.**

```ts
import { shallowRef, triggerRef } from 'vue'

// Only .value access is tracked; nested changes are ignored
const items = shallowRef<Item[]>([])

// ❌ Won't trigger updates
items.value.push(newItem)

// ✅ Will trigger updates
items.value = [...items.value, newItem]

// Or: mutate then manually trigger
items.value.push(newItem)
triggerRef(items)
```

**When to use `shallowRef`:**

- Large arrays / objects that are replaced wholesale
- Integration with external state (e.g., XState, Redux)
- Immutable data patterns

**When to use `ref`:**

- Small reactive values where deep tracking simplifies code
- Objects that undergo incremental property mutations

## computed()

Computed properties cache results and only re-evaluate when dependencies change.

```ts
import { computed, ref } from 'vue'

const count = ref(0)

// Read-only computed
const doubled = computed(() => count.value * 2)

// Writable computed
const doubledWritable = computed({
  get: () => count.value * 2,
  set: (val: number) => {
    count.value = val / 2
  },
})
```

**Computed stability (3.4+)**: A computed will only trigger effects when its returned value actually changes (shallow comparison). For object returns, manually return the old reference if content hasn't changed:

```ts
const computedObj = computed(oldValue => {
  const newValue = { isEven: count.value % 2 === 0 }
  if (oldValue && oldValue.isEven === newValue.isEven) {
    return oldValue
  }
  return newValue
})
```

## watch() vs watchEffect()

```ts
import { watch, watchEffect, ref } from 'vue'

const source = ref(0)

// watch: explicit source, access to old/new values
watch(source, (newVal, oldVal) => {
  console.log(`Changed: ${oldVal} → ${newVal}`)
})

// watch a getter
watch(
  () => source.value + 1,
  val => {
    /* ... */
  }
)

// watch multiple sources
watch([fooRef, barRef], ([newFoo, newBar], [oldFoo, oldBar]) => {
  /* ... */
})

// watchEffect: auto-tracks dependencies, no old value
watchEffect(() => {
  console.log(source.value) // re-runs whenever source changes
})

// Deep watch (use with caution for performance)
watch(() => someObject, callback, { deep: true })

// Immediate: run callback immediately
watch(source, callback, { immediate: true })

// flush: 'post' to access DOM after update
watch(source, callback, { flush: 'post' })
```

**Key difference**: `watchEffect` is simpler but less explicit. Use `watch` when you need old/new values or want to be explicit about dependencies.

## Key Points

- Default to `ref()` for primitives; `reactive()` for forms/objects
- Prefer `shallowRef()` unless deep reactivity is explicitly needed
- `computed()` auto-caches; be mindful of object identity for stability
- `watch()` for explicit dependencies; `watchEffect()` for simple auto-tracking
- Refs unwrap in `reactive()` objects but NOT in reactive arrays

<!--
Source references:
- https://vuejs.org/api/reactivity-core.html
- https://vuejs.org/api/reactivity-advanced.html
- https://vuejs.org/guide/essentials/reactivity-fundamentals.html
-->
