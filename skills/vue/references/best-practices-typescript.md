---
name: best-practices-typescript
description: TypeScript patterns for Vue 3 Composition API — typing props, emits, refs, composables, and template refs.
---

# TypeScript with Composition API

> From instructions: "Prefer using TypeScript over JavaScript. Prefer `<script setup lang="ts">` over `<script>`."

## Typing ref()

```ts
import { ref, type Ref } from 'vue'

// Explicit type
const count = ref<number>(0)
const name = ref<string | null>(null)

// Inferred from initial value
const msg = ref('hello') // Ref<string>

// For complex types
interface User {
  name: string
  age: number
}
const user = ref<User | null>(null)
```

## Typing reactive()

```ts
import { reactive } from 'vue'

interface FormState {
  email: string
  password: string
}

const form = reactive<FormState>({
  email: '',
  password: '',
})
```

## Typing computed()

```ts
import { computed, ref } from 'vue'

const count = ref(0)

// Type inferred from getter return
const doubled = computed(() => count.value * 2) // ComputedRef<number>
```

## Typing Template Refs

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="inputRef" />
</template>
```

## Typing Component Template Refs

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MyModal from './MyModal.vue'

// Use InstanceType to get component's exposed type
const modalRef = ref<InstanceType<typeof MyModal> | null>(null)

function open() {
  modalRef.value?.open()
}
</script>

<template>
  <MyModal ref="modalRef" />
</template>
```

## Typing Composable Parameters

Use `MaybeRefOrGetter<T>` for parameters that accept refs, getters, or plain values:

```ts
import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'

export function useTitle(newTitle: MaybeRefOrGetter<string>) {
  watchEffect(() => {
    document.title = toValue(newTitle)
  })
}
```

## Typing Event Handlers

```vue
<script setup lang="ts">
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  console.log(target.value)
}

function handleClick(event: MouseEvent) {
  console.log(event.clientX)
}
</script>

<template>
  <input @input="handleInput" />
  <button @click="handleClick">Click</button>
</template>
```

## Typing provide/inject

```ts [keys.ts]
import type { InjectionKey, Ref } from 'vue'

export const userKey = Symbol() as InjectionKey<Ref<User | null>>
```

```vue [Ancestor.vue]
<script setup lang="ts">
import { provide, ref } from 'vue'
import { userKey } from './keys'
import type { User } from './types'

provide(userKey, ref<User | null>(null))
</script>
```

```vue [Descendant.vue]
<script setup lang="ts">
import { inject } from 'vue'
import { userKey } from './keys'

const user = inject(userKey) // Ref<User | null> — fully typed
</script>
```

## Key Points

- Always use `<script setup lang="ts">`
- Use `ref<T>()` for explicit typing; inference works well with initial values
- `MaybeRefOrGetter<T>` for composable parameters accepting reactive or plain values
- `InstanceType<typeof Component>` for component template refs
- `InjectionKey<T>` for type-safe provide/inject
- Use `as` assertion sparingly for DOM event targets

<!--
Source references:
- https://vuejs.org/guide/typescript/composition-api.html
- https://vuejs.org/api/utility-types.html
-->
