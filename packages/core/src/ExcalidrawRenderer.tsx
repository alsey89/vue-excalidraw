import { createElement, useCallback, useRef } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'

import type { PointerEvent as ReactPointerEvent } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type {
  ExcalidrawInitialData,
  ExcalidrawUIOptions,
  BinaryFiles,
  ExcalidrawElement,
} from './types'

export interface ExcalidrawRendererProps {
  initialData?: ExcalidrawInitialData | null
  theme?: 'light' | 'dark'
  viewModeEnabled?: boolean
  langCode?: string
  gridModeEnabled?: boolean
  zenModeEnabled?: boolean
  UIOptions?: Partial<ExcalidrawUIOptions>
  onApiReady?: (api: ExcalidrawImperativeAPI) => void
  onChange?: (
    elements: readonly ExcalidrawElement[],
    appState: Record<string, unknown>,
    files: BinaryFiles,
  ) => void
  onLinkOpen?: (element: ExcalidrawElement, nativeEvent: MouseEvent) => void
}

export default function ExcalidrawRenderer(props: ExcalidrawRendererProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)

  const handleExcalidrawAPI = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api
      props.onApiReady?.(api)
    },
    [props.onApiReady],
  )

  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      props.onChange?.(elements, appState, files)
    },
    [props.onChange],
  )

  const handleLinkOpen = useCallback(
    (
      element: any,
      event: CustomEvent<{
        nativeEvent: MouseEvent | ReactPointerEvent<HTMLCanvasElement>
      }>,
    ) => {
      event.preventDefault()
      const nativeEvent =
        event.detail.nativeEvent instanceof MouseEvent
          ? event.detail.nativeEvent
          : (event.detail.nativeEvent as unknown as MouseEvent)
      props.onLinkOpen?.(element, nativeEvent)
    },
    [props.onLinkOpen],
  )

  // Use createElement directly instead of JSX to avoid Vue's JSX transform
  // intercepting and producing Vue VNodes instead of React elements.
  return createElement(Excalidraw, {
    initialData: props.initialData as any,
    theme: props.theme,
    viewModeEnabled: props.viewModeEnabled,
    langCode: props.langCode,
    gridModeEnabled: props.gridModeEnabled,
    zenModeEnabled: props.zenModeEnabled,
    UIOptions: props.UIOptions as any,
    excalidrawAPI: handleExcalidrawAPI,
    onChange: handleChange,
    onLinkOpen: handleLinkOpen,
  })
}
