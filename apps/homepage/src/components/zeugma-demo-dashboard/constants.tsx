'use client'

import { TreeNode } from 'react-zeugma'
import { Activity, BarChart3, Zap, Table2, ScrollText, Gauge } from 'lucide-react'

// ── Widget Registry ──────────────────────────────────────────────────────────

export const WIDGET_META: Record<string, { title: string; icon: React.ReactNode }> = {
  'time-series': {
    title: 'System Metrics',
    icon: <Activity className="w-3.5 h-3.5 text-[#5794F2]" />,
  },
  'requests-rate': {
    title: 'Request Rate',
    icon: <Activity className="w-3.5 h-3.5 text-[#B877D9]" />,
  },
  'service-health': {
    title: 'Service Health',
    icon: <BarChart3 className="w-3.5 h-3.5 text-[#73BF69]" />,
  },
  'key-metrics': { title: 'Key Metrics', icon: <Zap className="w-3.5 h-3.5 text-[#5794F2]" /> },
  'top-endpoints': {
    title: 'Top Endpoints',
    icon: <Table2 className="w-3.5 h-3.5 text-[#FF9830]" />,
  },
  'live-logs': { title: 'Live Logs', icon: <ScrollText className="w-3.5 h-3.5 text-[#73BF69]" /> },
  'cpu-gauge': { title: 'CPU Usage', icon: <Gauge className="w-3.5 h-3.5 text-[#5794F2]" /> },
  'mem-gauge': { title: 'Memory Usage', icon: <Gauge className="w-3.5 h-3.5 text-[#FF9830]" /> },
  'fps-monitor': {
    title: 'FPS Monitor',
    icon: <Activity className="w-3.5 h-3.5 text-[#B877D9]" />,
  },
}

export const AVAILABLE_WIDGETS = [
  { id: 'time-series', label: 'Metrics', color: '#5794F2' },
  { id: 'requests-rate', label: 'Req Rate', color: '#B877D9' },
  { id: 'service-health', label: 'Health', color: '#73BF69' },
  { id: 'key-metrics', label: 'Stats', color: '#5794F2' },
  { id: 'top-endpoints', label: 'Endpoints', color: '#FF9830' },
  { id: 'live-logs', label: 'Logs', color: '#73BF69' },
  { id: 'cpu-gauge', label: 'CPU', color: '#5794F2' },
  { id: 'mem-gauge', label: 'Memory', color: '#FF9830' },
  { id: 'fps-monitor', label: 'FPS', color: '#B877D9' },
]

export const PRESETS = [
  { name: 'all', label: 'Default Grid' },
  { name: 'system', label: 'Infrastructure' },
  { name: 'services', label: 'App Performance' },
  { name: 'minimal', label: 'Minimal Stats' },
]

// ── Preset Layout Definitions ────────────────────────────────────────────────

export const defaultDashboardLayout: TreeNode = {
  type: 'split',
  direction: 'column',
  splitPercentage: 30,
  first: {
    // Top row: stat cards + gauges
    type: 'split',
    direction: 'row',
    splitPercentage: 65,
    first: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-stats',
        tabs: ['key-metrics'],
        activeTabId: 'key-metrics',
      },
      second: {
        type: 'pane',
        id: 'pane-fps',
        tabs: ['fps-monitor'],
        activeTabId: 'fps-monitor',
      },
    },
    second: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-cpu',
        tabs: ['cpu-gauge'],
        activeTabId: 'cpu-gauge',
      },
      second: {
        type: 'pane',
        id: 'pane-mem',
        tabs: ['mem-gauge'],
        activeTabId: 'mem-gauge',
      },
    },
  },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: {
      // Middle row: time series + request rate
      type: 'split',
      direction: 'row',
      splitPercentage: 60,
      first: {
        type: 'pane',
        id: 'pane-timeseries',
        tabs: ['time-series'],
        activeTabId: 'time-series',
      },
      second: {
        type: 'pane',
        id: 'pane-requests',
        tabs: ['requests-rate'],
        activeTabId: 'requests-rate',
      },
    },
    second: {
      // Bottom row: service health + table + logs
      type: 'split',
      direction: 'row',
      splitPercentage: 25,
      first: {
        type: 'pane',
        id: 'pane-health',
        tabs: ['service-health'],
        activeTabId: 'service-health',
      },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 55,
        first: {
          type: 'pane',
          id: 'pane-table',
          tabs: ['top-endpoints'],
          activeTabId: 'top-endpoints',
        },
        second: {
          type: 'pane',
          id: 'pane-logs',
          tabs: ['live-logs'],
          activeTabId: 'live-logs',
        },
      },
    },
  },
}

export const systemFocusLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: {
    type: 'pane',
    id: 'pane-timeseries',
    tabs: ['time-series'],
    activeTabId: 'time-series',
  },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 40,
    first: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-stats',
        tabs: ['key-metrics'],
        activeTabId: 'key-metrics',
      },
      second: {
        type: 'pane',
        id: 'pane-fps',
        tabs: ['fps-monitor'],
        activeTabId: 'fps-monitor',
      },
    },
    second: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-cpu',
        tabs: ['cpu-gauge'],
        activeTabId: 'cpu-gauge',
      },
      second: {
        type: 'pane',
        id: 'pane-mem',
        tabs: ['mem-gauge'],
        activeTabId: 'mem-gauge',
      },
    },
  },
}

export const serviceFocusLayout: TreeNode = {
  type: 'split',
  direction: 'column',
  splitPercentage: 50,
  first: {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'pane-requests',
      tabs: ['requests-rate'],
      activeTabId: 'requests-rate',
    },
    second: {
      type: 'pane',
      id: 'pane-health',
      tabs: ['service-health'],
      activeTabId: 'service-health',
    },
  },
  second: {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'pane-table',
      tabs: ['top-endpoints'],
      activeTabId: 'top-endpoints',
    },
    second: {
      type: 'pane',
      id: 'pane-logs',
      tabs: ['live-logs'],
      activeTabId: 'live-logs',
    },
  },
}

export const minimalLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 35,
  first: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'pane-stats',
      tabs: ['key-metrics'],
      activeTabId: 'key-metrics',
    },
    second: {
      type: 'pane',
      id: 'pane-fps',
      tabs: ['fps-monitor'],
      activeTabId: 'fps-monitor',
    },
  },
  second: {
    type: 'pane',
    id: 'pane-logs',
    tabs: ['live-logs'],
    activeTabId: 'live-logs',
  },
}
