// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'

// Suppress React act() environment warning in jsdom
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

// ============================================================
// Mocks
// ============================================================

let capturedExcalidrawProps: any = null

vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: (props: any) => {
    capturedExcalidrawProps = props
    return null
  },
}))

vi.mock('@excalidraw/excalidraw/index.css', () => ({}))

import ExcalidrawRenderer from './ExcalidrawRenderer'

// ============================================================
// Tests
// ============================================================

describe('ExcalidrawRenderer', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    capturedExcalidrawProps = null
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders without crashing', () => {
    act(() => {
      root.render(createElement(ExcalidrawRenderer, {}))
    })
    expect(capturedExcalidrawProps).not.toBeNull()
  })

  it('forwards all config props to Excalidraw', () => {
    const initialData = { elements: [{ id: '1' }] }
    const uiOptions = { welcomeScreen: false }

    act(() => {
      root.render(
        createElement(ExcalidrawRenderer, {
          initialData,
          theme: 'dark',
          viewModeEnabled: true,
          langCode: 'ja',
          gridModeEnabled: true,
          zenModeEnabled: true,
          UIOptions: uiOptions,
        }),
      )
    })

    expect(capturedExcalidrawProps.initialData).toBe(initialData)
    expect(capturedExcalidrawProps.theme).toBe('dark')
    expect(capturedExcalidrawProps.viewModeEnabled).toBe(true)
    expect(capturedExcalidrawProps.langCode).toBe('ja')
    expect(capturedExcalidrawProps.gridModeEnabled).toBe(true)
    expect(capturedExcalidrawProps.zenModeEnabled).toBe(true)
    expect(capturedExcalidrawProps.UIOptions).toBe(uiOptions)
  })

  it('calls onApiReady when excalidrawAPI callback fires', () => {
    const onApiReady = vi.fn()

    act(() => {
      root.render(createElement(ExcalidrawRenderer, { onApiReady }))
    })

    const mockApi = { getSceneElements: vi.fn() }
    capturedExcalidrawProps.excalidrawAPI(mockApi)

    expect(onApiReady).toHaveBeenCalledWith(mockApi)
  })

  it('calls onChange when Excalidraw onChange fires', () => {
    const onChange = vi.fn()

    act(() => {
      root.render(createElement(ExcalidrawRenderer, { onChange }))
    })

    const elements = [{ id: '1' }]
    const appState = { theme: 'light' }
    const files = { 'f-1': { mimeType: 'image/png' } }

    capturedExcalidrawProps.onChange(elements, appState, files)

    expect(onChange).toHaveBeenCalledWith(elements, appState, files)
  })

  it('calls onLinkOpen with nativeEvent after preventDefault', () => {
    const onLinkOpen = vi.fn()

    act(() => {
      root.render(createElement(ExcalidrawRenderer, { onLinkOpen }))
    })

    const nativeEvent = new MouseEvent('click')
    const customEvent = new CustomEvent('linkOpen', {
      detail: { nativeEvent },
    })
    // CustomEvent.preventDefault needs to be spied on
    const preventDefaultSpy = vi.spyOn(customEvent, 'preventDefault')

    const element = { id: 'link-1', type: 'text' }
    capturedExcalidrawProps.onLinkOpen(element, customEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(onLinkOpen).toHaveBeenCalledWith(element, nativeEvent)
  })

  it('handles non-MouseEvent nativeEvent in onLinkOpen', () => {
    const onLinkOpen = vi.fn()

    act(() => {
      root.render(createElement(ExcalidrawRenderer, { onLinkOpen }))
    })

    // Simulate a PointerEvent-like object that is not a MouseEvent instance
    const pointerLikeEvent = { type: 'pointerdown' }
    const customEvent = new CustomEvent('linkOpen', {
      detail: { nativeEvent: pointerLikeEvent },
    })

    capturedExcalidrawProps.onLinkOpen({ id: 'link-2' }, customEvent)

    expect(onLinkOpen).toHaveBeenCalledWith({ id: 'link-2' }, pointerLikeEvent)
  })

  it('does not throw when optional callbacks are omitted', () => {
    act(() => {
      root.render(createElement(ExcalidrawRenderer, {}))
    })

    // These should not throw even without callbacks
    expect(() => {
      capturedExcalidrawProps.excalidrawAPI({ getSceneElements: vi.fn() })
    }).not.toThrow()

    expect(() => {
      capturedExcalidrawProps.onChange([], {}, {})
    }).not.toThrow()
  })
})
