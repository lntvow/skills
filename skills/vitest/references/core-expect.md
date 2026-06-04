---
name: core-expect
description: Vitest expect assertions — core matchers, toBe, toEqual, toContain, toMatchSnapshot, and expect.soft.
---

# Assertions (`expect`)

## Core Matchers

```ts
import { expect, test } from 'vitest'

test('matchers', () => {
  expect(value).toBe(expected) // strict equality (===)
  expect(value).toEqual({ a: 1 }) // deep equality
  expect(value).toStrictEqual({ a: 1 }) // deep + strict (no undefined props)

  expect(value).toBeTruthy()
  expect(value).toBeFalsy()
  expect(value).toBeNull()
  expect(value).toBeUndefined()
  expect(value).toBeDefined()
  expect(value).toBeNaN()
})
```

## Number Matchers

```ts
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThan(5)
expect(value).toBeCloseTo(0.3, 5) // for floating point
```

## String/Array/Object

```ts
expect('hello').toContain('ell')
expect([1, 2, 3]).toContain(2)
expect({ a: 1 }).toHaveProperty('a')
expect({ a: 1 }).toHaveProperty('a', 1)
expect([1, 2]).toHaveLength(2)
```

## Exceptions

```ts
expect(() => {
  throw new Error('fail')
}).toThrow()
expect(fn).toThrow('fail')
expect(fn).toThrow(/fail/)
```

## Async

```ts
await expect(promise).resolves.toBe(3)
await expect(promise).rejects.toThrow()
```

## Snapshots

```ts
expect(data).toMatchSnapshot()
expect(data).toMatchInlineSnapshot(`"expected"`)
```

## Negation

```ts
expect(value).not.toBe(0)
expect(value).not.toContain('x')
```

## Custom Message

```ts
expect(value, 'custom failure message').toBe(expected)
```

## Key Points

- `toBe` = strict equality; `toEqual` = deep equality
- `toStrictEqual` checks `undefined` properties
- `toContain` for strings, arrays, iterables
- `resolves`/`rejects` for async assertions
- `expect.soft` for non-critical assertions (see best-practices-soft)

<!--
Source references:
- https://vitest.dev/api/expect.html
-->
