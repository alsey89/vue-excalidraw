import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'

const mockExportToSvg = vi.fn()
const mockExportToBlob = vi.fn()

vi.mock('@excalidraw/excalidraw', () => ({
  exportToSvg: mockExportToSvg,
  exportToBlob: mockExportToBlob,
}))

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

describe('useExcalidraw export methods', () => {
  beforeEach(() => {
    _clearRegistry()
    mockExportToSvg.mockReset()
    mockExportToBlob.mockReset()
  })

  describe('exportToSvg', () => {
    it('calls exportToSvg with scene data and default padding', async () => {
      const mockApi = createMockApi()
      const { api, _setApi } = useExcalidraw('svg-1')
      _setApi(mockApi)
      await nextTick()

      const mockSvg = { tagName: 'svg' }
      mockExportToSvg.mockResolvedValue(mockSvg)

      await api.value.exportToSvg()

      expect(mockExportToSvg).toHaveBeenCalledWith(
        expect.objectContaining({
          elements: [{ id: '1', type: 'rectangle' }],
          appState: { theme: 'light' },
          files: { 'file-1': { mimeType: 'image/png', id: 'file-1' } },
          exportPadding: 10,
        }),
      )
    })

    it('forwards custom exportPadding and metadata options', async () => {
      const mockApi = createMockApi()
      const { api, _setApi } = useExcalidraw('svg-2')
      _setApi(mockApi)
      await nextTick()

      mockExportToSvg.mockResolvedValue({ tagName: 'svg' })

      await api.value.exportToSvg({ exportPadding: 20, metadata: 'test-meta' })

      expect(mockExportToSvg).toHaveBeenCalledWith(
        expect.objectContaining({
          exportPadding: 20,
          metadata: 'test-meta',
        }),
      )
    })

    it('returns the value from the excalidraw export function', async () => {
      const mockApi = createMockApi()
      const { api, _setApi } = useExcalidraw('svg-3')
      _setApi(mockApi)
      await nextTick()

      const mockSvg = { tagName: 'svg' }
      mockExportToSvg.mockResolvedValue(mockSvg)

      const result = await api.value.exportToSvg()
      expect(result).toBe(mockSvg)
    })
  })

  describe('exportToBlob', () => {
    it('calls exportToBlob with scene data and defaults', async () => {
      const mockApi = createMockApi()
      const { api, _setApi } = useExcalidraw('blob-1')
      _setApi(mockApi)
      await nextTick()

      const mockBlob = new Blob(['test'])
      mockExportToBlob.mockResolvedValue(mockBlob)

      await api.value.exportToBlob()

      expect(mockExportToBlob).toHaveBeenCalledWith(
        expect.objectContaining({
          elements: [{ id: '1', type: 'rectangle' }],
          appState: { theme: 'light' },
          files: { 'file-1': { mimeType: 'image/png', id: 'file-1' } },
          mimeType: 'image/png',
          quality: 0.92,
          exportPadding: 10,
        }),
      )
    })

    it('forwards custom mimeType, quality, and exportPadding', async () => {
      const mockApi = createMockApi()
      const { api, _setApi } = useExcalidraw('blob-2')
      _setApi(mockApi)
      await nextTick()

      mockExportToBlob.mockResolvedValue(new Blob())

      await api.value.exportToBlob({
        mimeType: 'image/jpeg',
        quality: 0.5,
        exportPadding: 0,
      })

      expect(mockExportToBlob).toHaveBeenCalledWith(
        expect.objectContaining({
          mimeType: 'image/jpeg',
          quality: 0.5,
          exportPadding: 0,
        }),
      )
    })

    it('passes a getDimensions function that preserves dimensions at scale 1', async () => {
      const mockApi = createMockApi()
      const { api, _setApi } = useExcalidraw('blob-3')
      _setApi(mockApi)
      await nextTick()

      mockExportToBlob.mockResolvedValue(new Blob())

      await api.value.exportToBlob()

      const callArgs = mockExportToBlob.mock.calls[0][0]
      const result = callArgs.getDimensions(100, 200)
      expect(result).toEqual({ width: 100, height: 200, scale: 1 })
    })

    it('returns the Blob from the excalidraw export function', async () => {
      const mockApi = createMockApi()
      const { api, _setApi } = useExcalidraw('blob-4')
      _setApi(mockApi)
      await nextTick()

      const mockBlob = new Blob(['test'], { type: 'image/png' })
      mockExportToBlob.mockResolvedValue(mockBlob)

      const result = await api.value.exportToBlob()
      expect(result).toBe(mockBlob)
    })
  })
})
