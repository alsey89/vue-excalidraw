import { shallowRef, computed, type ShallowRef } from 'vue'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { ExcalidrawApi, ExcalidrawElement, BinaryFiles } from '../types'

// Global registry of Excalidraw API instances, keyed by instance key.
// shallowRef avoids deep reactivity on the large Excalidraw API object.
const apiRegistry = new Map<string, ShallowRef<ExcalidrawImperativeAPI | null>>()

function getApiRef(key: string) {
  let apiRef = apiRegistry.get(key)
  if (!apiRef) {
    apiRef = shallowRef<ExcalidrawImperativeAPI | null>(null)
    apiRegistry.set(key, apiRef)
  }
  return apiRef
}

/**
 * Clears all entries from the API registry.
 * Exposed for test cleanup only — do not use in application code.
 * @internal
 */
export function _clearRegistry() {
  apiRegistry.clear()
}

/**
 * Composable providing imperative access to an Excalidraw instance.
 *
 * Usage:
 *   const { api, isReady } = useExcalidraw()
 *   if (isReady.value) {
 *     const elements = api.value.getSceneElements()
 *   }
 *
 * For multiple instances on the same page, pass a unique key:
 *   const { api: api1 } = useExcalidraw('editor-1')
 *   const { api: api2 } = useExcalidraw('editor-2')
 */
export function useExcalidraw(key: string = 'default') {
  const rawApi = getApiRef(key)

  const isReady = computed(() => rawApi.value !== null)

  /**
   * Called internally by the Excalidraw.vue component when the React API becomes available.
   * NOT intended for external use.
   * @internal
   */
  function _setApi(api: ExcalidrawImperativeAPI | null) {
    rawApi.value = api
    // Clean up registry entry when API is cleared
    if (api === null) {
      apiRegistry.delete(key)
    }
  }

  // Wrap the raw API in a safe, Vue-friendly interface
  const api = computed<ExcalidrawApi>(() => {
    const raw = rawApi.value

    return {
      isReady: raw !== null,

      getSceneElements(): readonly ExcalidrawElement[] {
        if (!raw) return []
        return raw.getSceneElements() as readonly ExcalidrawElement[]
      },

      getAppState(): Record<string, unknown> {
        if (!raw) return {}
        return raw.getAppState() as Record<string, unknown>
      },

      getFiles(): BinaryFiles {
        if (!raw) return {} as BinaryFiles
        return raw.getFiles() as BinaryFiles
      },

      updateScene(scene) {
        if (!raw) {
          console.warn('[vue-excalidraw] Cannot updateScene: API not ready')
          return
        }
        raw.updateScene(scene as any)
      },

      resetScene(opts) {
        if (!raw) {
          console.warn('[vue-excalidraw] Cannot resetScene: API not ready')
          return
        }
        raw.resetScene(opts)
      },

      scrollToContent(target) {
        if (!raw) return
        if (target) {
          raw.scrollToContent(target as any)
        } else {
          raw.scrollToContent()
        }
      },

      async exportToSvg(opts = {}) {
        if (!raw) throw new Error('[vue-excalidraw] Cannot export: API not ready')

        let exportToSvg: any
        try {
          ;({ exportToSvg } = await import('@excalidraw/excalidraw'))
        } catch (err) {
          throw new Error(
            '[vue-excalidraw] Failed to load export utilities from @excalidraw/excalidraw',
            { cause: err },
          )
        }
        const elements = raw.getSceneElements()
        const appState = raw.getAppState()
        const files = raw.getFiles()

        return await exportToSvg({
          elements: elements as any,
          appState: appState as any,
          files: files as any,
          exportPadding: opts.exportPadding ?? 10,
          metadata: opts.metadata,
        } as any)
      },

      async exportToBlob(opts = {}) {
        if (!raw) throw new Error('[vue-excalidraw] Cannot export: API not ready')

        let exportToBlob: any
        try {
          ;({ exportToBlob } = await import('@excalidraw/excalidraw'))
        } catch (err) {
          throw new Error(
            '[vue-excalidraw] Failed to load export utilities from @excalidraw/excalidraw',
            { cause: err },
          )
        }
        const elements = raw.getSceneElements()
        const appState = raw.getAppState()
        const files = raw.getFiles()

        return await exportToBlob({
          elements: elements as any,
          appState: appState as any,
          files: files as any,
          mimeType: opts.mimeType ?? 'image/png',
          quality: opts.quality ?? 0.92,
          exportPadding: opts.exportPadding ?? 10,
          getDimensions: (width: number, height: number) => ({ width, height, scale: 1 }),
        } as any)
      },

      clearHistory() {
        if (!raw) return
        raw.history.clear()
      },

      raw,
    }
  })

  return {
    /** Reactive computed API wrapper (always available, methods no-op when not ready) */
    api,
    /** Whether the Excalidraw imperative API is ready */
    isReady,
    /** @internal - Used by Excalidraw.vue to register the API */
    _setApi,
  }
}
