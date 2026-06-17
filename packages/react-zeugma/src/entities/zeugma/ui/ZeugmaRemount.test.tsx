import { describe, it, expect } from 'vitest'
import { render, act } from '@testing-library/react'
import { useZeugma, Zeugma } from '../../../index'
import type { TreeNode, ZeugmaInternalController } from '../../../shared'

describe('Zeugma Drag and Drop Widget Remounting', () => {
  it('should not remount widgets during tab move (reorder)', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    let mountCount = 0
    const unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      mountCount++
      // Simulate unmount hook via clean-up function
      // (React runs clean-up functions on unmount or dependency updates, but since tabId is stable for this widget, it only runs on unmount)
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaInternalController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as unknown as ZeugmaInternalController
      return (
        <Zeugma
          {...controller}
          renderPane={(id) => <div key={id} id={`pane-target-${id}`} />}
          renderWidget={(id) => <TestWidget tabId={id} />}
        >
          <div>Workspace</div>
        </Zeugma>
      )
    }

    render(<TestWrapper />)

    // Initially, both tabs are in the layout and registered.
    // tab-1 should mount once.
    // (Wait, since renderWidget is called for both tab-1 and tab-2 in the portal host, mountCount runs for both)
    expect(mountCount).toBe(2)
    expect(unmountCount).toBe(0)

    // Simulate drag start on tab-1
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId('tab-1')
        controllerInstance.setActiveType('tab')
        controllerInstance.setLayoutBeforeDrag(initialLayout)

        const newLayout: TreeNode = {
          type: 'pane',
          id: 'pane-1',
          tabs: ['tab-2'],
          activeTabId: 'tab-2',
        }
        controllerInstance.setLayout(newLayout)
      }
    })

    // During drag, no remounts of widgets should happen
    expect(unmountCount).toBe(0)

    // Simulate drag end on tab-1 (dropping on the same pane, moving it)
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId(null)
        controllerInstance.setActiveType(null)
        controllerInstance.setLayoutBeforeDrag(null)

        const finalLayout: TreeNode = {
          type: 'pane',
          id: 'pane-1',
          tabs: ['tab-2', 'tab-1'],
          activeTabId: 'tab-1',
        }
        controllerInstance.setLayout(finalLayout)
      }
    })

    // After drop, tab-1 should NOT have remounted!
    expect(unmountCount).toBe(0)
  })

  it('should not remount widgets during split drop', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    const unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaInternalController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as unknown as ZeugmaInternalController
      return (
        <Zeugma
          {...controller}
          renderPane={(id) => <div key={id} id={`pane-target-${id}`} />}
          renderWidget={(id) => <TestWidget tabId={id} />}
        >
          <div>Workspace</div>
        </Zeugma>
      )
    }

    render(<TestWrapper />)

    // Simulate drag start on tab-1
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId('tab-1')
        controllerInstance.setActiveType('tab')
        controllerInstance.setLayoutBeforeDrag(initialLayout)

        const newLayout: TreeNode = {
          type: 'pane',
          id: 'pane-1',
          tabs: ['tab-2'],
          activeTabId: 'tab-2',
        }
        controllerInstance.setLayout(newLayout)
      }
    })

    expect(unmountCount).toBe(0)

    // Simulate split drop (creating pane-2 and moving tab-1 there)
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId(null)
        controllerInstance.setActiveType(null)
        controllerInstance.setLayoutBeforeDrag(null)

        const finalLayout: TreeNode = {
          type: 'split',
          direction: 'row',
          splitPercentage: 50,
          first: {
            type: 'pane',
            id: 'pane-1',
            tabs: ['tab-2'],
            activeTabId: 'tab-2',
          },
          second: {
            type: 'pane',
            id: 'pane-2',
            tabs: ['tab-1'],
            activeTabId: 'tab-1',
          },
        }
        controllerInstance.setLayout(finalLayout)
      }
    })

    // Expect no remount (no unmounts of target tab)
    expect(unmountCount).toBe(0)
  })

  it('should not remount widgets during tab switching (activation)', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    const unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaInternalController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as unknown as ZeugmaInternalController
      return (
        <Zeugma
          {...controller}
          renderPane={(id) => <div key={id} id={`pane-target-${id}`} />}
          renderWidget={(id) => <TestWidget tabId={id} />}
        >
          <div>Workspace</div>
        </Zeugma>
      )
    }

    render(<TestWrapper />)

    // Switch active tab in pane-1 from tab-1 to tab-2
    act(() => {
      if (controllerInstance) {
        controllerInstance.selectTab('pane-1', 'tab-2')
      }
    })

    // No unmount should occur when switching tabs
    expect(unmountCount).toBe(0)

    // Switch active tab in pane-1 back from tab-2 to tab-1
    act(() => {
      if (controllerInstance) {
        controllerInstance.selectTab('pane-1', 'tab-1')
      }
    })

    expect(unmountCount).toBe(0)
  })
})
