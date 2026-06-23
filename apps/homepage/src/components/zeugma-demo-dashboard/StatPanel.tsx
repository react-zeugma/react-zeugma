'use client'

import { PanelChrome } from './DashboardLayout'
import { Zap, ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, Server } from 'lucide-react'
import { useMemo } from 'react'
import { useLiveDataContext } from './LiveDataProvider'

interface StatCardProps {
  label: string
  value: string
  unit: string
  trend: number[]
  color: string
  icon: React.ReactNode
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 64
  const height = 20

  const points = useMemo(() => {
    if (data.length < 2) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    return data
      .map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * (height - 2) - 1
        return `${x},${y}`
      })
      .join(' ')
  }, [data])

  if (!points) return null

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
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
      />
      {/* Fill area below */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
    </svg>
  )
}

function StatCard({ label, value, unit, trend, color, icon }: StatCardProps) {
  const trendDirection =
    trend.length >= 2 ? (trend[trend.length - 1] >= trend[trend.length - 2] ? 'up' : 'down') : 'up'

  const trendPercent =
    trend.length >= 2
      ? Math.abs(
          ((trend[trend.length - 1] - trend[trend.length - 2]) / (trend[trend.length - 2] || 1)) *
            100,
        ).toFixed(1)
      : '0.0'

  return (
    <div className="grafana-stat-card">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="opacity-60">{icon}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#8E8E8E]">
            {label}
          </span>
        </div>
        <div
          className={`flex items-center gap-0.5 text-[9px] font-semibold ${
            trendDirection === 'up' ? 'text-[#73BF69]' : 'text-[#F2495C]'
          }`}
        >
          {trendDirection === 'up' ? (
            <ArrowUpRight className="w-2.5 h-2.5" />
          ) : (
            <ArrowDownRight className="w-2.5 h-2.5" />
          )}
          {trendPercent}%
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tabular-nums" style={{ color }}>
            {value}
          </span>
          <span className="text-[9px] text-[#6B6B6B] font-medium">{unit}</span>
        </div>
        <Sparkline data={trend} color={color} />
      </div>
    </div>
  )
}

export function StatPanel() {
  const { stats } = useLiveDataContext()
  const cards: StatCardProps[] = [
    {
      label: 'Requests',
      value: stats.requestsPerSec.toLocaleString(),
      unit: 'req/s',
      trend: stats.requestsTrend,
      color: '#5794F2',
      icon: <Zap className="w-3 h-3 text-[#5794F2]" />,
    },
    {
      label: 'Uptime',
      value: stats.uptime.toFixed(2),
      unit: '%',
      trend: stats.uptimeTrend,
      color: '#73BF69',
      icon: <Server className="w-3 h-3 text-[#73BF69]" />,
    },
    {
      label: 'P99 Latency',
      value: stats.p99Latency.toString(),
      unit: 'ms',
      trend: stats.latencyTrend,
      color: '#FF9830',
      icon: <Clock className="w-3 h-3 text-[#FF9830]" />,
    },
    {
      label: 'Error Rate',
      value: stats.errorRate.toFixed(2),
      unit: '%',
      trend: stats.errorTrend,
      color: '#F2495C',
      icon: <AlertTriangle className="w-3 h-3 text-[#F2495C]" />,
    },
  ]

  return (
    <PanelChrome title="Key Metrics" icon={<Zap className="w-3.5 h-3.5 text-[#5794F2]" />}>
      <div className="grid grid-cols-2 gap-2 p-2 h-full">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </PanelChrome>
  )
}
