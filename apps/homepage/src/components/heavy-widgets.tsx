'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSharedFps } from '../hooks/use-fps'
import {
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Cpu,
  HardDrive,
  Activity,
  Heart,
  Download,
  X,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Cell,
} from 'recharts'

// ==========================================
// 1. ANALYTICS WIDGET
// ==========================================
export function AnalyticsWidget() {
  const [activeMetric, setActiveMetric] = useState<'views' | 'users'>('views')
  const [totalViews] = useState(35500)
  const [totalUsers] = useState(14500)
  const [chartData, setChartData] = useState<{ time: string; views: number; users: number }[]>([])

  // Initialize rolling chart data
  useEffect(() => {
    const data = []
    const now = Date.now()
    for (let i = 7; i >= 0; i--) {
      const time = new Date(now - i * 4000)
      const timeStr = time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      data.push({
        time: timeStr,
        views: Math.floor(Math.random() * 400) + 150,
        users: Math.floor(Math.random() * 150) + 50,
      })
    }
    setChartData(data)
  }, [])

  // Live updates removed per user request

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Header Metric Choices */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveMetric('views')}
            className={`flex flex-col text-left px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activeMetric === 'views'
                ? 'border-indigo-500 bg-indigo-500/10 text-text-primary shadow-sm'
                : 'border-border-primary hover:border-border-secondary text-text-secondary'
            }`}
          >
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-70">
              Page Views
            </span>
            <span className="text-base font-extrabold font-sans">
              {totalViews.toLocaleString()}
            </span>
          </button>
          <button
            onClick={() => setActiveMetric('users')}
            className={`flex flex-col text-left px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activeMetric === 'users'
                ? 'border-indigo-500 bg-indigo-500/10 text-text-primary shadow-sm'
                : 'border-border-primary hover:border-border-secondary text-text-secondary'
            }`}
          >
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-70">
              Unique Visitors
            </span>
            <span className="text-base font-extrabold font-sans">
              {totalUsers.toLocaleString()}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 select-none">
            <TrendingUp className="w-3.5 h-3.5 animate-bounce" />
            <span>+24.8%</span>
          </div>
        </div>
      </div>

      {/* Recharts Area/Line Composed Chart */}
      <div className="flex-1 min-h-[140px] w-full relative bg-bg-pane-inner border border-border-primary/60 rounded-xl p-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%" debounce={200}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-primary)"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="var(--text-muted)"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dy={6}
              style={{ fontWeight: 'bold' }}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dx={-5}
              style={{ fontWeight: 'bold' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-950/95 backdrop-blur-md text-white dark:bg-white dark:text-zinc-950 px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] border border-border-secondary flex flex-col font-sans gap-0.5">
                      <span className="font-extrabold text-[9px] uppercase tracking-wider opacity-60">
                        {payload[0].payload.time}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-indigo-400">
                          Views: {payload[0].payload.views.toLocaleString()}
                        </span>
                        <span className="font-bold text-emerald-400">
                          Visitors: {payload[0].payload.users.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={activeMetric === 'views' ? '#6366f1' : '#10b981'}
              strokeWidth={2}
              fill={activeMetric === 'views' ? 'url(#colorViews)' : 'url(#colorUsers)'}
            />
            <Bar
              dataKey={activeMetric === 'views' ? 'users' : 'views'}
              barSize={16}
              fill={activeMetric === 'views' ? '#10b981' : '#6366f1'}
              opacity={0.15}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ==========================================
// 2. TRANSACTIONS TABLE WIDGET
// ==========================================
interface Transaction {
  id: string
  name: string
  email: string
  status: 'Completed' | 'Pending' | 'Failed'
  amount: number
  date: string
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    name: 'Alice Vance',
    email: 'alice@vance.io',
    status: 'Completed',
    amount: 120.5,
    date: 'June 09, 2026',
  },
  {
    id: '2',
    name: 'Bob Sterling',
    email: 'bob@sterling.co',
    status: 'Pending',
    amount: 45.0,
    date: 'June 08, 2026',
  },
  {
    id: '3',
    name: 'Charlie Dean',
    email: 'charlie@dean.net',
    status: 'Failed',
    amount: 15.25,
    date: 'June 07, 2026',
  },
  {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@themyscira.com',
    status: 'Completed',
    amount: 450.0,
    date: 'June 06, 2026',
  },
  {
    id: '5',
    name: 'Evan Wright',
    email: 'evan@wright.dev',
    status: 'Completed',
    amount: 89.99,
    date: 'June 05, 2026',
  },
  {
    id: '6',
    name: 'Fiona Gallagher',
    email: 'fiona@southside.co',
    status: 'Pending',
    amount: 110.0,
    date: 'June 04, 2026',
  },
  {
    id: '7',
    name: 'George Harrison',
    email: 'george@beatles.com',
    status: 'Completed',
    amount: 1500.0,
    date: 'June 03, 2026',
  },
]

export function TransactionsWidget() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const filteredData = useMemo(() => {
    return INITIAL_TRANSACTIONS.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage])

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Filter transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-bg-pane-inner border border-border-primary rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Table grid */}
      <div className="flex-1 overflow-x-auto min-h-[140px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-primary text-text-muted font-bold">
              <th className="py-2 px-1">User</th>
              <th className="py-2 px-1">Status</th>
              <th className="py-2 px-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-text-muted italic">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border-primary/40 hover:bg-bg-pane-inner/50 transition-colors"
                >
                  <td className="py-2.5 px-1 flex flex-col">
                    <span className="font-bold text-text-primary">{item.name}</span>
                    <span className="text-[10px] text-text-muted">{item.email}</span>
                  </td>
                  <td className="py-2.5 px-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : item.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono font-bold text-text-primary">
                    ${item.amount.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-border-primary select-none">
        <span className="text-[10px] text-text-muted font-semibold">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-border-primary hover:border-border-secondary bg-bg-pane text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-border-primary hover:border-border-secondary bg-bg-pane text-text-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. SYSTEM RESOURCE WIDGET
// ==========================================
export function SystemWidget() {
  const [metrics, setMetrics] = useState({
    cpu: 25,
    memory: 48,
    temp: 38,
    history: [] as { time: string; cpu: number; memory: number }[],
  })

  // Initialize history
  useEffect(() => {
    const initHistory: { time: string; cpu: number; memory: number }[] = []
    const now = Date.now()
    for (let i = 9; i >= 0; i--) {
      const t = new Date(now - i * 3000)
      initHistory.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.floor(Math.random() * 20) + 15,
        memory: Math.floor(Math.random() * 10) + 40,
      })
    }
    setMetrics((prev) => ({
      ...prev,
      history: initHistory,
    }))
  }, [])

  // Simulate server usage fluctuating slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const nextCpu = Math.max(5, Math.min(95, prev.cpu + (Math.floor(Math.random() * 15) - 7)))
        const nextMemory = Math.max(
          20,
          Math.min(95, prev.memory + (Math.floor(Math.random() * 5) - 2)),
        )
        const nextTemp = Math.max(35, Math.min(75, prev.temp + (Math.floor(Math.random() * 5) - 2)))

        const now = new Date()
        const timeStr = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })

        const newHistory = [...prev.history, { time: timeStr, cpu: nextCpu, memory: nextMemory }]
        if (newHistory.length > 12) {
          newHistory.shift()
        }

        return {
          cpu: nextCpu,
          memory: nextMemory,
          temp: nextTemp,
          history: newHistory,
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Radial Gauge Calculations
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (metrics.cpu / 100) * circumference

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Top Stats Row */}
      <div className="grid grid-cols-3 gap-2 items-center pb-2 border-b border-border-primary/60 select-none">
        {/* Radial CPU Gauge */}
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 overflow-visible">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-border-primary"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-rose-500 transition-all duration-500 ease-out"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-text-primary font-mono leading-none">
                {metrics.cpu}%
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
              CPU Load
            </span>
            <span className="text-[10px] font-semibold text-text-secondary">Active</span>
          </div>
        </div>

        {/* Quick stats list */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-rose-500" />
            <div className="flex flex-col">
              <span className="text-[7px] uppercase tracking-wider text-text-muted font-bold leading-none">
                Core Temp
              </span>
              <span className="text-[9px] font-bold text-text-primary font-mono">
                {metrics.temp}°C
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-indigo-500" />
            <div className="flex flex-col">
              <span className="text-[7px] uppercase tracking-wider text-text-muted font-bold leading-none">
                Disk Free
              </span>
              <span className="text-[9px] font-bold text-text-primary font-mono">14.2 GB</span>
            </div>
          </div>
        </div>

        {/* Memory status */}
        <div className="flex flex-col justify-center">
          <div className="flex justify-between text-[8px] font-bold text-text-secondary mb-1">
            <span>RAM</span>
            <span className="text-rose-500 font-mono">{metrics.memory}%</span>
          </div>
          <div className="w-full h-1 bg-bg-pane border border-border-primary/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${metrics.memory}%` }}
            />
          </div>
          <span className="text-[8px] text-text-muted font-semibold mt-1 text-right">
            {Math.round(metrics.memory * 0.16)}GB / 16GB
          </span>
        </div>
      </div>

      {/* Live Chart area */}
      <div className="flex-1 min-h-[120px] w-full relative bg-bg-pane-inner border border-border-primary/60 rounded-xl p-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%" debounce={200}>
          <ComposedChart data={metrics.history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-primary)"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="var(--text-muted)"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dy={4}
            />
            <YAxis
              domain={[0, 100]}
              stroke="var(--text-muted)"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dx={-4}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-950/95 backdrop-blur-md text-white dark:bg-white dark:text-zinc-950 px-2 py-1 rounded shadow-md text-[9px] border border-border-secondary flex flex-col font-sans">
                      <span className="font-extrabold text-[8px] uppercase tracking-wider opacity-60">
                        {payload[0].payload.time}
                      </span>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="font-bold text-rose-500">
                          CPU: {payload[0].payload.cpu}%
                        </span>
                        <span className="font-bold text-indigo-400">
                          RAM: {payload[0].payload.memory}%
                        </span>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#f43f5e"
              strokeWidth={1.5}
              fill="url(#colorCpu)"
            />
            <Area
              type="monotone"
              dataKey="memory"
              stroke="#6366f1"
              strokeWidth={1.5}
              fill="url(#colorMem)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ==========================================
// 4. IMAGE GALLERY WIDGET
// ==========================================
const GALLERY_IMAGES = [
  { id: '1', title: 'Gypsy Girl (Çingene Kızı)', src: '/images/zeugma-1.png', category: 'Mosaic' },
  { id: '2', title: 'Oceanus & Tethys', src: '/images/zeugma-2.png', category: 'Mythology' },
  { id: '3', title: 'Zeugma Ancient Ruins', src: '/images/zeugma-3.png', category: 'Archaeology' },
]

export function GalleryWidget() {
  const [likes, setLikes] = useState<Record<string, number>>({ '1': 14, '2': 32, '3': 8 })
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [activeImage, setActiveImage] = useState<(typeof GALLERY_IMAGES)[0] | null>(null)

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked((prev) => {
      const isLiked = !prev[id]
      setLikes((l) => ({ ...l, [id]: isLiked ? l[id] + 1 : l[id] - 1 }))
      return { ...prev, [id]: isLiked }
    })
  }

  return (
    <div className="h-full flex flex-col justify-between space-y-3 relative">
      {/* Images Grid */}
      <div className="grid grid-cols-3 gap-2 flex-1 items-center">
        {GALLERY_IMAGES.map((img) => (
          <div
            key={img.id}
            onClick={() => setActiveImage(img)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-border-primary cursor-pointer hover:border-indigo-500/50 shadow-sm transition-all duration-300"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {/* Overlay Info on Hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 flex flex-col justify-end">
              <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-wide leading-none">
                {img.category}
              </span>
              <span className="text-[10px] font-bold text-white truncate leading-tight mt-0.5">
                {img.title}
              </span>
            </div>

            {/* Quick Actions overlay */}
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
              <button
                onClick={(e) => handleLike(img.id, e)}
                className={`p-1 rounded bg-black/60 hover:bg-black/80 border border-white/10 text-white transition-colors cursor-pointer`}
              >
                <Heart
                  className={`w-3 h-3 ${liked[img.id] ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Bar */}
      <div className="text-[10px] text-text-muted flex items-center justify-between border-t border-border-primary/80 pt-2 select-none font-semibold">
        <span>Click an image to expand</span>
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-indigo-500" />
          <span>Gallery Feed Active</span>
        </span>
      </div>

      {/* Lightbox / Modal */}
      {activeImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Modal Image */}
            <div className="flex-1 aspect-video md:aspect-auto md:h-[450px] bg-black relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.src}
                alt={activeImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Sidebar Info */}
            <div className="w-full md:w-64 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900 text-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                    {activeImage.category}
                  </span>
                  <button
                    onClick={() => setActiveImage(null)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold tracking-tight">{activeImage.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ancient artwork from the Zeugma Mosaic Museum in Gaziantep, Turkey, showcasing
                    the rich history and craftsmanship of Roman-era mosaics.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-6">
                <div className="flex gap-1.5">
                  <button
                    onClick={(e) => handleLike(activeImage.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${liked[activeImage.id] ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                    <span>{likes[activeImage.id]}</span>
                  </button>
                  <a
                    href={activeImage.src}
                    download
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer transition-colors"
                    title="Download Asset"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider select-none">
                  Asset #{activeImage.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 5. CONVERSIONS FUNNEL WIDGET
// ==========================================
const FUNNEL_DATA = [
  { stage: 'Views', value: 12500, color: '#6366f1' },
  { stage: 'Signups', value: 4800, color: '#8b5cf6' },
  { stage: 'Downloads', value: 2100, color: '#ec4899' },
  { stage: 'Upgrades', value: 420, color: '#10b981' },
]

export function ConversionsWidget() {
  const [funnelData, setFunnelData] = useState(FUNNEL_DATA)

  useEffect(() => {
    const interval = setInterval(() => {
      setFunnelData((prev) =>
        prev.map((item) => {
          const deltaPercent = (Math.random() * 4 - 2) / 100 // +/- 2%
          let newValue = Math.round(item.value * (1 + deltaPercent))
          if (item.stage === 'Views') newValue = Math.max(10000, Math.min(15000, newValue))
          else if (item.stage === 'Signups') newValue = Math.max(3500, Math.min(6000, newValue))
          else if (item.stage === 'Downloads') newValue = Math.max(1500, Math.min(3000, newValue))
          else if (item.stage === 'Upgrades') newValue = Math.max(300, Math.min(600, newValue))
          return { ...item, value: newValue }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-4 gap-1.5 text-center select-none">
        {funnelData.map((item) => (
          <div
            key={item.stage}
            className="bg-bg-pane border border-border-primary/60 rounded p-1.5 flex flex-col"
          >
            <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
              {item.stage}
            </span>
            <span className="text-xs font-extrabold text-text-primary font-mono mt-0.5">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Horizontal Bar Chart */}
      <div className="flex-1 min-h-[120px] w-full bg-bg-pane-inner border border-border-primary/60 rounded-xl p-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%" debounce={200}>
          <BarChart
            layout="vertical"
            data={funnelData}
            margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="stage"
              type="category"
              stroke="var(--text-secondary)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              style={{ fontWeight: 'bold' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-950/95 backdrop-blur-md text-white dark:bg-white dark:text-zinc-950 px-2 py-1 rounded shadow-md text-[10px] border border-border-secondary flex flex-col font-sans">
                      <span className="font-bold">{payload[0].name}</span>
                      <span className="font-mono mt-0.5">
                        {payload[0].value?.toLocaleString()} users
                      </span>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ==========================================
// 6. TASKS CHECKLIST WIDGET
// ==========================================
interface TaskItem {
  id: string
  text: string
  done: boolean
  priority: 'High' | 'Medium' | 'Low'
}

export function TasksWidget() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', text: 'Implement Zeugma layout sync', done: true, priority: 'High' },
    { id: '2', text: 'Optimize drag-and-drop re-renders', done: true, priority: 'High' },
    { id: '3', text: 'Integrate Recharts libraries for analytics', done: true, priority: 'Medium' },
    { id: '4', text: 'Add 6-widget Heavy UI grid preset', done: false, priority: 'High' },
    { id: '5', text: 'Write automated unit tests for drag/drop', done: false, priority: 'Low' },
  ])

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const completedCount = tasks.filter((t) => t.done).length
  const progressPercent = Math.round((completedCount / tasks.length) * 100)

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Progress Header */}
      <div className="space-y-1.5 select-none">
        <div className="flex justify-between text-[10px] font-bold text-text-secondary">
          <span>Task Progress</span>
          <span className="text-indigo-500 font-mono">
            {completedCount} / {tasks.length} Completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-bg-pane border border-border-primary/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-[120px] max-h-[140px] pr-1">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleTask(t.id)}
            className="flex items-start gap-2.5 p-2 bg-bg-pane-inner border border-border-primary/40 rounded-lg hover:border-border-primary cursor-pointer select-none transition-all"
          >
            <button className="pt-0.5 text-text-muted hover:text-indigo-500 transition-colors">
              {t.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
              ) : (
                <Circle className="w-4 h-4 text-text-muted" />
              )}
            </button>
            <div className="flex-1 flex flex-col min-w-0">
              <span
                className={`text-xs font-medium truncate ${t.done ? 'line-through text-text-muted' : 'text-text-primary'}`}
              >
                {t.text}
              </span>
              <div className="flex gap-1.5 mt-0.5">
                <span
                  className={`text-[8px] font-extrabold uppercase px-1 rounded ${
                    t.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10'
                      : t.priority === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                        : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/10'
                  }`}
                >
                  {t.priority}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// 7. PERFORMANCE MONITOR WIDGET
// ==========================================
export function PerformanceWidget() {
  const { fps, history } = useSharedFps()

  const averageFps = Math.round(history.reduce((a, b) => a + b, 0) / history.length)
  const minFps = Math.min(...history)
  const maxFps = Math.max(...history)

  const isSlow = fps < 30
  const isWarning = fps >= 30 && fps < 50

  const statusText = isSlow ? 'Severe Lag' : isWarning ? 'Degraded' : 'Optimal'
  const statusColorClass = isSlow
    ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    : isWarning
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'

  const dotColorClass = isSlow ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'

  // Pre-calculate line points for SVG sparkline
  const pointsString = useMemo(() => {
    const maxVal = Math.max(...history, 60)
    const minVal = Math.min(...history, 0)
    const range = maxVal - minVal || 1
    return history
      .map((val, idx) => {
        const x = (idx / (history.length - 1)) * 100
        const y = 60 - ((val - minVal) / range) * 55
        return `${x},${y}`
      })
      .join(' ')
  }, [history])

  const triggerLag = () => {
    const start = performance.now()
    while (performance.now() - start < 200) {
      // Intentionally block the main thread for 200ms
    }
  }

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Top row: Big FPS Display and status badge */}
      <div className="flex items-center justify-between select-none">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold font-sans text-text-primary tracking-tight">
            {fps}
          </span>
          <span className="text-xs font-bold text-text-muted">FPS</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold transition-colors duration-300 ${statusColorClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColorClass}`} />
            {statusText.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-3 gap-2 select-none">
        <div className="bg-bg-pane border border-border-primary/60 rounded-lg p-2 text-center flex flex-col">
          <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
            Min FPS
          </span>
          <span className="text-sm font-extrabold text-text-primary font-mono mt-0.5">
            {minFps}
          </span>
        </div>
        <div className="bg-bg-pane border border-border-primary/60 rounded-lg p-2 text-center flex flex-col">
          <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
            Avg FPS
          </span>
          <span className="text-sm font-extrabold text-text-primary font-mono mt-0.5">
            {averageFps}
          </span>
        </div>
        <div className="bg-bg-pane border border-border-primary/60 rounded-lg p-2 text-center flex flex-col">
          <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
            Max FPS
          </span>
          <span className="text-sm font-extrabold text-text-primary font-mono mt-0.5">
            {maxFps}
          </span>
        </div>
      </div>

      {/* Real-time Sparkline SVG Chart */}
      <div className="flex-1 min-h-[70px] w-full bg-bg-pane-inner border border-border-primary/60 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-1 select-none">
          <div className="text-[8px] uppercase tracking-wider text-text-muted font-bold">
            Frame Stability History
          </div>
          <div className="flex items-center gap-1 text-[7px] text-emerald-500 font-bold tracking-wider animate-pulse">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span>CALCULATING PERFORMANCE</span>
          </div>
        </div>
        <div className="flex-1 w-full h-[60px] relative">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
          >
            {/* Grid Line markers */}
            <line
              x1="0"
              y1="5"
              x2="100"
              y2="5"
              stroke="var(--border-primary)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity="0.3"
            />
            <line
              x1="0"
              y1="30"
              x2="100"
              y2="30"
              stroke="var(--border-primary)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity="0.3"
            />
            <line
              x1="0"
              y1="55"
              x2="100"
              y2="55"
              stroke="var(--border-primary)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity="0.3"
            />

            {/* Gradient definition for glow effect */}
            <defs>
              <linearGradient id="fpsGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            {pointsString && (
              <polygon points={`0,60 ${pointsString} 100,60`} fill="url(#fpsGlow)" />
            )}

            {/* Line plot */}
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />
          </svg>
        </div>
      </div>

      {/* Simulate lag button */}
      <button
        onClick={triggerLag}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98] select-none"
      >
        <Activity className="w-3.5 h-3.5 animate-pulse" />
        Simulate Heavy Main-Thread Load (200ms)
      </button>
    </div>
  )
}
