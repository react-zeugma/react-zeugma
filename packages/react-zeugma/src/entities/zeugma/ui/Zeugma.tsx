import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  pointerWithin,
  closestCenter,
  CollisionDetection,
  DroppableContainer,
} from '@dnd-kit/core'
import { TreeNode, SplitDirection, SplitNode, PaneNode } from '../../../shared/model'
import {
  removePane,
  removeTab,
  splitPane,
  addPane,
  updateSplitPercentage,
  updateTabMetadata,
  findPane,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  generateUniqueId,
} from '../../../shared/lib/tree'
import { DEFAULT_DRAG_ACTIVATION_DISTANCE, DEFAULT_SNAP_THRESHOLD } from '../../../shared/config'
import {
  ZeugmaStateContext,
  ZeugmaActionsContext,
  PortalRegistryContext,
  useLatestPointer,
  useBodyCursorOverride,
  usePortalRegistry,
} from '../model'
import { ZeugmaProps } from '../model/types'
import { CursorOverlay } from './CursorOverlay'
import { SmartPointerSensor, SmartTouchSensor } from '../lib/sensors'

function getPointerCoordinates(event: Event): { x: number; y: number } | null {
  if (event instanceof MouseEvent || event instanceof PointerEvent) {
    return { x: event.clientX, y: event.clientY }
  }
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const touch = event.touches[0] || event.changedTouches[0]
    if (touch) {
      return { x: touch.clientX, y: touch.clientY }
    }
  }
  return null
}

export const Zeugma: React.FC<ZeugmaProps> = ({
  layout,
  onChange,
  renderPane,
  renderWidget,
  renderDragOverlay,
  classNames = {},
  fullscreenPaneId = null,
  onFullscreenChange,
  onRemove,
  dragActivationDistance = DEFAULT_DRAG_ACTIVATION_DISTANCE,
  snapThreshold = DEFAULT_SNAP_THRESHOLD,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResize,
  onResizeEnd,
  minSplitPercentage = 5,
  maxSplitPercentage = 95,
  enableDragToDismiss = false,
  dismissThreshold = 60,
  onDismissIntentChange,
  locked = false,
  children,
}) => {
  const [localLayout, setLocalLayout] = useState<TreeNode | null>(layout)
  const [prevLayout, setPrevLayout] = useState<TreeNode | null>(layout)

  if (layout !== prevLayout) {
    setPrevLayout(layout)
    setLocalLayout(layout)
  }

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'pane' | 'tab' | null>(null)
  const [dismissIntentId, setDismissIntentId] = useState<string | null>(null)

  const { portalTargets, registerPortalTarget } = usePortalRegistry()
  const containerRef = useRef<HTMLElement | null>(null)
  const containerRectRef = useRef<DOMRect | null>(null)
  const latestPointerRef = useLatestPointer(activeId)

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element
  }, [])

  const [isOverLocked, setIsOverLocked] = useState(false)

  useBodyCursorOverride(isOverLocked)

  // Stable renderPane wrapper — immune to consumer passing inline functions
  const stableRenderPane = useCallback((paneId: string) => renderPane(paneId), [renderPane])

  // Shallow-memoize classNames by individual fields to avoid identity busting from inline objects
  const stableClassNames = useMemo(
    () => classNames,
    [
      classNames.pane,
      classNames.paneLocked,
      classNames.dropPreview,
      classNames.dragOverlay,
      classNames.resizer,
      classNames.dismissPreview,
      classNames.dashboardLocked,
      classNames.lockedPreview,
    ],
  )

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: dragActivationDistance },
    }),
    useSensor(SmartTouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  )

  const customCollisionDetection = useCallback<CollisionDetection>((args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) return pointerCollisions

    const activeId = args.active.id.toString()
    if (activeId.startsWith('tab-header-')) {
      const tabDroppables = args.droppableContainers.filter((container: DroppableContainer) =>
        container.id.toString().startsWith('tab-drop-'),
      )
      return closestCenter({ ...args, droppableContainers: tabDroppables })
    }
    return []
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const rawId = event.active.id.toString()
    const isTabDrag = rawId.startsWith('tab-header-')
    const draggingId = isTabDrag ? rawId.substring(11) : rawId
    setActiveId(draggingId)
    setActiveType(isTabDrag ? 'tab' : 'pane')

    const ae = event.activatorEvent
    latestPointerRef.current = getPointerCoordinates(ae)

    if (enableDragToDismiss && containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect()
    } else {
      containerRectRef.current = null
    }
    if (onDragStart) {
      onDragStart(draggingId)
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { over } = event
    const overIdStr = over?.id.toString() || ''
    const isOverLockedPane = overIdStr.startsWith('drop-locked-')
    setIsOverLocked(isOverLockedPane)

    if (!enableDragToDismiss) return

    const rawId = event.active.id.toString()
    const isTabDrag = rawId.startsWith('tab-header-')
    const draggingId = isTabDrag ? rawId.substring(11) : rawId
    const containerRect = containerRectRef.current

    if (!containerRect) {
      if (dismissIntentId !== null) {
        setDismissIntentId(null)
        onDismissIntentChange?.(null)
      }
      return
    }

    const ae = event.activatorEvent
    let px: number | null = null
    let py: number | null = null

    if (latestPointerRef.current) {
      px = latestPointerRef.current.x
      py = latestPointerRef.current.y
    } else {
      const coords = getPointerCoordinates(ae)
      if (coords) {
        px = coords.x + event.delta.x
        py = coords.y + event.delta.y
      }
    }

    let distance = 0
    if (px !== null && py !== null) {
      let dx = 0
      let dy = 0

      if (px < containerRect.left) {
        dx = containerRect.left - px
      } else if (px > containerRect.right) {
        dx = px - containerRect.right
      }

      if (py < containerRect.top) {
        dy = containerRect.top - py
      } else if (py > containerRect.bottom) {
        dy = py - containerRect.bottom
      }

      distance = Math.sqrt(dx * dx + dy * dy)
    } else {
      const activeRect = event.active.rect.current.translated
      if (activeRect) {
        const cx = activeRect.left + activeRect.width / 2
        const cy = activeRect.top + activeRect.height / 2
        let dx = 0
        let dy = 0

        if (cx < containerRect.left) {
          dx = containerRect.left - cx
        } else if (cx > containerRect.right) {
          dx = cx - containerRect.right
        }

        if (cy < containerRect.top) {
          dy = containerRect.top - cy
        } else if (cy > containerRect.bottom) {
          dy = cy - containerRect.bottom
        }

        distance = Math.sqrt(dx * dx + dy * dy)
      }
    }

    const isDismissIntent = distance > dismissThreshold
    if (isDismissIntent) {
      if (dismissIntentId !== draggingId) {
        setDismissIntentId(draggingId)
        onDismissIntentChange?.(draggingId)
      }
    } else {
      if (dismissIntentId !== null) {
        setDismissIntentId(null)
        onDismissIntentChange?.(null)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    setActiveType(null)
    setIsOverLocked(false)
    const { active, over } = event
    const rawId = active.id.toString()
    const isTabDrag = rawId.startsWith('tab-header-')
    const draggingId = isTabDrag ? rawId.substring(11) : rawId

    const wasDismissIntent = enableDragToDismiss && dismissIntentId === draggingId

    setDismissIntentId(null)
    onDismissIntentChange?.(null)
    containerRectRef.current = null

    if (wasDismissIntent) {
      if (onRemove) {
        onRemove(draggingId)
      } else {
        handleRemoveTab(draggingId)
      }

      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    if (!over) {
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const overIdStr = over.id.toString()

    if (overIdStr.startsWith('drop-locked-')) {
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    // Check for tab reorder drop
    const tabDropMatch = overIdStr.match(/^tab-drop-(.+)$/)
    if (tabDropMatch) {
      const [, targetTabId] = tabDropMatch
      if (draggingId !== targetTabId) {
        let position: 'before' | 'after' = 'before'
        const overRect = over.rect
        const ae = event.activatorEvent
        let px: number | null = null
        if (latestPointerRef.current) {
          px = latestPointerRef.current.x
        } else {
          const coords = getPointerCoordinates(ae)
          if (coords) {
            px = coords.x + event.delta.x
          }
        }

        if (px !== null) {
          const center = overRect.left + overRect.width / 2
          if (px > center) {
            position = 'after'
          }
        }

        const newLayout = moveTab(localLayout, draggingId, targetTabId, position)
        setLocalLayout(newLayout)
        onChange(newLayout)
      }
      if (onDragEnd) {
        onDragEnd(draggingId, targetTabId, { type: 'swap', position: 'center' })
      }
      return
    }

    // Check for edge (split) drop
    const match = overIdStr.match(/^drop-(left|right|top|bottom)-(.+)$/)
    if (!match) {
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const [, dropZone, targetId] = match
    const parentPane = findPane(localLayout, draggingId)
    const isParentTarget = parentPane && parentPane.id === targetId
    const isOnlyTab = parentPane && parentPane.tabs.length === 1

    if (draggingId === targetId || (isParentTarget && isOnlyTab)) {
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const direction: SplitDirection = dropZone === 'left' || dropZone === 'right' ? 'row' : 'column'

    let draggedPaneNode: PaneNode
    if (isTabDrag) {
      const originalPane = findPane(localLayout, draggingId)
      const sourceMetadata = originalPane?.tabsMetadata?.[draggingId]
      draggedPaneNode = {
        type: 'pane',
        id: generateUniqueId(),
        tabs: [draggingId],
        activeTabId: draggingId,
        tabsMetadata: sourceMetadata ? { [draggingId]: sourceMetadata } : undefined,
      }
    } else {
      draggedPaneNode = findPane(localLayout, draggingId) ?? {
        type: 'pane',
        id: generateUniqueId(),
        tabs: [draggingId],
        activeTabId: draggingId,
      }
    }

    const treeWithoutDragging = isTabDrag
      ? removeTab(localLayout, draggingId)
      : removePane(localLayout, draggingId)

    const newLayout = splitPane(
      treeWithoutDragging,
      targetId,
      direction,
      dropZone as 'left' | 'right' | 'top' | 'bottom',
      draggedPaneNode,
    )
    setLocalLayout(newLayout)
    onChange(newLayout)
    if (onDragEnd) {
      onDragEnd(draggingId, targetId, {
        type: 'split',
        direction,
        position: dropZone as 'left' | 'right' | 'top' | 'bottom',
      })
    }
  }

  const handleLocalLayoutChange = useCallback(
    (newLayout: TreeNode | null, localOnly = false) => {
      setLocalLayout(newLayout)
      if (!localOnly) {
        onChange(newLayout)
      }
    },
    [onChange],
  )

  const handleRemovePane = useCallback(
    (paneId: string) => {
      const newLayout = removePane(localLayout, paneId)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleAddPane = useCallback(
    (paneId: string) => {
      const newLayout = addPane(localLayout, paneId)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleSplitPane = useCallback(
    (
      targetId: string,
      direction: SplitDirection,
      splitType: 'left' | 'right' | 'top' | 'bottom',
      paneToAdd: string,
    ) => {
      const draggedPaneNode = findPane(localLayout, paneToAdd) ?? {
        type: 'pane',
        id: paneToAdd,
        tabs: [paneToAdd],
        activeTabId: paneToAdd,
      }
      const treeWithoutDragging = removePane(localLayout, paneToAdd)
      const newLayout = splitPane(
        treeWithoutDragging,
        targetId,
        direction,
        splitType,
        draggedPaneNode,
      )
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleSelectTab = useCallback(
    (paneId: string, tabId: string) => {
      const newLayout = selectTab(localLayout, paneId, tabId)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleMergeTab = useCallback(
    (draggedTabId: string, targetPaneId: string) => {
      const newLayout = mergeTab(localLayout, draggedTabId, targetPaneId)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleMoveTab = useCallback(
    (draggedTabId: string, targetTabId: string, position?: 'before' | 'after') => {
      const newLayout = moveTab(localLayout, draggedTabId, targetTabId, position)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleRemoveTab = useCallback(
    (tabId: string) => {
      const newLayout = removeTab(localLayout, tabId)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleUpdateSplitPercentage = useCallback(
    (currentNode: SplitNode, percentage: number) => {
      const newLayout = updateSplitPercentage(localLayout, currentNode, percentage)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleUpdateTabMetadata = useCallback(
    (
      tabId: string,
      updater: (
        current: Record<string, unknown> | undefined,
      ) => Record<string, unknown> | undefined,
    ) => {
      const newLayout = updateTabMetadata(localLayout, tabId, updater)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleUpdatePaneLock = useCallback(
    (paneId: string, isLocked: boolean) => {
      const newLayout = updatePaneLock(localLayout, paneId, isLocked)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleResizeEnd = useCallback(
    (currentNode: SplitNode, percentage: number) => {
      if (onResizeEnd) {
        onResizeEnd(currentNode, percentage)
      }
    },
    [onResizeEnd],
  )

  // State context — reactive values that change during runtime
  const stateValue = useMemo(
    () => ({
      layout: localLayout,
      onLayoutChange: handleLocalLayoutChange,
      renderPane: stableRenderPane,
      activeId,
      dismissIntentId,
      setContainerRef,
      fullscreenPaneId,
      classNames: stableClassNames,
      onRemove,
      onFullscreenChange,
      snapThreshold,
      onResizeStart,
      onResize,
      onResizeEnd: handleResizeEnd,
      minSplitPercentage,
      maxSplitPercentage,
      locked,
    }),
    [
      localLayout,
      activeId,
      dismissIntentId,
      setContainerRef,
      fullscreenPaneId,
      stableClassNames,
      onRemove,
      onFullscreenChange,
      snapThreshold,
      onResizeStart,
      onResize,
      minSplitPercentage,
      maxSplitPercentage,
      handleLocalLayoutChange,
      stableRenderPane,
      handleResizeEnd,
      locked,
    ],
  )

  // Actions context — stable dispatch functions that never change identity
  const actionsValue = useMemo(
    () => ({
      removePane: handleRemovePane,
      addPane: handleAddPane,
      splitPane: handleSplitPane,
      updateSplitPercentage: handleUpdateSplitPercentage,
      updateTabMetadata: handleUpdateTabMetadata,
      updatePaneLock: handleUpdatePaneLock,
      selectTab: handleSelectTab,
      mergeTab: handleMergeTab,
      moveTab: handleMoveTab,
      removeTab: handleRemoveTab,
    }),
    [
      handleRemovePane,
      handleAddPane,
      handleSplitPane,
      handleUpdateSplitPercentage,
      handleUpdateTabMetadata,
      handleUpdatePaneLock,
      handleSelectTab,
      handleMergeTab,
      handleMoveTab,
      handleRemoveTab,
    ],
  )

  // Collect all tab IDs in the current layout tree
  const allTabIds = useMemo(() => {
    const ids: string[] = []
    function traverse(node: TreeNode | null) {
      if (!node) return
      if (node.type === 'pane') {
        ids.push(...node.tabs)
      } else {
        traverse(node.first)
        traverse(node.second)
      }
    }
    traverse(localLayout)
    return ids
  }, [localLayout])

  const portalRegistryValue = useMemo(
    () => ({
      registerPortalTarget,
    }),
    [registerPortalTarget],
  )

  return (
    <ZeugmaActionsContext.Provider value={actionsValue}>
      <ZeugmaStateContext.Provider value={stateValue}>
        <PortalRegistryContext.Provider value={portalRegistryValue}>
          <DndContext
            id="zeugma-dnd-context"
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            {children}
          </DndContext>
          {activeId && activeType && renderDragOverlay && (
            <CursorOverlay
              activeId={activeId}
              render={(id) => renderDragOverlay(id, activeType)}
              className={`${classNames.dragOverlay || ''} ${
                activeId === dismissIntentId
                  ? classNames.dismissPreview || 'zeugma-dismiss-preview'
                  : ''
              }`.trim()}
            />
          )}
          {/* Transparent Portal Host to preserve widget state across pane drags */}
          <div id="zeugma-portal-host" style={{ display: 'none' }}>
            {allTabIds.map((tabId) => (
              <PortalHostItem
                key={tabId}
                tabId={tabId}
                target={portalTargets[tabId] || null}
                renderWidget={renderWidget}
              />
            ))}
          </div>
        </PortalRegistryContext.Provider>
      </ZeugmaStateContext.Provider>
    </ZeugmaActionsContext.Provider>
  )
}

interface PortalHostItemProps {
  tabId: string
  target: HTMLDivElement | null
  renderWidget?: (tabId: string) => React.ReactNode
}

const PortalHostItem: React.FC<PortalHostItemProps> = ({ tabId, target, renderWidget }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  if (!wrapperRef.current && typeof window !== 'undefined') {
    wrapperRef.current = document.createElement('div')
    wrapperRef.current.className = `zeugma-portal-wrapper-${tabId}`
    wrapperRef.current.style.width = '100%'
    wrapperRef.current.style.height = '100%'
  }

  const wrapper = wrapperRef.current

  // Move the stable wrapper in the DOM when the target pane element changes
  useEffect(() => {
    if (!wrapper) return

    if (target) {
      target.appendChild(wrapper)
    } else {
      let hiddenContainer = document.getElementById('zeugma-hidden-portal-container')
      if (!hiddenContainer) {
        hiddenContainer = document.createElement('div')
        hiddenContainer.id = 'zeugma-hidden-portal-container'
        hiddenContainer.style.display = 'none'
        document.body.appendChild(hiddenContainer)
      }
      hiddenContainer.appendChild(wrapper)
    }
  }, [target, wrapper])

  // Clean up the DOM element on unmount
  useEffect(() => {
    return () => {
      if (wrapperRef.current) {
        wrapperRef.current.remove()
      }
    }
  }, [])

  if (!wrapper || !renderWidget) return null

  return createPortal(renderWidget(tabId), wrapper)
}
