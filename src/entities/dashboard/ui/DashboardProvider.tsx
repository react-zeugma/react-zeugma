import React, { useState, useEffect, useRef, ReactNode, useMemo } from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
} from '@dnd-kit/core'
import { TreeNode, SplitDirection } from '../../../shared/model'
import { removePane, splitPane, swapPanes } from '../../../shared/lib/tree'
import { DEFAULT_DRAG_ACTIVATION_DISTANCE, DEFAULT_SNAP_THRESHOLD } from '../../../shared/config'
import { DashboardContext, ZeugmaClassNames } from '../model/context'

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
  children,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: dragActivationDistance },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const draggingId = active.id.toString()
    const overIdStr = over.id.toString()

    // Check for center (swap) drop
    const swapMatch = overIdStr.match(/^drop-center-(.+)$/)
    if (swapMatch) {
      const [, targetId] = swapMatch
      if (draggingId !== targetId) {
        onChange(swapPanes(layout, draggingId, targetId))
      }
      return
    }

    // Check for edge (split) drop
    const match = overIdStr.match(/^drop-(left|right|top|bottom)-(.+)$/)
    if (!match) return

    const [, dropZone, targetId] = match
    if (draggingId === targetId) return

    const direction: SplitDirection = dropZone === 'left' || dropZone === 'right' ? 'row' : 'column'
    const treeWithoutDragging = removePane(layout, draggingId)

    const newLayout = splitPane(
      treeWithoutDragging,
      targetId,
      direction,
      dropZone as 'left' | 'right' | 'top' | 'bottom',
      draggingId,
    )
    onChange(newLayout)
  }

  // Best practice: Memoize context value to prevent unnecessary re-renders of context consumers.
  const contextValue = useMemo(
    () => ({
      layout,
      onLayoutChange: onChange,
      renderPane,
      activeId,
      fullscreenPaneId,
      classNames,
      onRemove,
      onFullscreenChange,
      snapThreshold,
    }),
    [
      layout,
      onChange,
      renderPane,
      activeId,
      fullscreenPaneId,
      classNames,
      onRemove,
      onFullscreenChange,
      snapThreshold,
    ],
  )

  return (
    <DashboardContext.Provider value={contextValue}>
      <DndContext
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
    </DashboardContext.Provider>
  )
}
