'use client'

import React, { useState } from 'react'
import { useZeugmaState, addPane } from 'react-zeugma'
import type { TreeNode } from 'react-zeugma'
import {
  Code2,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Sliders,
  X,
} from 'lucide-react'
import { FpsMonitor } from './fps-monitor'

export interface LogEntry {
  id: string
  time: string
  type: 'drag' | 'resize'
  message: string
}

interface SidebarWrapperProps {
  children: React.ReactNode
  snapThreshold: number
  onSnapThresholdChange: (val: number) => void
  minSplitPercentage: number
  onMinSplitPercentageChange: (val: number) => void
  maxSplitPercentage: number
  onMaxSplitPercentageChange: (val: number) => void
  resizableHeight: boolean
  onResizableHeightChange: (val: boolean) => void
  logs: LogEntry[]
  onPresetChange?: (presetKey: string) => void
}

export const PRESETS: Record<string, { label: string; layout: TreeNode }> = {
  default: {
    label: 'Default Layout',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 20,
      first: { type: 'pane', paneId: 'explorer' },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 50,
        first: { type: 'pane', paneId: 'editor' },
        second: { type: 'pane', paneId: 'preview' },
      },
    },
  },
  'split-screen': {
    label: 'Split Screen (Editor & Preview)',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: { type: 'pane', paneId: 'editor' },
      second: { type: 'pane', paneId: 'preview' },
    },
  },
  'heavy-ui': {
    label: 'Heavy UI Dashboard',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 33.3,
      first: {
        type: 'split',
        direction: 'column',
        splitPercentage: 50,
        first: {
          type: 'pane',
          paneId: 'heavy-analytics',
          metadata: { title: 'Analytics Dashboard', color: 'indigo' },
        },
        second: {
          type: 'pane',
          paneId: 'heavy-conversions',
          metadata: { title: 'Conversion Funnel', color: 'violet' },
        },
      },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 50,
        first: {
          type: 'split',
          direction: 'column',
          splitPercentage: 55,
          first: {
            type: 'pane',
            paneId: 'heavy-transactions',
            metadata: { title: 'Recent Transactions', color: 'emerald' },
          },
          second: {
            type: 'pane',
            paneId: 'heavy-tasks',
            metadata: { title: 'Development Tasks', color: 'amber' },
          },
        },
        second: {
          type: 'split',
          direction: 'column',
          splitPercentage: 33.3,
          first: {
            type: 'pane',
            paneId: 'heavy-performance',
            metadata: { title: 'Performance Monitor', color: 'sky' },
          },
          second: {
            type: 'split',
            direction: 'column',
            splitPercentage: 50,
            first: {
              type: 'pane',
              paneId: 'heavy-system',
              metadata: { title: 'System Status', color: 'rose' },
            },
            second: {
              type: 'pane',
              paneId: 'heavy-gallery',
              metadata: { title: 'Media Assets', color: 'sky' },
            },
          },
        },
      },
    },
  },
  'tall-stress': {
    label: 'Tall Scroll Stress-Test',
    layout: {
      type: 'split',
      direction: 'column',
      splitPercentage: 25,
      first: {
        type: 'split',
        direction: 'row',
        splitPercentage: 50,
        first: {
          type: 'pane',
          paneId: 'heavy-analytics',
          metadata: { title: 'Analytics Dashboard', color: 'indigo' },
        },
        second: {
          type: 'pane',
          paneId: 'heavy-conversions',
          metadata: { title: 'Conversion Funnel', color: 'violet' },
        },
      },
      second: {
        type: 'split',
        direction: 'column',
        splitPercentage: 33.3,
        first: {
          type: 'split',
          direction: 'row',
          splitPercentage: 50,
          first: {
            type: 'pane',
            paneId: 'heavy-transactions',
            metadata: { title: 'Recent Transactions', color: 'emerald' },
          },
          second: {
            type: 'pane',
            paneId: 'heavy-performance',
            metadata: { title: 'Performance Monitor', color: 'sky' },
          },
        },
        second: {
          type: 'split',
          direction: 'column',
          splitPercentage: 50,
          first: {
            type: 'split',
            direction: 'row',
            splitPercentage: 50,
            first: {
              type: 'pane',
              paneId: 'heavy-system',
              metadata: { title: 'System Status', color: 'rose' },
            },
            second: {
              type: 'pane',
              paneId: 'heavy-tasks',
              metadata: { title: 'Development Tasks', color: 'amber' },
            },
          },
          second: {
            type: 'split',
            direction: 'row',
            splitPercentage: 50,
            first: {
              type: 'pane',
              paneId: 'heavy-gallery',
              metadata: { title: 'Media Assets', color: 'sky' },
            },
            second: {
              type: 'pane',
              paneId: 'explorer',
              metadata: { title: 'File Explorer', color: 'indigo' },
            },
          },
        },
      },
    },
  },
}

export function SidebarWrapper({
  children,
  snapThreshold,
  onSnapThresholdChange,
  minSplitPercentage,
  onMinSplitPercentageChange,
  maxSplitPercentage,
  onMaxSplitPercentageChange,
  resizableHeight,
  onResizableHeightChange,
  logs,
  onPresetChange,
}: SidebarWrapperProps) {
  const { layout, onLayoutChange } = useZeugmaState()
  const [activePreset, setActivePreset] = useState<string>('default')
  const [isJsonExpanded, setIsJsonExpanded] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const mainContentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!resizableHeight && mainContentRef.current) {
      mainContentRef.current.scrollTop = 0
    }
  }, [resizableHeight])

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(layout, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey)
    onLayoutChange(PRESETS[presetKey].layout)
    onPresetChange?.(presetKey)
    if (presetKey === 'tall-stress') {
      onResizableHeightChange(true)
    }
  }

  const handleReset = () => {
    const targetPreset = PRESETS[activePreset] ? activePreset : 'default'
    onLayoutChange(PRESETS[targetPreset].layout)
    onPresetChange?.(targetPreset)
  }

  const handleAddRandomWidget = () => {
    const randomId = `random-${Math.floor(100 + Math.random() * 900)}`
    const newLayout = addPane(layout, randomId)
    onLayoutChange(newLayout)
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-app transition-colors duration-200">
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-25 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-bg-sidebar border-r border-border-primary flex flex-col shrink-0 z-30 transition-all duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
          {/* Mobile Close Button */}
          <div className="md:hidden flex items-center justify-between pb-3 border-b border-border-primary/80 mb-2">
            <span className="text-xs font-bold text-text-primary">Dashboard Settings</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-bg-pane text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Presets and Controls */}
          <div className="space-y-3 px-1">
            <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-bold uppercase tracking-wider select-none">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Layout Presets</span>
            </div>
            <div className="flex flex-col gap-2">
              <select
                value={activePreset}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="w-full bg-bg-pane border border-border-primary hover:border-border-secondary text-text-primary rounded px-2 py-1.5 text-xs font-medium cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors duration-200"
              >
                {Object.entries(PRESETS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={handleAddRandomWidget}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold border border-indigo-700 hover:border-indigo-600 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Widget
                </button>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-bg-pane hover:bg-bg-sidebar text-text-primary text-xs font-medium border border-border-primary hover:border-border-secondary transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Resizing & Callbacks Section */}
          <div className="border-t border-border-primary/80 pt-3 px-1 space-y-2.5">
            <div className="text-text-secondary text-[10px] font-bold uppercase tracking-wider select-none">
              <span>Constraints & Settings</span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-text-secondary">
                  <span>Snap Threshold</span>
                  <span className="font-semibold text-indigo-500">{snapThreshold}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={snapThreshold}
                  onChange={(e) => onSnapThresholdChange(Number(e.target.value))}
                  className="w-full h-1 bg-bg-pane border-none rounded outline-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-text-secondary">
                  <span>Min Split Bound</span>
                  <span className="font-semibold text-indigo-500">{minSplitPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={minSplitPercentage}
                  onChange={(e) => onMinSplitPercentageChange(Number(e.target.value))}
                  className="w-full h-1 bg-bg-pane border-none rounded outline-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-text-secondary">
                  <span>Max Split Bound</span>
                  <span className="font-semibold text-indigo-500">{maxSplitPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="95"
                  value={maxSplitPercentage}
                  onChange={(e) => onMaxSplitPercentageChange(Number(e.target.value))}
                  className="w-full h-1 bg-bg-pane border-none rounded outline-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-text-secondary">Resizable Height</span>
              <button
                type="button"
                disabled={activePreset === 'tall-stress'}
                onClick={() => onResizableHeightChange(!resizableHeight)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 border ${
                  activePreset === 'tall-stress'
                    ? 'bg-indigo-500/50 border-indigo-500/30 cursor-not-allowed'
                    : resizableHeight
                      ? 'bg-indigo-600 border-indigo-700 cursor-pointer'
                      : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 cursor-pointer'
                }`}
                title={
                  activePreset === 'tall-stress' ? 'Required for scroll stress-test' : undefined
                }
              >
                <span
                  className="absolute top-px left-[2px] w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200"
                  style={{
                    transform: resizableHeight ? 'translateX(16px)' : 'translateX(0px)',
                  }}
                />
              </button>
            </div>
          </div>

          {/* Performance Monitor Section */}
          <FpsMonitor />

          {/* Interactive Logs Section */}
          <div className="border-t border-border-primary/80 my-3 pt-3 px-1 space-y-1.5">
            <div className="text-text-secondary text-[10px] font-bold uppercase tracking-wider select-none flex items-center justify-between">
              <span>Interactive Logs</span>
            </div>
            <div className="bg-bg-pane-inner border border-border-primary rounded p-1.5 font-mono text-[9px] h-32 overflow-y-auto flex flex-col gap-1 transition-colors duration-200">
              {logs.length === 0 ? (
                <span className="text-text-muted italic">Perform actions to see logs...</span>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="text-text-secondary leading-normal">
                    <span className="text-text-muted mr-1">[{log.time}]</span>
                    <span className="text-text-primary font-bold">
                      {log.type.toUpperCase()}
                    </span>{' '}
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Layout JSON Viewer */}
          <div className="border-t border-border-primary/80 my-3 pt-3 px-1">
            <button
              onClick={() => setIsJsonExpanded(!isJsonExpanded)}
              className="w-full flex items-center justify-between text-text-secondary hover:text-text-primary text-[10px] font-bold uppercase tracking-wider select-none cursor-pointer group transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-1.5">
                <Code2 className="w-3 h-3 text-indigo-500" />
                <span>Active Layout JSON</span>
              </div>
              {isJsonExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
              )}
            </button>

            {isJsonExpanded && (
              <div className="relative mt-2 rounded-lg border border-border-primary bg-bg-pane-inner font-mono text-[10px] overflow-hidden group/json">
                <div className="flex items-center justify-between px-2.5 py-1 border-b border-border-primary bg-bg-sidebar/50 text-text-secondary text-[9px] select-none">
                  <span>json</span>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2 overflow-x-auto text-text-primary select-all whitespace-pre max-h-48 scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-transparent">
                  {JSON.stringify(layout, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        ref={mainContentRef}
        className={`flex-1 min-w-0 h-full relative bg-bg-app ${resizableHeight ? 'overflow-y-auto' : 'overflow-hidden'}`}
      >
        {children}

        {/* Floating Mobile Toggle Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-40 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg border border-indigo-500/30 transition-all flex items-center justify-center cursor-pointer active:scale-95"
            title="Open Settings"
          >
            <Sliders className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
