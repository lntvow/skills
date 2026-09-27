---
name: best-practices-env
description: Vite environment variables and modes — import.meta.env, .env files, VITE_ prefix, mode-specific loading.
---

# Environment Variables & Modes

## Built-in Constants

Available everywhere via `import.meta.env`:

```ts
import.meta.env.MODE // 'development' | 'production' | custom
import.meta.env.BASE_URL // from base config
import.meta.env.PROD // boolean
import.meta.env.DEV // boolean
import.meta.env.SSR // boolean
```

Statically replaced at build — tree-shaking removes unreachable branches:

```ts
if (import.meta.env.DEV) {
  console.log('Dev-only code')
}
```

## `VITE_` Prefix

Only variables with `VITE_` prefix are exposed to client code:

```env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
DB_PASSWORD=secret          # NOT exposed to client
```

```ts
console.log(import.meta.env.VITE_API_URL) // "https://api.example.com"
console.log(import.meta.env.DB_PASSWORD) // undefined
```

All values are **strings**. Convert as needed: `Number(import.meta.env.VITE_PORT)`.

**⚠️ Never put secrets** (API keys, tokens) in `VITE_*` — they're bundled into source code.

## `.env` Files

```
.env                  # all modes
.env.local            # all modes, git-ignored
.env.development      # development mode
.env.production       # production mode
.env.staging          # custom mode: vite --mode staging
.env.[mode].local     # mode-specific, git-ignored
```

**Priority** (highest to lowest):

1. Shell environment variables (when Vite starts)
2. `.env.[mode].local`
3. `.env.[mode]`
4. `.env.local`
5. `.env`

Variables in `.env` files support expansion:

```env
VITE_APP_TITLE=My App
VITE_APP_URL=https://$VITE_APP_TITLE.example.com
```

## Custom `envPrefix`

```ts
export default defineConfig({
  envPrefix: 'APP_', // APP_* instead of VITE_*
})
```

Can also be an array: `envPrefix: ['VITE_', 'APP_']`.

## Modes

- `vite dev` / `vite serve` → mode: `development`
- `vite build` → mode: `production`
- Override: `vite build --mode staging` → loads `.env.staging`

## Key Points

- Only `VITE_*` variables go to client; values always strings
- Never store secrets in `VITE_*` — they're bundled
- `.env.local` files are git-ignored
- `.env.[mode]` loads based on current mode
- `--mode` flag overrides the default mode
- Existing shell env vars take highest priority

<!--
Source references:
- https://vite.dev/guide/env-and-mode.html
-->
