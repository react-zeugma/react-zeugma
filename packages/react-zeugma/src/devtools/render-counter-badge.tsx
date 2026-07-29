'use client'

import type { RenderCounterBadgeProps } from './types'
import { useRenderCounter } from './use-render-counter'

const POSITION_STYLES: Record<NonNullable<RenderCounterBadgeProps['position']>, string> = {
  'top-right': 'top-2 right-2',
  'top-left': 'top-2 left-2',
  'bottom-right': 'bottom-2 right-2',
  'bottom-left': 'bottom-2 left-2',
}

/**
 * A floating overlay badge displaying mount and render counters for debugging component lifecycles.
 */
export function RenderCounterBadge({
  id,
  position = 'top-right',
  className = '',
  style,
  logToConsole = false,
  disabled = false,
}: RenderCounterBadgeProps) {
  const { mounts, renders } = useRenderCounter(id, { logToConsole, disabled })

  if (disabled) {
    return null
  }

  const posClass = POSITION_STYLES[position] || POSITION_STYLES['top-right']

  return (
    <div
      className={`absolute ${posClass} z-50 pointer-events-none flex items-center gap-2 rounded px-2 py-1 text-[11px] font-mono bg-zinc-900/90 text-zinc-200 border border-zinc-700/80 shadow-md backdrop-blur-xs select-none ${className}`}
      style={style}
    >
      <span>
        M: <strong className="text-emerald-400 font-semibold">{mounts}</strong>
      </span>
      <span className="opacity-30">|</span>
      <span>
        R: <strong className="text-indigo-400 font-semibold">{renders}</strong>
      </span>
    </div>
  )
}
