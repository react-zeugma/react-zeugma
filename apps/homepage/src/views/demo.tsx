'use client'

import React, { useState } from 'react'
import {
  Zeugma,
  PaneTree,
  Pane,
  DragHandle,
  Tab,
  findPane,
  ResizableContainer,
  useZeugma,
} from 'react-zeugma'
import type { TreeNode, PaneRenderProps, SplitNode, TabRenderProps } from 'react-zeugma'
import {
  Box,
  LineChart,
  Table,
  Gauge,
  Image as ImageIcon,
  BarChart2,
  CheckCircle2,
  Activity,
  Lock,
  Unlock,
} from 'lucide-react'
import { SidebarWrapper, type LogEntry } from '../components/sidebar-wrapper'
import {
  AnalyticsWidget,
  TransactionsWidget,
  SystemWidget,
  GalleryWidget,
  ConversionsWidget,
  TasksWidget,
  PerformanceWidget,
} from '../components/heavy-widgets'
import { FpsProvider } from '../hooks/use-fps'

const WIDGET_ICON = <Box className="w-3.5 h-3.5 text-indigo-500" />
const PLACEHOLDER_ICON = <Box className="w-3.5 h-3.5 text-indigo-400" />
const CENTER_ICON = <Box className="w-8 h-8 text-indigo-500 opacity-80" />

const ANALYTICS_ICON = <LineChart className="w-3.5 h-3.5 text-indigo-500" />
const TRANSACTIONS_ICON = <Table className="w-3.5 h-3.5 text-emerald-500" />
const SYSTEM_ICON = <Gauge className="w-3.5 h-3.5 text-rose-500" />
const GALLERY_ICON = <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
const CONVERSIONS_ICON = <BarChart2 className="w-3.5 h-3.5 text-violet-500" />
const TASKS_ICON = <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
const PERFORMANCE_ICON = <Activity className="w-3.5 h-3.5 text-indigo-500" />

const globalMountCounts = new Map<string, number>()

function useRenderCounter(widgetId: string) {
  const mountRef = React.useRef(0)

  if (mountRef.current === 0) {
    const prevMounts = globalMountCounts.get(widgetId) || 0
    const nextMounts = prevMounts + 1
    globalMountCounts.set(widgetId, nextMounts)
    mountRef.current = nextMounts
  }

  const renderRef = React.useRef(0)
  renderRef.current += 1

  return {
    mounts: mountRef.current,
    renders: renderRef.current,
  }
}

const RenderCounterContext = React.createContext<{ mounts: number; renders: number }>({
  mounts: 0,
  renders: 0,
})

interface UIPlaceholderProps {
  id: string
  title: string
  children: React.ReactNode
  icon: React.ReactNode
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
  metadata?: Record<string, unknown>
  locked: boolean
  globalLocked: boolean
  updatePaneLock: (paneId: string, locked: boolean) => void
}

const UIPlaceholder = ({
  id,
  title,
  children,
  icon,
  isFullscreen,
  toggleFullscreen,
  remove,
  metadata,
  locked,
  globalLocked,
  updatePaneLock,
  hideHeader = false,
}: UIPlaceholderProps & { hideHeader?: boolean }) => {
  const color = (metadata?.color as string) || 'indigo'

  const { mounts, renders } = useRenderCounter(id)

  const colorDotMap: Record<string, string> = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
  }

  const dotColor = colorDotMap[color] || colorDotMap.indigo
  const isLocked = locked || globalLocked

  const headerClass = `px-3 py-2 bg-bg-sidebar border-b border-border-primary flex items-center justify-between transition-colors relative select-none ${
    isLocked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:bg-bg-sidebar/95'
  }`

  if (hideHeader) {
    return (
      <RenderCounterContext.Provider value={{ mounts, renders }}>
        <div className="flex-1 overflow-auto bg-bg-pane-inner text-sm flex flex-col p-4 transition-colors duration-200 h-full w-full relative">
          {children}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-bg-sidebar/95 backdrop-blur-xs border border-border-primary/60 rounded-full text-[9px] font-mono text-text-muted flex gap-2 select-none z-30 pointer-events-none opacity-70 hover:opacity-100 transition-opacity duration-200 shadow-xs">
            <span>
              Mounts: <strong className="text-text-primary">{mounts}</strong>
            </span>
            <span>
              Renders: <strong className="text-text-primary">{renders}</strong>
            </span>
          </div>
        </div>
      </RenderCounterContext.Provider>
    )
  }

  return (
    <RenderCounterContext.Provider value={{ mounts, renders }}>
      <div className="h-full w-full bg-bg-pane flex flex-col relative overflow-hidden group transition-colors duration-200">
        <DragHandle>
          <div className={headerClass}>
            <div className="flex items-center gap-2 z-10 pointer-events-none">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              {icon}
              <span className="text-[11px] uppercase tracking-wider text-text-primary font-bold">
                {title}
              </span>
              {isLocked && <Lock className="w-2.5 h-2.5 text-text-muted shrink-0 ml-1.5" />}
            </div>

            <div className="drag-cancel flex gap-1.5 items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {!globalLocked && (
                <button
                  onClick={() => updatePaneLock(id, !locked)}
                  className={`w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer`}
                  title={locked ? 'Unlock Pane' : 'Lock Pane'}
                >
                  {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={toggleFullscreen}
                className="w-2.5 h-2.5 rounded-full bg-text-muted hover:bg-[#27c93f] transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              />
              {!isLocked && (
                <button
                  onClick={remove}
                  className="w-2.5 h-2.5 rounded-full bg-text-muted hover:bg-[#ff5f56] transition-colors cursor-pointer"
                  title="Close Pane"
                />
              )}
            </div>
          </div>
        </DragHandle>

        <div className="flex-1 overflow-auto bg-bg-pane-inner text-sm flex flex-col p-4 transition-colors duration-200 relative">
          {children}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-bg-sidebar/95 backdrop-blur-xs border border-border-primary/60 rounded-full text-[9px] font-mono text-text-muted flex gap-2 select-none z-30 pointer-events-none opacity-70 hover:opacity-100 transition-opacity duration-200 shadow-xs">
            <span>
              Mounts: <strong className="text-text-primary">{mounts}</strong>
            </span>
            <span>
              Renders: <strong className="text-text-primary">{renders}</strong>
            </span>
          </div>
        </div>
      </div>
    </RenderCounterContext.Provider>
  )
}

interface WidgetProps {
  id: string
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
  metadata?: Record<string, unknown>
  locked: boolean
  globalLocked: boolean
  updatePaneLock: (paneId: string, locked: boolean) => void
  updateMetadata?: (
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  hideHeader?: boolean
}

const GenericWidget = ({
  id,
  title,
  metadata,
  ...props
}: WidgetProps & { id: string; title?: string }) => {
  const currentTitle = (metadata?.title as string) || title || 'Workspace Pane'
  const currentNotes = (metadata?.notes as string) || ''

  return (
    <UIPlaceholder
      id={id}
      title={currentTitle}
      icon={PLACEHOLDER_ICON}
      metadata={metadata}
      {...props}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        {CENTER_ICON}
        <p className="text-text-secondary text-sm leading-relaxed max-w-sm px-4 text-center">
          {currentTitle}: A dynamically generated layout node. Drag and split to arrange it anywhere
          in your workspace.
        </p>
        {currentNotes && <p className="text-text-muted text-xs italic">Note: "{currentNotes}"</p>}
      </div>
    </UIPlaceholder>
  )
}

const MetadataDebug = ({
  id,
  locked,
  metadata,
}: {
  id: string
  locked: boolean
  metadata?: Record<string, unknown>
}) => {
  const { mounts, renders } = React.useContext(RenderCounterContext)
  return (
    <pre className="whitespace-pre-wrap font-mono text-[9px] text-text-secondary leading-normal">
      {JSON.stringify(
        {
          paneId: id,
          locked,
          metadata: metadata || {},
          mounts,
          renders,
        },
        null,
        2,
      )}
    </pre>
  )
}

const MetadataWidget = ({
  id,
  title,
  metadata,
  updateMetadata,
  locked,
  hideHeader = false,
  ...props
}: WidgetProps & { title?: string }) => {
  const currentTitle = (metadata?.title as string) || title || 'Workspace Pane'
  const currentNotes = (metadata?.notes as string) || ''
  const currentColor = (metadata?.color as string) || 'indigo'

  const colors = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet']

  return (
    <UIPlaceholder
      id={id}
      locked={locked}
      title={currentTitle}
      icon={PLACEHOLDER_ICON}
      metadata={metadata}
      hideHeader={hideHeader}
      {...props}
    >
      <div className="flex flex-col items-center justify-start gap-3 w-full max-w-sm mx-auto py-1">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-text-secondary text-xs leading-relaxed">
            Drag/split to arrange. Edit local settings below:
          </p>
        </div>

        {/* Simplified Metadata Controls */}
        <div className="w-full bg-bg-sidebar/40 border border-border-primary/80 rounded-md p-3 flex flex-col gap-2.5 text-left">
          {/* Title Editor */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted min-w-[50px]">
              Title:
            </span>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => {
                const newTitle = e.target.value
                updateMetadata?.((current) => ({
                  ...current,
                  title: newTitle,
                }))
              }}
              className="flex-1 min-w-0 bg-bg-pane border border-border-primary rounded px-2 py-0.5 text-xs text-text-primary focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Pane title..."
            />
          </div>
          {/* Color Palette Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted min-w-[50px]">
              Color:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {colors.map((c) => {
                const colorBgMap: Record<string, string> = {
                  indigo: 'bg-indigo-500',
                  emerald: 'bg-emerald-500',
                  amber: 'bg-amber-500',
                  rose: 'bg-rose-500',
                  sky: 'bg-sky-500',
                  violet: 'bg-violet-500',
                }
                const isActive = currentColor === c
                return (
                  <button
                    key={c}
                    onClick={() => {
                      updateMetadata?.((current) => ({
                        ...current,
                        color: c,
                      }))
                    }}
                    className={`w-4 h-4 rounded-full cursor-pointer transition-all ${colorBgMap[c]} ${
                      isActive
                        ? 'ring-2 ring-offset-1 ring-offset-bg-pane ring-indigo-500 scale-110'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    title={c}
                  />
                )
              })}
            </div>
          </div>
          {/* Notes Input */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted min-w-[50px]">
              Notes:
            </span>
            <input
              type="text"
              value={currentNotes}
              onChange={(e) => {
                const newNotes = e.target.value
                updateMetadata?.((current) => ({
                  ...current,
                  notes: newNotes,
                }))
              }}
              className="flex-1 min-w-0 bg-bg-pane border border-border-primary rounded px-2 py-0.5 text-xs text-text-primary focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Add custom notes..."
            />
          </div>{' '}
        </div>

        {/* Debug info showing layout node state */}
        <div className="w-full text-left bg-bg-app border border-border-primary/40 rounded p-1.5 overflow-x-auto max-h-32">
          <div className="text-[9px] uppercase font-bold tracking-wider mb-1 text-text-muted flex justify-between">
            <span>Layout Node (outside metadata):</span>
            {locked && <span className="text-rose-500 font-bold uppercase text-[8px]">LOCKED</span>}
          </div>
          <MetadataDebug id={id} locked={locked} metadata={metadata} />
        </div>
      </div>
    </UIPlaceholder>
  )
}

const getWidgetDetails = (id: string) => {
  let title = id
  let icon = WIDGET_ICON

  if (id.startsWith('random-')) {
    title = `Widget #${id.substring(7)}`
  } else if (id.startsWith('widget-')) {
    title = `Widget #${id.substring(7)}`
  } else if (id === 'explorer') {
    title = 'Widget #1'
  } else if (id === 'editor') {
    title = 'Widget #2'
  } else if (id === 'preview') {
    title = 'Widget #3'
  } else if (id === 'heavy-analytics') {
    title = 'Analytics'
    icon = ANALYTICS_ICON
  } else if (id === 'heavy-transactions') {
    title = 'Transactions'
    icon = TRANSACTIONS_ICON
  } else if (id === 'heavy-system') {
    title = 'System Status'
    icon = SYSTEM_ICON
  } else if (id === 'heavy-gallery') {
    title = 'Media Gallery'
    icon = GALLERY_ICON
  } else if (id === 'heavy-conversions') {
    title = 'Conversions'
    icon = CONVERSIONS_ICON
  } else if (id === 'heavy-tasks') {
    title = 'Tasks'
    icon = TASKS_ICON
  } else if (id === 'heavy-performance') {
    title = 'Performance'
    icon = PERFORMANCE_ICON
  }

  return {
    title,
    icon,
  }
}

interface TabHeaderProps {
  tabId: string
  activeTabId: string
  locked: boolean
  tabsMetadata: Record<string, Record<string, unknown>> | undefined
  selectTab: (id: string) => void
  removeTab: (id: string) => void
}

const TabHeader = ({
  tabId,
  activeTabId,
  locked,
  tabsMetadata,
  selectTab,
  removeTab,
}: TabHeaderProps) => {
  const isActive = tabId === activeTabId
  const { title: defaultTitle, icon } = getWidgetDetails(tabId)

  const metadata = tabsMetadata?.[tabId]
  const title = (metadata?.title as string) || defaultTitle
  const color = (metadata?.color as string) || 'indigo'

  const colorBorderMap: Record<string, string> = {
    indigo: 'border-indigo-500 text-indigo-600 dark:text-indigo-400',
    emerald: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
    amber: 'border-amber-500 text-amber-600 dark:text-amber-400',
    rose: 'border-rose-500 text-rose-600 dark:text-rose-400',
    sky: 'border-sky-500 text-sky-600 dark:text-sky-400',
    violet: 'border-violet-500 text-violet-600 dark:text-violet-400',
  }

  const activeColorClass =
    colorBorderMap[color] || 'border-indigo-500 text-indigo-600 dark:text-indigo-400'

  return (
    <Tab
      id={tabId}
      locked={locked}
      className="flex-1 min-w-[36px] max-w-[160px] min-w-0 h-full"
      style={{ display: 'flex' }}
    >
      {({ isDragging, isOver }: TabRenderProps) => (
        <div
          onClick={() => selectTab(tabId)}
          className={`w-full px-2.5 py-1.5 flex items-center justify-between gap-1.5 border-b-2 font-medium text-xs transition-all relative select-none h-full min-w-0 group cursor-pointer ${
            isActive
              ? 'bg-bg-pane text-text-primary border-b-2 ' + activeColorClass
              : 'bg-bg-sidebar/50 text-text-muted hover:text-text-secondary hover:bg-bg-sidebar/80 border-b-transparent'
          } ${isOver ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500 animate-pulse' : ''} ${
            isDragging ? 'opacity-40' : ''
          }`}
        >
          <span className="flex items-center gap-1.5 min-w-0 pointer-events-none flex-1">
            {icon && <span className="flex-shrink-0 flex items-center">{icon}</span>}
            <span className="truncate font-bold uppercase tracking-wider text-[10px] min-w-0">
              {title}
            </span>
          </span>

          {!locked && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTab(tabId)
              }}
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[10px] flex-shrink-0 ${
                isActive ? 'opacity-85 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title="Close Tab"
            >
              ×
            </button>
          )}
        </div>
      )}
    </Tab>
  )
}

const TabbedPaneWrapper = ({
  paneProps,
  globalLocked,
  updatePaneLock,
  children,
}: {
  paneProps: PaneRenderProps
  globalLocked: boolean
  updatePaneLock: (paneId: string, locked: boolean) => void
  children: React.ReactNode
}) => {
  const { tabs, activeTabId, selectTab, removeTab, tabsMetadata, locked } = paneProps

  return (
    <div className="zeugma-pane-container h-full w-full bg-bg-pane flex flex-col relative overflow-hidden group border border-border-primary rounded-lg shadow-md transition-all duration-200">
      {/* Tab Bar Header */}
      <div className="flex items-center bg-bg-sidebar border-b border-border-primary relative select-none h-9">
        {/* Scrollable container for tabs */}
        <div className="flex items-center overflow-x-auto scrollbar-none min-w-0 h-full flex-shrink">
          {tabs.map((tabId) => (
            <TabHeader
              key={tabId}
              tabId={tabId}
              activeTabId={activeTabId}
              locked={locked}
              tabsMetadata={tabsMetadata}
              selectTab={selectTab}
              removeTab={removeTab}
            />
          ))}
        </div>

        {/* Empty area is drag handle for the entire pane */}
        <DragHandle className="flex-1 min-w-[48px] h-full min-h-[32px] cursor-grab active:cursor-grabbing self-stretch" />

        {/* Action controls on the right */}
        <div className="flex gap-1.5 items-center px-3 drag-cancel">
          {!globalLocked && (
            <button
              onClick={() => updatePaneLock(paneProps.activeTabId, !locked)}
              className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title={locked ? 'Unlock Pane' : 'Lock Pane'}
            >
              {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={paneProps.toggleFullscreen}
            className="w-2.5 h-2.5 flex-shrink-0 rounded-full bg-text-muted hover:bg-[#27c93f] transition-colors cursor-pointer"
            title={paneProps.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          />
          {!locked && (
            <button
              onClick={paneProps.remove}
              className="w-2.5 h-2.5 flex-shrink-0 rounded-full bg-text-muted hover:bg-[#ff5f56] transition-colors cursor-pointer"
              title="Close Pane"
            />
          )}
        </div>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-auto bg-bg-pane-inner text-sm flex flex-col transition-colors duration-200">
        {children}
      </div>
    </div>
  )
}

const findPaneMetadata = (
  tree: TreeNode | null,
  paneId: string,
): Record<string, unknown> | undefined => {
  if (!tree) return undefined
  if (tree.type === 'pane') {
    return tree.tabsMetadata?.[paneId]
  }
  return findPaneMetadata(tree.first, paneId) || findPaneMetadata(tree.second, paneId)
}

export function Demo() {
  const defaultIDELayout: TreeNode = {
    type: 'split',
    direction: 'row',
    splitPercentage: 20,
    first: {
      type: 'pane',
      id: 'pane-left',
      tabs: ['explorer'],
      activeTabId: 'explorer',
      tabsMetadata: {
        explorer: {
          title: 'File Explorer',
          color: 'indigo',
          notes: 'This is the main explorer tab.',
        },
      },
    },
    second: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-center',
        tabs: ['editor'],
        activeTabId: 'editor',
        tabsMetadata: {
          editor: { title: 'Code Editor', color: 'emerald', notes: 'Editing index.tsx here.' },
        },
      },
      second: {
        type: 'pane',
        id: 'pane-right',
        tabs: ['preview', 'heavy-system'],
        activeTabId: 'preview',
        tabsMetadata: {
          preview: { title: 'Live Preview', color: 'amber', notes: 'Hot reloading active.' },
          'heavy-system': { title: 'System Status', color: 'rose' },
        },
      },
    },
  }

  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [layoutLocked, setLayoutLocked] = useState(false)

  const [snapThreshold, setSnapThreshold] = useState(12)
  const [minSplit, setMinSplit] = useState(10)
  const [maxSplit, setMaxSplit] = useState(90)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [localDismissIntentId, setLocalDismissIntentId] = useState<string | null>(null)
  const [resizableHeight, setResizableHeight] = useState(false)
  const [containerHeight, setContainerHeight] = useState<number>(800)
  const [showResizeAlert, setShowResizeAlert] = useState(true)
  const [highlightResizer, setHighlightResizer] = useState(false)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const zeugmaRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (resizableHeight) {
      setShowResizeAlert(true)
      const timer = setTimeout(() => {
        setShowResizeAlert(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [resizableHeight])

  React.useEffect(() => {
    if (resizableHeight && scrollContainerRef.current) {
      const el = scrollContainerRef.current

      // Phase 1: Fast scroll for instant updates
      const timer1 = setTimeout(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth',
        })
      }, 100)

      // Phase 2: Final scroll after the 500ms CSS transition completes
      const timer2 = setTimeout(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth',
        })
        setHighlightResizer(true)
      }, 600)

      // Phase 3: Remove highlight after 2.5 seconds
      const timer3 = setTimeout(() => {
        setHighlightResizer(false)
      }, 3100)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      setHighlightResizer(false)
    }
  }, [resizableHeight, containerHeight])

  const addLog = React.useCallback((type: 'drag' | 'resize', message: string) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const entry = {
      id: Math.random().toString(),
      time: timeStr,
      type,
      message,
    }
    setLogs((prev) => [entry, ...prev].slice(0, 10))
  }, [])

  const handleDragStart = React.useCallback(
    (activeId: string) => {
      setLocalDismissIntentId(null)
      addLog('drag', `Started dragging "${activeId}"`)
    },
    [addLog],
  )

  const handleDragEnd = React.useCallback(
    (
      activeId: string,
      overId: string | null,
      dropAction: {
        type: 'split' | 'swap'
        direction?: 'row' | 'column'
        position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
      } | null,
    ) => {
      setLocalDismissIntentId(null)
      if (!overId) {
        addLog('drag', `Released "${activeId}" without drop target`)
      } else if (dropAction) {
        const detail =
          dropAction.type === 'split'
            ? `split-${dropAction.position} onto "${overId}"`
            : `swapped with "${overId}"`
        addLog('drag', `Dropped "${activeId}": ${detail}`)
      }
    },
    [addLog],
  )

  const handleDismissIntentChange = React.useCallback(
    (paneId: string | null) => {
      setLocalDismissIntentId(paneId)
      if (paneId) {
        addLog('drag', `Ready to close: Widget "${paneId}" dragged out`)
      } else {
        addLog('drag', `Cancel close: Widget brought back inside`)
      }
    },
    [addLog],
  )

  const handleResizeStart = React.useCallback(
    (node: SplitNode) => {
      const directionLabel = node.direction === 'row' ? 'Horizontal' : 'Vertical'
      addLog('resize', `Start resizing ${directionLabel} split`)
    },
    [addLog],
  )

  const handleResizeEnd = React.useCallback(
    (node: SplitNode, percentage: number) => {
      const directionLabel = node.direction === 'row' ? 'Horizontal' : 'Vertical'
      addLog('resize', `Resized ${directionLabel} split to ${percentage.toFixed(1)}%`)
    },
    [addLog],
  )

  const handleRemove = React.useCallback(
    (id: string) => {
      const isDragOut = localDismissIntentId === id
      setLocalDismissIntentId(null)
      const pane = findPane(zeugmaRef.current?.layout, id)
      if (pane) {
        if (pane.tabs.length > 1 && pane.tabs.includes(id)) {
          zeugmaRef.current?.removeTab(id)
        } else {
          zeugmaRef.current?.removePane(pane.id)
        }
      } else {
        zeugmaRef.current?.removePane(id)
      }
      if (isDragOut) {
        addLog('drag', `Closed: Widget "${id}" dragged out and released`)
      } else {
        addLog('drag', `Closed: Widget "${id}" removed`)
      }
    },
    [localDismissIntentId, addLog],
  )

  const zeugma = useZeugma({
    initialLayout: defaultIDELayout,
    locked: layoutLocked,
    onRemove: handleRemove,
    snapThreshold: snapThreshold,
    minSplitPercentage: minSplit,
    maxSplitPercentage: maxSplit,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDismissIntentChange: handleDismissIntentChange,
    enableDragToDismiss: true,
    dismissThreshold: 60,
    onResizeStart: handleResizeStart,
    onResizeEnd: handleResizeEnd,
  })

  zeugmaRef.current = zeugma

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const renderWidget = React.useCallback(
    (tabId: string) => {
      const { title } = getWidgetDetails(tabId)
      const pane = findPane(zeugma.layout, tabId)
      const tabMetadata = pane?.tabsMetadata?.[tabId]
      const isFullscreen = zeugma.fullscreenPaneId !== null && zeugma.fullscreenPaneId === pane?.id
      const locked = pane?.locked || layoutLocked

      const toggleFullscreen = () => {
        if (pane) {
          zeugma.setFullscreenPaneId(zeugma.fullscreenPaneId === pane.id ? null : pane.id)
        }
      }

      const updateMetadata = (
        updater: (
          current: Record<string, unknown> | undefined,
        ) => Record<string, unknown> | undefined,
      ) => {
        zeugma.updateTabMetadata(tabId, updater)
      }

      const remove = () => {
        handleRemove(tabId)
      }

      const commonProps = {
        globalLocked: layoutLocked,
        updatePaneLock: zeugma.updatePaneLock,
      }

      if (tabId === 'explorer') {
        return (
          <MetadataWidget
            id={tabId}
            title={title}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            updateMetadata={updateMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          />
        )
      }
      if (tabId === 'heavy-analytics') {
        return (
          <UIPlaceholder
            id={tabId}
            title={title}
            icon={ANALYTICS_ICON}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          >
            <AnalyticsWidget />
          </UIPlaceholder>
        )
      }
      if (tabId === 'heavy-transactions') {
        return (
          <UIPlaceholder
            id={tabId}
            title={title}
            icon={TRANSACTIONS_ICON}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          >
            <TransactionsWidget />
          </UIPlaceholder>
        )
      }
      if (tabId === 'heavy-system') {
        return (
          <UIPlaceholder
            id={tabId}
            title={title}
            icon={SYSTEM_ICON}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          >
            <SystemWidget />
          </UIPlaceholder>
        )
      }
      if (tabId === 'heavy-gallery') {
        return (
          <UIPlaceholder
            id={tabId}
            title={title}
            icon={GALLERY_ICON}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          >
            <GalleryWidget />
          </UIPlaceholder>
        )
      }
      if (tabId === 'heavy-conversions') {
        return (
          <UIPlaceholder
            id={tabId}
            title={title}
            icon={CONVERSIONS_ICON}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          >
            <ConversionsWidget />
          </UIPlaceholder>
        )
      }
      if (tabId === 'heavy-tasks') {
        return (
          <UIPlaceholder
            id={tabId}
            title={title}
            icon={TASKS_ICON}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          >
            <TasksWidget />
          </UIPlaceholder>
        )
      }
      if (tabId === 'heavy-performance') {
        return (
          <UIPlaceholder
            id={tabId}
            title={title}
            icon={PERFORMANCE_ICON}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            remove={remove}
            metadata={tabMetadata}
            locked={locked}
            hideHeader={true}
            {...commonProps}
          >
            <PerformanceWidget />
          </UIPlaceholder>
        )
      }
      return (
        <GenericWidget
          id={tabId}
          title={title}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          remove={remove}
          metadata={tabMetadata}
          locked={locked}
          hideHeader={true}
          {...commonProps}
        />
      )
    },
    [zeugma.layout, zeugma.fullscreenPaneId, zeugma.updatePaneLock, layoutLocked, handleRemove],
  )

  const renderPane = (paneId: string) => {
    return (
      <Pane id={paneId}>
        {(paneProps: PaneRenderProps) => {
          const isThisDraggedOut = paneProps.tabs.includes(localDismissIntentId || '')

          return (
            <TabbedPaneWrapper
              paneProps={paneProps}
              globalLocked={zeugma.locked}
              updatePaneLock={zeugma.updatePaneLock}
            >
              {paneProps.renderActiveTab()}
              {paneProps.isDragging && isThisDraggedOut && (
                <div className="absolute inset-0 bg-bg-app/40 flex items-center justify-center pointer-events-none select-none z-50">
                  <span className="text-zinc-900 font-bold uppercase tracking-wider text-[10px] bg-zinc-100 border border-zinc-300 px-2.5 py-1 rounded shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                    Close Widget
                  </span>
                </div>
              )}
            </TabbedPaneWrapper>
          )
        }}
      </Pane>
    )
  }

  const renderDragOverlay = (id: string, type: 'pane' | 'tab') => {
    const { title, icon } = getWidgetDetails(id)
    const metadata = findPaneMetadata(zeugma.layout, id)
    const currentTitle = (metadata?.title as string) || title
    const color = (metadata?.color as string) || 'indigo'

    const colorDotMap: Record<string, string> = {
      indigo: 'bg-indigo-500',
      emerald: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      sky: 'bg-sky-500',
      violet: 'bg-violet-500',
    }
    const dotClass = colorDotMap[color] || 'bg-indigo-500'
    const isDraggedOut = id === localDismissIntentId

    if (isDraggedOut) {
      return (
        <div className="px-3.5 py-2 bg-zinc-900 border border-zinc-700 dark:bg-zinc-100 dark:border-zinc-300 rounded-lg shadow-2xl flex items-center gap-2.5 opacity-95 backdrop-blur-md pointer-events-none select-none text-zinc-100 dark:text-zinc-900">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider font-bold">
            Release to Close: {currentTitle}
          </span>
        </div>
      )
    }

    return (
      <div
        className={`px-3.5 py-2 border rounded-lg shadow-2xl flex items-center gap-2.5 opacity-95 backdrop-blur-md pointer-events-none select-none ${
          type === 'pane'
            ? 'bg-bg-sidebar/95 border-indigo-500/40 ring-1 ring-indigo-500/10'
            : 'bg-bg-sidebar border-border-secondary'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {icon}
        <span className="text-[11px] uppercase tracking-wider text-text-primary font-bold flex items-center gap-1.5">
          {currentTitle}
          {type === 'pane' && (
            <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded px-1.5 py-0.5 normal-case font-mono shrink-0 select-none">
              Group
            </span>
          )}
        </span>
      </div>
    )
  }

  return (
    <FpsProvider>
      <div
        className={`transition-all duration-500 ease-in-out relative ${
          resizableHeight
            ? 'h-[calc(100vh-3.5rem)] overflow-y-auto p-6 md:p-10 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center'
            : 'h-[calc(100vh-3.5rem)] overflow-hidden bg-bg-app p-0'
        }`}
      >
        {resizableHeight && showResizeAlert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-zinc-900/95 text-zinc-100 dark:bg-white/95 dark:text-zinc-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-zinc-800 dark:border-zinc-200 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto select-none backdrop-blur-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Drag the handle at the bottom edge of the container to resize its height.</span>
            <button
              onClick={() => setShowResizeAlert(false)}
              className="ml-1 hover:opacity-75 cursor-pointer text-sm font-bold leading-none p-0.5"
            >
              ×
            </button>
          </div>
        )}
        <h1 className="sr-only">react-zeugma Live Workspace Demo</h1>
        <Zeugma
          {...zeugma}
          renderPane={renderPane}
          renderWidget={renderWidget}
          renderDragOverlay={renderDragOverlay}
          classNames={{
            dropPreview:
              'bg-indigo-500/10 backdrop-blur-[2px] border-2 border-dashed border-indigo-400/50 shadow-[0_25px_50px_-12px_rgba(99,102,241,0.2)] rounded-lg transition-all duration-200',
            dismissPreview: 'zeugma-dismiss-preview',
            paneLocked:
              'border-zinc-300 dark:border-zinc-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] bg-zinc-500/[0.02] dark:bg-zinc-500/[0.02] rounded-lg overflow-hidden transition-all duration-200',
            lockedPreview:
              'bg-rose-500/[0.03] backdrop-blur-[0.5px] border-2 border-dashed border-rose-500/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] rounded-lg transition-all duration-200',
          }}
        >
          <div
            className={`w-full mx-auto transition-all duration-500 ease-in-out ${
              resizableHeight
                ? 'max-w-[1800px] rounded-xl border border-border-primary bg-bg-pane shadow-lg dark:shadow-[0_4px_30px_rgba(255,255,255,0.03),0_15px_60px_rgba(255,255,255,0.06)] overflow-hidden h-full'
                : 'max-w-full rounded-none border-none shadow-none h-full'
            }`}
          >
            <SidebarWrapper
              contentRef={scrollContainerRef}
              layout={zeugma.layout}
              onLayoutChange={zeugma.setLayout}
              snapThreshold={snapThreshold}
              onSnapThresholdChange={setSnapThreshold}
              minSplitPercentage={minSplit}
              onMinSplitPercentageChange={setMinSplit}
              maxSplitPercentage={maxSplit}
              onMaxSplitPercentageChange={setMaxSplit}
              layoutLocked={layoutLocked}
              onLayoutLockedChange={setLayoutLocked}
              logs={logs}
              resizableHeight={resizableHeight}
              onResizableHeightChange={setResizableHeight}
              onPresetChange={(preset) => {
                if (preset === 'tall-stress') {
                  setContainerHeight(1600)
                } else {
                  setContainerHeight(800)
                }
              }}
            >
              <div
                className={`w-full p-2 bg-bg-app transition-all duration-500 ease-in-out ${
                  resizableHeight ? 'min-h-full' : 'h-full overflow-hidden'
                }`}
              >
                {!isMounted ? (
                  <div className="h-full flex items-center justify-center bg-bg-app text-text-muted select-none">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 animate-pulse">
                        Loading Workspace...
                      </span>
                    </div>
                  </div>
                ) : zeugma.layout ? (
                  <ResizableContainer
                    active={resizableHeight}
                    height={containerHeight}
                    minHeight={300}
                    persist={true}
                    localStorageKey="demo-container"
                    resizerHeight={6}
                    resizerClassName={`zeugma-container-resizer ${highlightResizer ? 'zeugma-resizer-highlight' : ''}`}
                    onHeightChange={setContainerHeight}
                  >
                    <PaneTree />
                  </ResizableContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                    <p className="mb-4">All panes closed.</p>
                    <button
                      onClick={() => {
                        zeugma.setLayout(defaultIDELayout)
                        setContainerHeight(800)
                      }}
                      className="px-4 py-2 bg-text-primary hover:bg-text-primary/90 text-bg-app rounded text-sm transition-colors cursor-pointer"
                    >
                      Reset Layout
                    </button>
                  </div>
                )}
              </div>
            </SidebarWrapper>
          </div>
        </Zeugma>
      </div>
    </FpsProvider>
  )
}
