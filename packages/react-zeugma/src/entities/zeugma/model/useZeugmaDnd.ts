import { useState, useRef, useCallback, Dispatch, SetStateAction } from 'react'
import {
  useSensor,
  useSensors,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  pointerWithin,
  closestCenter,
  CollisionDetection,
  DroppableContainer,
} from '@dnd-kit/core'
import { SplitDirection, PaneNode, ZeugmaInternalController } from '../../../shared'
import {
  removePane as removePaneHelper,
  removeTab as removeTabHelper,
  splitPane as splitPaneHelper,
  findPaneById,
  findPaneContainingTab,
  generateUniqueId,
} from '../../../shared/lib/tree'
import { SmartPointerSensor, SmartTouchSensor } from '../lib/sensors'
import { useLatestPointer, useBodyCursorOverride } from './hooks'

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

interface UseZeugmaDndProps extends ZeugmaInternalController {
  setOverTabId: Dispatch<SetStateAction<string | null>>
  setOverTabPosition: Dispatch<SetStateAction<'before' | 'after' | null>>
}

export function useZeugmaDnd(props: UseZeugmaDndProps) {
  const {
    layout,
    setLayout,
    activeId,
    setActiveId,
    setActiveType,
    dismissIntentId,
    setDismissIntentId,
    setOverTabId,
    setOverTabPosition,
    containerRef,

    // Config
    dragActivationDistance,
    enableDragToDismiss,
    dismissThreshold,

    // Callbacks
    onRemove,
    onDragStart,
    onDragEnd,
    onDismissIntentChange,

    // Actions
    removeTab,
    moveTab,
    selectTab,
  } = props

  const containerRectRef = useRef<DOMRect | null>(null)
  const latestPointerRef = useLatestPointer(activeId)

  const [isOverLocked, setIsOverLocked] = useState(false)
  useBodyCursorOverride(isOverLocked)

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

    const activeIdStr = args.active.id.toString()
    if (activeIdStr.startsWith('tab-header-')) {
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
    setOverTabId(null)
    setOverTabPosition(null)

    const ae = event.activatorEvent
    latestPointerRef.current = getPointerCoordinates(ae)

    if (enableDragToDismiss && containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect()
    } else {
      containerRectRef.current = null
    }

    if (isTabDrag) {
      const parentPane = findPaneContainingTab(layout, draggingId)
      if (parentPane) {
        selectTab(parentPane.id, draggingId)
      }
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

    // Handle tab drop hover location
    const tabDropMatch = overIdStr.match(/^tab-drop-(.+)$/)
    if (tabDropMatch && over) {
      const [, targetTabId] = tabDropMatch
      const rawId = event.active.id.toString()
      const isTabDrag = rawId.startsWith('tab-header-')
      const draggingId = isTabDrag ? rawId.substring(11) : rawId

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

        setOverTabId(targetTabId)
        setOverTabPosition(position)
      } else {
        setOverTabId(null)
        setOverTabPosition(null)
      }
    } else {
      setOverTabId(null)
      setOverTabPosition(null)
    }

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
    setOverTabId(null)
    setOverTabPosition(null)
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
        removeTab(draggingId)
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

        moveTab(draggingId, targetTabId, position)
        if (onDragEnd) {
          onDragEnd(draggingId, targetTabId, { type: 'move', position: 'center' })
        }
      } else {
        if (onDragEnd) {
          onDragEnd(draggingId, null, null)
        }
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
    const parentPane = isTabDrag
      ? findPaneContainingTab(layout, draggingId)
      : findPaneById(layout, draggingId)
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
      const originalPane = findPaneContainingTab(layout, draggingId)
      const sourceMetadata = originalPane?.tabsMetadata?.[draggingId]
      draggedPaneNode = {
        type: 'pane',
        id: generateUniqueId(),
        tabs: [draggingId],
        activeTabId: draggingId,
        tabsMetadata: sourceMetadata ? { [draggingId]: sourceMetadata } : undefined,
      }
    } else {
      draggedPaneNode = findPaneById(layout, draggingId) ?? {
        type: 'pane',
        id: generateUniqueId(),
        tabs: [draggingId],
        activeTabId: draggingId,
      }
    }

    const treeWithoutDragging = isTabDrag
      ? removeTabHelper(layout, draggingId)
      : removePaneHelper(layout, draggingId)

    const newLayout = splitPaneHelper(
      treeWithoutDragging,
      targetId,
      direction,
      dropZone as 'left' | 'right' | 'top' | 'bottom',
      draggedPaneNode,
    )
    setLayout(newLayout)
    if (onDragEnd) {
      onDragEnd(draggingId, targetId, {
        type: 'split',
        direction,
        position: dropZone as 'left' | 'right' | 'top' | 'bottom',
      })
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveType(null)
    setIsOverLocked(false)
    setOverTabId(null)
    setOverTabPosition(null)
    setDismissIntentId(null)
    onDismissIntentChange?.(null)
    containerRectRef.current = null
  }

  return {
    sensors,
    collisionDetection: customCollisionDetection,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  }
}
