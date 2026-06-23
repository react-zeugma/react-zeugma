'use client'

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { PanelChrome } from './DashboardLayout'
import { Activity } from 'lucide-react'
import { useState } from 'react'
import { useLiveDataContext } from './LiveDataProvider'

const SERIES_CONFIG = [
  { key: 'cpu', label: 'CPU %', color: '#5794F2', dashArray: undefined },
  { key: 'memory', label: 'Memory %', color: '#73BF69', dashArray: undefined },
  { key: 'network', label: 'Network MB/s', color: '#FF9830', dashArray: '4 2' },
] as const

type SeriesKey = (typeof SERIES_CONFIG)[number]['key']

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="grafana-tooltip">
      <div className="grafana-tooltip-time">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="grafana-tooltip-row">
          <span className="grafana-tooltip-dot" style={{ backgroundColor: entry.color }} />
          <span className="grafana-tooltip-label">{entry.name}</span>
          <span className="grafana-tooltip-value">
            {entry.name === 'Network MB/s' ? `${entry.value}` : `${entry.value}%`}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TimeSeriesPanel() {
  const { timeSeries: data } = useLiveDataContext()
  const [visibleSeries, setVisibleSeries] = useState<Set<SeriesKey>>(
    new Set(SERIES_CONFIG.map((s) => s.key)),
  )

  const toggleSeries = (key: SeriesKey) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <PanelChrome title="System Metrics" icon={<Activity className="w-3.5 h-3.5 text-[#5794F2]" />}>
      <div className="flex flex-col h-full">
        {/* Legend */}
        <div className="flex items-center gap-3 px-3 pt-2 pb-1">
          {SERIES_CONFIG.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              className={`flex items-center gap-1.5 text-[10px] font-medium transition-opacity cursor-pointer ${
                visibleSeries.has(s.key) ? 'opacity-100' : 'opacity-35'
              }`}
            >
              <span className="w-2.5 h-[2px] rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[#D8D9DA]">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0 pr-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
              <defs>
                {SERIES_CONFIG.map((s) => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: '#6B6B6B' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#6B6B6B' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              {SERIES_CONFIG.map(
                (s) =>
                  visibleSeries.has(s.key) && (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={1.5}
                      fill={`url(#grad-${s.key})`}
                      strokeDasharray={s.dashArray}
                      dot={false}
                      animationDuration={300}
                      isAnimationActive={false}
                    />
                  ),
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PanelChrome>
  )
}

// ── Requests Rate Panel ──────────────────────────────────────────────────────

export function RequestsRatePanel() {
  const { timeSeries: data } = useLiveDataContext()
  return (
    <PanelChrome title="Request Rate" icon={<Activity className="w-3.5 h-3.5 text-[#B877D9]" />}>
      <div className="h-full pr-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
            <defs>
              <linearGradient id="grad-requests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B877D9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#B877D9" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grad-errors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F2495C" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F2495C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: '#6B6B6B' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 9, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="requests"
              name="Requests/s"
              stroke="#B877D9"
              strokeWidth={1.5}
              fill="url(#grad-requests)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="errors"
              name="Errors/s"
              stroke="#F2495C"
              strokeWidth={1.5}
              fill="url(#grad-errors)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PanelChrome>
  )
}
