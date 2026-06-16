import React from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useZeugmaState, ZeugmaInternalStateValue } from '../../../shared'

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

// Subcomponent used when tab is NOT hovered over (99% of the time).
// Does NOT subscribe to active drag state changes (overTabId, overTabPosition), preventing cascades!
const TabNormal = React.memo<{
  isDragging: boolean
  children: (props: TabRenderProps) => React.ReactNode
}>(({ isDragging, children }) => {
  return <>{children({ isDragging, isOver: false })}</>
})

TabNormal.displayName = 'TabNormal'

// Subcomponent used ONLY when tab is hovered over (isOver is true).
// Subscribes to drag position to show the drop preview line.
const TabHovered: React.FC<{
  id: string
  isDragging: boolean
  children: (props: TabRenderProps) => React.ReactNode
}> = ({ id, isDragging, children }) => {
  const {
    overTabId,
    overTabPosition,
    classNames = {},
  } = useZeugmaState() as ZeugmaInternalStateValue
  const isTargetOver = overTabId === id
  const dropPosition = isTargetOver ? overTabPosition : null

  return (
    <>
      {children({ isDragging, isOver: isTargetOver })}

      {isTargetOver && dropPosition && (
        <div
          className={classNames.tabDropPreview || ''}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: '#6366f1',
            left: dropPosition === 'before' ? 0 : undefined,
            right: dropPosition === 'after' ? 0 : undefined,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </>
  )
}

TabHovered.displayName = 'TabHovered'

export const Tab: React.FC<TabProps> = ({ id, locked = false, children, className, style }) => {
  const state = useZeugmaState() as ZeugmaInternalStateValue
  const isLocked = locked || state.locked

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
        position: 'relative',
        cursor: isLocked ? 'default' : 'grab',
        ...style,
      }}
      {...(isLocked ? {} : listeners)}
      {...(isLocked ? {} : attributes)}
    >
      {isOver ? (
        <TabHovered id={id} isDragging={isDragging}>
          {children}
        </TabHovered>
      ) : (
        <TabNormal isDragging={isDragging}>{children}</TabNormal>
      )}
    </div>
  )
}
