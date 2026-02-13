// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { _clearRegistry, useExcalidraw } from '../composables/useExcalidraw'

// ============================================================
// Mocks
// ============================================================

const mockRender = vi.fn()
const mockUnmount = vi.fn()
const mockCreateRoot = vi.fn(() => ({ render: mockRender, unmount: mockUnmount }))

vi.mock('react-dom/client', () => ({
  createRoot: (...args: any[]) => mockCreateRoot(...args),
}))

vi.mock('../ExcalidrawRenderer', () => ({
  default: function MockRenderer() {
    return null
  },
}))

vi.mock('@excalidraw/excalidraw/index.css', () => ({}))

// Import the component AFTER mocks are set up
import ExcalidrawComponent from './Excalidraw.vue'

// ============================================================
// Helpers
// ============================================================

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

/** Extract the props passed to ExcalidrawRenderer via createElement */
function getRenderedProps(): Record<string, any> {
  const lastCall = mockRender.mock.calls[mockRender.mock.calls.length - 1]
  // mockRender receives a React element created by createElement(ExcalidrawRenderer, props)
  return lastCall[0].props
}

// ============================================================
// Tests
// ============================================================

describe('Excalidraw.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    _clearRegistry()
    mockCreateRoot.mockClear()
    mockRender.mockClear()
    mockUnmount.mockClear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  // ----------------------------------------------------------
  // Mounting & React root creation
  // ----------------------------------------------------------

  describe('mounting', () => {
    it('creates a React root from the container div on mount', () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'mount-1' } })
      expect(mockCreateRoot).toHaveBeenCalledTimes(1)
      const arg = mockCreateRoot.mock.calls[0][0]
      expect(arg).toBeInstanceOf(HTMLDivElement)
      expect(arg.classList.contains('excalidraw-vue-container')).toBe(true)
    })

    it('renders React element on mount', () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'mount-2' } })
      expect(mockRender).toHaveBeenCalledTimes(1)
    })

    it('createElement is called with ExcalidrawRenderer', async () => {
      const MockRenderer = (await import('../ExcalidrawRenderer')).default
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'mount-3' } })
      const reactElement = mockRender.mock.calls[0][0]
      expect(reactElement.type).toBe(MockRenderer)
    })

    it('logs error when createRoot throws', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockCreateRoot.mockImplementationOnce(() => {
        throw new Error('React root failed')
      })

      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'mount-err' } })

      expect(errorSpy).toHaveBeenCalledWith(
        '[vue-excalidraw] Failed to mount Excalidraw:',
        expect.any(Error),
      )
      errorSpy.mockRestore()
    })
  })

  // ----------------------------------------------------------
  // Prop reactivity → React re-render
  // ----------------------------------------------------------

  describe('prop reactivity', () => {
    it('re-renders React when theme prop changes', async () => {
      wrapper = mount(ExcalidrawComponent, {
        props: { excalidrawKey: 'prop-theme', theme: 'light' },
      })
      const initialCount = mockRender.mock.calls.length

      await wrapper.setProps({ theme: 'dark' })
      await nextTick()

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialCount)
      expect(getRenderedProps().theme).toBe('dark')
    })

    it('re-renders React when viewMode prop changes', async () => {
      wrapper = mount(ExcalidrawComponent, {
        props: { excalidrawKey: 'prop-view', viewMode: false },
      })
      const initialCount = mockRender.mock.calls.length

      await wrapper.setProps({ viewMode: true })
      await nextTick()

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialCount)
      expect(getRenderedProps().viewModeEnabled).toBe(true)
    })

    it('re-renders React when langCode prop changes', async () => {
      wrapper = mount(ExcalidrawComponent, {
        props: { excalidrawKey: 'prop-lang', langCode: 'en' },
      })
      const initialCount = mockRender.mock.calls.length

      await wrapper.setProps({ langCode: 'ja' })
      await nextTick()

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialCount)
      expect(getRenderedProps().langCode).toBe('ja')
    })

    it('re-renders React when gridMode prop changes', async () => {
      wrapper = mount(ExcalidrawComponent, {
        props: { excalidrawKey: 'prop-grid', gridMode: false },
      })
      const initialCount = mockRender.mock.calls.length

      await wrapper.setProps({ gridMode: true })
      await nextTick()

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialCount)
      expect(getRenderedProps().gridModeEnabled).toBe(true)
    })

    it('re-renders React when zenMode prop changes', async () => {
      wrapper = mount(ExcalidrawComponent, {
        props: { excalidrawKey: 'prop-zen', zenMode: false },
      })
      const initialCount = mockRender.mock.calls.length

      await wrapper.setProps({ zenMode: true })
      await nextTick()

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialCount)
      expect(getRenderedProps().zenModeEnabled).toBe(true)
    })

    it('re-renders React when uiOptions prop changes', async () => {
      wrapper = mount(ExcalidrawComponent, {
        props: { excalidrawKey: 'prop-ui', uiOptions: { welcomeScreen: true } },
      })
      const initialCount = mockRender.mock.calls.length

      await wrapper.setProps({ uiOptions: { welcomeScreen: false } })
      await nextTick()

      expect(mockRender.mock.calls.length).toBeGreaterThan(initialCount)
    })
  })

  // ----------------------------------------------------------
  // Keyboard shortcuts
  // ----------------------------------------------------------

  describe('keyboard shortcuts', () => {
    it('emits save on Ctrl+S when API is ready', async () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'kb-ctrl' } })

      // Simulate API becoming ready via the onApiReady callback
      const onApiReady = getRenderedProps().onApiReady
      onApiReady(createMockApi())
      await nextTick()

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(wrapper.emitted('save')).toHaveLength(1)
      const payload = wrapper.emitted('save')![0][0] as any
      expect(payload.elements).toEqual([{ id: '1', type: 'rectangle' }])
      expect(payload.appState).toEqual({ theme: 'light' })
    })

    it('emits save on Cmd+S when API is ready', async () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'kb-cmd' } })

      const onApiReady = getRenderedProps().onApiReady
      onApiReady(createMockApi())
      await nextTick()

      const event = new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(wrapper.emitted('save')).toHaveLength(1)
    })

    it('does not emit save when API is not ready', () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'kb-no-api' } })

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      expect(wrapper.emitted('save')).toBeUndefined()
    })

    it('prevents default on Ctrl+S', async () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'kb-prevent' } })

      const onApiReady = getRenderedProps().onApiReady
      onApiReady(createMockApi())
      await nextTick()

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })
      document.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
    })
  })

  // ----------------------------------------------------------
  // Event emission via React callbacks
  // ----------------------------------------------------------

  describe('event emission', () => {
    it('emits change when React onChange callback fires', () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'evt-change' } })

      const { onChange } = getRenderedProps()
      const elements = [{ id: '2', type: 'ellipse' }]
      const appState = { theme: 'dark' }
      const files = { 'f-1': { mimeType: 'image/png' } }

      onChange(elements, appState, files)

      expect(wrapper.emitted('change')).toHaveLength(1)
      const payload = wrapper.emitted('change')![0][0] as any
      expect(payload.elements).toEqual(elements)
      expect(payload.appState).toEqual(appState)
      expect(payload.files).toEqual(files)
    })

    it('emits link-open when React onLinkOpen callback fires', () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'evt-link' } })

      const { onLinkOpen } = getRenderedProps()
      const element = { id: 'link-1', type: 'text' }
      const nativeEvent = new MouseEvent('click')

      onLinkOpen(element, nativeEvent)

      expect(wrapper.emitted('link-open')).toHaveLength(1)
      const payload = wrapper.emitted('link-open')![0][0] as any
      expect(payload.element).toEqual(element)
      expect(payload.nativeEvent).toBe(nativeEvent)
    })
  })

  // ----------------------------------------------------------
  // Cleanup on unmount
  // ----------------------------------------------------------

  describe('cleanup', () => {
    it('calls reactRoot.unmount on Vue component unmount', () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'clean-1' } })
      wrapper.unmount()

      expect(mockUnmount).toHaveBeenCalledTimes(1)
    })

    it('clears the composable API reference on unmount', async () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'clean-2' } })

      // Set API to ready
      const onApiReady = getRenderedProps().onApiReady
      onApiReady(createMockApi())
      await nextTick()

      const { isReady } = useExcalidraw('clean-2')
      expect(isReady.value).toBe(true)

      wrapper.unmount()
      await nextTick()

      expect(isReady.value).toBe(false)
    })

    it('removes keydown listener on unmount', async () => {
      wrapper = mount(ExcalidrawComponent, { props: { excalidrawKey: 'clean-3' } })

      const onApiReady = getRenderedProps().onApiReady
      onApiReady(createMockApi())
      await nextTick()

      wrapper.unmount()

      // Ctrl+S after unmount should not emit (listener removed)
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      // No save emitted after unmount
      expect(wrapper.emitted('save')).toBeUndefined()
    })
  })
})
