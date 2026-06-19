import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface RootDropZoneProps {
  id: string
  fraction: '1/4' | '1/3'
  edge: 'top' | 'bottom' | 'left' | 'right'
  activeClassName?: string
}

const activationPositions: Record<
  'top' | 'bottom' | 'left' | 'right',
  Record<'1/4' | '1/3', React.CSSProperties>
> = {
  top: {
    '1/4': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '24px',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/3': {
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
    '1/4': {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '24px',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/3': {
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
    '1/4': {
      position: 'absolute',
      left: 0,
      top: '48px',
      width: '24px',
      height: 'calc(100% - 96px)',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/3': {
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
    '1/4': {
      position: 'absolute',
      right: 0,
      top: '48px',
      width: '24px',
      height: 'calc(100% - 96px)',
      zIndex: 100,
      pointerEvents: 'auto',
    },
    '1/3': {
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
  Record<'1/4' | '1/3', React.CSSProperties>
> = {
  top: {
    '1/4': {
      top: 0,
      left: 0,
      width: '100%',
      height: '60px',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      borderTopLeftRadius: '0px',
      borderTopRightRadius: '0px',
    },
    '1/3': {
      top: 0,
      left: 0,
      width: '100%',
      height: '96px',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      borderTopLeftRadius: '0px',
      borderTopRightRadius: '0px',
    },
  },
  bottom: {
    '1/4': {
      bottom: 0,
      left: 0,
      width: '100%',
      height: '60px',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px',
    },
    '1/3': {
      bottom: 0,
      left: 0,
      width: '100%',
      height: '96px',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottomLeftRadius: '0px',
      borderBottomRightRadius: '0px',
    },
  },
  left: {
    '1/4': {
      left: 0,
      top: 0,
      width: '60px',
      height: '100%',
      borderTopRightRadius: '12px',
      borderBottomRightRadius: '12px',
      borderTopLeftRadius: '0px',
      borderBottomLeftRadius: '0px',
    },
    '1/3': {
      left: 0,
      top: 0,
      width: '96px',
      height: '100%',
      borderTopRightRadius: '12px',
      borderBottomRightRadius: '12px',
      borderTopLeftRadius: '0px',
      borderBottomLeftRadius: '0px',
    },
  },
  right: {
    '1/4': {
      right: 0,
      top: 0,
      width: '60px',
      height: '100%',
      borderTopLeftRadius: '12px',
      borderBottomLeftRadius: '12px',
      borderTopRightRadius: '0px',
      borderBottomRightRadius: '0px',
    },
    '1/3': {
      right: 0,
      top: 0,
      width: '96px',
      height: '100%',
      borderTopLeftRadius: '12px',
      borderBottomLeftRadius: '12px',
      borderTopRightRadius: '0px',
      borderBottomRightRadius: '0px',
    },
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
    fraction: '1/4' | '1/3'
    edge: 'top' | 'bottom' | 'left' | 'right'
  }> = [
    { id: 'drop-root-1/4-top', fraction: '1/4', edge: 'top' },
    { id: 'drop-root-1/3-top', fraction: '1/3', edge: 'top' },
    { id: 'drop-root-1/4-bottom', fraction: '1/4', edge: 'bottom' },
    { id: 'drop-root-1/3-bottom', fraction: '1/3', edge: 'bottom' },
    { id: 'drop-root-1/4-left', fraction: '1/4', edge: 'left' },
    { id: 'drop-root-1/3-left', fraction: '1/3', edge: 'left' },
    { id: 'drop-root-1/4-right', fraction: '1/4', edge: 'right' },
    { id: 'drop-root-1/3-right', fraction: '1/3', edge: 'right' },
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
