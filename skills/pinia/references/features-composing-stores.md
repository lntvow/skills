---
name: features-composing-stores
description: Composing Pinia stores — cross-store usage, shared getters/actions, and avoiding circular dependencies.
---

# Composing Stores

Stores can use other stores. The key rule: **avoid circular reads in setup** — don't read another store's state directly at the top level of `defineStore()` if that store also reads yours.

## Setup Stores: Direct Usage

Call `useOtherStore()` at the top of the setup function:

```ts
export const useCartStore = defineStore('cart', () => {
  const user = useUserStore()
  const items = ref<Item[]>([])

  const summary = computed(() => `Hi ${user.name}, you have ${items.value.length} items.`)

  async function purchase() {
    return apiPurchase(user.id, items.value)
  }

  return { items, summary, purchase }
})
```

## Option Stores: Shared Getters

```ts
export const useCartStore = defineStore('cart', {
  getters: {
    summary(state) {
      const user = useUserStore()
      return `${user.name}: ${state.items.length} items`
    },
  },
})
```

## Option Stores: Shared Actions

```ts
export const useCartStore = defineStore('cart', {
  actions: {
    async checkout() {
      const user = useUserStore()
      const order = useOrderStore()
      await order.place(user.id, this.items)
    },
  },
})
```

## Avoiding Circular Dependencies

❌ **Both stores read each other in setup**:

```ts
const useX = defineStore('x', () => {
  const y = useY()
  y.name // ❌ y also reads x.name
  return { name: ref('X') }
})
const useY = defineStore('y', () => {
  const x = useX()
  x.name // ❌ circular
  return { name: ref('Y') }
})
```

✅ **Defer reads to getters/actions**:

```ts
const useX = defineStore('x', () => {
  const name = ref('X')
  // Don't call useY() here if Y reads X in its setup
  function getYName() {
    return useY().name // ✅ deferred to action
  }
  return { name, getYName }
})
```

## Key Points

- Use `useOtherStore()` at the top of setup stores, in getters, or in actions
- Don't read another store's state at the top level if they both reference each other
- Defer cross-store reads to getters/actions to avoid circular setup
- Each store in its own file for code splitting and type inference

<!--
Source references:
- https://pinia.vuejs.org/cookbook/composing-stores.html
-->
