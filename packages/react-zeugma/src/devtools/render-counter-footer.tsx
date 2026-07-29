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
      {children}
      <div className={footerClassName}>
        <span>{displayId}</span>
        <div>
          <span>
            Mounts: <strong>{mounts}</strong>
          </span>
          <span>|</span>
          <span>
            Renders: <strong>{renders}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
