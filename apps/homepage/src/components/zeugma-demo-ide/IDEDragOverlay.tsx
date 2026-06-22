import React from 'react'
import { getTabMetadata } from './IDETab'

interface IDEDragOverlayProps {
  id: string
  isDismissing?: boolean
}

export function IDEDragOverlay({ id, isDismissing = false }: IDEDragOverlayProps) {
  const { title, icon } = getTabMetadata(id)

  let sizedIcon = icon
  if (React.isValidElement(icon)) {
    const element = icon as React.ReactElement<{ className?: string }>
    sizedIcon = React.cloneElement(element, {
      className: element.props.className?.replace('w-3.5 h-3.5', 'w-4 h-4'),
    })
  }

  return (
    <div
      className={`px-4 py-2 border shadow-2xl flex items-center gap-2.5 opacity-95 text-xs text-white font-bold uppercase tracking-wider pointer-events-none font-mono transition-all duration-150 ${
        isDismissing
          ? 'bg-rose-950 border-rose-500 scale-90 text-rose-200'
          : 'bg-[#2d2d2d] border-indigo-500/30'
      }`}
    >
      {isDismissing ? <span className="text-rose-400 font-bold">⚠️</span> : sizedIcon}
      <span className={isDismissing ? 'line-through text-rose-300' : ''}>
        {isDismissing ? `Remove ${title}` : title}
      </span>
    </div>
  )
}
