'use client'

import { ServiceHealth } from './use-live-data'
import { PanelChrome } from './DashboardLayout'
import { BarChart3 } from 'lucide-react'
import { useLiveDataContext } from './LiveDataProvider'

const STATUS_COLORS: Record<ServiceHealth['status'], string> = {
  healthy: '#73BF69',
  degraded: '#FF9830',
  critical: '#F2495C',
}

function HealthBar({ service }: { service: ServiceHealth }) {
  const color = STATUS_COLORS[service.status]

  return (
    <div className="flex items-center gap-2 px-3 py-[5px] group">
      <span className="text-[10px] font-medium text-[#D8D9DA] w-[100px] truncate shrink-0">
        {service.name}
      </span>
      <div className="flex-1 h-[14px] bg-[#1a1d21] rounded-sm overflow-hidden relative">
        <div
          className="h-full rounded-sm transition-all duration-700 ease-out relative overflow-hidden"
          style={{
            width: `${service.health}%`,
            backgroundColor: color,
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
              animation: 'shimmer 2s infinite',
            }}
          />
        </div>
        {/* Threshold markers */}
        <div className="absolute top-0 bottom-0 left-[70%] w-px bg-[#FF9830]/20" />
        <div className="absolute top-0 bottom-0 left-[90%] w-px bg-[#73BF69]/20" />
      </div>
      <span
        className="text-[10px] font-mono font-bold w-[36px] text-right tabular-nums"
        style={{ color }}
      >
        {service.health}%
      </span>
    </div>
  )
}

export function BarGaugePanel() {
  const { serviceHealth: data } = useLiveDataContext()
  return (
    <PanelChrome title="Service Health" icon={<BarChart3 className="w-3.5 h-3.5 text-[#73BF69]" />}>
      <div className="flex flex-col py-1 overflow-auto h-full">
        {data.map((service) => (
          <HealthBar key={service.name} service={service} />
        ))}
      </div>
    </PanelChrome>
  )
}
