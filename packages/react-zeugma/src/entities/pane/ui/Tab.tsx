import React from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useZeugmaState } from '../../zeugma'

export interface TabRenderProps {
  isDragging: boolean
  isOver: boolean
}

export interface TabProps {
  /** The unique ID of the tab, which corresponds to the pane/widget ID. */
  id: string
  /** Whether dragging is locked on this tab. */
  locked?: boolean
  /** Render prop child function. */
  children: (props: TabRenderProps) => React.ReactNode
  /** Custom CSS class applied to the tab wrapper. */
  className?: string
  /** Custom inline CSS style applied to the tab wrapper. */
  style?: React.CSSProperties
}

export const Tab: React.FC<TabProps> = ({ id, locked = false, children, className, style }) => {
  const { locked: globalLocked } = useZeugmaState()
  const isLocked = locked || globalLocked

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `tab-header-${id}`,
    disabled: isLocked,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `tab-drop-${id}`,
    disabled: isLocked,
  })

  const handleRef = (el: HTMLDivElement | null) => {
    setDragRef(el)
    setDropRef(el)
  }

  return (
    <div
      ref={handleRef}
      className={className}
      style={{
        display: 'inline-flex',
        cursor: isLocked ? 'default' : 'grab',
        ...style,
      }}
      {...(isLocked ? {} : listeners)}
      {...(isLocked ? {} : attributes)}
    >
      {children({ isDragging, isOver })}
    </div>
  )
}
