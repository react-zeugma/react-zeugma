'use client'

import { PanelChrome } from './DashboardLayout'
import { Table2, ArrowUpDown } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useLiveDataContext } from './LiveDataProvider'

type SortKey = 'endpoint' | 'avgLatency' | 'p99Latency' | 'rpm' | 'errorRate'
type SortDir = 'asc' | 'desc'

const METHOD_COLORS: Record<string, string> = {
  GET: '#73BF69',
  POST: '#5794F2',
  PUT: '#FF9830',
  DELETE: '#F2495C',
}

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className="grafana-method-badge"
      style={{ color: METHOD_COLORS[method], borderColor: `${METHOD_COLORS[method]}30` }}
    >
      {method}
    </span>
  )
}

function StatusBadge({ status }: { status: number }) {
  const color = status < 300 ? '#73BF69' : status < 400 ? '#FF9830' : '#F2495C'
  return (
    <span className="grafana-status-badge" style={{ color, backgroundColor: `${color}15` }}>
      {status}
    </span>
  )
}

function LatencyCell({ value }: { value: number }) {
  const color = value < 50 ? '#73BF69' : value < 200 ? '#FF9830' : '#F2495C'
  return (
    <span className="tabular-nums font-mono text-[10px]" style={{ color }}>
      {value}ms
    </span>
  )
}

export function TablePanel() {
  const { endpoints: data } = useLiveDataContext()
  const [sortKey, setSortKey] = useState<SortKey>('rpm')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [data, sortKey, sortDir])

  const columns: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'endpoint', label: 'Endpoint' },
    { key: 'avgLatency', label: 'Avg', align: 'right' },
    { key: 'p99Latency', label: 'P99', align: 'right' },
    { key: 'rpm', label: 'RPM', align: 'right' },
    { key: 'errorRate', label: 'Err%', align: 'right' },
  ]

  return (
    <PanelChrome title="Top Endpoints" icon={<Table2 className="w-3.5 h-3.5 text-[#FF9830]" />}>
      <div className="h-full overflow-auto">
        <table className="grafana-table">
          <thead>
            <tr>
              <th className="w-[40px]"></th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`cursor-pointer hover:text-[#D8D9DA] transition-colors select-none ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <ArrowUpDown className="w-2.5 h-2.5 text-[#5794F2]" />}
                  </span>
                </th>
              ))}
              <th className="w-[40px] text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className="grafana-table-row">
                <td>
                  <MethodBadge method={row.method} />
                </td>
                <td className="text-[#D8D9DA] font-mono text-[10px]">{row.endpoint}</td>
                <td className="text-right">
                  <LatencyCell value={row.avgLatency} />
                </td>
                <td className="text-right">
                  <LatencyCell value={row.p99Latency} />
                </td>
                <td className="text-right">
                  <span className="tabular-nums font-mono text-[10px] text-[#B877D9]">
                    {row.rpm.toLocaleString()}
                  </span>
                </td>
                <td className="text-right">
                  <span
                    className="tabular-nums font-mono text-[10px]"
                    style={{
                      color:
                        row.errorRate > 2 ? '#F2495C' : row.errorRate > 0.5 ? '#FF9830' : '#73BF69',
                    }}
                  >
                    {row.errorRate.toFixed(2)}%
                  </span>
                </td>
                <td className="text-right">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelChrome>
  )
}
