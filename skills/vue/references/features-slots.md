---
name: features-slots
description: Vue slots — default, named, scoped slots, and dynamic slot patterns.
---

# Slots

Slots allow parent components to inject template content into child components.

## Default Slots

```vue [Child.vue]
<template>
  <div class="card">
    <slot />
  </div>
</template>
```

```vue [Parent.vue]
<Card>This content goes into the default slot</Card>
```

## Named Slots

```vue [Layout.vue]
<template>
  <div class="layout">
    <header><slot name="header" /></header>
    <main><slot /></main>
    <footer><slot name="footer" /></footer>
  </div>
</template>
```

```vue [Parent.vue]
<Layout>
  <template #header><h1>Title</h1></template>
  <p>Main content (default slot)</p>
  <template #footer><small>© 2026</small></template>
</Layout>
```

## Scoped Slots

Pass data from child to parent slot content:

```vue [List.vue]
<script setup lang="ts">
interface Props {
  items: string[]
}
const props = defineProps<Props>()
</script>

<template>
  <ul>
    <li v-for="(item, index) in items" :key="index">
      <slot name="item" :item="item" :index="index" />
    </li>
  </ul>
</template>
```

```vue [Parent.vue]
<List :items="['A', 'B', 'C']">
  <template #item="{ item, index }">
    <strong>{{ index + 1 }}. {{ item }}</strong>
  </template>
</List>
```

## `$slots` in `<script setup>`

Use `useSlots()` to programmatically check or render slots:

```vue
<script setup lang="ts">
import { useSlots, computed } from 'vue'

const slots = useSlots()

const hasFooter = computed(() => !!slots.footer)
</script>

<template>
  <div v-if="hasFooter" class="footer-wrapper">
    <slot name="footer" />
  </div>
</template>
```

## Renderless Components

Components that provide logic without rendering their own markup — pass data via scoped slots:

```vue [UseMouse.vue]
<script setup lang="ts">
import { useMouse } from './useMouse'

const { x, y } = useMouse()
</script>

<template>
  <slot :x="x" :y="y" />
</template>
```

```vue [Parent.vue]
<UseMouse v-slot="{ x, y }">
  <p>Mouse: {{ x }}, {{ y }}</p>
</UseMouse>
```

## Key Points

- Use `v-slot:name` or shorthand `#name`
- Default slot is `<slot />` without name or `#default`
- Scoped slots pass data from child to parent
- Use `useSlots()` for programmatic slot access
- For renderless patterns, prefer composables over renderless components

<!--
Source references:
- https://vuejs.org/guide/components/slots.html
- https://vuejs.org/api/component-instance.html#slots
-->
