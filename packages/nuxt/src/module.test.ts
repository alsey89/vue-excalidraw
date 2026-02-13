import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// Mocks — use vi.hoisted() so mock factories can reference these
// ============================================================

const {
  mockAddComponent,
  mockAddImports,
  mockAddVitePlugin,
  captured,
  mockPlugin1,
  mockPlugin2,
  mockExcalidrawVitePlugin,
} = vi.hoisted(() => {
  const mockAddComponent = vi.fn()
  const mockAddImports = vi.fn()
  const mockAddVitePlugin = vi.fn()
  const captured: { moduleConfig: any } = { moduleConfig: null }
  const mockPlugin1 = { name: 'vue-excalidraw:config' }
  const mockPlugin2 = { name: 'vite:react-babel' }
  const mockExcalidrawVitePlugin = vi.fn(() => [mockPlugin1, mockPlugin2])
  return {
    mockAddComponent,
    mockAddImports,
    mockAddVitePlugin,
    captured,
    mockPlugin1,
    mockPlugin2,
    mockExcalidrawVitePlugin,
  }
})

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (config: any) => {
    captured.moduleConfig = config
    return config
  },
  addComponent: (...args: any[]) => mockAddComponent(...args),
  addImports: (...args: any[]) => mockAddImports(...args),
  addVitePlugin: (...args: any[]) => mockAddVitePlugin(...args),
}))

vi.mock('vue-excalidraw/vite', () => ({
  excalidrawVitePlugin: (...args: any[]) => mockExcalidrawVitePlugin(...args),
}))

// Import triggers defineNuxtModule, which captures the config
import './module'

// ============================================================
// Helpers
// ============================================================

function createNuxtStub(overrides: { transpile?: string[]; scripts?: any[] } = {}) {
  return {
    options: {
      build: { transpile: overrides.transpile ?? [] },
      app: { head: { script: overrides.scripts ?? [] } },
    },
  }
}

// ============================================================
// Tests
// ============================================================

describe('vue-excalidraw-nuxt module', () => {
  beforeEach(() => {
    mockAddComponent.mockClear()
    mockAddImports.mockClear()
    mockAddVitePlugin.mockClear()
    mockExcalidrawVitePlugin.mockClear()
  })

  describe('module meta', () => {
    it('has correct meta name and configKey', () => {
      expect(captured.moduleConfig.meta.name).toBe('vue-excalidraw-nuxt')
      expect(captured.moduleConfig.meta.configKey).toBe('excalidraw')
    })

    it('requires nuxt >= 3.0.0', () => {
      expect(captured.moduleConfig.meta.compatibility.nuxt).toBe('>=3.0.0')
    })
  })

  describe('component registration', () => {
    it('calls addComponent with Excalidraw in client-only mode', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({}, nuxt)

      expect(mockAddComponent).toHaveBeenCalledWith({
        name: 'Excalidraw',
        filePath: 'vue-excalidraw/src/components/Excalidraw.vue',
        mode: 'client',
      })
    })
  })

  describe('composable auto-import', () => {
    it('calls addImports with useExcalidraw from vue-excalidraw', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({}, nuxt)

      expect(mockAddImports).toHaveBeenCalledWith({
        name: 'useExcalidraw',
        from: 'vue-excalidraw',
      })
    })
  })

  describe('vite plugin registration', () => {
    it('calls addVitePlugin for each plugin from excalidrawVitePlugin', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({}, nuxt)

      expect(mockAddVitePlugin).toHaveBeenCalledTimes(2)
      expect(mockAddVitePlugin).toHaveBeenCalledWith(mockPlugin1)
      expect(mockAddVitePlugin).toHaveBeenCalledWith(mockPlugin2)
    })

    it('passes assetPath option to excalidrawVitePlugin', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({ assetPath: '/fonts/' }, nuxt)

      expect(mockExcalidrawVitePlugin).toHaveBeenCalledWith({ assetPath: '/fonts/' })
    })

    it('passes undefined assetPath when not configured', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({ assetPath: undefined }, nuxt)

      expect(mockExcalidrawVitePlugin).toHaveBeenCalledWith({ assetPath: undefined })
    })
  })

  describe('transpile configuration', () => {
    it('adds transpile entries for excalidraw, react, and react-dom', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({}, nuxt)

      expect(nuxt.options.build.transpile).toContain('@excalidraw/excalidraw')
      expect(nuxt.options.build.transpile).toContain('react')
      expect(nuxt.options.build.transpile).toContain('react-dom')
    })

    it('preserves existing transpile entries', async () => {
      const nuxt = createNuxtStub({ transpile: ['existing-package'] })
      await captured.moduleConfig.setup({}, nuxt)

      expect(nuxt.options.build.transpile).toContain('existing-package')
      expect(nuxt.options.build.transpile).toContain('@excalidraw/excalidraw')
    })
  })

  describe('asset path head script injection', () => {
    it('injects EXCALIDRAW_ASSET_PATH head script when assetPath is set', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({ assetPath: '/fonts/' }, nuxt)

      const scripts = nuxt.options.app.head.script
      expect(scripts).toHaveLength(1)
      expect(scripts[0].innerHTML).toContain('window.EXCALIDRAW_ASSET_PATH')
      expect(scripts[0].innerHTML).toContain('/fonts/')
      expect(scripts[0].tagPosition).toBe('head')
    })

    it('does not inject head script when assetPath is not set', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup({}, nuxt)

      expect(nuxt.options.app.head.script).toHaveLength(0)
    })

    it('sanitizes assetPath to prevent XSS via script close tag', async () => {
      const nuxt = createNuxtStub()
      await captured.moduleConfig.setup(
        { assetPath: '</script><script>alert(1)</script>' },
        nuxt,
      )

      const script = nuxt.options.app.head.script[0]
      expect(script.innerHTML).not.toContain('</script>')
      expect(script.innerHTML).toContain('\\u003c')
    })
  })
})
