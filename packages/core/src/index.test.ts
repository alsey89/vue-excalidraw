import { describe, it, expect, vi } from 'vitest'

// ============================================================
// Mocks — prevent loading heavy React/Excalidraw dependencies
// ============================================================

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn(), unmount: vi.fn() })),
}))

vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: () => null,
}))

vi.mock('@excalidraw/excalidraw/index.css', () => ({}))

// ============================================================
// Tests
// ============================================================

describe('barrel export (index.ts)', () => {
  it('exports Excalidraw component', async () => {
    const mod = await import('./index')
    expect(mod.Excalidraw).toBeDefined()
  })

  it('exports useExcalidraw as a function', async () => {
    const mod = await import('./index')
    expect(typeof mod.useExcalidraw).toBe('function')
  })

  it('useExcalidraw returns expected shape', async () => {
    const mod = await import('./index')
    const result = mod.useExcalidraw('barrel-test')
    expect(result).toHaveProperty('api')
    expect(result).toHaveProperty('isReady')
    expect(result).toHaveProperty('_setApi')
  })

  it('does not export internal _clearRegistry', async () => {
    const mod = await import('./index')
    expect((mod as any)._clearRegistry).toBeUndefined()
  })
})
