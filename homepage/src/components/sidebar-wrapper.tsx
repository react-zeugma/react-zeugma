'use client'

import React, { useState } from 'react'
import { useDashboard, addPane } from 'react-zeugma'
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
} from 'lucide-react'

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
  logs: LogEntry[]
  useCustomResizer: boolean
  onUseCustomResizerChange: (val: boolean) => void
}

const PRESETS: Record<string, { label: string; layout: TreeNode }> = {
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
  splitScreen: {
    label: 'Split Screen (Editor & Preview)',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: { type: 'pane', paneId: 'editor' },
      second: { type: 'pane', paneId: 'preview' },
    },
  },
  editorFocus: {
    label: 'Editor Focus',
    layout: { type: 'pane', paneId: 'editor' },
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
  logs,
  useCustomResizer,
  onUseCustomResizerChange,
}: SidebarWrapperProps) {
  const { layout, onLayoutChange } = useDashboard()
  const [activePreset, setActivePreset] = useState<string>('default')
  const [isJsonExpanded, setIsJsonExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(layout, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey)
    onLayoutChange(PRESETS[presetKey].layout)
  }

  const handleReset = () => {
    setActivePreset('default')
    onLayoutChange(PRESETS.default.layout)
  }

  const handleAddRandomWidget = () => {
    const randomId = `random-${Math.floor(100 + Math.random() * 900)}`
    const newLayout = addPane(layout, randomId)
    onLayoutChange(newLayout)
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-app transition-colors duration-200">
      {/* Sidebar Panel */}
      <div className="w-64 bg-bg-sidebar border-r border-border-primary flex flex-col shrink-0 z-20 transition-colors duration-200">
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
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
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Default
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
              {/* Custom Resizer Checkbox */}
              <div className="flex items-center justify-between bg-bg-pane border border-border-primary rounded p-2 text-xs select-none transition-colors duration-200">
                <span className="text-text-secondary font-medium">Use Custom Resizer</span>
                <button
                  onClick={() => onUseCustomResizerChange(!useCustomResizer)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                    useCustomResizer ? 'bg-indigo-600' : 'bg-text-muted'
                  }`}
                  aria-label="Toggle Custom Resizer"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
                      useCustomResizer ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

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
          </div>

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
      <div className="flex-1 min-w-0 h-full relative overflow-hidden bg-bg-app">{children}</div>
    </div>
  )
}
