---
name: core-cli
description: Vite CLI commands — vite dev, vite build, vite preview, and their options.
---

# CLI

## `vite` / `vite dev`

Start dev server:

```bash
vite                   # default: current directory
vite dev               # alias
vite serve             # alias
```

Key options:

```bash
vite --port 3000              # specify port
vite --host 0.0.0.0           # expose on network
vite --open                   # open browser
vite --strictPort             # fail if port in use
vite --force                  # re-bundle dependencies (ignore cache)
vite --mode staging           # set mode for env loading
vite -c vite.config.ts        # specify config file
vite --clearScreen false      # keep console output
vite -l silent                # log level: info | warn | error | silent
vite --configLoader bundle    # bundle config with Rolldown (default)
```

## `vite build`

Production build:

```bash
vite build
```

Key options:

```bash
vite build --outDir dist         # output dir (default: dist)
vite build --target es2020       # transpile target
vite build --assetsDir assets    # assets subdir (default: assets)
vite build --sourcemap           # generate source maps
vite build --minify oxc          # minifier: oxc | terser | esbuild
vite build --manifest            # emit manifest.json
vite build --ssr entry.js        # SSR build
vite build --watch               # watch mode
vite build --emptyOutDir         # force empty outDir outside root
vite build --base /my-app/       # override base path
```

## `vite preview`

Preview production build locally:

```bash
vite preview
```

## `vite optimize`

Pre-bundle dependencies (runs automatically; `--force` to re-bundle):

```bash
vite optimize --force
```

## Key Points

- `vite` / `vite dev` / `vite serve` start dev server
- `vite build` for production; `vite preview` to test build locally
- `--force` ignores dependency cache and re-bundles
- `--mode` controls which `.env.[mode]` files are loaded
- `--configLoader bundle` (default) bundles config with Rolldown

<!--
Source references:
- https://vite.dev/guide/cli.html
-->
