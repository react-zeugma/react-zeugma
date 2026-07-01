'use client'

import { useState, useMemo } from 'react'
import { useZeugma, Zeugma, Pane, TreeNode, TabDetails, usePaneContext } from 'react-zeugma'
import { Code, Layers, Play, RefreshCw, Lock, Unlock, AlertCircle, X } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

const initialPlaygroundLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 40,
  first: {
    type: 'pane',
    id: 'Panel-A',
    tabIds: ['Panel A'],
    activeTabId: 'Panel A',
  },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'Panel-B',
      tabIds: ['Panel B', 'Detail View'],
      activeTabId: 'Panel B',
    },
    second: {
      type: 'pane',
      id: 'Panel-C',
      tabIds: ['Panel C'],
      activeTabId: 'Panel C',
    },
  },
}

function PlaygroundPaneHeader() {
  const { tabIds, activeTabId, selectTab, remove } = usePaneContext()
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bg-sidebar border-b border-border-primary/80 select-none">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabIds.map((id) => {
          const isActive = id === activeTabId
          return (
            <button
              key={id}
              onClick={() => selectTab(id)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                isActive
                  ? 'bg-bg-pane text-indigo-500 shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {id}
            </button>
          )
        })}
      </div>
      <Pane.DragHandle className="flex-1 h-5 mx-2 cursor-grab active:cursor-grabbing" />
      <button
        onClick={remove}
        className="p-0.5 hover:bg-rose-500/10 hover:text-rose-500 rounded text-text-muted transition-colors cursor-pointer"
        title="Close Pane"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

export function DocsPlayground() {
  const [locked, setLocked] = useState(false)
  const [resizerSize, setResizerSize] = useState(6)
  const [snapThreshold, setSnapThreshold] = useState(8)
  const [enableDragToDismiss, setEnableDragToDismiss] = useState(true)
  const minSplit = 10
  const maxSplit = 90

  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'json'>('preview')

  const controller = useZeugma({
    initialLayout: initialPlaygroundLayout,
    locked,
  })

  const handleReset = () => {
    controller.setLayout(initialPlaygroundLayout)
  }

  const generatedCode = useMemo(() => {
    return `import { useZeugma, Zeugma, Pane } from 'react-zeugma'

export default function Dashboard() {
  const controller = useZeugma({
    initialLayout: { ... },
    locked: ${locked}
  })

  return (
    <Zeugma
      controller={controller}
      resizerSize={${resizerSize}}
      snapThreshold={${snapThreshold}}
      enableDragToDismiss={${enableDragToDismiss}}
      minSplitPercentage={${minSplit}}
      maxSplitPercentage={${maxSplit}}
      renderPane={(paneId) => (
        <Pane id={paneId}>
          <MyPaneHeader />
          <Pane.Content className="p-4">
            Content for {paneId}
          </Pane.Content>
        </Pane>
      )}
      classNames={{
        resizer: 'bg-indigo-500/10 hover:bg-indigo-500/50 transition-colors',
        dropPreview: 'bg-indigo-500/5 border border-indigo-500 border-dashed'
      }}
    />
  )`
  }, [locked, resizerSize, snapThreshold, enableDragToDismiss, minSplit, maxSplit])

  const highlightedCode = useMemo(() => {
    return Prism.highlight(generatedCode, Prism.languages.tsx || Prism.languages.javascript, 'tsx')
  }, [generatedCode])

  const renderWidget = (tab: TabDetails) => {
    return (
      <div className="flex flex-col h-full justify-between p-3 select-none">
        <div className="space-y-1.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-500">
            {tab.id}
          </span>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Drag by the header to rearrange or split.
          </p>
        </div>
        <div className="text-[9px] text-text-muted font-mono bg-bg-pane-inner/85 px-1.5 py-0.5 rounded border border-border-primary/40 w-fit">
          ID: {tab.id}
        </div>
      </div>
    )
  }

  const renderPane = (paneId: string) => {
    return (
      <Pane id={paneId}>
        <div className="flex flex-col h-full bg-bg-pane border border-border-primary rounded-lg overflow-hidden shadow-2xs transition-all">
          <PlaygroundPaneHeader />
          <Pane.Content className="flex-1 bg-bg-pane-inner/30 overflow-hidden">
            {renderWidget}
          </Pane.Content>
        </div>
      </Pane>
    )
  }

  return (
    <div className="border border-border-primary rounded-2xl overflow-hidden bg-bg-pane shadow-xs">
      {/* Sleek, Minimal Control Panel */}
      <div className="px-4 py-3 border-b border-border-primary bg-bg-sidebar/30 flex flex-wrap items-center gap-x-6 gap-y-3 select-none text-xs">
        <div className="flex items-center gap-4 border-r border-border-primary/80 pr-6">
          <label className="flex items-center gap-1.5 font-semibold text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={locked}
              onChange={(e) => {
                setLocked(e.target.checked)
                controller.setLocked(e.target.checked)
              }}
              className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
            />
            {locked ? (
              <Lock className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-indigo-500" />
            )}
            Lock Layout
          </label>
          <label className="flex items-center gap-1.5 font-semibold text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={enableDragToDismiss}
              onChange={(e) => setEnableDragToDismiss(e.target.checked)}
              className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
            />
            Drag-to-Dismiss
          </label>
        </div>

        {/* Sliders in a row */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-text-muted font-medium">Resizer:</span>
            <input
              type="range"
              min={2}
              max={16}
              value={resizerSize}
              onChange={(e) => setResizerSize(Number(e.target.value))}
              className="w-20 h-1 bg-border-primary rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="font-mono text-indigo-500 font-semibold">{resizerSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted font-medium">Snap:</span>
            <input
              type="range"
              min={0}
              max={24}
              value={snapThreshold}
              onChange={(e) => setSnapThreshold(Number(e.target.value))}
              className="w-20 h-1 bg-border-primary rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="font-mono text-indigo-500 font-semibold">{snapThreshold}px</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center justify-between border-b border-border-primary bg-bg-sidebar/15 px-4 select-none">
        <div className="flex gap-1.5 py-1.5">
          {(['preview', 'code', 'json'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                activeTab === tab
                  ? 'bg-bg-pane text-indigo-500 border-border-primary/60 shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary border-transparent'
              }`}
            >
              {tab === 'preview' && <Play className="w-3 h-3" />}
              {tab === 'code' && <Code className="w-3 h-3" />}
              {tab === 'json' && <Layers className="w-3 h-3" />}
              <span className="capitalize">{tab === 'preview' ? 'Live Preview' : tab}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleReset}
          disabled={locked}
          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border border-border-primary/80 transition-all rounded-md ${
            activeTab === 'preview' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${
            locked
              ? 'opacity-50 cursor-not-allowed text-text-muted'
              : 'bg-bg-pane hover:bg-bg-sidebar text-text-secondary hover:text-text-primary cursor-pointer'
          }`}
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Workspace Area */}
      <div className="relative h-[380px] bg-bg-pane-inner/10">
        <div
          className={`w-full h-full p-3 relative ${activeTab === 'preview' ? 'block' : 'hidden'}`}
        >
          {controller.layout ? (
            <Zeugma
              controller={controller}
              resizerSize={resizerSize}
              snapThreshold={snapThreshold}
              enableDragToDismiss={enableDragToDismiss}
              minSplitPercentage={minSplit}
              maxSplitPercentage={maxSplit}
              renderPane={renderPane}
              classNames={{
                resizer: 'zeugma-resizer',
                dropPreview:
                  'bg-indigo-500/5 border border-indigo-500 border-dashed rounded-lg shadow-sm',
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6 text-text-muted" />
              <div className="text-center">
                <p className="text-xs font-bold text-text-primary">Workspace Empty</p>
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs cursor-pointer"
              >
                Restore Layout
              </button>
            </div>
          )}
        </div>

        <div
          className={`w-full h-full overflow-y-auto p-4 font-mono text-[11px] bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 select-all border-t border-zinc-200 dark:border-border-primary/40 ${activeTab === 'code' ? 'block' : 'hidden'}`}
        >
          <pre className="leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </div>

        <div
          className={`w-full h-full overflow-y-auto p-4 font-mono text-[11px] bg-zinc-50 dark:bg-zinc-950 text-emerald-650 dark:text-emerald-400 border-t border-zinc-200 dark:border-border-primary/40 ${activeTab === 'json' ? 'block' : 'hidden'}`}
        >
          <pre className="leading-relaxed">{JSON.stringify(controller.layout, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
