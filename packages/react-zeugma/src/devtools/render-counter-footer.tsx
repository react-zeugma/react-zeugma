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
  className,
  footerClassName,
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
    <div className={className} style={style}>
      {children && <div className="flex-1 overflow-hidden relative min-h-0">{children}</div>}
      <div className={footerClassName}>
        <span className="truncate">{displayId}</span>
        <div className="flex items-center gap-3">
          <span>
            Mounts: <strong className="counter-mounts">{mounts}</strong>
          </span>
          <span>|</span>
          <span>
            Renders: <strong className="counter-renders">{renders}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
