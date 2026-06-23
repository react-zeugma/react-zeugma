'use client'

import { PanelChrome } from './DashboardLayout'
import { Gauge } from 'lucide-react'
import { useMemo } from 'react'
import { useLiveDataContext } from './LiveDataProvider'

interface GaugePanelProps {
  label: string
  value: number
  max?: number
  unit?: string
  thresholds?: { value: number; color: string }[]
}

function ArcGauge({
  value,
  max = 100,
  thresholds,
}: {
  value: number
  max?: number
  thresholds?: { value: number; color: string }[]
}) {
  const defaultThresholds = [
    { value: 0, color: '#73BF69' },
    { value: 60, color: '#FF9830' },
    { value: 80, color: '#F2495C' },
  ]
  const thr = thresholds || defaultThresholds

  const size = 120
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const center = size / 2

  // Arc from 135° to 405° (270° sweep)
  const startAngle = 135
  const sweepAngle = 270
  const pct = Math.min(value / max, 1)
  const currentAngle = startAngle + sweepAngle * pct

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    }
  }

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start)
    const e = polarToCartesian(end)
    const largeArc = end - start > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`
  }

  // Get color for current value
  const activeColor = useMemo(() => {
    let color = thr[0].color
    for (const t of thr) {
      if (value >= t.value) color = t.color
    }
    return color
  }, [value, thr])

  return (
    <svg
      width={size}
      height={size - 14}
      viewBox={`0 0 ${size} ${size - 10}`}
      className="overflow-visible"
    >
      {/* Background arc */}
      <path
        d={describeArc(startAngle, startAngle + sweepAngle)}
        fill="none"
        stroke="#1a1d21"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Colored arc */}
      <path
        d={describeArc(startAngle, currentAngle)}
        fill="none"
        stroke={activeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-500 ease-out"
        style={{
          filter: `drop-shadow(0 0 6px ${activeColor}40)`,
        }}
      />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const angle = startAngle + (sweepAngle * tick) / 100
        const inner = polarToCartesian(angle)
        const outerR = radius + 6
        const outerPoint = {
          x: center + outerR * Math.cos((angle * Math.PI) / 180),
          y: center + outerR * Math.sin((angle * Math.PI) / 180),
        }
        return (
          <line
            key={tick}
            x1={inner.x}
            y1={inner.y}
            x2={outerPoint.x}
            y2={outerPoint.y}
            stroke="#3a3d42"
            strokeWidth={1}
          />
        )
      })}

      {/* Glow effect */}
      <defs>
        <filter id={`glow-${activeColor.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Needle indicator dot */}
      <circle
        cx={polarToCartesian(currentAngle).x}
        cy={polarToCartesian(currentAngle).y}
        r={3}
        fill={activeColor}
        className="transition-all duration-500 ease-out"
        style={{ filter: `drop-shadow(0 0 4px ${activeColor})` }}
      />
    </svg>
  )
}

export function GaugePanel({ label, value, max = 100, unit = '%', thresholds }: GaugePanelProps) {
  const defaultThresholds = [
    { value: 0, color: '#73BF69' },
    { value: 60, color: '#FF9830' },
    { value: 80, color: '#F2495C' },
  ]
  const thr = thresholds || defaultThresholds

  const activeColor = useMemo(() => {
    let color = thr[0].color
    for (const t of thr) {
      if (value >= t.value) color = t.color
    }
    return color
  }, [value, thr])

  return (
    <PanelChrome
      title={label}
      icon={<Gauge className="w-3.5 h-3.5" style={{ color: activeColor }} />}
    >
      <div className="flex flex-col items-center justify-center h-full gap-0">
        <ArcGauge value={value} max={max} thresholds={thresholds} />
        <div className="flex items-baseline gap-1 -mt-2">
          <span
            className="text-2xl font-bold tabular-nums transition-colors duration-500"
            style={{ color: activeColor }}
          >
            {value}
          </span>
          <span className="text-[10px] text-[#6B6B6B] font-medium">{unit}</span>
        </div>
      </div>
    </PanelChrome>
  )
}

export function CpuGaugePanel() {
  const { cpuGauge } = useLiveDataContext()
  return <GaugePanel label="CPU Usage" value={cpuGauge} />
}

export function MemGaugePanel() {
  const { memGauge } = useLiveDataContext()
  return <GaugePanel label="Memory Usage" value={memGauge} />
}
