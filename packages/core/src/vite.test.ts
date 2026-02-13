// @vitest-environment node
import { describe, it, expect, afterEach } from 'vitest'
import { excalidrawVitePlugin } from './vite'

describe('excalidrawVitePlugin', () => {
  const originalEnv = process.env.IS_PREACT

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.IS_PREACT
    } else {
      process.env.IS_PREACT = originalEnv
    }
  })

  it('returns an array of plugins including config and react plugins', () => {
    const plugins = excalidrawVitePlugin()
    expect(Array.isArray(plugins)).toBe(true)
    expect(plugins.length).toBeGreaterThanOrEqual(2)
    expect(plugins[0].name).toBe('vue-excalidraw:config')
  })

  it('config hook sets process.env.IS_PREACT define', () => {
    const plugins = excalidrawVitePlugin()
    const plugin = plugins[0]
    const config = {} as any

    ;(plugin.config as (...args: any[]) => any)(config, { command: 'serve' })

    expect(config.define['process.env.IS_PREACT']).toBe(JSON.stringify('true'))
  })

  it('config hook adds optimizeDeps includes', () => {
    const plugins = excalidrawVitePlugin()
    const plugin = plugins[0]
    const config = {} as any

    ;(plugin.config as (...args: any[]) => any)(config, { command: 'serve' })

    expect(config.optimizeDeps.include).toContain('react')
    expect(config.optimizeDeps.include).toContain('react-dom')
    expect(config.optimizeDeps.include).toContain('react-dom/client')
    expect(config.optimizeDeps.include).toContain('react/jsx-runtime')
    expect(config.optimizeDeps.include).toContain('@excalidraw/excalidraw')
  })

  it('config hook sets esbuild target to es2022', () => {
    const plugins = excalidrawVitePlugin()
    const plugin = plugins[0]
    const config = {} as any

    ;(plugin.config as (...args: any[]) => any)(config, { command: 'serve' })

    expect(config.optimizeDeps.esbuildOptions.target).toBe('es2022')
  })

  it('sets EXCALIDRAW_ASSET_PATH when assetPath option is provided', () => {
    const plugins = excalidrawVitePlugin({ assetPath: '/fonts/' })
    const plugin = plugins[0]
    const config = {} as any

    ;(plugin.config as (...args: any[]) => any)(config, { command: 'serve' })

    expect(config.define['globalThis.EXCALIDRAW_ASSET_PATH']).toBe(JSON.stringify('/fonts/'))
  })

  it('does not set EXCALIDRAW_ASSET_PATH when assetPath is not provided', () => {
    const plugins = excalidrawVitePlugin()
    const plugin = plugins[0]
    const config = {} as any

    ;(plugin.config as (...args: any[]) => any)(config, { command: 'serve' })

    expect(config.define['globalThis.EXCALIDRAW_ASSET_PATH']).toBeUndefined()
  })

  it('includes react plugins from @vitejs/plugin-react', () => {
    const plugins = excalidrawVitePlugin()
    const pluginNames = plugins.map((p) => p.name)
    // First plugin is our config plugin
    expect(pluginNames[0]).toBe('vue-excalidraw:config')
    // Remaining plugins come from @vitejs/plugin-react
    const reactPluginNames = pluginNames.slice(1)
    expect(reactPluginNames.length).toBeGreaterThan(0)
    expect(reactPluginNames.some((name) => name?.includes('react'))).toBe(true)
  })

  it('merges with existing config without clobbering', () => {
    const plugins = excalidrawVitePlugin()
    const plugin = plugins[0]
    const config = {
      define: { 'process.env.MY_VAR': '"hello"' },
      optimizeDeps: {
        include: ['existing-dep'],
        esbuildOptions: { loader: { '.png': 'file' } },
      },
    } as any

    ;(plugin.config as (...args: any[]) => any)(config, { command: 'serve' })

    // Existing values preserved
    expect(config.define['process.env.MY_VAR']).toBe('"hello"')
    expect(config.optimizeDeps.include).toContain('existing-dep')
    expect(config.optimizeDeps.esbuildOptions.loader).toEqual({ '.png': 'file' })

    // New values added
    expect(config.define['process.env.IS_PREACT']).toBe(JSON.stringify('true'))
    expect(config.optimizeDeps.include).toContain('react')
  })
})
