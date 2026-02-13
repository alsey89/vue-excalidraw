# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] - 2025-XX-XX

### Added

- Vue 3 `<Excalidraw>` component with React bridge
- `useExcalidraw()` composable for imperative API access
- Vite plugin for build configuration (`vue-excalidraw/vite`)
- Multi-instance support via `excalidrawKey` prop
- Theme, view mode, zen mode, grid mode, and language props
- Change, save (Ctrl+S / Cmd+S), and link-open events
- Export to SVG and Blob via composable API
- Nuxt 3 module (`vue-excalidraw-nuxt`) with zero-config integration
- Auto-registration of component and composable in Nuxt
- Optional self-hosted font asset path configuration
