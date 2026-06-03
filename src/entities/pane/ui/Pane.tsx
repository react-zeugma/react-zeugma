import React, { useMemo } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useDashboard } from '../../dashboard'
import { DragListenersCtx } from '../model/context'
import { PaneRenderProps } from '../model/types'

interface DropZoneProps {
  id: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  activeClassName?: string
}

const activationPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: '50%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    width: '50%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '25%',
    height: '100%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '25%',
    height: '100%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  center: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
}

const previewPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
}

const DropZone: React.FC<DropZoneProps> = ({ id, position, activeClassName }) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <>
      <div ref={setNodeRef} style={activationPositions[position]} />
      {isOver && <div className={activeClassName} style={previewPositions[position]} />}
    </>
  )
}

interface PaneProps {
  id: string
  children: (props: PaneRenderProps) => React.ReactNode
  style?: React.CSSProperties
}

export const Pane: React.FC<PaneProps> = ({ id, children, style }) => {
  const { activeId, classNames, fullscreenPaneId, onRemove, onFullscreenChange, removePane } =
    useDashboard()
  const showDropZones = activeId !== null && activeId !== id

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })
  const dragging = activeId === id || isDragging
  const isFullscreen = fullscreenPaneId === id

  const renderProps: PaneRenderProps = {
    isDragging: dragging,
    isFullscreen,
    toggleFullscreen: () => onFullscreenChange?.(isFullscreen ? null : id),
    remove: () => {
      if (isFullscreen) {
        onFullscreenChange?.(null)
      }
      if (onRemove) {
        onRemove(id)
      } else {
        removePane(id)
      }
    },
  }

  // Best practice: Memoize drag context value to prevent unnecessary re-renders of the drag handle.
  const contextValue = useMemo(
    () => ({
      ...listeners,
      ...attributes,
    }),
    [listeners, attributes],
  )

  return (
    <DragListenersCtx.Provider value={contextValue}>
      <div
        ref={setNodeRef}
        className={classNames.pane}
        style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      >
        {children(renderProps)}

        {showDropZones && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 15,
              pointerEvents: 'none',
            }}
          >
            {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
              <DropZone
                key={pos}
                id={`drop-${pos}-${id}`}
                position={pos}
                activeClassName={classNames.dropPreview}
              />
            ))}
            <DropZone
              id={`drop-center-${id}`}
              position="center"
              activeClassName={classNames.swapPreview}
            />
          </div>
        )}
      </div>
    </DragListenersCtx.Provider>
  )
}
