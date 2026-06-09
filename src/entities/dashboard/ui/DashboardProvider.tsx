import React, { useState, useEffect, useRef, ReactNode, useMemo, useCallback } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
} from '@dnd-kit/core'
import { TreeNode, SplitDirection, SplitNode } from '../../../shared/model'
import {
  removePane,
  splitPane,
  swapPanes,
  addPane,
  updateSplitPercentage,
  splitRoot,
  updatePaneMetadata,
  findPane,
} from '../../../shared/lib/tree'
import { DEFAULT_DRAG_ACTIVATION_DISTANCE, DEFAULT_SNAP_THRESHOLD } from '../../../shared/config'
import {
  DashboardStateContext,
  DashboardActionsContext,
  ZeugmaClassNames,
  ResizerRenderProps,
} from '../model/context'

/** Cursor-following overlay rendered via portal */
const CursorOverlay: React.FC<{
  activeId: string
  render: (id: string) => ReactNode
  className?: string
}> = ({ activeId, render, className }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`
      }
    }
    document.addEventListener('pointermove', handleMove)
    return () => document.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {render(activeId)}
    </div>
  )
}

class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: PointerEvent }) => {
        const element = event.target as HTMLElement | null
        if (element?.closest('.drag-cancel')) {
          return false
        }
        return true
      },
    },
  ]
}

interface DashboardProviderProps {
  layout: TreeNode | null
  onChange: (newLayout: TreeNode | null) => void
  renderPane: (paneId: string) => ReactNode
  renderDragOverlay?: (activeId: string) => ReactNode
  classNames?: ZeugmaClassNames
  fullscreenPaneId?: string | null
  onFullscreenChange?: (paneId: string | null) => void
  onRemove?: (paneId: string) => void
  dragActivationDistance?: number
  snapThreshold?: number
  onDragStart?: (activeId: string) => void
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'swap'
      direction?: SplitDirection
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
  onResizeStart?: (currentNode: SplitNode) => void
  onResize?: (currentNode: SplitNode, percentage: number) => void
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  renderResizer?: (props: ResizerRenderProps) => ReactNode
  minSplitPercentage?: number
  maxSplitPercentage?: number
  children: ReactNode
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
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
  renderResizer,
  minSplitPercentage = 5,
  maxSplitPercentage = 95,
  children,
}) => {
  const [localLayout, setLocalLayout] = useState<TreeNode | null>(layout)
  const prevLayoutRef = useRef(layout)

  if (layout !== prevLayoutRef.current) {
    prevLayoutRef.current = layout
    setLocalLayout(layout)
  }

  const [activeId, setActiveId] = useState<string | null>(null)

  // Refs for stable closure access — prevents callback identity changes on every layout update
  const layoutRef = useRef(localLayout)
  layoutRef.current = localLayout

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const renderPaneRef = useRef(renderPane)
  renderPaneRef.current = renderPane

  const onResizeEndPropRef = useRef(onResizeEnd)
  onResizeEndPropRef.current = onResizeEnd

  // Stable renderPane wrapper — immune to consumer passing inline functions
  const stableRenderPane = useCallback((paneId: string) => renderPaneRef.current(paneId), [])

  // Shallow-memoize classNames by individual fields to avoid identity busting from inline objects
  const stableClassNames = useMemo(
    () => classNames,
    [
      classNames.pane,
      classNames.dropPreview,
      classNames.swapPreview,
      classNames.dragOverlay,
      classNames.resizer,
    ],
  )

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: dragActivationDistance },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const draggingId = event.active.id.toString()
    setActiveId(draggingId)
    if (onDragStart) {
      onDragStart(draggingId)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    const draggingId = active.id.toString()

    if (!over) {
      if (onDragEnd) {
        onDragEnd(draggingId, null, null)
      }
      return
    }

    const overIdStr = over.id.toString()

    // Check for root drop (places pane like half of the root)
    const rootMatch = overIdStr.match(/^drop-root-(left|right|top|bottom)$/)
    if (rootMatch) {
      const [, dropZone] = rootMatch
      const newLayout = splitRoot(
        localLayout,
        draggingId,
        dropZone as 'left' | 'right' | 'top' | 'bottom',
      )
      setLocalLayout(newLayout)
      onChange(newLayout)

      if (onDragEnd) {
        const direction: SplitDirection =
          dropZone === 'left' || dropZone === 'right' ? 'row' : 'column'
        onDragEnd(draggingId, 'root', {
          type: 'split',
          direction,
          position: dropZone as 'left' | 'right' | 'top' | 'bottom',
        })
      }
      return
    }

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

  const handleLocalLayoutChange = useCallback((newLayout: TreeNode | null) => {
    setLocalLayout(newLayout)
  }, [])

  const handleRemovePane = useCallback((paneId: string) => {
    const newLayout = removePane(layoutRef.current, paneId)
    setLocalLayout(newLayout)
    onChangeRef.current(newLayout)
  }, [])

  const handleAddPane = useCallback((paneId: string) => {
    const newLayout = addPane(layoutRef.current, paneId)
    setLocalLayout(newLayout)
    onChangeRef.current(newLayout)
  }, [])

  const handleSwapPanes = useCallback((paneIdA: string, paneIdB: string) => {
    const newLayout = swapPanes(layoutRef.current, paneIdA, paneIdB)
    setLocalLayout(newLayout)
    onChangeRef.current(newLayout)
  }, [])

  const handleSplitPane = useCallback(
    (
      targetId: string,
      direction: SplitDirection,
      splitType: 'left' | 'right' | 'top' | 'bottom',
      paneToAdd: string,
    ) => {
      const draggedPaneNode = findPane(layoutRef.current, paneToAdd) ?? {
        type: 'pane',
        paneId: paneToAdd,
      }
      const treeWithoutDragging = removePane(layoutRef.current, paneToAdd)
      const newLayout = splitPane(
        treeWithoutDragging,
        targetId,
        direction,
        splitType,
        draggedPaneNode,
      )
      setLocalLayout(newLayout)
      onChangeRef.current(newLayout)
    },
    [],
  )

  const handleUpdateSplitPercentage = useCallback((currentNode: SplitNode, percentage: number) => {
    const newLayout = updateSplitPercentage(layoutRef.current, currentNode, percentage)
    setLocalLayout(newLayout)
    onChangeRef.current(newLayout)
  }, [])

  const handleUpdatePaneMetadata = useCallback(
    (
      paneId: string,
      updater: (
        current: Record<string, unknown> | undefined,
      ) => Record<string, unknown> | undefined,
    ) => {
      const newLayout = updatePaneMetadata(layoutRef.current, paneId, updater)
      setLocalLayout(newLayout)
      onChangeRef.current(newLayout)
    },
    [],
  )

  const handleResizeEnd = useCallback((currentNode: SplitNode, percentage: number) => {
    const finalLayout = updateSplitPercentage(layoutRef.current, currentNode, percentage)
    setLocalLayout(finalLayout)
    onChangeRef.current(finalLayout)
    if (onResizeEndPropRef.current) {
      onResizeEndPropRef.current(currentNode, percentage)
    }
  }, [])

  // State context — reactive values that change during runtime
  const stateValue = useMemo(
    () => ({
      layout: localLayout,
      onLayoutChange: handleLocalLayoutChange,
      renderPane: stableRenderPane,
      activeId,
      fullscreenPaneId,
      classNames: stableClassNames,
      onRemove,
      onFullscreenChange,
      snapThreshold,
      onResizeStart,
      onResize,
      onResizeEnd: handleResizeEnd,
      renderResizer,
      minSplitPercentage,
      maxSplitPercentage,
    }),
    [
      localLayout,
      activeId,
      fullscreenPaneId,
      stableClassNames,
      onRemove,
      onFullscreenChange,
      snapThreshold,
      onResizeStart,
      onResize,
      renderResizer,
      minSplitPercentage,
      maxSplitPercentage,
      // Stable callbacks (empty deps) — included for exhaustive-deps lint rule
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
    <DashboardActionsContext.Provider value={actionsValue}>
      <DashboardStateContext.Provider value={stateValue}>
        <DndContext
          id="zeugma-dnd-context"
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {children}
        </DndContext>
        {activeId && renderDragOverlay && (
          <CursorOverlay
            activeId={activeId}
            render={renderDragOverlay}
            className={classNames.dragOverlay}
          />
        )}
      </DashboardStateContext.Provider>
    </DashboardActionsContext.Provider>
  )
}
