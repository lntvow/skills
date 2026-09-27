---
name: advanced-custom-theme
description: VitePress custom themes — Layout component, enhanceApp, extending default theme, SSR compatibility.
---

# Custom Themes

## Theme Entry

Create `.vitepress/theme/index.ts`. Default export a theme object:

```ts [.vitepress/theme/index.ts]
import Layout from './Layout.vue'

export default {
  Layout, // required
  enhanceApp({ app, router, siteData }) {
    app.component('MyGlobal', MyComponent)
  },
}
```

Presence of theme entry **overrides** the default theme. To extend instead, use `extends`:

```ts
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout, // overrides DefaultTheme.Layout
}
```

## Layout Component

Must include `<Content />` to render markdown:

```vue [.vitepress/theme/Layout.vue]
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
</script>

<template>
  <header>My Site</header>
  <main>
    <Content />
  </main>
  <div v-if="page.isNotFound">Not Found</div>
</template>
```

## enhanceApp

Register global components, directives, or plugins:

```ts
import MyComponent from './MyComponent.vue'

export default {
  enhanceApp({ app, router, siteData }) {
    app.component('MyComponent', MyComponent)
    app.directive('focus', {
      /* ... */
    })
    // Access site data
    console.log(siteData.value.title)
  },
}
```

## Theme Interface

```ts
interface Theme {
  Layout: Component
  enhanceApp?: (ctx: EnhanceAppContext) => Awaitable<void>
  extends?: Theme
}

interface EnhanceAppContext {
  app: App
  router: Router
  siteData: Ref<SiteData>
}
```

## Extending Default Theme

Override specific slots while keeping defaults:

```vue [.vitepress/theme/Layout.vue]
<script setup>
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #nav-bar-content>
      <span>Custom nav content</span>
    </template>
  </Layout>
</template>
```

Default theme provides slots: `nav-bar-title-before`, `nav-bar-content`, `nav-bar-title-after`, `sidebar-nav-before`, `sidebar-nav-after`, `home-hero-info`, `home-hero-image`, `home-features-after`, `doc-footer-before`, `doc-before`, `doc-after`.

## SSR Compatibility

Custom themes must be SSR-safe. Avoid browser-only APIs in setup. Use `onMounted` for client-only code.

## Key Points

- `.vitepress/theme/index.ts` for custom theme entry
- `Layout` is the only required property
- `extends: DefaultTheme` to layer on top of defaults
- `<Content />` renders markdown; slot system for partial overrides
- Theme must be SSR-compatible — use `onMounted` for browser APIs

<!--
Source references:
- https://vitepress.dev/guide/custom-theme
- https://vitepress.dev/guide/extending-default-theme
-->
