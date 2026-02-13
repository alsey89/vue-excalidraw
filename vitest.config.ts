import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-excalidraw/vite': path.resolve(__dirname, 'packages/core/src/vite.ts'),
      'vue-excalidraw': path.resolve(__dirname, 'packages/core/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.{test,spec}.ts'],
  },
})
