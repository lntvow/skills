---
name: vite
description: Vite build tool and dev server — configuration, plugins, asset handling, env variables, build optimization, and SSR. Used when working with Vite projects, vite.config.ts, or Vite-based frameworks.
metadata:
  author: lntvow
  version: '2026.6.4'
  source: Generated from https://github.com/vitejs/vite, scripts located at https://github.com/lntvow/skills
---

> The skill is based on Vite v7, generated at 2026-06-04.

Vite is a fast build tool and dev server. Prefer `vite.config.ts` with ESM syntax. Vite uses Rolldown for bundling and Oxc for TypeScript transpilation. Type checking must run separately via `tsc --noEmit`.

## Core References

| Topic         | Description                                                                                       | Reference                                    |
| ------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Configuration | `vite.config.ts`, `defineConfig`, shared options (`root`, `base`, `plugins`, `resolve`, `define`) | [core-config](references/core-config.md)     |
| Features      | Static asset imports, `import.meta.env`, TypeScript, CSS modules, JSON, HMR                       | [core-features](references/core-features.md) |
| CLI           | `vite dev`, `vite build`, `vite preview` commands and options                                     | [core-cli](references/core-cli.md)           |

## Feature References

| Topic   | Description                                                                     | Reference                                          |
| ------- | ------------------------------------------------------------------------------- | -------------------------------------------------- |
| Plugins | Using plugins, `enforce` ordering, conditional `apply`, official plugins        | [features-plugins](references/features-plugins.md) |
| Build   | Production build, `build.target`, library mode, chunking, browser compatibility | [features-build](references/features-build.md)     |

## Best Practices

| Topic         | Description                                                     | Reference                                              |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| Env Variables | `import.meta.env`, `.env` files, modes, `VITE_` prefix, secrets | [best-practices-env](references/best-practices-env.md) |

## Advanced

| Topic      | Description                                                                 | Reference                                                |
| ---------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| Plugin API | Authoring plugins, virtual modules, Vite-specific hooks, plugin conventions | [advanced-plugin-api](references/advanced-plugin-api.md) |
| SSR        | Server-side rendering setup, environment API, conditional logic             | [advanced-ssr](references/advanced-ssr.md)               |
