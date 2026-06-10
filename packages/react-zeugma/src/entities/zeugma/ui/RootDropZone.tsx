import React from 'react'
import { useDroppable } from '@dnd-kit/core'

const rootActivationPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '32px',
    zIndex: 30,
    pointerEvents: 'auto',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '32px',
    zIndex: 30,
    pointerEvents: 'auto',
  },
  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '32px',
    zIndex: 30,
    pointerEvents: 'auto',
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '32px',
    zIndex: 30,
    pointerEvents: 'auto',
  },
}

const rootPreviewPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 31,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 31,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    zIndex: 31,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '50%',
    zIndex: 31,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
}

export interface RootDropZoneProps {
  id: string
  position: 'top' | 'bottom' | 'left' | 'right'
  activeClassName?: string
}

export const RootDropZone: React.FC<RootDropZoneProps> = ({ id, position, activeClassName }) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <>
      <div ref={setNodeRef} style={rootActivationPositions[position]} />
      {isOver && <div className={activeClassName} style={rootPreviewPositions[position]} />}
    </>
  )
}

export interface RootDropZonesProps {
  activeId: string | null
  hasOtherPanes: boolean
  dropPreviewClassName?: string
}

export const RootDropZones: React.FC<RootDropZonesProps> = ({
  activeId,
  hasOtherPanes,
  dropPreviewClassName,
}) => {
  if (!activeId || !hasOtherPanes) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        pointerEvents: 'none',
      }}
    >
      {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
        <RootDropZone
          key={pos}
          id={`drop-root-${pos}`}
          position={pos}
          activeClassName={dropPreviewClassName}
        />
      ))}
    </div>
  )
}
