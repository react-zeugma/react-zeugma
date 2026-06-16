'use client'

import { useContext, createContext, useRef } from 'react'
import { Box, Lock, Unlock } from 'lucide-react'

// Render Counter Utility
const globalMountCounts = new Map<string, number>()

export function useRenderCounter(widgetId: string) {
  const mountRef = useRef(0)

  if (mountRef.current === 0) {
    const prevMounts = globalMountCounts.get(widgetId) || 0
    const nextMounts = prevMounts + 1
    globalMountCounts.set(widgetId, nextMounts)
    mountRef.current = nextMounts
  }

  const renderRef = useRef(0)
  renderRef.current += 1

  return {
    mounts: mountRef.current,
    renders: renderRef.current,
  }
}

export const RenderCounterContext = createContext<{ mounts: number; renders: number }>({
  mounts: 0,
  renders: 0,
})

// Icons Mappings
export const WIDGET_ICON = <Box className="w-3.5 h-3.5 text-indigo-500" />
export const PLACEHOLDER_ICON = <Box className="w-3.5 h-3.5 text-indigo-400" />
export const CENTER_ICON = <Box className="w-8 h-8 text-indigo-500 opacity-80" />

export const getWidgetDetails = (id: string) => {
  let title = id
  const icon = WIDGET_ICON

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
  }

  return {
    title,
    icon,
  }
}

export const GenericWidgetContent = ({ title, notes }: { title: string; notes?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {CENTER_ICON}
      <p className="text-text-secondary text-sm leading-relaxed max-w-sm px-4 text-center">
        {title}: A dynamically generated layout node. Drag and split to arrange it anywhere in your
        workspace.
      </p>
      {notes && <p className="text-text-muted text-xs italic">Note: "{currentNotes}"</p>}
    </div>
  )
}

// Fallback for typescript binding inside child
const currentNotes = ''

export const MetadataDebug = ({
  id,
  locked,
  metadata,
}: {
  id: string
  locked: boolean
  metadata?: Record<string, unknown>
}) => {
  const { mounts, renders } = useContext(RenderCounterContext)
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

export const MetadataWidgetContent = ({
  id,
  title,
  notes,
  color,
  locked,
  metadata,
  updateMetadata,
}: {
  id: string
  title: string
  notes: string
  color: string
  locked: boolean
  metadata?: Record<string, unknown>
  updateMetadata?: (
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
}) => {
  const colors = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet']

  return (
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
            value={title}
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
              const isActive = color === c
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
            value={notes}
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
        </div>
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
  )
}

export const TabHeaderContent = ({
  tabId,
  activeTabId,
  locked,
  tabsMetadata,
  selectTab,
  removeTab,
  isDragging,
}: {
  tabId: string
  activeTabId: string
  locked: boolean
  tabsMetadata: Record<string, Record<string, unknown>> | undefined
  selectTab: (id: string) => void
  removeTab: (id: string) => void
  isDragging: boolean
}) => {
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
    <div
      onClick={() => selectTab(tabId)}
      className={`w-full px-2.5 py-1.5 flex items-center justify-between gap-1.5 border-b-2 font-medium text-xs transition-all relative select-none h-full min-w-0 group cursor-pointer ${
        isActive
          ? 'bg-bg-pane text-text-primary border-b-2 ' + activeColorClass
          : 'bg-bg-sidebar/50 text-text-muted hover:text-text-secondary hover:bg-bg-sidebar/80 border-b-transparent'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <span className="flex items-center gap-1.5 min-w-0 pointer-events-none flex-1">
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
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
          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[10px] shrink-0 ${
            isActive ? 'opacity-85 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Close Tab"
        >
          ×
        </button>
      )}
    </div>
  )
}

export const TabbedPaneLayout = ({
  tabs,
  dragHandle,
  controls,
  children,
}: {
  tabs: React.ReactNode
  dragHandle: React.ReactNode
  controls: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <div className="zeugma-pane-container h-full w-full bg-bg-pane flex flex-col relative overflow-hidden group border border-border-primary rounded-lg shadow-md transition-all duration-200">
      {/* Tab Bar Header */}
      <div className="flex items-center bg-bg-sidebar border-b border-border-primary relative select-none h-9">
        {/* Scrollable container for tabs */}
        <div className="flex items-center overflow-x-auto scrollbar-none min-w-0 h-full shrink">
          {tabs}
        </div>

        {/* Empty area is drag handle */}
        {dragHandle}

        {/* Action controls */}
        {controls}
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-auto bg-bg-pane-inner text-sm flex flex-col transition-colors duration-200">
        {children}
      </div>
    </div>
  )
}

export const TabbedPaneControls = ({
  activeTabId,
  locked,
  globalLocked,
  isFullscreen,
  toggleFullscreen,
  remove,
  updatePaneLock,
}: {
  activeTabId: string
  locked: boolean
  globalLocked: boolean
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
  updatePaneLock: (paneId: string, locked: boolean) => void
}) => {
  return (
    <div className="flex gap-1.5 items-center px-3 drag-cancel">
      {!globalLocked && (
        <button
          onClick={() => updatePaneLock(activeTabId, !locked)}
          className="w-5 h-5 shrink-0 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title={locked ? 'Unlock Pane' : 'Lock Pane'}
        >
          {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
      )}
      <button
        onClick={toggleFullscreen}
        className="w-2.5 h-2.5 shrink-0 rounded-full bg-text-muted hover:bg-[#27c93f] transition-colors cursor-pointer"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      />
      {!locked && (
        <button
          onClick={remove}
          className="w-2.5 h-2.5 shrink-0 rounded-full bg-text-muted hover:bg-[#ff5f56] transition-colors cursor-pointer"
          title="Close Pane"
        />
      )}
    </div>
  )
}

export const UIPlaceholderLayout = ({
  hideHeader,
  dragHandle,
  children,
}: {
  hideHeader: boolean
  dragHandle?: React.ReactNode
  children: React.ReactNode
}) => {
  const { mounts, renders } = useContext(RenderCounterContext)

  if (hideHeader) {
    return (
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
    )
  }

  return (
    <div className="h-full w-full bg-bg-pane flex flex-col relative overflow-hidden group transition-colors duration-200">
      {dragHandle}

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
  )
}

export const UIPlaceholderHeader = ({
  id,
  title,
  icon,
  metadata,
  locked,
  globalLocked,
  isFullscreen,
  toggleFullscreen,
  remove,
  updatePaneLock,
}: {
  id: string
  title: string
  icon: React.ReactNode
  metadata?: Record<string, unknown>
  locked: boolean
  globalLocked: boolean
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
  updatePaneLock: (paneId: string, locked: boolean) => void
}) => {
  const color = (metadata?.color as string) || 'indigo'

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

  return (
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
  )
}

export const DemoDragOverlay = ({
  id,
  type,
  isDraggedOut,
  metadata,
}: {
  id: string
  type: 'pane' | 'tab'
  isDraggedOut: boolean
  metadata?: Record<string, unknown>
}) => {
  const { title, icon } = getWidgetDetails(id)
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

export const DemoResizeAlert = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 bg-zinc-900/95 text-zinc-100 dark:bg-white/95 dark:text-zinc-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-zinc-800 dark:border-zinc-200 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto select-none backdrop-blur-xs">
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
      </span>
      <span>Drag the handle at the bottom edge of the container to resize its height.</span>
      <button
        onClick={onClose}
        className="ml-1 hover:opacity-75 cursor-pointer text-sm font-bold leading-none p-0.5"
      >
        ×
      </button>
    </div>
  )
}

export const DemoLoadingSpinner = () => {
  return (
    <div className="h-full flex items-center justify-center bg-bg-app text-text-muted select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 animate-pulse">
          Loading Workspace...
        </span>
      </div>
    </div>
  )
}
