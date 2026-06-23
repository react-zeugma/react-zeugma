'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

export interface MetricPoint {
  time: string
  cpu: number
  memory: number
  network: number
  requests: number
  errors: number
  latency: number
}

export interface ServiceHealth {
  name: string
  health: number
  status: 'healthy' | 'degraded' | 'critical'
}

export interface EndpointRow {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  status: number
  avgLatency: number
  p99Latency: number
  rpm: number
  errorRate: number
}

export interface LogEntry {
  id: number
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  service: string
  message: string
}

export interface LiveStats {
  requestsPerSec: number
  uptime: number
  p99Latency: number
  errorRate: number
  requestsTrend: number[]
  uptimeTrend: number[]
  latencyTrend: number[]
  errorTrend: number[]
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function randomWalk(prev: number, volatility: number, min: number, max: number): number {
  const delta = (Math.random() - 0.48) * volatility // slight upward drift
  return clamp(prev + delta, min, max)
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const SERVICES = [
  'api-gateway',
  'auth-service',
  'user-service',
  'payment-service',
  'notification-svc',
  'search-engine',
  'cache-layer',
  'worker-pool',
]

const ENDPOINTS: Omit<EndpointRow, 'avgLatency' | 'p99Latency' | 'rpm' | 'errorRate'>[] = [
  { endpoint: '/api/v1/users', method: 'GET', status: 200 },
  { endpoint: '/api/v1/auth/login', method: 'POST', status: 200 },
  { endpoint: '/api/v1/payments', method: 'POST', status: 201 },
  { endpoint: '/api/v1/search', method: 'GET', status: 200 },
  { endpoint: '/api/v1/notifications', method: 'GET', status: 200 },
  { endpoint: '/api/v1/users/:id', method: 'PUT', status: 200 },
  { endpoint: '/api/v1/webhooks', method: 'POST', status: 202 },
  { endpoint: '/api/v1/health', method: 'GET', status: 200 },
]

const LOG_MESSAGES: { level: LogEntry['level']; messages: string[] }[] = [
  {
    level: 'INFO',
    messages: [
      'Request processed successfully',
      'Cache hit for user session',
      'Websocket connection established',
      'Background job completed',
      'Health check passed',
      'Rate limiter reset for client pool',
      'Database connection pool scaled to 25',
      'CDN cache invalidated for /assets/*',
    ],
  },
  {
    level: 'WARN',
    messages: [
      'Slow query detected: 450ms on users_table',
      'Rate limit approaching threshold (85%)',
      'Memory usage above 80%',
      'Connection pool nearing capacity',
      'Deprecated API endpoint called: /v0/legacy',
      'Certificate expires in 14 days',
    ],
  },
  {
    level: 'ERROR',
    messages: [
      'Failed to connect to payment gateway',
      'Timeout on upstream service: auth-service',
      'Unhandled rejection in worker thread #3',
      'Database replica lag exceeds 5s',
    ],
  },
  {
    level: 'DEBUG',
    messages: [
      'Parsed request body: 2.3KB',
      'Token validation: JWT exp check passed',
      'Serializing response payload',
      'Query planner selected index: idx_user_email',
    ],
  },
]

// ── Seed data ────────────────────────────────────────────────────────────────

function generateInitialTimeSeries(count: number): MetricPoint[] {
  const points: MetricPoint[] = []
  const now = Date.now()
  let cpu = 45
  let memory = 62
  let network = 120
  let requests = 850
  let errors = 12
  let latency = 45

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * 2000)
    cpu = randomWalk(cpu, 8, 15, 95)
    memory = randomWalk(memory, 3, 40, 88)
    network = randomWalk(network, 25, 20, 350)
    requests = randomWalk(requests, 80, 400, 1500)
    errors = randomWalk(errors, 5, 0, 60)
    latency = randomWalk(latency, 10, 10, 150)

    points.push({
      time: formatTime(t),
      cpu: Math.round(cpu * 10) / 10,
      memory: Math.round(memory * 10) / 10,
      network: Math.round(network),
      requests: Math.round(requests),
      errors: Math.round(errors),
      latency: Math.round(latency * 10) / 10,
    })
  }
  return points
}

function generateServiceHealth(): ServiceHealth[] {
  return SERVICES.map((name) => {
    const health = Math.random() > 0.15 ? 85 + Math.random() * 15 : 40 + Math.random() * 40
    return {
      name,
      health: Math.round(health),
      status: health >= 90 ? 'healthy' : health >= 70 ? 'degraded' : 'critical',
    }
  })
}

function generateEndpoints(): EndpointRow[] {
  return ENDPOINTS.map((ep) => ({
    ...ep,
    avgLatency: Math.round(15 + Math.random() * 120),
    p99Latency: Math.round(80 + Math.random() * 400),
    rpm: Math.round(50 + Math.random() * 950),
    errorRate: Math.round(Math.random() * 500) / 100,
  }))
}

function generateLogEntry(id: number): LogEntry {
  const levelGroup =
    LOG_MESSAGES[Math.random() < 0.6 ? 0 : Math.random() < 0.75 ? 3 : Math.random() < 0.85 ? 1 : 2]
  const message = levelGroup.messages[Math.floor(Math.random() * levelGroup.messages.length)]
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)]

  return {
    id,
    timestamp: formatTime(new Date()),
    level: levelGroup.level,
    service,
    message,
  }
}

// ── Main Hook ────────────────────────────────────────────────────────────────

export function useLiveData(intervalMs = 2000) {
  const logIdRef = useRef(0)

  const [timeSeries, setTimeSeries] = useState<MetricPoint[]>(() => generateInitialTimeSeries(30))
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>(generateServiceHealth)
  const [endpoints, setEndpoints] = useState<EndpointRow[]>(generateEndpoints)
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const initial: LogEntry[] = []
    for (let i = 0; i < 15; i++) {
      initial.push(generateLogEntry(logIdRef.current++))
    }
    return initial
  })
  const [stats, setStats] = useState<LiveStats>({
    requestsPerSec: 847,
    uptime: 99.97,
    p99Latency: 142,
    errorRate: 0.23,
    requestsTrend: Array.from({ length: 12 }, () => 700 + Math.random() * 400),
    uptimeTrend: Array.from({ length: 12 }, () => 99.5 + Math.random() * 0.5),
    latencyTrend: Array.from({ length: 12 }, () => 80 + Math.random() * 100),
    errorTrend: Array.from({ length: 12 }, () => Math.random() * 2),
  })
  const [cpuGauge, setCpuGauge] = useState(52)
  const [memGauge, setMemGauge] = useState(67)

  const tick = useCallback(() => {
    // Time series
    setTimeSeries((prev) => {
      const last = prev[prev.length - 1]
      const newPoint: MetricPoint = {
        time: formatTime(new Date()),
        cpu: Math.round(randomWalk(last.cpu, 8, 15, 95) * 10) / 10,
        memory: Math.round(randomWalk(last.memory, 3, 40, 88) * 10) / 10,
        network: Math.round(randomWalk(last.network, 25, 20, 350)),
        requests: Math.round(randomWalk(last.requests, 80, 400, 1500)),
        errors: Math.round(randomWalk(last.errors, 5, 0, 60)),
        latency: Math.round(randomWalk(last.latency, 10, 10, 150) * 10) / 10,
      }
      return [...prev.slice(-29), newPoint]
    })

    // Service health — subtle shifts
    setServiceHealth((prev) =>
      prev.map((s) => {
        const h = clamp(s.health + (Math.random() - 0.48) * 4, 30, 100)
        const health = Math.round(h)
        return {
          ...s,
          health,
          status: health >= 90 ? 'healthy' : health >= 70 ? 'degraded' : 'critical',
        }
      }),
    )

    // Endpoints
    setEndpoints((prev) =>
      prev.map((ep) => ({
        ...ep,
        avgLatency: Math.max(5, Math.round(ep.avgLatency + (Math.random() - 0.5) * 15)),
        p99Latency: Math.max(20, Math.round(ep.p99Latency + (Math.random() - 0.5) * 30)),
        rpm: Math.max(10, Math.round(ep.rpm + (Math.random() - 0.5) * 60)),
        errorRate: Math.max(
          0,
          Math.round((ep.errorRate + (Math.random() - 0.5) * 0.4) * 100) / 100,
        ),
      })),
    )

    // Logs
    setLogs((prev) => {
      const count = Math.random() < 0.3 ? 2 : 1
      const newEntries: LogEntry[] = []
      for (let i = 0; i < count; i++) {
        newEntries.push(generateLogEntry(logIdRef.current++))
      }
      return [...prev, ...newEntries].slice(-80)
    })

    // Stats
    setStats((prev) => {
      const rps = clamp(prev.requestsPerSec + (Math.random() - 0.48) * 60, 300, 1600)
      const uptime = clamp(prev.uptime + (Math.random() - 0.3) * 0.01, 99.0, 100)
      const p99 = clamp(prev.p99Latency + (Math.random() - 0.5) * 20, 40, 500)
      const errRate = clamp(prev.errorRate + (Math.random() - 0.48) * 0.1, 0, 5)
      return {
        requestsPerSec: Math.round(rps),
        uptime: Math.round(uptime * 100) / 100,
        p99Latency: Math.round(p99),
        errorRate: Math.round(errRate * 100) / 100,
        requestsTrend: [...prev.requestsTrend.slice(-11), rps],
        uptimeTrend: [...prev.uptimeTrend.slice(-11), uptime],
        latencyTrend: [...prev.latencyTrend.slice(-11), p99],
        errorTrend: [...prev.errorTrend.slice(-11), errRate],
      }
    })

    // Gauges
    setCpuGauge((prev) => Math.round(clamp(prev + (Math.random() - 0.48) * 8, 10, 95)))
    setMemGauge((prev) => Math.round(clamp(prev + (Math.random() - 0.48) * 4, 35, 92)))
  }, [])

  useEffect(() => {
    const id = setInterval(tick, intervalMs)
    return () => clearInterval(id)
  }, [tick, intervalMs])

  return { timeSeries, serviceHealth, endpoints, logs, stats, cpuGauge, memGauge }
}
