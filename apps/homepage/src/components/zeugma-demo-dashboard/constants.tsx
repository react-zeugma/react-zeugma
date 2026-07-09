'use client'

import { TreeNode } from 'react-zeugma'
import { Activity, BarChart3, Zap, Table2, ScrollText, Gauge, MapPin } from 'lucide-react'

// ── Widget Registry ──────────────────────────────────────────────────────────

export const WIDGET_META: Record<string, { title: string; icon: React.ReactNode }> = {
  'time-series': {
    title: 'System Metrics',
    icon: <Activity className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'requests-rate': {
    title: 'Request Rate',
    icon: <Activity className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'service-health': {
    title: 'Service Health',
    icon: <BarChart3 className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'key-metrics': {
    title: 'Key Metrics',
    icon: <Zap className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'top-endpoints': {
    title: 'Top Endpoints',
    icon: <Table2 className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'live-logs': {
    title: 'Live Logs',
    icon: <ScrollText className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'cpu-gauge': {
    title: 'CPU Usage',
    icon: <Gauge className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'mem-gauge': {
    title: 'Memory Usage',
    icon: <Gauge className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'fps-monitor': {
    title: 'FPS Monitor',
    icon: <Activity className="w-3.5 h-3.5 text-[#8b8f97]" />,
  },
  'system-map': {
    title: 'System Node Map',
    icon: <MapPin className="w-3.5 h-3.5 text-[#8b8f97]" />,
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
  { id: 'system-map', label: 'Node Map', color: '#5794F2' },
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
        tabIds: ['key-metrics', 'system-map'],
        activeTabId: 'key-metrics',
        tabsMetadata: {
          'key-metrics': { color: '#5794F2' },
          'system-map': { color: '#5794F2', remountOnPopout: true },
        },
      },
      second: {
        type: 'pane',
        id: 'pane-fps',
        tabIds: ['fps-monitor'],
        activeTabId: 'fps-monitor',
        tabsMetadata: {
          'fps-monitor': { color: '#B877D9' },
        },
      },
    },
    second: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-cpu',
        tabIds: ['cpu-gauge'],
        activeTabId: 'cpu-gauge',
        tabsMetadata: {
          'cpu-gauge': { color: '#5794F2' },
        },
      },
      second: {
        type: 'pane',
        id: 'pane-mem',
        tabIds: ['mem-gauge'],
        activeTabId: 'mem-gauge',
        tabsMetadata: {
          'mem-gauge': { color: '#FF9830' },
        },
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
        tabIds: ['time-series'],
        activeTabId: 'time-series',
        tabsMetadata: {
          'time-series': { color: '#5794F2' },
        },
      },
      second: {
        type: 'pane',
        id: 'pane-requests',
        tabIds: ['requests-rate'],
        activeTabId: 'requests-rate',
        tabsMetadata: {
          'requests-rate': { color: '#B877D9' },
        },
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
        tabIds: ['service-health'],
        activeTabId: 'service-health',
        tabsMetadata: {
          'service-health': { color: '#73BF69' },
        },
      },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 55,
        first: {
          type: 'pane',
          id: 'pane-table',
          tabIds: ['top-endpoints'],
          activeTabId: 'top-endpoints',
          tabsMetadata: {
            'top-endpoints': { color: '#FF9830' },
          },
        },
        second: {
          type: 'pane',
          id: 'pane-logs',
          tabIds: ['live-logs'],
          activeTabId: 'live-logs',
          tabsMetadata: {
            'live-logs': { color: '#73BF69' },
          },
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
    tabIds: ['time-series'],
    activeTabId: 'time-series',
    tabsMetadata: {
      'time-series': { color: '#5794F2' },
    },
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
        tabIds: ['key-metrics'],
        activeTabId: 'key-metrics',
        tabsMetadata: {
          'key-metrics': { color: '#5794F2' },
        },
      },
      second: {
        type: 'pane',
        id: 'pane-fps',
        tabIds: ['fps-monitor'],
        activeTabId: 'fps-monitor',
        tabsMetadata: {
          'fps-monitor': { color: '#B877D9' },
        },
      },
    },
    second: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-cpu',
        tabIds: ['cpu-gauge'],
        activeTabId: 'cpu-gauge',
        tabsMetadata: {
          'cpu-gauge': { color: '#5794F2' },
        },
      },
      second: {
        type: 'pane',
        id: 'pane-mem',
        tabIds: ['mem-gauge'],
        activeTabId: 'mem-gauge',
        tabsMetadata: {
          'mem-gauge': { color: '#FF9830' },
        },
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
      tabIds: ['requests-rate'],
      activeTabId: 'requests-rate',
      tabsMetadata: {
        'requests-rate': { color: '#B877D9' },
      },
    },
    second: {
      type: 'pane',
      id: 'pane-health',
      tabIds: ['service-health'],
      activeTabId: 'service-health',
      tabsMetadata: {
        'service-health': { color: '#73BF69' },
      },
    },
  },
  second: {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'pane-table',
      tabIds: ['top-endpoints'],
      activeTabId: 'top-endpoints',
      tabsMetadata: {
        'top-endpoints': { color: '#FF9830' },
      },
    },
    second: {
      type: 'pane',
      id: 'pane-logs',
      tabIds: ['live-logs'],
      activeTabId: 'live-logs',
      tabsMetadata: {
        'live-logs': { color: '#73BF69' },
      },
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
      tabIds: ['key-metrics'],
      activeTabId: 'key-metrics',
      tabsMetadata: {
        'key-metrics': { color: '#5794F2' },
      },
    },
    second: {
      type: 'pane',
      id: 'pane-fps',
      tabIds: ['fps-monitor'],
      activeTabId: 'fps-monitor',
      tabsMetadata: {
        'fps-monitor': { color: '#B877D9' },
      },
    },
  },
  second: {
    type: 'pane',
    id: 'pane-logs',
    tabIds: ['live-logs'],
    activeTabId: 'live-logs',
    tabsMetadata: {
      'live-logs': { color: '#73BF69' },
    },
  },
}

export const PRESETS = [
  { name: 'all', label: 'Default Grid', layout: defaultDashboardLayout },
  { name: 'system', label: 'Infrastructure', layout: systemFocusLayout },
  { name: 'services', label: 'App Performance', layout: serviceFocusLayout },
  { name: 'minimal', label: 'Minimal Stats', layout: minimalLayout },
]
