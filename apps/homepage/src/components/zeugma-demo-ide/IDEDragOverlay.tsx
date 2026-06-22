import React from 'react'
import { getTabMetadata } from './IDETab'

interface IDEDragOverlayProps {
  id: string
}

export function IDEDragOverlay({ id }: IDEDragOverlayProps) {
  const { title, icon } = getTabMetadata(id)

  let sizedIcon = icon
  if (React.isValidElement(icon)) {
    const element = icon as React.ReactElement<{ className?: string }>
    sizedIcon = React.cloneElement(element, {
      className: element.props.className?.replace('w-3.5 h-3.5', 'w-4 h-4'),
    })
  }

  return (
    <div className="px-4 py-2 bg-[#2d2d2d] border border-indigo-500/30 shadow-2xl flex items-center gap-2.5 opacity-95 text-xs text-white font-bold uppercase tracking-wider pointer-events-none font-mono">
      {sizedIcon}
      <span>{title}</span>
    </div>
  )
}
