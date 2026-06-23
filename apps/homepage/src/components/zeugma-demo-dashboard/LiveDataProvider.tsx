'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useLiveData } from './use-live-data'
import type { MetricPoint, ServiceHealth, EndpointRow, LogEntry, LiveStats } from './use-live-data'

// ── Context ──────────────────────────────────────────────────────────────────

interface LiveDataContextValue {
  timeSeries: MetricPoint[]
  serviceHealth: ServiceHealth[]
  endpoints: EndpointRow[]
  logs: LogEntry[]
  stats: LiveStats
  cpuGauge: number
  memGauge: number
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function LiveDataProvider({
  children,
  intervalMs = 2000,
}: {
  children: ReactNode
  intervalMs?: number
}) {
  const data = useLiveData(intervalMs)

  return <LiveDataContext.Provider value={data}>{children}</LiveDataContext.Provider>
}

// ── Consumer hook ────────────────────────────────────────────────────────────

export function useLiveDataContext() {
  const ctx = useContext(LiveDataContext)
  if (!ctx) {
    throw new Error('useLiveDataContext must be used within a LiveDataProvider')
  }
  return ctx
}
