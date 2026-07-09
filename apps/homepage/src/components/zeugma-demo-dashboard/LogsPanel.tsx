'use client'

import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LogEntry } from './use-live-data'
import { PanelChrome } from './DashboardLayout'
import { ScrollText, ChevronDown } from 'lucide-react'
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

function LogLevelDropdown({
  selectedLevel,
  onChange,
}: {
  selectedLevel: string
  onChange: (level: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })

  const handleToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = () => {
      setIsOpen(false)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [isOpen])

  const dropdownMenu = isOpen && (
    <div
      style={{
        position: 'absolute',
        top: coords.top + 4,
        left: coords.left,
        minWidth: Math.max(120, coords.width),
        backgroundColor: '#181b1f',
        border: '1px solid #2c3035',
        borderRadius: '4px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        padding: '4px 0',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((level) => (
        <button
          key={level}
          onClick={() => {
            onChange(level)
            setIsOpen(false)
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '6px 12px',
            fontSize: '11px',
            textAlign: 'left',
            color: selectedLevel === level ? '#5794f2' : '#ccccdc',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: selectedLevel === level ? 700 : 500,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2c3035'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = selectedLevel === level ? '#5794f2' : '#ccccdc'
          }}
        >
          {level}
        </button>
      ))}
    </div>
  )

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          handleToggle()
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1e2127] hover:bg-[#2c3035] border border-[#2c3035] rounded text-white text-[10px] font-bold cursor-pointer transition-colors"
      >
        <span>Level: {selectedLevel}</span>
        <ChevronDown className="w-3 h-3 text-[#8e8e8e]" />
      </button>
      {isOpen && createPortal(dropdownMenu, document.body)}
    </div>
  )
}

export function LogsPanel() {
  const { logs: data } = useLiveDataContext()
  const [selectedLevel, setSelectedLevel] = useState('ALL')
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAutoScrollRef = useRef(true)

  const filteredLogs = data.filter((entry) => {
    if (selectedLevel === 'ALL') return true
    return entry.level === selectedLevel
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !isAutoScrollRef.current) return
    el.scrollTop = el.scrollHeight
  }, [filteredLogs])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    isAutoScrollRef.current = atBottom
  }

  return (
    <PanelChrome title="Live Logs" icon={<ScrollText className="w-3.5 h-3.5 text-[#73BF69]" />}>
      <div className="relative h-full flex flex-col bg-[#141619]">
        {/* Filter bar */}
        <div className="flex items-center justify-between p-1.5 bg-[#161719] border-b border-[#2c3035] text-xs shrink-0 select-none">
          <span className="text-[#8e8e8e] text-[9px] font-bold uppercase tracking-wider pl-1">
            Log Filter
          </span>
          <LogLevelDropdown selectedLevel={selectedLevel} onChange={setSelectedLevel} />
        </div>

        {/* Header row */}
        <div className="grafana-log-header select-none shrink-0">
          <span className="w-[62px] shrink-0">Time</span>
          <span className="w-[42px] shrink-0">Level</span>
          <span className="w-[90px] shrink-0">Service</span>
          <span className="flex-1">Message</span>
        </div>

        {/* Log stream */}
        <div ref={scrollRef} onScroll={handleScroll} className="grafana-log-stream flex-1 min-h-0">
          {filteredLogs.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))}
        </div>

        {/* Gradient fade at top */}
        <div className="absolute top-[52px] left-0 right-0 h-4 bg-linear-to-b from-[#141619] to-transparent pointer-events-none z-10" />
      </div>
    </PanelChrome>
  )
}
