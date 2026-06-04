---
name: vue
description: Vue 3 Composition API with `<script setup lang="ts">` covering reactivity, SFC, components, composables, TypeScript, performance, and SSR. Used when working with Vue 3, .vue files, Vue components, Vue Router, Pinia, or Vite + Vue projects.
metadata:
  author: lntvow
  version: '2026.6.4'
  source: Generated from https://github.com/vuejs/docs, scripts located at https://github.com/lntvow/skills
---

> The skill is based on Vue v3.5, generated at 2026-06-04.

Vue 3 with Composition API and `<script setup lang="ts">` is the standard. Always use Composition API unless the project explicitly requires Options API. Prefer `shallowRef` over `ref` when deep reactivity is not needed.

## Core References

| Topic                  | Description                                                                  | Reference                                                          |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Reactivity             | `ref`, `reactive`, `computed`, `watch`, `shallowRef` — when to use each      | [core-reactivity](references/core-reactivity.md)                   |
| `<script setup>` & SFC | `defineProps`, `defineEmits`, `defineModel`, `defineExpose`, `defineOptions` | [core-sfc-script-setup](references/core-sfc-script-setup.md)       |
| Component Data Flow    | Props, events, v-model, fallthrough attrs                                    | [core-component-data-flow](references/core-component-data-flow.md) |
| Lifecycle Hooks        | `onMounted`, `onUnmounted`, SSR awareness, cleanup patterns                  | [core-lifecycle](references/core-lifecycle.md)                     |

## Feature References

| Topic               | Description                                                          | Reference                                                                  |
| ------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Built-in Components | `Transition`, `TransitionGroup`, `KeepAlive`, `Teleport`, `Suspense` | [features-built-in-components](references/features-built-in-components.md) |
| Composables         | Extracting and reusing stateful logic, `toValue()`, async patterns   | [features-composables](references/features-composables.md)                 |
| Slots               | Default, named, scoped slots, `useSlots()`, renderless components    | [features-slots](references/features-slots.md)                             |
| Provide / Inject    | Dependency injection, `InjectionKey`, readonly state                 | [features-provide-inject](references/features-provide-inject.md)           |

## Best Practices

| Topic       | Description                                                                         | Reference                                                              |
| ----------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Performance | `shallowRef`, props stability, `v-once`, `v-memo`, computed stability, lazy loading | [best-practices-performance](references/best-practices-performance.md) |
| TypeScript  | Typing refs, props, emits, composables, template refs, provide/inject               | [best-practices-typescript](references/best-practices-typescript.md)   |

## Advanced

| Topic                  | Description                                                                 | Reference                                                            |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Render Functions & JSX | `h()`, JSX/TSX, functional components, slots in render functions            | [advanced-render-functions](references/advanced-render-functions.md) |
| SSR                    | `renderToString`, hydration, server/client code separation, `useSSRContext` | [advanced-ssr](references/advanced-ssr.md)                           |
