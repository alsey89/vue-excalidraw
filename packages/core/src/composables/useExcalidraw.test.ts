import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useExcalidraw, _clearRegistry } from './useExcalidraw'

function createMockApi() {
  return {
    getSceneElements: vi.fn(() => [{ id: '1', type: 'rectangle' }]),
    getAppState: vi.fn(() => ({ theme: 'light' })),
    getFiles: vi.fn(() => ({ 'file-1': { mimeType: 'image/png', id: 'file-1' } })),
    updateScene: vi.fn(),
    resetScene: vi.fn(),
    scrollToContent: vi.fn(),
    history: { clear: vi.fn() },
  } as any
}

describe('useExcalidraw', () => {
  beforeEach(() => {
    // Clear the global registry between tests to prevent cross-test pollution
    _clearRegistry()
  })

  it('returns api, isReady, and _setApi', () => {
    const result = useExcalidraw('test-1')
    expect(result).toHaveProperty('api')
    expect(result).toHaveProperty('isReady')
    expect(result).toHaveProperty('_setApi')
  })

  it('isReady is false initially', () => {
    const { isReady } = useExcalidraw('test-2')
    expect(isReady.value).toBe(false)
  })

  it('isReady becomes true after _setApi', async () => {
    const { isReady, _setApi } = useExcalidraw('test-3')
    expect(isReady.value).toBe(false)

    _setApi(createMockApi())
    await nextTick()

    expect(isReady.value).toBe(true)
  })

  it('api methods return safe defaults when not ready', () => {
    const { api } = useExcalidraw('test-4')

    expect(api.value.isReady).toBe(false)
    expect(api.value.getSceneElements()).toEqual([])
    expect(api.value.getAppState()).toEqual({})
    expect(api.value.getFiles()).toEqual({})
    expect(api.value.raw).toBeNull()
  })

  it('api methods delegate to raw API when ready', async () => {
    const mockApi = createMockApi()
    const { api, _setApi } = useExcalidraw('test-5')

    _setApi(mockApi)
    await nextTick()

    expect(api.value.isReady).toBe(true)
    api.value.getSceneElements()
    expect(mockApi.getSceneElements).toHaveBeenCalled()

    api.value.getAppState()
    expect(mockApi.getAppState).toHaveBeenCalled()

    api.value.getFiles()
    expect(mockApi.getFiles).toHaveBeenCalled()

    api.value.updateScene({ elements: [] })
    expect(mockApi.updateScene).toHaveBeenCalledWith({ elements: [] })

    api.value.resetScene()
    expect(mockApi.resetScene).toHaveBeenCalled()

    api.value.scrollToContent()
    expect(mockApi.scrollToContent).toHaveBeenCalled()

    api.value.clearHistory()
    expect(mockApi.history.clear).toHaveBeenCalled()

    expect(api.value.raw).toBe(mockApi)
  })

  it('multiple keys create independent instances', async () => {
    const { api: api1, _setApi: setApi1 } = useExcalidraw('instance-a')
    const { api: api2, _setApi: setApi2 } = useExcalidraw('instance-b')

    const mockA = createMockApi()
    const mockB = createMockApi()

    setApi1(mockA)
    await nextTick()

    expect(api1.value.isReady).toBe(true)
    expect(api2.value.isReady).toBe(false)

    setApi2(mockB)
    await nextTick()

    expect(api1.value.raw).toBe(mockA)
    expect(api2.value.raw).toBe(mockB)

    // Cleanup
    setApi1(null)
    setApi2(null)
  })

  it('same key returns shared state', async () => {
    const { _setApi } = useExcalidraw('shared-key')
    const mockApi = createMockApi()
    _setApi(mockApi)
    await nextTick()

    const { api, isReady } = useExcalidraw('shared-key')
    expect(isReady.value).toBe(true)
    expect(api.value.raw).toBe(mockApi)

    // Cleanup
    _setApi(null)
  })

  it('warns on updateScene when not ready', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { api } = useExcalidraw('test-warn-update')

    api.value.updateScene({ elements: [] })
    expect(warnSpy).toHaveBeenCalledWith('[vue-excalidraw] Cannot updateScene: API not ready')

    warnSpy.mockRestore()
  })

  it('warns on resetScene when not ready', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { api } = useExcalidraw('test-warn-reset')

    api.value.resetScene()
    expect(warnSpy).toHaveBeenCalledWith('[vue-excalidraw] Cannot resetScene: API not ready')

    warnSpy.mockRestore()
  })

  it('throws on exportToSvg when not ready', async () => {
    const { api } = useExcalidraw('test-throw-svg')
    await expect(api.value.exportToSvg()).rejects.toThrow(
      '[vue-excalidraw] Cannot export: API not ready',
    )
  })

  it('throws on exportToBlob when not ready', async () => {
    const { api } = useExcalidraw('test-throw-blob')
    await expect(api.value.exportToBlob()).rejects.toThrow(
      '[vue-excalidraw] Cannot export: API not ready',
    )
  })

  it('cleans up registry entry when _setApi(null) is called', async () => {
    const { isReady, _setApi } = useExcalidraw('test-cleanup')
    _setApi(createMockApi())
    await nextTick()
    expect(isReady.value).toBe(true)

    _setApi(null)
    await nextTick()

    // Getting a fresh composable for the same key should start unready
    const { isReady: isReady2 } = useExcalidraw('test-cleanup')
    expect(isReady2.value).toBe(false)
  })
})
