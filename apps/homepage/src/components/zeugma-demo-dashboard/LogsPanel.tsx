'use client'

import { useRef, useEffect } from 'react'
import { LogEntry } from './use-live-data'
import { PanelChrome } from './DashboardLayout'
import { ScrollText } from 'lucide-react'
import { useLiveDataContext } from './LiveDataProvider'

const LEVEL_STYLES: Record<LogEntry['level'], { color: string; bg: string }> = {
  INFO: { color: '#73BF69', bg: '#73BF6915' },
  WARN: { color: '#FF9830', bg: '#FF983015' },
  ERROR: { color: '#F2495C', bg: '#F2495C15' },
  DEBUG: { color: '#5794F2', bg: '#5794F215' },
}

function LogLine({ entry }: { entry: LogEntry }) {
  const style = LEVEL_STYLES[entry.level]

  return (
    <div className="grafana-log-line group">
      <span className="grafana-log-time">{entry.timestamp}</span>
      <span className="grafana-log-level" style={{ color: style.color, backgroundColor: style.bg }}>
        {entry.level}
      </span>
      <span className="grafana-log-service">{entry.service}</span>
      <span className="grafana-log-message">{entry.message}</span>
    </div>
  )
}

export function LogsPanel() {
  const { logs: data } = useLiveDataContext()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAutoScrollRef = useRef(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !isAutoScrollRef.current) return
    el.scrollTop = el.scrollHeight
  }, [data])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    isAutoScrollRef.current = atBottom
  }

  return (
    <PanelChrome title="Live Logs" icon={<ScrollText className="w-3.5 h-3.5 text-[#73BF69]" />}>
      <div className="relative h-full flex flex-col">
        {/* Header row */}
        <div className="grafana-log-header">
          <span className="w-[62px] shrink-0">Time</span>
          <span className="w-[42px] shrink-0">Level</span>
          <span className="w-[90px] shrink-0">Service</span>
          <span className="flex-1">Message</span>
        </div>

        {/* Log stream */}
        <div ref={scrollRef} onScroll={handleScroll} className="grafana-log-stream">
          {data.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
        </div>

        {/* Gradient fade at top */}
        <div className="absolute top-[22px] left-0 right-0 h-4 bg-linear-to-b from-[#141619] to-transparent pointer-events-none z-10" />
      </div>
    </PanelChrome>
  )
}
