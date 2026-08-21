import { renderHook, act, render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useZeugma } from './useZeugma'
import { useTabMetadata, useAllMetadata } from './metadata-store'
import { Zeugma } from '../ui/Zeugma'
import { Pane } from '../../pane'
import { TreeNode, ZeugmaControllerInternal } from '../../../shared'

describe('useTabMetadata & Decoupled Metadata Reactivity', () => {
  it('should allow granular subscription per tabId and only re-render targeted component', () => {
    let tab1RenderCount = 0
    let tab2RenderCount = 0
    let layoutRenderCount = 0

    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    const initialMetadata = {
      'tab-1': { title: 'Tab One', count: 0 },
      'tab-2': { title: 'Tab Two', count: 0 },
    }

    const Tab1Component = () => {
      tab1RenderCount++
      const meta = useTabMetadata('tab-1')
      return (
        <div data-testid="tab-1-view">
          {String(meta?.title)}: {String(meta?.count)}
        </div>
      )
    }

    const Tab2Component = () => {
      tab2RenderCount++
      const meta = useTabMetadata('tab-2')
      return (
        <div data-testid="tab-2-view">
          {String(meta?.title)}: {String(meta?.count)}
        </div>
      )
    }

    let externalController: ReturnType<typeof useZeugma> | null = null

    const App = () => {
      layoutRenderCount++
      const controller = useZeugma({ initialLayout, initialMetadata })
      externalController = controller

      return (
        <Zeugma
          controller={controller}
          renderPane={(paneId) => (
            <Pane id={paneId}>
              <Tab1Component />
              <Tab2Component />
            </Pane>
          )}
        />
      )
    }

    render(<App />)

    expect(screen.getByTestId('tab-1-view').textContent).toBe('Tab One: 0')
    expect(screen.getByTestId('tab-2-view').textContent).toBe('Tab Two: 0')

    const initialLayoutCount = layoutRenderCount
    const initialTab1Count = tab1RenderCount
    const initialTab2Count = tab2RenderCount

    // Update Tab 1 metadata
    act(() => {
      externalController!.updateMetadata('tab-1', (prev) => ({
        ...prev,
        count: 1,
      }))
    })

    expect(screen.getByTestId('tab-1-view').textContent).toBe('Tab One: 1')
    expect(screen.getByTestId('tab-2-view').textContent).toBe('Tab Two: 0')

    // Tab 1 must have re-rendered
    expect(tab1RenderCount).toBeGreaterThan(initialTab1Count)
    // Tab 2 must NOT have re-rendered
    expect(tab2RenderCount).toBe(initialTab2Count)
    // App/Layout must NOT have re-rendered
    expect(layoutRenderCount).toBe(initialLayoutCount)
  })

  it('should support useAllMetadata hook to observe all metadata changes', () => {
    const { result } = renderHook(() => {
      const controller = useZeugma({
        initialMetadata: {
          'tab-1': { a: 1 },
        },
      })
      const internal = controller as ZeugmaControllerInternal
      const all = useAllMetadata(internal.metadataStore)
      return { controller, all }
    })

    expect(result.current.all).toEqual({ 'tab-1': { a: 1 } })

    act(() => {
      result.current.controller.updateMetadata('tab-1', (c) => ({ ...c, a: 2 }))
    })

    expect(result.current.all).toEqual({ 'tab-1': { a: 2 } })

    act(() => {
      result.current.controller.updateMetadata('tab-2', () => ({ b: 10 }))
    })

    expect(result.current.all).toEqual({
      'tab-1': { a: 2 },
      'tab-2': { b: 10 },
    })
  })
})
