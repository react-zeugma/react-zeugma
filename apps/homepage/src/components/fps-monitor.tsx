'use client'

import React from 'react'
import { useSharedFps } from '@/hooks/use-fps'

function FpsSparkline({ data, color }: { data: number[]; color: string }) {
  const width = 100
  const height = 40
  const points = React.useMemo(() => {
    if (data.length < 2) return ''
    const max = Math.max(...data, 60)
    const min = Math.min(...data, 30)
    const range = max - min || 1

    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 4) - 2
        return `${x},${y}`
      })
      .join(' ')
  }, [data])

  if (!points) return null
  const gradientId = `fps-spark-${color.replace('#', '')}`

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible select-none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="transition-all duration-300"
      />
      <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#${gradientId})`} />
    </svg>
  )
}

export function FpsMonitor({
  className = 'p-3 flex flex-col h-full justify-between gap-3',
}: {
  className?: string
}) {
  const { fps, history } = useSharedFps()

  const isSlow = fps < 30
  const isWarning = fps >= 30 && fps < 50
  const activeColor = isSlow ? '#F2495C' : isWarning ? '#FF9830' : '#73BF69'

  return (
    <div className={className}>
      {/* Top Banner */}
      <div className="text-[9px] text-[#73BF69] bg-[#73BF69]/10 border border-[#73BF69]/20 rounded px-2 py-1 text-center font-semibold tracking-wide uppercase select-none">
        ✓ Diagnostics Active: Real-time UI Telemetry
      </div>

      {/* Value Display */}
      <div className="flex items-center justify-between select-none">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8E8E8E]">
            UI Frame Rate
          </span>
          <span className="text-[9px] text-[#6B6B6B]">Client-side engine diagnostics</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className="text-3xl font-extrabold tracking-tight tabular-nums transition-colors duration-300"
            style={{ color: activeColor }}
          >
            {fps}
          </span>
          <span className="text-[10px] text-[#8E8E8E] font-semibold">FPS</span>
        </div>
      </div>

      {/* Sparkline Container */}
      <div className="flex-1 min-h-[40px] w-full bg-[#111317] border border-[#1e2127] rounded p-2 flex items-center justify-center relative overflow-hidden">
        <FpsSparkline data={history} color={activeColor} />
      </div>
    </div>
  )
}
