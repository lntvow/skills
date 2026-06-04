---
name: core-rules-shortcuts
description: UnoCSS custom rules and shortcuts — static/dynamic rules, CSS fallbacks, shortcut patterns.
---

# Rules & Shortcuts

## Static Rules

```ts
rules: [
  ['m-1', { margin: '0.25rem' }],
  ['font-bold', { 'font-weight': 700 }],
]
```

CSS property names use kebab-case: `'font-weight'` not `fontWeight`.

## Dynamic Rules

Matcher is a `RegExp`; body is a function:

```ts
rules: [
  [/^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` })],
  [/^p-(\d+)$/, (match, ctx) => ({ padding: `${match[1] / 4}rem` })],
]
```

First arg = regex match; second arg = context (`theme`, `symbols`).

Usage: `class="m-100"` → `.m-100 { margin: 25rem; }`

## CSS Rules Fallback

Return a 2D array for multiple values (older browsers first):

```ts
rules: [
  [
    /^h-(\d+)dvh$/,
    ([, d]) => [
      ['height', `${d}vh`],
      ['height', `${d}dvh`],
    ],
  ],
]
```

## Shortcuts

Combine multiple rules into a single shorthand:

```ts
shortcuts: {
  'btn': 'py-2 px-4 font-semibold rounded-lg shadow-md',
  'btn-green': 'text-white bg-green-500 hover:bg-green-700',
}
```

**Dynamic shortcuts**:

```ts
shortcuts: [[/^btn-(.*)$/, ([, c]) => `bg-${c}-400 text-${c}-100 py-2 px-4 rounded-lg`]]
```

`btn-green` → CSS for `bg-green-400 text-green-100 py-2 px-4 rounded-lg`.

## Key Points

- Static rules: `[matcher, cssObject]`
- Dynamic rules: `[regex, (match, ctx) => cssObject]`
- Shortcuts expand to other utilities; dynamic shortcuts use regex
- CSS property names in kebab-case
- Return 2D array for CSS fallback values

<!--
Source references:
- https://unocss.dev/config/rules
- https://unocss.dev/config/shortcuts
-->
