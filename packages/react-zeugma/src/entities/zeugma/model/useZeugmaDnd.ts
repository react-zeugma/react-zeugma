import { useState, useRef, Dispatch, SetStateAction } from 'react'
import { useSensor, useSensors, DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core'
import { SplitDirection, TreeNode, PaneNode } from '../../../shared'
import {
  removePane as removePaneHelper,
  removeTab as removeTabHelper,
  splitPane as splitPaneHelper,
  findPaneById,
  findPaneContainingTab,
  generateUniqueId,
  moveTab as moveTabHelper,
  selectTab as selectTabHelper,
  movePaneTabs,
} from '../../../shared/lib/tree'
import { SmartPointerSensor, SmartTouchSensor } from '../lib/sensors'
import { useLatestPointer, useBodyCursorOverride } from './hooks'
import { customCollisionDetection } from '../lib/collisions'

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

interface UseZeugmaDndProps {
  layout: TreeNode | null
  _internalSetLayout: Dispatch<SetStateAction<TreeNode | null>>
  setLayout: (nextLayout: SetStateAction<TreeNode | null>) => void
  activeId: string | null
  setActiveId: Dispatch<SetStateAction<string | null>>
  activeType: 'pane' | 'tab' | null
  setActiveType: Dispatch<SetStateAction<'pane' | 'tab' | null>>
  dismissIntentId: string | null
  setDismissIntentId: Dispatch<SetStateAction<string | null>>
  setOverTabId: Dispatch<SetStateAction<string | null>>
  setOverTabPosition: Dispatch<SetStateAction<'before' | 'after' | null>>
  containerRef: React.RefObject<HTMLElement | null>

  // Config
  dragActivationDistance: number
  enableDragToDismiss: boolean
  dismissThreshold: number

  // Callbacks
  onRemove?: (paneId: string) => void
  onDragStart?: (activeId: string) => void
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'move'
      direction?: SplitDirection
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
  onDismissIntentChange?: (paneId: string | null) => void

  // Actions
  removeTab: (tabId: string) => void
  removePane: (paneId: string) => void
}

export function useZeugmaDnd(props: UseZeugmaDndProps) {
  const {
    layout,
    _internalSetLayout,
    setLayout,
    activeId,
    setActiveId,
    activeType,
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
    removePane,
  } = props

  const containerRectRef = useRef<DOMRect | null>(null)
  const latestPointerRef = useLatestPointer(activeId)
  const initialLayoutForDragRef = useRef<TreeNode | null>(null)

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

    let layoutAfterSelect = layout
    if (isTabDrag) {
      const parentPane = findPaneContainingTab(layout, draggingId)
      if (parentPane) {
        layoutAfterSelect = selectTabHelper(layout, parentPane.id, draggingId) || layout
      }
    }
    initialLayoutForDragRef.current = layoutAfterSelect

    const layoutAfterRemove = isTabDrag
      ? removeTabHelper(layoutAfterSelect, draggingId)
      : removePaneHelper(layoutAfterSelect, draggingId)
    _internalSetLayout(layoutAfterRemove)

    if (onDragStart) {
      onDragStart(draggingId)
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { over } = event
    const overIdStr = over?.id.toString() || ''
    const isOverLockedPane = overIdStr.startsWith('drop-locked-')
    setIsOverLocked((prev) => (prev === isOverLockedPane ? prev : isOverLockedPane))

    const rawId = event.active.id.toString()
    const isTabDrag = rawId.startsWith('tab-header-')
    const draggingId = isTabDrag ? rawId.substring(11) : rawId

    // Handle tab drop hover location
    const tabDropMatch = overIdStr.match(/^tab-drop-(.+)$/)
    if (tabDropMatch && over && (isTabDrag || activeType === 'pane')) {
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

        setOverTabId((prev) => (prev === targetTabId ? prev : targetTabId))
        setOverTabPosition((prev) => (prev === position ? prev : position))
      } else {
        setOverTabId((prev) => (prev === null ? prev : null))
        setOverTabPosition((prev) => (prev === null ? prev : null))
      }
    } else {
      setOverTabId((prev) => (prev === null ? prev : null))
      setOverTabPosition((prev) => (prev === null ? prev : null))
    }

    if (!enableDragToDismiss) return

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

    // Capture the original layout before drag
    const originalLayout = initialLayoutForDragRef.current || layout
    initialLayoutForDragRef.current = null

    if (wasDismissIntent) {
      if (onRemove) {
        onRemove(draggingId)
      } else {
        if (isTabDrag) {
          removeTab(draggingId)
        } else {
          removePane(draggingId)
        }
      }

      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    if (!over) {
      _internalSetLayout(originalLayout)
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const overIdStr = over.id.toString()

    if (overIdStr.startsWith('drop-locked-')) {
      _internalSetLayout(originalLayout)
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    // Check for tab reorder drop
    const tabDropMatch = overIdStr.match(/^tab-drop-(.+)$/)
    if (tabDropMatch) {
      const [, targetTabId] = tabDropMatch
      if (isTabDrag) {
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

          const newLayout = moveTabHelper(originalLayout, draggingId, targetTabId, position)
          setLayout(newLayout)
          if (onDragEnd) {
            onDragEnd(draggingId, targetTabId, { type: 'move', position: 'center' })
          }
        } else {
          _internalSetLayout(originalLayout)
          if (onDragEnd) {
            onDragEnd(draggingId, null, null)
          }
        }
      } else {
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

        const newLayout = movePaneTabs(originalLayout, draggingId, targetTabId, position)
        setLayout(newLayout)
        if (onDragEnd) {
          onDragEnd(draggingId, targetTabId, { type: 'move', position: 'center' })
        }
      }
      return
    }

    // Check for root split drop
    const rootMatch = overIdStr.match(/^drop-root-(1\/4|1\/3)-(top|bottom|left|right|start|end)$/)
    if (rootMatch) {
      const [, fraction, rawEdge] = rootMatch
      let edge = rawEdge
      if (edge === 'start') edge = 'left'
      if (edge === 'end') edge = 'right'

      const cleanLayout = isTabDrag
        ? removeTabHelper(originalLayout, draggingId)
        : removePaneHelper(originalLayout, draggingId)

      let draggedPaneNode: PaneNode
      if (isTabDrag) {
        const originalPane = findPaneContainingTab(originalLayout, draggingId)
        const sourceMetadata = originalPane?.tabsMetadata?.[draggingId]
        draggedPaneNode = {
          type: 'pane',
          id: generateUniqueId(),
          tabIds: [draggingId],
          activeTabId: draggingId,
          tabsMetadata: sourceMetadata ? { [draggingId]: sourceMetadata } : undefined,
        }
      } else {
        draggedPaneNode = findPaneById(originalLayout, draggingId) ?? {
          type: 'pane',
          id: generateUniqueId(),
          tabIds: [draggingId],
          activeTabId: draggingId,
        }
      }

      if (cleanLayout === null) {
        setLayout(draggedPaneNode)
      } else {
        const isRow = edge === 'left' || edge === 'right'
        const isFirst = edge === 'left' || edge === 'top'
        let splitPercentage = 50
        if (fraction === '1/4') {
          splitPercentage = isFirst ? 25 : 75
        } else if (fraction === '1/3') {
          splitPercentage = isFirst ? 100 / 3 : 200 / 3
        }

        const newLayout: TreeNode = {
          type: 'split',
          direction: isRow ? 'row' : 'column',
          first: isFirst ? draggedPaneNode : cleanLayout,
          second: isFirst ? cleanLayout : draggedPaneNode,
          splitPercentage,
        }
        setLayout(newLayout)
      }

      if (onDragEnd) {
        onDragEnd(draggingId, 'root', {
          type: 'split',
          direction: edge === 'left' || edge === 'right' ? 'row' : 'column',
          position: edge as 'left' | 'right' | 'top' | 'bottom',
        })
      }
      return
    }

    // Check for edge (split) drop
    const match = overIdStr.match(/^drop-(left|right|top|bottom)-(.+)$/)
    if (!match) {
      _internalSetLayout(originalLayout)
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const [, dropZone, targetId] = match
    const parentPane = isTabDrag
      ? findPaneContainingTab(originalLayout, draggingId)
      : findPaneById(originalLayout, draggingId)
    const isParentTarget = parentPane && parentPane.id === targetId
    const isOnlyTab = parentPane && parentPane.tabIds.length === 1

    if (draggingId === targetId || (isParentTarget && isOnlyTab)) {
      _internalSetLayout(originalLayout)
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const direction: SplitDirection = dropZone === 'left' || dropZone === 'right' ? 'row' : 'column'

    let draggedPaneNode: PaneNode
    if (isTabDrag) {
      const originalPane = findPaneContainingTab(originalLayout, draggingId)
      const sourceMetadata = originalPane?.tabsMetadata?.[draggingId]
      draggedPaneNode = {
        type: 'pane',
        id: generateUniqueId(),
        tabIds: [draggingId],
        activeTabId: draggingId,
        tabsMetadata: sourceMetadata ? { [draggingId]: sourceMetadata } : undefined,
      }
    } else {
      draggedPaneNode = findPaneById(originalLayout, draggingId) ?? {
        type: 'pane',
        id: generateUniqueId(),
        tabIds: [draggingId],
        activeTabId: draggingId,
      }
    }

    // We need to first remove the dragged tab/pane from the original layout tree before splitting.
    const cleanLayout = isTabDrag
      ? removeTabHelper(originalLayout, draggingId)
      : removePaneHelper(originalLayout, draggingId)

    const newLayout = splitPaneHelper(
      cleanLayout,
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

    const originalLayout = initialLayoutForDragRef.current || layout
    initialLayoutForDragRef.current = null
    _internalSetLayout(originalLayout)
    if (originalLayout !== layout) {
      setLayout(originalLayout)
    }
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
