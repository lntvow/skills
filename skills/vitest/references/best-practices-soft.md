---
name: best-practices-soft
description: Vitest soft assertions — expect.soft for non-critical checks, collecting multiple failures per test.
---

# Soft Assertions

> **Instructions**: Use `expect.soft` for non-critical assertions that shouldn't stop the test.

## `expect.soft`

Continues running after a failed assertion, collects all errors:

```ts
import { expect, test } from 'vitest'

test('multiple checks', () => {
  expect.soft(1 + 1).toBe(3) // ❌ but continues
  expect.soft(1 + 2).toBe(4) // ❌ but continues
  // Both errors reported at the end
})
```

## Mixed with `expect`

First hard failure terminates the test:

```ts
test('mixed assertions', () => {
  expect.soft(1 + 1).toBe(3) // ❌ soft — continues
  expect(1 + 2).toBe(4) // ❌ hard — stops here
  expect.soft(1 + 3).toBe(5) // never runs
})
```

## Use Cases

- Validating multiple properties of an object
- Non-critical UI checks
- Form validation where all errors should be collected
- Data integrity checks where you want full picture

```ts
test('user object validation', () => {
  const user = { name: 'John', age: 25, email: 'john@example.com' }
  expect.soft(user.name).toBe('Jane')
  expect.soft(user.age).toBe(30)
  expect.soft(user.email).toContain('@test.com')
  // All 3 failures reported together
})
```

## Key Points

- `expect.soft` collects failures without stopping the test
- Use alongside `expect` — hard assertion still terminates immediately
- Best for: multi-property validation, form checks, data audits
- All soft failures reported at test completion

<!--
Source references:
- https://vitest.dev/api/expect.html#soft
-->
