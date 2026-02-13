# vue-excalidraw

Vue 3 component wrapping [Excalidraw](https://excalidraw.com/)'s React whiteboard editor. Provides a reactive Vue interface with full imperative API access.

## Install

```bash
npm install vue-excalidraw react react-dom @excalidraw/excalidraw
```

## Setup (Vite)

Add the Vite plugin to configure React JSX transform and Excalidraw compatibility:

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { excalidrawVitePlugin } from 'vue-excalidraw/vite'

export default defineConfig({
  plugins: [vue(), excalidrawVitePlugin()],
})
```

> For Nuxt, use [vue-excalidraw-nuxt](https://github.com/alsey89/vue-excalidraw/tree/main/packages/nuxt) which handles all configuration automatically.

## Usage

```vue
<template>
  <div style="width: 100%; height: 600px;">
    <Excalidraw :theme="isDark ? 'dark' : 'light'" @change="onDrawingChange" @save="onManualSave" />
  </div>
</template>

<script setup lang="ts">
import { Excalidraw, useExcalidraw } from 'vue-excalidraw'
import type { ExcalidrawChangePayload } from 'vue-excalidraw'

const { api, isReady } = useExcalidraw()

function onDrawingChange(payload: ExcalidrawChangePayload) {
  console.log('Elements:', payload.elements.length)
}

function onManualSave(payload: ExcalidrawChangePayload) {
  // Ctrl+S / Cmd+S pressed
  saveToBackend(payload)
}

// Imperative API access
function exportAsPng() {
  if (!isReady.value) return
  api.value.exportToBlob({ mimeType: 'image/png' }).then((blob) => {
    /* download or upload */
  })
}
</script>
```

## Props

| Prop            | Type                            | Default     | Description                               |
| --------------- | ------------------------------- | ----------- | ----------------------------------------- |
| `initialData`   | `ExcalidrawInitialData \| null` | `null`      | Initial scene data (loaded once on mount) |
| `theme`         | `'light' \| 'dark'`             | `'light'`   | Color theme                               |
| `viewMode`      | `boolean`                       | `false`     | Read-only mode                            |
| `langCode`      | `string`                        | `'en'`      | Excalidraw UI language                    |
| `gridMode`      | `boolean`                       | `false`     | Show grid                                 |
| `zenMode`       | `boolean`                       | `false`     | Minimal UI                                |
| `uiOptions`     | `Partial<ExcalidrawUIOptions>`  | `undefined` | Customize UI elements                     |
| `excalidrawKey` | `string`                        | `'default'` | Unique key for multi-instance support     |

## Events

| Event       | Payload                     | Description                                 |
| ----------- | --------------------------- | ------------------------------------------- |
| `change`    | `ExcalidrawChangePayload`   | Scene changed (elements, appState, files)   |
| `save`      | `ExcalidrawChangePayload`   | Ctrl+S / Cmd+S pressed                      |
| `link-open` | `ExcalidrawLinkOpenPayload` | Link clicked (default navigation prevented) |

## Composable: `useExcalidraw(key?)`

Returns imperative access to the Excalidraw instance:

```ts
const { api, isReady } = useExcalidraw()

// All methods are safe to call (no-op when not ready)
api.value.getSceneElements() // readonly ExcalidrawElement[]
api.value.getAppState() // Record<string, unknown>
api.value.getFiles() // BinaryFiles
api.value.updateScene(scene) // Update elements/appState
api.value.resetScene() // Clear canvas
api.value.scrollToContent() // Fit to viewport
api.value.exportToSvg(opts) // Promise<SVGSVGElement>
api.value.exportToBlob(opts) // Promise<Blob>
api.value.clearHistory() // Clear undo/redo
api.value.raw // Raw ExcalidrawImperativeAPI (escape hatch)
```

## Multiple Instances

```vue
<Excalidraw excalidraw-key="editor-1" />
<Excalidraw excalidraw-key="editor-2" />

<script setup>
const { api: api1 } = useExcalidraw('editor-1')
const { api: api2 } = useExcalidraw('editor-2')
</script>
```

## Self-Hosted Fonts

```ts
excalidrawVitePlugin({
  assetPath: '/excalidraw-assets/',
})
```

## How It Works

This package bridges React and Vue by:

1. Mounting a React root inside a Vue container element
2. Forwarding Vue props to React via `createElement` (not JSX, to avoid Vue's JSX transform)
3. Emitting React callbacks as Vue events
4. Exposing the imperative API through a Vue composable with `shallowRef`

The Excalidraw component is always client-side rendered (no SSR).

## License

MIT
