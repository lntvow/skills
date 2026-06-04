---
name: features-mocking
description: Vitest mocking — vi.mock, vi.fn, vi.spyOn, vi.importActual, and common mock patterns.
---

# Mocking

> **Instructions**: Use `vi.mock` for module mocking.

## `vi.fn` — Mock Function

```ts
import { vi, test, expect } from 'vitest'

test('mock function', () => {
  const fn = vi.fn()
  fn('hello')
  expect(fn).toHaveBeenCalledWith('hello')
  expect(fn).toHaveBeenCalledTimes(1)
})

// With implementation
const mockFn = vi.fn(x => x * 2)
expect(mockFn(21)).toBe(42)
```

## `vi.spyOn` — Spy on Methods

```ts
import { vi } from 'vitest'

const obj = { greet: (name: string) => `Hello ${name}` }

// Spy on existing method
vi.spyOn(obj, 'greet').mockReturnValue('Mocked!')
expect(obj.greet('world')).toBe('Mocked!')

// Spy on getter
vi.spyOn(exports, 'getter', 'get').mockReturnValue('mocked')
```

## `vi.mock` — Mock Modules

Hoisted to top of file:

```ts
import { vi, test, expect } from 'vitest'

vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'John' }),
}))

import { fetchUser } from './api'

test('mocked api', async () => {
  const user = await fetchUser()
  expect(user).toEqual({ name: 'John' })
})
```

**Auto-mock with spy** (v4.1+):

```ts
vi.mock('./calculator', { spy: true })
// exports are preserved, but can be spied on
```

**Module promise syntax** (better types):

```ts
vi.mock(import('./path/to/module'), async importOriginal => {
  const mod = await importOriginal()
  return { ...mod, total: vi.fn() }
})
```

## `vi.importActual`

Get original module inside mock factory:

```ts
vi.mock('./utils', async importOriginal => {
  const actual = await importOriginal()
  return { ...actual, log: vi.fn() }
})
```

## Cleanup

```ts
beforeEach(() => {
  vi.clearAllMocks() // clear call history
  vi.resetAllMocks() // clear history + implementations
  vi.restoreAllMocks() // restore original implementations
})
```

## Common Patterns

```ts
// Mock class
vi.mock('./connection', () => ({
  Connection: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(true),
  })),
}))

// Mock date
vi.setSystemTime(new Date('2024-01-01'))

// Mock timer
vi.useFakeTimers()
// ... test code ...
vi.runAllTimers()
```

## Key Points

- `vi.mock` is hoisted; can't use outer variables in factory
- `vi.importActual` imports the real module inside a mock
- `vi.spyOn` for spying on existing methods without full module mock
- Always clean up mocks with `vi.clearAllMocks()` / `vi.resetAllMocks()`
- Use module promise syntax (`vi.mock(import(...))`) for better type inference

<!--
Source references:
- https://vitest.dev/api/vi.html
- https://vitest.dev/guide/mocking.html
-->
