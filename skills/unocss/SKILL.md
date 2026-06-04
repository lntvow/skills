---
name: unocss
description: UnoCSS atomic CSS engine — configuration, rules, shortcuts, variants, presets, icons, and attributify mode. Used when working with UnoCSS, uno.config.ts, atomic CSS, or Tailwind-compatible utility classes.
metadata:
  author: lntvow
  version: '2026.6.4'
  source: Generated from https://github.com/unocss/unocss, scripts located at https://github.com/lntvow/skills
---

> The skill is based on UnoCSS v66, generated at 2026-06-04.

UnoCSS is an atomic CSS engine, a superset of Tailwind CSS. Look for `uno.config.ts` to understand available presets, rules, and shortcuts. If unclear about the project setup, use basic `class` usage — avoid attributify mode and advanced features.

## Core References

| Topic             | Description                                                           | Reference                                                  |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Configuration     | `uno.config.ts`, `defineConfig`, presets, shortcuts, theme            | [core-config](references/core-config.md)                   |
| Rules & Shortcuts | Custom rules (static/dynamic), shortcuts, CSS fallbacks               | [core-rules-shortcuts](references/core-rules-shortcuts.md) |
| Presets           | `presetWind3`, `presetIcons`, `presetTypography`, `presetAttributify` | [core-presets](references/core-presets.md)                 |

## Feature References

| Topic        | Description                                                             | Reference                                                    |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Variants     | `hover:`, `dark:`, responsive variants, custom variant authoring        | [features-variants](references/features-variants.md)         |
| Transformers | `transformerDirectives`, `transformerVariantGroup`, custom transformers | [features-transformers](references/features-transformers.md) |
| Attributify  | Attribute-based utility application, grouping, prefix configuration     | [features-attributify](references/features-attributify.md)   |
| Icons        | `i-` prefix, Iconify integration, custom collections, CSS icons         | [features-icons](references/features-icons.md)               |
