---
name: core-component-data-flow
description: Props down, events up, v-model two-way binding, and fallthrough attributes in Vue components.
---

# Component Data Flow

Vue enforces **unidirectional data flow**: props flow down, events flow up.

## Props

Props are read-only in the child. Define them with type-based `defineProps`:

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
}

const props = defineProps<Props>()

// With defaults (3.5+ via destructure — discouraged, use withDefaults)
const props2 = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => [], // functions for mutable defaults
})
</script>
```

**Prop validation** — use runtime declaration for validators:

```ts
defineProps({
  status: {
    type: String as PropType<'active' | 'inactive'>,
    required: true,
    validator: (v: string) => ['active', 'inactive'].includes(v),
  },
})
```

**Prop stability for performance**: Pass computed boolean props instead of raw data that causes all children to re-render:

```vue
<!-- ❌ Every item re-renders when activeId changes -->
<ListItem v-for="item in list" :id="item.id" :active-id="activeId" />

<!-- ✅ Only affected items re-render -->
<ListItem v-for="item in list" :id="item.id" :active="item.id === activeId" />
```

## Events

```vue
<script setup lang="ts">
const emit = defineEmits<{
  change: [value: string]
  submit: []
}>()

function handleChange(val: string) {
  emit('change', val)
}
</script>

<template>
  <button @click="$emit('submit')">Submit</button>
</template>
```

Events do **NOT** bubble — only direct parent can listen. For sibling/deep communication, use provide/inject or state management.

## v-model on Components

Use `defineModel` (3.4+) for two-way binding:

```vue [Child.vue]
<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<template>
  <input v-model="model" />
</template>
```

```vue [Parent.vue]
<Child v-model="text" />
<Child v-model:title="title" />
<!-- named v-model -->
```

Pre-3.4 manual approach for context:

```ts
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
```

## Fallthrough Attributes

Attributes not declared as props or emits "fall through" to the root element:

```vue
<!-- Parent -->
<MyButton class="large" @click="handle" />

<!-- MyButton: class + @click fall through to root <button> -->
<template>
  <button>Click me</button>
</template>
```

**Control inheritance:**

- `defineOptions({ inheritAttrs: false })` — disable fallthrough
- Access via `useAttrs()`:

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs() // reactive object of fallthrough attrs
</script>

<template>
  <div>
    <button v-bind="attrs">Wrapped</button>
  </div>
</template>
```

Multi-root components don't auto-inherit attrs — must explicitly bind with `v-bind="$attrs"`.

## Key Points

- Props down (read-only), events up — never mutate props
- Stabilize props to prevent unnecessary child re-renders
- `defineModel` is the standard for `v-model` on components (3.4+)
- Component events don't bubble
- Use `useAttrs()` + `inheritAttrs: false` for wrapper components

<!--
Source references:
- https://vuejs.org/guide/components/props.html
- https://vuejs.org/guide/components/events.html
- https://vuejs.org/guide/components/v-model.html
- https://vuejs.org/guide/components/attrs.html
-->
