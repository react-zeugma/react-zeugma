'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { GripVertical, Clock, RefreshCw, ChevronDown } from 'lucide-react'

// ── Panel Chrome ─────────────────────────────────────────────────────────────

export function PanelChrome({
  children,
}: {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return <>{children}</>
}

// ── Dashboard Toolbar ────────────────────────────────────────────────────────

export interface WidgetToggleInfo {
  id: string
  label: string
  color: string
}

export interface PresetInfo {
  name: string
  label: string
}

export function DashboardToolbar({
  onRefresh,
  timeRange,
  onTimeRangeChange,
  availableWidgets,
  activeWidgets,
  onToggleWidget,
  presets,
  activePreset,
  onApplyPreset,
}: {
  onRefresh?: () => void
  timeRange: string
  onTimeRangeChange?: (range: string) => void
  availableWidgets: WidgetToggleInfo[]
  activeWidgets: string[]
  onToggleWidget: (widgetId: string) => void
  presets: PresetInfo[]
  activePreset: string
  onApplyPreset: (presetName: string) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const ranges = ['5m', '15m', '30m', '1h', '6h', '24h']

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="grafana-toolbar">
      {/* Left: Presets and Widget Selects next to each other */}
      <div className="flex items-center gap-3">
        {/* Preset Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E8E] shrink-0">
            Preset:
          </span>
          <select
            value={activePreset}
            onChange={(e) => onApplyPreset(e.target.value)}
            className="grafana-select"
          >
            <option value="" disabled hidden>
              Custom Layout
            </option>
            {presets.map((p) => (
              <option key={p.name} value={p.name}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Widgets Selector */}
        <div className="flex items-center gap-1.5" ref={dropdownRef}>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E8E] shrink-0">
            Widgets:
          </span>
          <div className="grafana-dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="grafana-select flex items-center gap-1.5"
            >
              <span>
                {activeWidgets.length} / {availableWidgets.length} Active
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {dropdownOpen && (
              <div className="grafana-dropdown-menu">
                {availableWidgets.map((w) => {
                  const isActive = activeWidgets.includes(w.id)
                  return (
                    <button
                      key={w.id}
                      onClick={() => onToggleWidget(w.id)}
                      className="grafana-dropdown-item"
                    >
                      <span className={`grafana-dropdown-checkbox ${isActive ? 'checked' : ''}`} />
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: w.color }}
                      />
                      <span>{w.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Time range + Refresh */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="grafana-time-picker">
          <Clock className="w-3 h-3 text-[#8E8E8E]" />
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange?.(r)}
              className={`grafana-time-pill ${timeRange === r ? 'active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>

        <button onClick={onRefresh} className="grafana-refresh-btn" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Dashboard Drag Handle ────────────────────────────────────────────────────

export function DashboardDragHandle({ className = '' }: { className?: string }) {
  return (
    <div className={`grafana-drag-handle ${className}`} title="Drag to rearrange">
      <GripVertical className="w-3 h-3" />
    </div>
  )
}

// ── Dashboard Container ──────────────────────────────────────────────────────

export function DashboardContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`grafana-dashboard-container ${className}`}>{children}</div>
}
