'use client'

import type { RenderCounterFooterProps } from './types'
import { useRenderCounter } from './use-render-counter'

/**
 * A container footer component for displaying mount and render counters at the bottom of widgets or panels.
 */
export function RenderCounterFooter({
  id,
  label,
  children,
  className = '',
  footerClassName = '',
  style,
  logToConsole = false,
  disabled = false,
}: RenderCounterFooterProps) {
  const displayId = label || id || 'widget'
  const { mounts, renders } = useRenderCounter(id, { logToConsole, disabled })

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden min-h-0 ${className}`}
      style={style}
    >
      {children && <div className="flex-1 overflow-hidden relative min-h-0">{children}</div>}
      <div
        className={`bg-zinc-900/90 border-t border-zinc-800 px-3 py-1.5 flex items-center justify-between text-[11px] text-zinc-400 font-mono shrink-0 select-none ${footerClassName}`}
      >
        <span className="truncate max-w-[140px] text-zinc-300 font-semibold">{displayId}</span>
        <div className="flex items-center gap-3">
          <span>
            Mounts: <strong className="text-emerald-400 font-semibold">{mounts}</strong>
          </span>
          <span className="opacity-20">|</span>
          <span>
            Renders: <strong className="text-indigo-400 font-semibold">{renders}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
