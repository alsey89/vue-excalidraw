import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

export interface ExcalidrawViteOptions {
  /**
   * Base path for self-hosted Excalidraw assets (fonts).
   * Leave undefined to use Excalidraw's default CDN.
   */
  assetPath?: string
}

/**
 * Vite plugin that configures the build for Excalidraw compatibility.
 *
 * Sets up:
 * - @vitejs/plugin-react for .tsx JSX transform (scoped to .tsx files)
 * - optimizeDeps for React + Excalidraw pre-bundling
 * - Excalidraw build variant (IS_PREACT)
 * - Optional self-hosted asset path
 *
 * Usage:
 *   import { excalidrawVitePlugin } from 'vue-excalidraw/vite'
 *
 *   export default defineConfig({
 *     plugins: [vue(), excalidrawVitePlugin()],
 *   })
 */
export function excalidrawVitePlugin(options: ExcalidrawViteOptions = {}): Plugin[] {
  const configPlugin: Plugin = {
    name: 'vue-excalidraw:config',
    config(config) {
      // Excalidraw checks process.env.IS_PREACT to decide build variant
      config.define = config.define || {}
      config.define['process.env.IS_PREACT'] = JSON.stringify('true')

      // Ensure optimizeDeps handles Excalidraw's ESM properly
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push(
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@excalidraw/excalidraw',
      )

      // Target ES2022 for Excalidraw compatibility
      config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {}
      config.optimizeDeps.esbuildOptions.target = 'es2022'

      // Set asset path if configured
      if (options.assetPath) {
        config.define['globalThis.EXCALIDRAW_ASSET_PATH'] = JSON.stringify(options.assetPath)
      }
    },
  }

  // @vitejs/plugin-react for JSX transform, scoped to .tsx files only
  const reactPlugins = react({ include: /\.tsx$/ })
  const reactPluginArray: Plugin[] = Array.isArray(reactPlugins) ? reactPlugins : [reactPlugins]

  return [configPlugin, ...reactPluginArray]
}
