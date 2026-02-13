# vue-excalidraw

[![npm version](https://img.shields.io/npm/v/vue-excalidraw.svg)](https://www.npmjs.com/package/vue-excalidraw)
[![license](https://img.shields.io/npm/l/vue-excalidraw.svg)](https://github.com/alsey89/vue-excalidraw/blob/main/LICENSE)
[![CI](https://github.com/alsey89/vue-excalidraw/actions/workflows/ci.yml/badge.svg)](https://github.com/alsey89/vue-excalidraw/actions/workflows/ci.yml)

Vue 3 component wrapping [Excalidraw](https://excalidraw.com/)'s React whiteboard editor. Provides a reactive Vue interface with full imperative API access.

## Packages

| Package                                | Description                                     |
| -------------------------------------- | ----------------------------------------------- |
| [vue-excalidraw](./packages/core)      | Core Vue 3 component + composable + Vite plugin |
| [vue-excalidraw-nuxt](./packages/nuxt) | Nuxt 3 module for zero-config integration       |

## Quick Start

### Vite / Vue CLI

```bash
npm install vue-excalidraw react react-dom @excalidraw/excalidraw
```

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { excalidrawVitePlugin } from 'vue-excalidraw/vite'

export default defineConfig({
  plugins: [vue(), excalidrawVitePlugin()],
})
```

```vue
<template>
  <div style="width: 100%; height: 600px;">
    <Excalidraw :theme="'dark'" @change="onDrawingChange" />
  </div>
</template>

<script setup>
import { Excalidraw, useExcalidraw } from 'vue-excalidraw'

const { api, isReady } = useExcalidraw()

function onDrawingChange(payload) {
  console.log('Elements:', payload.elements.length)
}
</script>
```

See the [core package README](./packages/core) for full props, events, and API documentation.

### Nuxt

```bash
npm install vue-excalidraw-nuxt react react-dom @excalidraw/excalidraw
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-excalidraw-nuxt'],
})
```

That's it. The `<Excalidraw>` component and `useExcalidraw()` composable are auto-imported.

See the [Nuxt module README](./packages/nuxt) for more details.

## How It Works

This package bridges React and Vue by mounting a React root inside a Vue container element. Props are forwarded via `createElement` (not JSX, to avoid Vue's JSX transform intercepting React elements). React callbacks are emitted as Vue events, and the imperative API is exposed through a Vue composable using `shallowRef` for performance.

The Excalidraw component is always client-side rendered (no SSR).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](./LICENSE)
