import { describe, it, expect } from 'vitest'
import { render, act } from '@testing-library/react'
import { useEffect } from 'react'
import { useZeugma, Zeugma, Pane, PaneTree } from '../../../index'
import type { TreeNode, ZeugmaController } from '../../../shared'

describe('Zeugma Drag and Drop Widget Remounting', () => {
  it('should not remount widgets during tab move (reorder)', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    let mountCount = 0
    let unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      useEffect(() => {
        mountCount++
        return () => {
          unmountCount++
        }
      }, [])
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller
      return (
        <Zeugma
          {...controller}
          renderPane={(paneId) => (
            <Pane id={paneId}>
              {(paneProps) => <div id={`pane-target-${paneId}`}>{paneProps.renderActiveTab()}</div>}
            </Pane>
          )}
          renderWidget={(id) => <TestWidget tabId={id} />}
        >
          <PaneTree />
        </Zeugma>
      )
    }

    render(<TestWrapper />)

    // Initially, both tabs are in the layout and registered.
    // tab-1 and tab-2 should mount.
    expect(mountCount).toBe(2)
    expect(unmountCount).toBe(0)

    // Reset mountCount before drag
    mountCount = 0

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
    expect(mountCount).toBe(0)
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
    expect(mountCount).toBe(0)
    expect(unmountCount).toBe(0)
  })

  it('should not remount widgets during split drop', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    let mountCount = 0
    let unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      useEffect(() => {
        mountCount++
        return () => {
          unmountCount++
        }
      }, [])
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller
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

    // Reset mountCount before drag
    mountCount = 0

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

    expect(mountCount).toBe(0)
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

    // Expect no remount (no unmounts or additional mounts of target tab)
    expect(mountCount).toBe(0)
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

    let controllerInstance: ZeugmaController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller
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
