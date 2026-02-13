import { defineNuxtModule, addComponent, addImports, addVitePlugin } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { excalidrawVitePlugin } from 'vue-excalidraw/vite'

export interface ModuleOptions {
  /**
   * Base path for Excalidraw assets (fonts).
   * Set to a string to self-host, or leave undefined for CDN default.
   */
  assetPath?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-excalidraw-nuxt',
    configKey: 'excalidraw',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    assetPath: undefined,
  },
  async setup(options: ModuleOptions, nuxt: Nuxt) {
    // ================================================================
    // 1. Register the Vue wrapper component (client-only)
    // ================================================================
    addComponent({
      name: 'Excalidraw',
      // Resolve from vue-excalidraw's installed location
      filePath: 'vue-excalidraw/src/components/Excalidraw.vue',
      mode: 'client',
    })

    // ================================================================
    // 2. Register the composable as an auto-import
    // ================================================================
    addImports({
      name: 'useExcalidraw',
      from: 'vue-excalidraw',
    })

    // ================================================================
    // 3. Add Vite plugins from vue-excalidraw core
    //    (includes config + @vitejs/plugin-react scoped to .tsx)
    // ================================================================
    const plugins = excalidrawVitePlugin({
      assetPath: options.assetPath,
    })
    for (const plugin of plugins) {
      addVitePlugin(plugin)
    }

    // ================================================================
    // 4. Ensure Excalidraw packages are transpiled
    // ================================================================
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push('@excalidraw/excalidraw', 'react', 'react-dom')

    // ================================================================
    // 6. Set EXCALIDRAW_ASSET_PATH if configured (SSR head injection)
    // ================================================================
    if (options.assetPath) {
      // Escape '<' to prevent script injection via </script> sequences
      const sanitized = JSON.stringify(options.assetPath).replace(/</g, '\\u003c')
      const head = nuxt.options.app.head as any
      head.script = head.script || []
      head.script.push({
        innerHTML: `window.EXCALIDRAW_ASSET_PATH = ${sanitized};`,
        tagPosition: 'head',
      })
    }
  },
})
