'use client'

import React from 'react'
import { Activity } from 'lucide-react'
import { useSharedFps } from '@/hooks/use-fps'

export function FpsMonitor() {
  const { fps, history } = useSharedFps()

  // Determine status color based on FPS
  const isSlow = fps < 30
  const isWarning = fps >= 30 && fps < 50

  const statusColorClass = isSlow
    ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    : isWarning
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'

  const dotColorClass = isSlow ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'

  const polylineColorClass = isSlow
    ? 'text-rose-500'
    : isWarning
      ? 'text-amber-500'
      : 'text-indigo-500'

  // Pre-calculate line points for SVG sparkline
  const pointsString = React.useMemo(() => {
    const maxVal = Math.max(...history, 60)
    const minVal = Math.min(...history, 30)
    const range = maxVal - minVal || 1
    return history
      .map((val, idx) => {
        const x = (idx / (history.length - 1)) * 100
        const y = 24 - ((val - minVal) / range) * 24
        return `${x},${y}`
      })
      .join(' ')
  }, [history])

  return (
    <div className="border-t border-border-primary/80 pt-3 px-1 space-y-2">
      <div className="text-text-secondary text-[10px] font-bold uppercase tracking-wider select-none flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          <span>Performance</span>
        </div>
        <span
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold transition-colors duration-300 ${statusColorClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColorClass}`} />
          {fps} FPS
        </span>
      </div>

      <div className="bg-bg-pane-inner border border-border-primary rounded p-2.5 flex items-center justify-between gap-3 h-12 transition-colors duration-200">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary font-medium font-sans">Frame Rate</span>
          <span className="text-[9px] text-text-muted font-sans">Real-time update</span>
        </div>
        <div className="flex-1 max-w-[100px] h-6 flex items-center">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`transition-colors duration-300 ${polylineColorClass}`}
              points={pointsString}
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
