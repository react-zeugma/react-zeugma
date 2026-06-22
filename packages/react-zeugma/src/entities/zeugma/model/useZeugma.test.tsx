import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useZeugma } from './useZeugma'
import type { TreeNode, PaneNode, SplitNode } from '../../../shared'

describe('useZeugma Hook', () => {
  const initialLayout: TreeNode = {
    type: 'pane',
    id: 'pane-1',
    tabs: ['tab-1'],
    activeTabId: 'tab-1',
  }

  it('should initialize with uncontrolled initialLayout', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))
    expect(result.current.layout).toEqual(initialLayout)
    expect(result.current.locked).toBe(false)
    expect(result.current.fullscreenPaneId).toBeNull()
  })

  it('should handle controlled layout updates from options', () => {
    const { result, rerender } = renderHook((props) => useZeugma(props), {
      initialProps: { layout: initialLayout },
    })
    expect(result.current.layout).toEqual(initialLayout)

    const updatedLayout: TreeNode = {
      type: 'pane',
      id: 'pane-updated',
      tabs: ['tab-updated'],
      activeTabId: 'tab-updated',
    }

    rerender({ layout: updatedLayout })
    expect(result.current.layout).toEqual(updatedLayout)
  })

  it('should handle locked toggle via options or setter', () => {
    const { result, rerender } = renderHook((props) => useZeugma(props), {
      initialProps: { initialLayout, locked: false },
    })
    expect(result.current.locked).toBe(false)

    rerender({ initialLayout, locked: true })
    expect(result.current.locked).toBe(true)

    act(() => {
      result.current.setLocked(false)
    })
    expect(result.current.locked).toBe(false)
  })

  it('should toggle fullscreenPaneId', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))
    expect(result.current.fullscreenPaneId).toBeNull()

    act(() => {
      result.current.setFullscreenPaneId('pane-1')
    })
    expect(result.current.fullscreenPaneId).toBe('pane-1')

    act(() => {
      result.current.setFullscreenPaneId(null)
    })
    expect(result.current.fullscreenPaneId).toBeNull()
  })

  it('should perform removePane and removeTab', () => {
    const layoutWithTwoTabs: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithTwoTabs }))

    // Remove tab-2
    act(() => {
      result.current.removeTab('tab-2')
    })
    const pane = result.current.layout as PaneNode
    expect(pane.tabs).toEqual(['tab-1'])

    // Remove the entire pane
    act(() => {
      result.current.removePane('pane-1')
    })
    expect(result.current.layout).toBeNull()
  })

  it('should perform splitPane programmatically', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      result.current.splitPane('pane-1', 'row', 'right', 'tab-new')
    })

    const root = result.current.layout as SplitNode
    expect(root.type).toBe('split')
    expect(root.direction).toBe('row')

    const secondChild = root.second as PaneNode
    expect(secondChild.type).toBe('pane')
    expect(secondChild.tabs).toEqual(['tab-new'])
  })

  it('should perform updateSplitPercentage', () => {
    const layoutWithSplit: TreeNode = {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: { type: 'pane', id: 'pane-1', tabs: ['tab-1'], activeTabId: 'tab-1' },
      second: { type: 'pane', id: 'pane-2', tabs: ['tab-2'], activeTabId: 'tab-2' },
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithSplit }))

    const initialRoot = result.current.layout as SplitNode

    act(() => {
      result.current.updateSplitPercentage(initialRoot, 75)
    })

    const updatedRoot = result.current.layout as SplitNode
    expect(updatedRoot.splitPercentage).toBe(75)
  })

  it('should perform mergeTab and moveTab', () => {
    const layoutWithSplit: TreeNode = {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: { type: 'pane', id: 'pane-1', tabs: ['tab-1'], activeTabId: 'tab-1' },
      second: { type: 'pane', id: 'pane-2', tabs: ['tab-2'], activeTabId: 'tab-2' },
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithSplit }))

    // Merge tab-2 from pane-2 into pane-1
    act(() => {
      result.current.mergeTab('tab-2', 'pane-1')
    })

    let layout = result.current.layout as PaneNode
    expect(layout.type).toBe('pane') // second pane collapsed
    expect(layout.tabs).toEqual(['tab-1', 'tab-2'])

    // Move tab-2 before tab-1
    act(() => {
      result.current.moveTab('tab-2', 'tab-1', 'before')
    })

    layout = result.current.layout as PaneNode
    expect(layout.tabs).toEqual(['tab-2', 'tab-1'])
  })

  it('should support tree queries (findPaneById, findPaneContainingTab, findTabById)', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    const pane = result.current.findPaneById('pane-1')
    expect(pane).not.toBeNull()
    expect(pane?.id).toBe('pane-1')

    const paneByTab = result.current.findPaneContainingTab('tab-1')
    expect(paneByTab?.id).toBe('pane-1')

    const tabDetails = result.current.findTabById('tab-1')
    expect(tabDetails).not.toBeNull()
    expect(tabDetails?.paneId).toBe('pane-1')
    expect(tabDetails?.isActive).toBe(true)
  })

  it('should support synchronous batching without state overwrite (layoutRef check)', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      result.current.addTab('tab-2', 'pane-1')
      result.current.addTab('tab-3', 'pane-1')
    })

    const pane = result.current.layout as PaneNode
    expect(pane.tabs).toEqual(['tab-1', 'tab-2', 'tab-3'])
    expect(pane.activeTabId).toBe('tab-3')
  })

  it('should maintain action identity stability across layout changes', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    const initialAddTab = result.current.addTab
    const initialAddWidget = result.current.addWidget
    const initialRemovePane = result.current.removePane

    act(() => {
      result.current.addTab('tab-2', 'pane-1')
    })

    expect(result.current.addTab).toBe(initialAddTab)
    expect(result.current.addWidget).toBe(initialAddWidget)
    expect(result.current.removePane).toBe(initialRemovePane)
  })

  it('should update tab metadata programmatically', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      result.current.updateMetadata('tab-1', (current) => ({
        ...current,
        title: 'My Custom Title',
      }))
    })

    const pane = result.current.layout as PaneNode
    expect(pane.tabsMetadata?.['tab-1']?.title).toBe('My Custom Title')
  })

  it('should lock and unlock a specific pane programmatically', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      result.current.updatePaneLock('pane-1', true)
    })

    let pane = result.current.layout as PaneNode
    expect(pane.locked).toBe(true)

    act(() => {
      result.current.updatePaneLock('pane-1', false)
    })

    pane = result.current.layout as PaneNode
    expect(pane.locked).toBeUndefined()
  })

  it('should select tab (change activeTabId) in a pane', () => {
    const layoutWithTwoTabs: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithTwoTabs }))

    act(() => {
      result.current.selectTab('pane-1', 'tab-2')
    })

    const pane = result.current.layout as PaneNode
    expect(pane.activeTabId).toBe('tab-2')
  })

  it('should call onFullscreenChange callback when setFullscreenPaneId is invoked', () => {
    const onFullscreenChangeMock = vi.fn()
    const { result } = renderHook(() =>
      useZeugma({ initialLayout, onFullscreenChange: onFullscreenChangeMock }),
    )

    act(() => {
      result.current.setFullscreenPaneId('pane-1')
    })

    expect(onFullscreenChangeMock).toHaveBeenCalledWith('pane-1')
  })
})
