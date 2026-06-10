import React, { useState, useRef, useMemo, useCallback } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  pointerWithin,
} from '@dnd-kit/core'
import { TreeNode, SplitDirection, SplitNode } from '../../../shared/model'
import {
  removePane,
  splitPane,
  swapPanes,
  addPane,
  updateSplitPercentage,
  updatePaneMetadata,
  findPane,
} from '../../../shared/lib/tree'
import { DEFAULT_DRAG_ACTIVATION_DISTANCE, DEFAULT_SNAP_THRESHOLD } from '../../../shared/config'
import { ZeugmaStateContext, ZeugmaActionsContext } from '../model/context'
import { ZeugmaProps } from '../model/types'
import { CursorOverlay } from './CursorOverlay'
import { SmartPointerSensor, SmartTouchSensor } from '../lib/sensors'

export const Zeugma: React.FC<ZeugmaProps> = ({
  layout,
  onChange,
  renderPane,
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
  children,
}) => {
  const [localLayout, setLocalLayout] = useState<TreeNode | null>(layout)
  const [prevLayout, setPrevLayout] = useState<TreeNode | null>(layout)

  if (layout !== prevLayout) {
    setPrevLayout(layout)
    setLocalLayout(layout)
  }

  const [activeId, setActiveId] = useState<string | null>(null)
  const [dismissIntentId, setDismissIntentId] = useState<string | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const containerRectRef = useRef<DOMRect | null>(null)

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element
  }, [])

  // Stable renderPane wrapper — immune to consumer passing inline functions
  const stableRenderPane = useCallback((paneId: string) => renderPane(paneId), [renderPane])

  // Shallow-memoize classNames by individual fields to avoid identity busting from inline objects
  const stableClassNames = useMemo(
    () => classNames,
    [
      classNames.pane,
      classNames.dropPreview,
      classNames.swapPreview,
      classNames.dragOverlay,
      classNames.resizer,
      classNames.dismissPreview,
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

  const handleDragStart = (event: DragStartEvent) => {
    const draggingId = event.active.id.toString()
    setActiveId(draggingId)
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
    if (!enableDragToDismiss) return

    const draggingId = event.active.id.toString()
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

    if (ae instanceof MouseEvent || ae instanceof PointerEvent) {
      px = ae.clientX + event.delta.x
      py = ae.clientY + event.delta.y
    } else if (typeof TouchEvent !== 'undefined' && ae instanceof TouchEvent) {
      const touch = ae.touches[0] || ae.changedTouches[0]
      if (touch) {
        px = touch.clientX + event.delta.x
        py = touch.clientY + event.delta.y
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
    const { active, over } = event
    const draggingId = active.id.toString()

    const wasDismissIntent = enableDragToDismiss && dismissIntentId === draggingId

    setDismissIntentId(null)
    onDismissIntentChange?.(null)
    containerRectRef.current = null

    if (wasDismissIntent) {
      if (onRemove) {
        onRemove(draggingId)
      } else {
        handleRemovePane(draggingId)
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

    // Check for center (swap) drop
    const swapMatch = overIdStr.match(/^drop-center-(.+)$/)
    if (swapMatch) {
      const [, targetId] = swapMatch
      if (draggingId !== targetId) {
        const newLayout = swapPanes(localLayout, draggingId, targetId)
        setLocalLayout(newLayout)
        onChange(newLayout)
      }
      if (onDragEnd) {
        onDragEnd(draggingId, targetId, { type: 'swap', position: 'center' })
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
    if (draggingId === targetId) {
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const direction: SplitDirection = dropZone === 'left' || dropZone === 'right' ? 'row' : 'column'
    const draggedPaneNode = findPane(localLayout, draggingId) ?? {
      type: 'pane',
      paneId: draggingId,
    }
    const treeWithoutDragging = removePane(localLayout, draggingId)

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
    (newLayout: TreeNode | null) => {
      setLocalLayout(newLayout)
      onChange(newLayout)
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

  const handleSwapPanes = useCallback(
    (paneIdA: string, paneIdB: string) => {
      const newLayout = swapPanes(localLayout, paneIdA, paneIdB)
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
        paneId: paneToAdd,
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

  const handleUpdateSplitPercentage = useCallback(
    (currentNode: SplitNode, percentage: number) => {
      const newLayout = updateSplitPercentage(localLayout, currentNode, percentage)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleUpdatePaneMetadata = useCallback(
    (
      paneId: string,
      updater: (
        current: Record<string, unknown> | undefined,
      ) => Record<string, unknown> | undefined,
    ) => {
      const newLayout = updatePaneMetadata(localLayout, paneId, updater)
      setLocalLayout(newLayout)
      onChange(newLayout)
    },
    [localLayout, onChange],
  )

  const handleResizeEnd = useCallback(
    (currentNode: SplitNode, percentage: number) => {
      const finalLayout = updateSplitPercentage(localLayout, currentNode, percentage)
      setLocalLayout(finalLayout)
      onChange(finalLayout)
      if (onResizeEnd) {
        onResizeEnd(currentNode, percentage)
      }
    },
    [localLayout, onChange, onResizeEnd],
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
    ],
  )

  // Actions context — stable dispatch functions that never change identity
  const actionsValue = useMemo(
    () => ({
      removePane: handleRemovePane,
      addPane: handleAddPane,
      swapPanes: handleSwapPanes,
      splitPane: handleSplitPane,
      updateSplitPercentage: handleUpdateSplitPercentage,
      updatePaneMetadata: handleUpdatePaneMetadata,
    }),
    [
      handleRemovePane,
      handleAddPane,
      handleSwapPanes,
      handleSplitPane,
      handleUpdateSplitPercentage,
      handleUpdatePaneMetadata,
    ],
  )

  return (
    <ZeugmaActionsContext.Provider value={actionsValue}>
      <ZeugmaStateContext.Provider value={stateValue}>
        <DndContext
          id="zeugma-dnd-context"
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          {children}
        </DndContext>
        {activeId && renderDragOverlay && (
          <CursorOverlay
            activeId={activeId}
            render={renderDragOverlay}
            className={`${classNames.dragOverlay || ''} ${
              activeId === dismissIntentId
                ? classNames.dismissPreview || 'zeugma-dismiss-preview'
                : ''
            }`.trim()}
          />
        )}
      </ZeugmaStateContext.Provider>
    </ZeugmaActionsContext.Provider>
  )
}
