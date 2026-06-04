---
name: core-sfc-script-setup
description: `<script setup lang="ts">` — the standard way to write Vue SFCs with Composition API and TypeScript.
---

# `<script setup>` & SFC

`<script setup lang="ts">` is the recommended syntax for Vue Single-File Components. It provides compile-time syntactic sugar over the Composition API.

## Basic Rules

- Top-level bindings (variables, functions, imports) are **automatically exposed** to the template
- Refs auto-unwrap in templates (no `.value` needed)
- Code runs **per component instance** (not once on import)
- Components are **closed by default** — use `defineExpose` to expose to parent

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { capitalize } from './utils'

const msg = ref('hello')

function log() {
  console.log(msg.value)
}
</script>

<template>
  <button @click="log">{{ capitalize(msg) }}</button>
</template>
```

## defineProps() & defineEmits()

Compiler macros — no import needed.

```vue
<script setup lang="ts">
// Type-based declaration (preferred with TypeScript)
const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}>()
// 3.3+ shorthand:
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()

function handleClick() {
  emit('update', 'new value')
}
</script>
```

**Runtime validation with type-based props** — when you need validator functions alongside type-based declarations:

```ts
// Only type-based OR runtime — not both. For validators, use runtime:
const props = defineProps({
  title: { type: String, required: true, validator: (v: string) => v.length > 0 },
})
```

## defineModel() (3.4+)

Two-way binding macro. Declares a prop + `update:` event.

```vue
<script setup lang="ts">
// Basic: binds to v-model
const model = defineModel<string>({ required: true })

// Named: binds to v-model:count
const count = defineModel<number>('count', { default: 0 })

// With modifiers & transformers
const [value, modifiers] = defineModel<string, 'trim' | 'capitalize'>({
  set(val) {
    if (modifiers.trim) return val.trim()
    if (modifiers.capitalize) return val.charAt(0).toUpperCase() + val.slice(1)
    return val
  },
})
</script>
```

**⚠️ Warning**: `defineModel` with a `default` value and no parent-provided value causes de-synchronization between parent and child.

## defineExpose()

Explicitly control what parent template refs can access.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const internalState = ref(0)

function publicMethod() {
  internalState.value++
}

defineExpose({ publicMethod })
// parent ref will only see: { publicMethod: () => void }
</script>
```

## defineOptions() (3.3+)

Set component options without a separate `<script>` block.

```vue
<script setup lang="ts">
defineOptions({
  name: 'MyComponent',
  inheritAttrs: false,
})
</script>
```

## Reactive Props Destructure (3.5+) — Discouraged

Instructions say: **"Discourage using of Reactive Props Destructure."** Prefer explicit `props.xxx` access:

```ts
// ❌ Discouraged: can be confusing and hides the prop source
const { foo } = defineProps<{ foo: string }>()

// ✅ Prefer: explicit prop access
const props = defineProps<{ foo: string }>()
// use props.foo everywhere
```

## Key Points

- Always use `<script setup lang="ts">` for new code
- `defineProps`/`defineEmits`/`defineModel` are compiler macros — no imports
- `defineModel` is the modern way for `v-model` on components (3.4+)
- Components are closed by default — use `defineExpose` sparingly
- Avoid Reactive Props Destructure; prefer `props.xxx` for clarity

<!--
Source references:
- https://vuejs.org/api/sfc-script-setup.html
- https://vuejs.org/guide/components/props.html
- https://vuejs.org/guide/components/events.html
- https://vuejs.org/guide/components/v-model.html
-->
