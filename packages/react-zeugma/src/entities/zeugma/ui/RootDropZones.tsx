import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface RootDropZoneProps {
  id: string
  fraction: '1/3' | '1/2'
  edge: 'top' | 'bottom' | 'left' | 'right'
  activeClassName?: string
}

const activationPositions: Record<
  'top' | 'bottom' | 'left' | 'right',
  Record<'1/3' | '1/2', React.CSSProperties>
> = {
  top: {
    '1/3': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '24px',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/2': {
      position: 'absolute',
      top: '24px',
      left: 0,
      width: '100%',
      height: '24px',
      zIndex: 100,
      pointerEvents: 'auto',
    },
  },
  bottom: {
    '1/3': {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '24px',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/2': {
      position: 'absolute',
      bottom: '24px',
      left: 0,
      width: '100%',
      height: '24px',
      zIndex: 100,
      pointerEvents: 'auto',
    },
  },
  left: {
    '1/3': {
      position: 'absolute',
      left: 0,
      top: '48px',
      width: '24px',
      height: 'calc(100% - 96px)',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/2': {
      position: 'absolute',
      left: '24px',
      top: '48px',
      width: '24px',
      height: 'calc(100% - 96px)',
      zIndex: 100,
      pointerEvents: 'auto',
    },
  },
  right: {
    '1/3': {
      position: 'absolute',
      right: 0,
      top: '48px',
      width: '24px',
      height: 'calc(100% - 96px)',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/2': {
      position: 'absolute',
      right: '24px',
      top: '48px',
      width: '24px',
      height: 'calc(100% - 96px)',
      zIndex: 100,
      pointerEvents: 'auto',
    },
  },
}

const previewPositions: Record<
  'top' | 'bottom' | 'left' | 'right',
  Record<'1/3' | '1/2', React.CSSProperties>
> = {
  top: {
    '1/3': { top: 0, left: 0, width: '100%', height: '33.3333%' },
    '1/2': { top: 0, left: 0, width: '100%', height: '50%' },
  },
  bottom: {
    '1/3': { bottom: 0, left: 0, width: '100%', height: '33.3333%' },
    '1/2': { bottom: 0, left: 0, width: '100%', height: '50%' },
  },
  left: {
    '1/3': { left: 0, top: 0, width: '33.3333%', height: '100%' },
    '1/2': { left: 0, top: 0, width: '50%', height: '100%' },
  },
  right: {
    '1/3': { right: 0, top: 0, width: '33.3333%', height: '100%' },
    '1/2': { right: 0, top: 0, width: '50%', height: '100%' },
  },
}

const RootDropZone: React.FC<RootDropZoneProps> = ({ id, fraction, edge, activeClassName }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  const previewStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 101,
    boxSizing: 'border-box',
    ...previewPositions[edge][fraction],
  }

  return (
    <>
      <div ref={setNodeRef} style={activationPositions[edge][fraction]} />
      {isOver && <div className={activeClassName} style={previewStyle} />}
    </>
  )
}

interface RootDropZonesProps {
  activeClassName?: string
}

export const RootDropZones: React.FC<RootDropZonesProps> = ({ activeClassName }) => {
  const zones: Array<{
    id: string
    fraction: '1/3' | '1/2'
    edge: 'top' | 'bottom' | 'left' | 'right'
  }> = [
    { id: 'drop-root-1/3-top', fraction: '1/3', edge: 'top' },
    { id: 'drop-root-1/3-bottom', fraction: '1/3', edge: 'bottom' },
    { id: 'drop-root-1/3-left', fraction: '1/3', edge: 'left' },
    { id: 'drop-root-1/2-left', fraction: '1/2', edge: 'left' },
    { id: 'drop-root-1/3-right', fraction: '1/3', edge: 'right' },
    { id: 'drop-root-1/2-right', fraction: '1/2', edge: 'right' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        pointerEvents: 'none',
      }}
    >
      {zones.map((zone) => (
        <RootDropZone
          key={zone.id}
          id={zone.id}
          fraction={zone.fraction}
          edge={zone.edge}
          activeClassName={activeClassName}
        />
      ))}
    </div>
  )
}
