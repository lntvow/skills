---
name: core-lifecycle
description: Vue component lifecycle hooks — onMounted, onUpdated, onUnmounted, and when to use each.
---

# Lifecycle Hooks

All Composition API lifecycle hooks must be called **synchronously** during `setup()`.

## Hook Reference

| Hook              | When                                     | SSR? |
| ----------------- | ---------------------------------------- | ---- |
| `onMounted`       | After component DOM is inserted          | No   |
| `onUpdated`       | After DOM re-render from reactive change | No   |
| `onUnmounted`     | After component is removed               | No   |
| `onBeforeMount`   | Before mounting starts                   | No   |
| `onBeforeUpdate`  | Before DOM re-render                     | No   |
| `onBeforeUnmount` | Before unmounting                        | No   |
| `onActivated`     | KeepAlive cached component inserted      | No   |
| `onDeactivated`   | KeepAlive cached component removed       | No   |
| `onErrorCaptured` | Child component error caught             | Yes  |

## Common Patterns

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Template ref access
const elRef = ref<HTMLElement | null>(null)
onMounted(() => {
  elRef.value?.focus()
})

// Side effect cleanup
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => {
    /* ... */
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timer)
})

// DOM event listener cleanup
function onResize() {
  /* ... */
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>
```

## SSR Considerations

`onMounted`, `onUpdated`, `onUnmounted` are **not** called during SSR. Use them for:

- DOM access (`document`, `window`)
- Third-party library initialization
- Browser-only APIs

For code that must run on both server and client, place it directly in `setup()` or use `watchEffect`.

## Key Points

- All lifecycle hooks must be called synchronously in `setup()`
- `onMounted`/`onUnmounted` are the most commonly used pair
- SSR: `onMounted`/`onUpdated`/`onUnmounted` run only on client
- `onUpdated` for post-DOM-update logic; avoid mutating state here (infinite loop risk)
- `onActivated`/`onDeactivated` for `<KeepAlive>` cached components
- Always clean up side effects in `onUnmounted`/`onBeforeUnmount`

<!--
Source references:
- https://vuejs.org/api/composition-api-lifecycle.html
- https://vuejs.org/guide/essentials/lifecycle.html
-->
