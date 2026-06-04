---
name: core-test-api
description: Vitest test API — test, describe, beforeEach, afterEach, test context, and lifecycle hooks.
---

# Test API

## `test` / `it`

```ts
import { test, expect } from 'vitest'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
```

**Skipping and running**:

```ts
test.skip('skip this', () => {
  /* ... */
})
test.only('run only this', () => {
  /* ... */
})
test.todo('not implemented yet')
```

**Concurrent tests**:

```ts
test.concurrent('runs in parallel', async () => {
  /* ... */
})
```

**Failing test**:

```ts
test.fails('expected to fail', () => {
  throw new Error()
})
```

## `describe`

Group related tests:

```ts
import { describe, test, expect } from 'vitest'

describe('sum function', () => {
  test('positive numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })
  test('negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3)
  })
})
```

Can be nested. Supports `.skip`, `.only`, `.concurrent`, `.todo`, `.fails`.

## Lifecycle Hooks

```ts
import { beforeAll, beforeEach, afterEach, afterAll } from 'vitest'

beforeAll(() => {
  /* setup once before all tests */
})
beforeEach(() => {
  /* setup before each test */
})
afterEach(() => {
  /* cleanup after each test */
})
afterAll(() => {
  /* cleanup once after all tests */
})
```

## Test Context

```ts
import { test } from 'vitest'

test('context example', ctx => {
  // ctx.meta, ctx.expect, ctx.skip()
})

beforeEach(ctx => {
  ctx.skip() // dynamically skip
})
```

## Test Files

Files matching `**/*.{test,spec}.{js,ts,jsx,tsx}` by default. Configure with `include`/`exclude` in config.

## Key Points

- `test` and `it` are interchangeable
- `.only` for focused runs; `.skip` to exclude
- `describe` for grouping; supports nesting
- `beforeEach`/`afterEach` run per test; `beforeAll`/`afterAll` per suite
- Hooks run in order: `beforeAll` → `beforeEach` → test → `afterEach` → `afterAll`

<!--
Source references:
- https://vitest.dev/api/test.html
- https://vitest.dev/api/describe.html
- https://vitest.dev/api/hooks.html
-->
