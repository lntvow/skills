---
name: pinia
description: Pinia state management for Vue 3 — stores, state, getters, actions, plugins, composing stores, SSR, and testing. Used when working with Pinia stores, Vue state management, or store-based architectures.
metadata:
  author: lntvow
  version: '2026.6.4'
  source: Generated from https://github.com/vuejs/pinia, scripts located at https://github.com/lntvow/skills
---

> The skill is based on Pinia v3, generated at 2026-06-04.

Pinia is the official Vue state management library. Prefer Setup Stores (`defineStore('id', () => { ... })`) with TypeScript. Use `storeToRefs()` when destructuring state. Separate API calls from stores into composables.

## Core References

| Topic            | Description                                                            | Reference                                                    |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| Store Definition | `defineStore`, Option Stores vs Setup Stores, `storeToRefs`            | [core-store-definition](references/core-store-definition.md) |
| State            | State definition, `$reset`, `mapState`, `mapWritableState`, TypeScript | [core-state](references/core-state.md)                       |
| Getters          | Computed store values, `this` access, argument-passing pattern         | [core-getters](references/core-getters.md)                   |
| Actions          | Business logic, async operations, cross-store access                   | [core-actions](references/core-actions.md)                   |

## Feature References

| Topic            | Description                                                                | Reference                                                            |
| ---------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Composing Stores | Cross-store usage patterns, shared getters/actions, avoiding circular deps | [features-composing-stores](references/features-composing-stores.md) |
| Plugins          | Adding global properties, augmenting state, SSR-safe plugin state          | [features-plugins](references/features-plugins.md)                   |
| SSR              | Hydration, `$pinia` injection, Nuxt integration, state serialization       | [features-ssr](references/features-ssr.md)                           |

## Best Practices

| Topic   | Description                                                                            | Reference                                                      |
| ------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Testing | Unit testing stores with `setActivePinia`, component testing with `createTestingPinia` | [best-practices-testing](references/best-practices-testing.md) |
