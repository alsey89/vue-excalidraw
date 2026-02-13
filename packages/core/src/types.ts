import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'

// ============================================================
// Excalidraw data types (re-exported for consumer convenience)
// ============================================================

/**
 * Simplified element type for the Vue API surface.
 * Consumers who need full types can import from @excalidraw/excalidraw/types.
 */
export type ExcalidrawElement = Record<string, unknown>

/**
 * Binary file data attached to the scene.
 */
export type BinaryFiles = Record<
  string,
  { mimeType: string; id: string; dataURL: string; created: number }
>

/**
 * Initial data to populate the Excalidraw canvas.
 */
export interface ExcalidrawInitialData {
  elements?: readonly ExcalidrawElement[]
  appState?: Record<string, unknown>
  files?: BinaryFiles
  libraryItems?: unknown[]
}

// ============================================================
// UIOptions (subset exposed via the Vue component)
// ============================================================

export interface ExcalidrawCanvasActions {
  changeViewBackgroundColor?: boolean
  clearCanvas?: boolean
  export?: false | { saveFileToDisk?: boolean }
  loadScene?: boolean
  saveToActiveFile?: boolean
  toggleTheme?: boolean | null
  saveAsImage?: boolean
}

export interface ExcalidrawUIOptions {
  canvasActions?: Partial<ExcalidrawCanvasActions>
  dockedSidebarBreakpoint?: number
  welcomeScreen?: boolean
  tools?: {
    image?: boolean
  }
}

// ============================================================
// Vue component props
// ============================================================

export interface ExcalidrawProps {
  /**
   * Initial scene data. Loaded once on mount.
   * To update after mount, use the imperative API (useExcalidraw().updateScene).
   */
  initialData?: ExcalidrawInitialData | null

  /**
   * Theme: 'light' or 'dark'. Fully controlled by host.
   * When supplied, takes precedence over initialData.appState.theme.
   * @default 'light'
   */
  theme?: 'light' | 'dark'

  /**
   * Enable read-only view mode.
   * @default false
   */
  viewMode?: boolean

  /**
   * Language code for Excalidraw UI (e.g., 'en', 'zh-TW', 'ja').
   * @default 'en'
   */
  langCode?: string

  /**
   * Show grid on the canvas.
   * @default false
   */
  gridMode?: boolean

  /**
   * Enable zen mode (minimal UI).
   * @default false
   */
  zenMode?: boolean

  /**
   * Customize Excalidraw UI elements.
   */
  uiOptions?: Partial<ExcalidrawUIOptions>

  /**
   * A unique key for the composable state. Allows multiple independent
   * Excalidraw instances on the same page with separate composable APIs.
   * @default 'default'
   */
  excalidrawKey?: string
}

// ============================================================
// Vue component emits
// ============================================================

export interface ExcalidrawChangePayload {
  elements: readonly ExcalidrawElement[]
  appState: Record<string, unknown>
  files: BinaryFiles
}

export interface ExcalidrawLinkOpenPayload {
  element: ExcalidrawElement
  nativeEvent: MouseEvent
}

export interface ExcalidrawEmits {
  (e: 'change', payload: ExcalidrawChangePayload): void
  (e: 'save', payload: ExcalidrawChangePayload): void
  (e: 'link-open', payload: ExcalidrawLinkOpenPayload): void
}

// ============================================================
// Composable API (imperative methods)
// ============================================================

export interface ExcalidrawApi {
  /** Whether the Excalidraw API is ready */
  isReady: boolean

  /** Get all non-deleted scene elements */
  getSceneElements: () => readonly ExcalidrawElement[]

  /** Get current app state */
  getAppState: () => Record<string, unknown>

  /** Get all binary files in the scene */
  getFiles: () => BinaryFiles

  /** Update the scene with new elements/appState */
  updateScene: (scene: {
    elements?: readonly ExcalidrawElement[]
    appState?: Record<string, unknown>
    collaborators?: Map<string, unknown>
  }) => void

  /** Reset the scene to empty state */
  resetScene: (opts?: { resetLoadingState?: boolean }) => void

  /** Scroll to fit content in viewport */
  scrollToContent: (target?: ExcalidrawElement | ExcalidrawElement[]) => void

  /** Export the scene as an SVG element */
  exportToSvg: (opts?: { exportPadding?: number; metadata?: string }) => Promise<SVGSVGElement>

  /** Export the scene as a Blob */
  exportToBlob: (opts?: {
    mimeType?: string
    quality?: number
    exportPadding?: number
  }) => Promise<Blob>

  /** Clear undo/redo history */
  clearHistory: () => void

  /** The raw ExcalidrawImperativeAPI (escape hatch) */
  raw: ExcalidrawImperativeAPI | null
}
