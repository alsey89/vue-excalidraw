<template>
  <div ref="containerRef" class="excalidraw-vue-container" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, toRaw } from 'vue'
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import ExcalidrawRenderer from '../ExcalidrawRenderer'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type {
  ExcalidrawInitialData,
  ExcalidrawUIOptions,
  ExcalidrawChangePayload,
  ExcalidrawLinkOpenPayload,
} from '../types'
import { useExcalidraw } from '../composables/useExcalidraw'

// ============================================================
// Props
// ============================================================

const props = withDefaults(
  defineProps<{
    initialData?: ExcalidrawInitialData | null
    theme?: 'light' | 'dark'
    viewMode?: boolean
    langCode?: string
    gridMode?: boolean
    zenMode?: boolean
    uiOptions?: Partial<ExcalidrawUIOptions>
    excalidrawKey?: string
  }>(),
  {
    initialData: null,
    theme: 'light',
    viewMode: false,
    langCode: 'en',
    gridMode: false,
    zenMode: false,
    uiOptions: undefined,
    excalidrawKey: 'default',
  },
)

// ============================================================
// Emits
// ============================================================

const emit = defineEmits<{
  change: [payload: ExcalidrawChangePayload]
  save: [payload: ExcalidrawChangePayload]
  'link-open': [payload: ExcalidrawLinkOpenPayload]
}>()

// ============================================================
// React Bridge
// ============================================================

const containerRef = ref<HTMLDivElement | null>(null)
let reactRoot: Root | null = null

// Connect to the composable so the imperative API is available externally
const { _setApi, api } = useExcalidraw(props.excalidrawKey)

/**
 * Render (or re-render) the React Excalidraw component with current props.
 */
function renderReact() {
  if (!reactRoot) return

  const element = createElement(ExcalidrawRenderer, {
    initialData: props.initialData ? toRaw(props.initialData) : null,
    theme: props.theme,
    viewModeEnabled: props.viewMode,
    langCode: props.langCode,
    gridModeEnabled: props.gridMode,
    zenModeEnabled: props.zenMode,
    UIOptions: props.uiOptions,
    onApiReady: (api: ExcalidrawImperativeAPI) => {
      _setApi(api)
    },
    onChange: (
      elements: readonly Record<string, unknown>[],
      appState: Record<string, unknown>,
      files: Record<string, unknown>,
    ) => {
      const payload: ExcalidrawChangePayload = {
        elements,
        appState,
        files: files as any,
      }
      emit('change', payload)
    },
    onLinkOpen: (element: Record<string, unknown>, nativeEvent: MouseEvent) => {
      emit('link-open', { element, nativeEvent })
    },
  })

  reactRoot.render(element)
}

// ============================================================
// Lifecycle
// ============================================================

onMounted(() => {
  if (!containerRef.value) return

  try {
    reactRoot = createRoot(containerRef.value)
    renderReact()
  } catch (err) {
    console.error('[vue-excalidraw] Failed to mount Excalidraw:', err)
  }

  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up React root first, then remove listener
  if (reactRoot) {
    reactRoot.unmount()
    reactRoot = null
  }
  // Clear the composable API reference
  _setApi(null)

  document.removeEventListener('keydown', handleKeydown)
})

// ============================================================
// Reactivity Bridge: Vue props -> React re-render
// ============================================================

// Watch all props that should trigger a React re-render.
// initialData is NOT watched because it's only used on mount.
watch(
  () => [
    props.theme,
    props.viewMode,
    props.langCode,
    props.gridMode,
    props.zenMode,
    props.uiOptions,
  ],
  () => {
    renderReact()
  },
  { deep: true },
)

// ============================================================
// Keyboard shortcut: Ctrl+S / Cmd+S => emit 'save'
// ============================================================

function handleKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 's') {
    event.preventDefault()

    if (api.value.isReady) {
      emit('save', {
        elements: api.value.getSceneElements(),
        appState: api.value.getAppState(),
        files: api.value.getFiles(),
      })
    }
  }
}
</script>

<style>
/*
 * The container must have explicit dimensions because Excalidraw
 * takes 100% width and height of its containing block.
 * Consumers should set dimensions on this component or its parent.
 */
.excalidraw-vue-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
