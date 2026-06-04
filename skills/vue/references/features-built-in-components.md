---
name: features-built-in-components
description: Vue built-in components — Transition, TransitionGroup, KeepAlive, Teleport, Suspense — and when to use each.
---

# Built-in Components

All built-in components are tree-shakeable — only included when used. No registration needed in templates; import needed for render functions.

## Transition & TransitionGroup

### `<Transition>`

Animates a **single** element/component entering/leaving. Triggered by `v-if`, `v-show`, `<component :is>`, or `key` changes.

```vue
<template>
  <Transition name="fade" mode="out-in" appear>
    <div v-if="visible" key="content">Hello</div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

**Key props**: `name`, `mode` (`out-in`|`in-out`), `appear`, `duration`
**CSS classes**: `{name}-enter-from`, `{name}-enter-active`, `{name}-enter-to`, `{name}-leave-from`, `{name}-leave-active`, `{name}-leave-to`
**Events**: `@before-enter`, `@enter`, `@after-enter`, `@before-leave`, `@leave`, `@after-leave`

### `<TransitionGroup>`

Animates **multiple** items in a list (`v-for`). Every child must have a **unique key**.

```vue
<template>
  <TransitionGroup name="list" tag="ul" move-class="list-move">
    <li v-for="item in items" :key="item.id">{{ item.text }}</li>
  </TransitionGroup>
</template>

<style>
.list-move {
  transition: transform 0.3s ease;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

## `<KeepAlive>`

Caches component instances to preserve state and avoid re-rendering when toggling.

```vue
<template>
  <KeepAlive :include="['TabA', 'TabB']" :exclude="['Settings']" :max="10">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

**Lifecycle hooks for cached components**: `onActivated()`, `onDeactivated()`
**Props**: `include`/`exclude` (string, regex, or array of component names), `max` (limit cached instances)

## `<Teleport>`

Renders children into a different DOM location, outside the component hierarchy.

```vue
<template>
  <Teleport to="body">
    <div class="modal">Modal content rendered in &lt;body&gt;</div>
  </Teleport>
</template>
```

**`to` target**: CSS selector string (e.g., `"body"`, `"#app"`) or DOM element
**`:disabled` prop**: dynamically disable teleporting (content renders in-place)

## `<Suspense>` (Experimental)

Orchestrates async dependencies with loading/fallback states.

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncDashboard />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

`<Suspense>` allows `async setup()` in child components. Two slots: `#default` (async content) and `#fallback` (loading state). Can trigger `@pending`, `@resolve`, `@fallback` events.

## Key Points

- All built-in components are tree-shakeable; import only for render functions
- `<Transition>` needs single child with conditional rendering (`v-if`/`v-show`) or dynamic `key`
- `<TransitionGroup>` children must have unique keys for animation to work
- `<KeepAlive>` caches by component `name` — set `defineOptions({ name: '...' })` in `<script setup>`
- `<Teleport>` renders children elsewhere in DOM; `to` must be a valid selector
- `<Suspense>` is experimental — use with caution in production

<!--
Source references:
- https://vuejs.org/api/built-in-components.html
- https://vuejs.org/guide/built-ins/transition.html
- https://vuejs.org/guide/built-ins/transition-group.html
- https://vuejs.org/guide/built-ins/keep-alive.html
- https://vuejs.org/guide/built-ins/teleport.html
- https://vuejs.org/guide/built-ins/suspense.html
-->
