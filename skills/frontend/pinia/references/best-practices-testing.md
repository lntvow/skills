---
name: best-practices-testing
description: Testing Pinia stores — unit testing with setActivePinia, component testing with createTestingPinia, and plugin testing.
---

# Testing

## Unit Testing Stores

Use `setActivePinia(createPinia())` in `beforeEach`:

```ts
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('increments', () => {
    const store = useCounterStore()
    expect(store.count).toBe(0)
    store.increment()
    expect(store.count).toBe(1)
  })

  it('increments by amount', () => {
    const store = useCounterStore()
    store.increment(10)
    expect(store.count).toBe(10)
  })
})
```

## Testing with Plugins

Plugins need `app.use(pinia)` before `setActivePinia`:

```ts
import { createApp } from 'vue'

const app = createApp({})
beforeEach(() => {
  const pinia = createPinia().use(myPlugin)
  app.use(pinia)
  setActivePinia(pinia)
})
```

## Component Testing with `@pinia/testing`

```bash
npm i -D @pinia/testing
```

```ts
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useSomeStore } from '@/stores/myStore'

test('component uses store', () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: false, // default: true (actions are stubbed)
          createSpy: vi.fn, // custom spy function
          initialState: {
            // seed initial state
            counter: { count: 5 },
          },
        }),
      ],
    },
  })

  const store = useSomeStore()
  store.count = 10 // direct manipulation works
})
```

**`stubActions: true`** (default) — all actions are replaced with spies, so you can assert they were called without executing real logic.

## Stubbing Stores

Mock an entire store for isolated component tests:

```ts
import { vi } from 'vitest'

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isLoggedIn: true,
    user: { name: 'Test User' },
    login: vi.fn(),
  }),
}))
```

## Key Points

- `setActivePinia(createPinia())` in `beforeEach` for unit testing stores
- Plugins need `app.use(pinia)` before `setActivePinia`
- `createTestingPinia()` for component tests — actions are stubbed by default
- `stubActions: false` to run real actions in component tests
- `initialState` to seed stores with test data
- Mock stores with `vi.mock()` for isolated component testing

<!--
Source references:
- https://pinia.vuejs.org/cookbook/testing.html
-->
