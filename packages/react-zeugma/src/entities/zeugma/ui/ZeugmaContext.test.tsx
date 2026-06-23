import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useZeugma, useZeugmaContext, Zeugma, Pane } from '../../../index'
import {
  useZeugmaState,
  useZeugmaActions,
  ZeugmaStateContext,
  ZeugmaDragContext,
} from '../../../shared'
import type { TreeNode, ZeugmaController } from '../../../shared'
import { Tabs } from '../../pane/ui/Tabs'
import * as dndKitCore from '@dnd-kit/core'

describe('Zeugma Context Provider & Consumers', () => {
  const initialLayout: TreeNode = {
    type: 'pane',
    id: 'pane-1',
    tabs: ['tab-1'],
    activeTabId: 'tab-1',
  }

  it('should throw error when useZeugmaState is used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useZeugmaState())
    }).toThrow('useZeugmaState must be used within a Zeugma provider')
    consoleErrorSpy.mockRestore()
  })

  it('should throw error when useZeugmaActions is used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useZeugmaActions())
    }).toThrow('useZeugmaActions must be used within a Zeugma provider')
    consoleErrorSpy.mockRestore()
  })

  it('should successfully render children and provide context values', () => {
    let contextValue: ZeugmaController | null = null
    const ConsumerComponent = () => {
      contextValue = useZeugmaContext()
      return <div data-testid="child">Child Component</div>
    }

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <ConsumerComponent />
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    expect(screen.getByTestId('child')).toBeDefined()
    expect(contextValue).not.toBeNull()
    expect(contextValue!.layout).toEqual(initialLayout)

    // Actions should be present
    expect(typeof contextValue!.addTab).toBe('function')
    expect(typeof contextValue!.removePane).toBe('function')
    expect(typeof contextValue!.setFullscreenPaneId).toBe('function')
    expect(typeof contextValue!.setLocked).toBe('function')
    expect(typeof contextValue!.splitPane).toBe('function')
    expect(typeof contextValue!.updateSplitPercentage).toBe('function')
    expect(typeof contextValue!.moveTab).toBe('function')
  })

  it('should pass tab metadata to Pane.Content render callback', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1'],
      activeTabId: 'tab-1',
      tabsMetadata: {
        'tab-1': { title: 'My Tab Title', customProp: 42 },
      },
    }

    let receivedMetadata: Record<string, unknown> | undefined = undefined

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <div data-testid="pane-root">
            <Pane.Content>
              {(tab) => {
                receivedMetadata = tab.metadata
                return <div data-testid="tab-content">{tab.id} Content</div>
              }}
            </Pane.Content>
          </div>
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    expect(screen.getByTestId('tab-content')).toBeDefined()
    expect(receivedMetadata).toEqual({ title: 'My Tab Title', customProp: 42 })
  })

  it('should successfully provide context using Zeugma and nested Zeugma component', () => {
    let contextValue: ZeugmaController | null = null
    const ConsumerComponent = () => {
      contextValue = useZeugmaContext()
      return <div data-testid="child">Child Component</div>
    }

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <ConsumerComponent />
        </Pane>
      )
      return (
        <Zeugma controller={controller} renderPane={renderPane}>
          <div data-testid="toolbar">Toolbar</div>
          <Zeugma />
        </Zeugma>
      )
    }

    render(<TestWrapper />)

    expect(screen.getByTestId('toolbar')).toBeDefined()
    expect(screen.getByTestId('child')).toBeDefined()
    expect(contextValue).not.toBeNull()
    expect(contextValue!.layout).toEqual(initialLayout)
  })

  it('should throw error when Zeugma is used standalone without controller', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      render(<Zeugma />)
    }).toThrow('Zeugma component requires a controller when used standalone.')
    consoleErrorSpy.mockRestore()
  })
})

describe('Tab Drop Preview rendering', () => {
  beforeEach(() => {
    vi.spyOn(dndKitCore, 'useDroppable').mockReturnValue({
      setNodeRef: () => {},
      isOver: true,
      node: { current: null },
      rect: { current: null },
      active: null,
      over: null,
    })
    vi.spyOn(dndKitCore, 'useDraggable').mockReturnValue({
      setNodeRef: () => {},
      listeners: undefined,
      attributes: {},
      isDragging: false,
      transform: null,
      node: { current: null },
    } as unknown as ReturnType<typeof dndKitCore.useDraggable>)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const defaultState = {
    layout: null,
    setLayout: () => {},
    activeId: 'tab-1',
    activeType: 'tab' as const,
    dismissIntentId: null,
    setContainerRef: () => {},
    fullscreenPaneId: null,
    classNames: {
      tabDropPreview: 'custom-drop-preview',
    },
    locked: false,
    setLocked: () => {},
    findPaneById: () => null,
    findPaneContainingTab: () => null,
    findTabById: () => null,
    getTabMetadata: () => undefined,
    getActiveTabMetadata: () => undefined,
    renderPane: () => null,
  }

  it('should render the drop preview indicator before the target tab when position is before', () => {
    const dragValue = {
      overTabId: 'tab-2',
      overTabPosition: 'before' as const,
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabs={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('position: absolute')
    expect(indicator?.getAttribute('style')).toContain('transform: translateX(-50%)')

    // It should be inside a parent that has relative position and width 0
    const parent = indicator?.parentElement
    expect(parent?.getAttribute('style')).toContain('position: relative')
    expect(parent?.getAttribute('style')).toContain('width: 0')
  })

  it('should render the drop preview indicator after the target tab when position is after', () => {
    const dragValue = {
      overTabId: 'tab-1',
      overTabPosition: 'after' as const, // index 1 (between tab-1 and tab-2)
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabs={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('transform: translateX(-50%)')
  })

  it('should render the drop preview indicator with none transform when position is before the first tab', () => {
    const dragValue = {
      overTabId: 'tab-1',
      overTabPosition: 'before' as const, // index 0 (very beginning)
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabs={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('transform: none')
  })

  it('should render the drop preview indicator with translateX(-100%) transform when position is after the last tab', () => {
    const dragValue = {
      overTabId: 'tab-2',
      overTabPosition: 'after' as const, // index 2 (very end)
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabs={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('transform: translateX(-100%)')
  })

  it('should not render the drop preview indicator when overTabId is not in the tabs list', () => {
    const dragValue = {
      overTabId: 'tab-3',
      overTabPosition: 'before' as const,
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabs={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).toBeNull()
  })
})
