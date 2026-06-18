import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useZeugmaDnd } from './useZeugmaDnd'
import type { ZeugmaController } from '../../../shared'
import * as dndKitCore from '@dnd-kit/core'

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const original = await importOriginal<typeof dndKitCore>()
  return {
    ...original,
    pointerWithin: vi.fn(),
  }
})

describe('useZeugmaDnd Hook', () => {
  const mockController = (): ZeugmaController => ({
    layout: {
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    },
    setLayout: vi.fn(),
    layoutBeforeDrag: null,
    setLayoutBeforeDrag: vi.fn(),
    activeId: null,
    setActiveId: vi.fn(),
    activeType: null,
    setActiveType: vi.fn(),
    dismissIntentId: null,
    setDismissIntentId: vi.fn(),
    fullscreenPaneId: null,
    setFullscreenPaneId: vi.fn(),
    locked: false,
    setLocked: vi.fn(),
    containerRef: { current: null },
    setContainerRef: vi.fn(),
    dragActivationDistance: 8,
    snapThreshold: 8,
    minSplitPercentage: 5,
    maxSplitPercentage: 95,
    enableDragToDismiss: false,
    dismissThreshold: 60,
    removePane: vi.fn(),
    addPane: vi.fn(),
    addTab: vi.fn(),
    updateTabMetadata: vi.fn(),
    updatePaneLock: vi.fn(),
    selectTab: vi.fn(),
    mergeTab: vi.fn(),
    removeTab: vi.fn(),
    splitPane: vi.fn(),
    updateSplitPercentage: vi.fn(),
    moveTab: vi.fn(),
    findPaneById: vi.fn(),
    findPaneContainingTab: vi.fn(),
    findTabById: vi.fn(),
  })

  it('should filter out tab drop zones in collision detection when dragging a pane', () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const { result } = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    const collisionDetection = result.current.collisionDetection

    // Simulate pointerWithin returning a set of collisions
    const mockCollisions = [{ id: 'tab-drop-tab-1' }, { id: 'drop-left-pane-2' }]
    vi.mocked(dndKitCore.pointerWithin).mockReturnValue(mockCollisions as dndKitCore.Collision[])

    // Scenario A: Active drag is a tab (tab-header-tab-1)
    const tabArgs = {
      active: { id: 'tab-header-tab-1' },
      droppableContainers: [],
    } as unknown as Parameters<dndKitCore.CollisionDetection>[0]
    const tabResult = collisionDetection(tabArgs)
    expect(tabResult).toEqual(mockCollisions) // For tab drag, we don't filter out tab-drop zones

    // Scenario B: Active drag is a pane (pane-1)
    const paneArgs = {
      active: { id: 'pane-1' },
      droppableContainers: [],
    } as unknown as Parameters<dndKitCore.CollisionDetection>[0]
    const paneResult = collisionDetection(paneArgs)
    expect(paneResult).toEqual([{ id: 'drop-left-pane-2' }]) // For pane drag, tab-drop-tab-1 is filtered out
  })

  it('should not trigger moveTab when dropping a pane on a tab-drop zone', () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const onDragEndMock = vi.fn()
    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
        onDragEnd: onDragEndMock,
      }),
    )

    const handleDragEnd = hookInstance.result.current.onDragEnd

    // Simulate dragging a pane (isTabDrag = false) and dropping it over a tab drop zone
    const paneDragEndEvent = {
      active: { id: 'pane-1' },
      over: { id: 'tab-drop-tab-2' },
    } as unknown as dndKitCore.DragEndEvent

    handleDragEnd(paneDragEndEvent)

    // Verify moveTab is NOT called
    expect(controller.moveTab).not.toHaveBeenCalled()
    // Verify onDragEnd callback is called with nulls
    expect(onDragEndMock).toHaveBeenCalledWith('pane-1', null, null)
  })

  it('should trigger moveTab when dropping a tab on a tab-drop zone', () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const onDragEndMock = vi.fn()
    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
        onDragEnd: onDragEndMock,
      }),
    )

    const handleDragEnd = hookInstance.result.current.onDragEnd

    // Simulate dragging a tab (isTabDrag = true) and dropping it over a tab drop zone
    const tabDragEndEvent = {
      active: { id: 'tab-header-tab-1' },
      over: {
        id: 'tab-drop-tab-2',
        rect: {
          width: 100,
          height: 0,
          top: 0,
          bottom: 0,
          left: 0,
          right: 100,
        },
        data: {},
        disabled: false,
        node: { current: null },
      },
      activatorEvent: new MouseEvent('mouseup'),
      delta: { x: 10, y: 0 },
    } as unknown as dndKitCore.DragEndEvent

    handleDragEnd(tabDragEndEvent)

    // Verify setLayout IS called with the expected layout
    expect(controller.setLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
      tabsMetadata: undefined,
    })
    expect(onDragEndMock).toHaveBeenCalledWith('tab-1', 'tab-2', {
      type: 'move',
      position: 'center',
    })
  })

  it('should not change the layout on drag start, but set layoutBeforeDrag, and restore/clear state on cancel or invalid drop', async () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    // 1. Start drag for tab-1
    const dragStartEvent = {
      active: { id: 'tab-header-tab-1' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent

    hookInstance.result.current.onDragStart(dragStartEvent)

    // Verify setLayoutBeforeDrag was called with original layout
    expect(controller.setLayoutBeforeDrag).toHaveBeenCalledWith(controller.layout)
    // Verify setLayout was NOT called
    expect(controller.setLayout).not.toHaveBeenCalled()

    // Mock controller state during drag (layoutBeforeDrag has original layout, layout is unchanged)
    const controllerWithDragState = {
      ...controller,
      layoutBeforeDrag: controller.layout,
    }

    const hookWithDragState = renderHook(() =>
      useZeugmaDnd({
        ...controllerWithDragState,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    // 2. Drag cancel should restore layout
    hookWithDragState.result.current.onDragCancel()
    expect(controllerWithDragState.setLayout).toHaveBeenCalledWith(
      controllerWithDragState.layoutBeforeDrag,
    )
    expect(controllerWithDragState.setLayoutBeforeDrag).toHaveBeenCalledWith(null)

    // Reset mocks for the next scenario
    vi.mocked(controllerWithDragState.setLayout).mockClear()
    vi.mocked(controllerWithDragState.setLayoutBeforeDrag).mockClear()

    // 3. Invalid drop (no over target) should restore layout
    const dragEndEventNoOver = {
      active: { id: 'tab-header-tab-1' },
      over: null,
    } as unknown as dndKitCore.DragEndEvent

    hookWithDragState.result.current.onDragEnd(dragEndEventNoOver)
    expect(controllerWithDragState.setLayout).toHaveBeenCalledWith(
      controllerWithDragState.layoutBeforeDrag,
    )
    expect(controllerWithDragState.setLayoutBeforeDrag).toHaveBeenCalledWith(null)
  })

  it('should set an inactive tab as active on drag start', async () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    // Start drag for tab-2 (which is inactive, layout has activeTabId: 'tab-1')
    const dragStartEvent = {
      active: { id: 'tab-header-tab-2' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent

    hookInstance.result.current.onDragStart(dragStartEvent)

    // Verify setLayoutBeforeDrag was called with the selected layout (where tab-2 is active)
    expect(controller.setLayoutBeforeDrag).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-2',
    })
    // Verify setLayout was called to set it active
    expect(controller.setLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabs: ['tab-1', 'tab-2'],
      activeTabId: 'tab-2',
    })
  })
})
