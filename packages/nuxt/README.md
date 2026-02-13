# vue-excalidraw-nuxt

Nuxt module for [vue-excalidraw](https://github.com/alsey89/vue-excalidraw). Zero-config Excalidraw whiteboard integration for Nuxt apps.

## Install

```bash
npm install vue-excalidraw-nuxt react react-dom @excalidraw/excalidraw
```

## Setup

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['vue-excalidraw-nuxt'],

  // Optional: self-host Excalidraw fonts
  excalidraw: {
    assetPath: '/excalidraw-assets/',
  },
})
```

That's it. The module auto-registers:

- `<Excalidraw>` component (client-only)
- `useExcalidraw()` composable (auto-imported)
- Vite plugins for React JSX transform and Excalidraw compatibility

## Usage

```vue
<template>
  <div style="height: 600px;">
    <Excalidraw
      :theme="$colorMode.value === 'dark' ? 'dark' : 'light'"
      @change="onDrawingChange"
      @save="onManualSave"
    />
  </div>
</template>

<script setup lang="ts">
import type { ExcalidrawChangePayload } from 'vue-excalidraw'

const { api, isReady } = useExcalidraw()

function onDrawingChange(payload: ExcalidrawChangePayload) {
  // Auto-save, debounce, etc.
}

function onManualSave(payload: ExcalidrawChangePayload) {
  // Ctrl+S / Cmd+S
}
</script>
```

See [vue-excalidraw README](https://github.com/alsey89/vue-excalidraw) for full props, events, and composable API documentation.

## Chunk Splitting (Recommended)

Excalidraw + React add ~1.5MB to your bundle. Isolate them into a separate chunk:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('react') || id.includes('@excalidraw')) {
              return 'excalidraw'
            }
          },
        },
      },
    },
  },
})
```

## License

MIT
