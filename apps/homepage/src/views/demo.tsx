'use client'

import React, { useState } from 'react'
import { DashboardProvider, PaneTree, Pane, DragHandle, removePane } from 'react-zeugma'
import type { TreeNode, PaneRenderProps, ResizerRenderProps, SplitNode } from 'react-zeugma'
import { Box } from 'lucide-react'
import { SidebarWrapper, type LogEntry } from '../components/sidebar-wrapper'

interface UIPlaceholderProps {
  title: string
  children: React.ReactNode
  icon: React.ReactNode
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
  metadata?: Record<string, unknown>
}

const UIPlaceholder = ({
  title,
  children,
  icon,
  isFullscreen,
  toggleFullscreen,
  remove,
  metadata,
}: UIPlaceholderProps) => {
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

  return (
    <div className="h-full w-full bg-bg-pane flex flex-col relative overflow-hidden group transition-colors duration-200">
      <DragHandle>
        <div className="px-3 py-2 bg-bg-sidebar border-b border-border-primary flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-bg-sidebar/95 transition-colors relative select-none">
          <div className="flex items-center gap-2 z-10 pointer-events-none">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {icon}
            <span className="text-[11px] uppercase tracking-wider text-text-primary font-bold">
              {title}
            </span>
          </div>

          <div className="drag-cancel flex gap-1.5 items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={toggleFullscreen}
              className="w-2.5 h-2.5 rounded-full bg-text-muted hover:bg-[#27c93f] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            />
            <button
              onClick={remove}
              className="w-2.5 h-2.5 rounded-full bg-text-muted hover:bg-[#ff5f56] transition-colors cursor-pointer"
              title="Close Pane"
            />
          </div>
        </div>
      </DragHandle>

      <div className="flex-1 overflow-auto bg-bg-pane-inner text-sm flex flex-col p-4 transition-colors duration-200">
        {children}
      </div>
    </div>
  )
}

interface WidgetProps {
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
  metadata?: Record<string, unknown>
  updateMetadata?: (
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
}

const GenericWidget = ({ title, metadata, ...props }: WidgetProps & { title?: string }) => {
  const currentTitle = (metadata?.title as string) || title || 'Workspace Pane'
  const currentNotes = (metadata?.notes as string) || ''

  return (
    <UIPlaceholder
      title={currentTitle}
      icon={<Box className="w-3.5 h-3.5 text-indigo-400" />}
      metadata={metadata}
      {...props}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <Box className="w-8 h-8 text-indigo-500 opacity-80" />
        <p className="text-text-secondary text-sm leading-relaxed max-w-sm px-4">
          {currentTitle}: A dynamically generated layout node. Drag and split to arrange it anywhere
          in your workspace.
        </p>
        {currentNotes && <p className="text-text-muted text-xs italic">Note: "{currentNotes}"</p>}
      </div>
    </UIPlaceholder>
  )
}

const MetadataWidget = ({
  title,
  metadata,
  updateMetadata,
  ...props
}: WidgetProps & { title?: string }) => {
  const currentTitle = (metadata?.title as string) || title || 'Workspace Pane'
  const currentNotes = (metadata?.notes as string) || ''
  const currentColor = (metadata?.color as string) || 'indigo'

  const colors = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet']

  return (
    <UIPlaceholder
      title={currentTitle}
      icon={<Box className="w-3.5 h-3.5 text-indigo-400" />}
      metadata={metadata}
      {...props}
    >
      <div className="flex flex-col items-center justify-start gap-3 w-full max-w-sm mx-auto py-1">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-text-secondary text-xs leading-relaxed">
            Drag/split to arrange. Edit local metadata below:
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
          </div>
        </div>

        {/* Debug info showing raw metadata pretty printed */}
        <div className="w-full text-left bg-bg-app border border-border-primary/40 rounded p-1.5 overflow-x-auto max-h-24">
          <div className="text-[9px] uppercase font-bold tracking-wider mb-1 text-text-muted">
            Raw metadata state:
          </div>
          <pre className="whitespace-pre-wrap font-mono text-[9px] text-text-secondary leading-normal">
            {JSON.stringify(metadata || {}, null, 2)}
          </pre>
        </div>
      </div>
    </UIPlaceholder>
  )
}

const getWidgetDetails = (id: string) => {
  let title = id
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
    icon: <Box className="w-3.5 h-3.5 text-indigo-500" />,
  }
}

const findPaneMetadata = (
  tree: TreeNode | null,
  paneId: string,
): Record<string, unknown> | undefined => {
  if (!tree) return undefined
  if (tree.type === 'pane') {
    return tree.paneId === paneId ? tree.metadata : undefined
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
      paneId: 'explorer',
      metadata: {
        title: 'File Explorer',
        color: 'indigo',
        notes: 'This is the main explorer tab.',
      },
    },
    second: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        paneId: 'editor',
        metadata: { title: 'Code Editor', color: 'emerald', notes: 'Editing index.tsx here.' },
      },
      second: {
        type: 'pane',
        paneId: 'preview',
        metadata: { title: 'Live Preview', color: 'amber', notes: 'Hot reloading active.' },
      },
    },
  }

  const [layout, setLayout] = useState<TreeNode | null>(defaultIDELayout)
  const [useCustomResizer, setUseCustomResizer] = useState<boolean>(true)
  const [fullscreenPaneId, setFullscreenPaneId] = useState<string | null>(null)
  const [snapThreshold, setSnapThreshold] = useState(12)
  const [minSplit, setMinSplit] = useState(10)
  const [maxSplit, setMaxSplit] = useState(90)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [localDismissIntentId, setLocalDismissIntentId] = useState<string | null>(null)

  React.useEffect(() => {
    const savedResizer = localStorage.getItem('zeugma-demo-custom-resizer')
    if (savedResizer !== null) {
      setUseCustomResizer(savedResizer === 'true')
    }
  }, [])

  const handleUseCustomResizerChange = (val: boolean) => {
    setUseCustomResizer(val)
    localStorage.setItem('zeugma-demo-custom-resizer', String(val))
  }

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

  const handleLayoutChange = (newLayout: TreeNode | null) => {
    setLayout(newLayout)
  }

  const handleRemove = React.useCallback(
    (paneId: string) => {
      const isDragOut = localDismissIntentId === paneId
      setLocalDismissIntentId(null)
      const newLayout = removePane(layout, paneId)
      handleLayoutChange(newLayout)
      if (isDragOut) {
        addLog('drag', `Closed: Widget "${paneId}" dragged out and released`)
      } else {
        addLog('drag', `Closed: Widget "${paneId}" removed`)
      }
    },
    [layout, localDismissIntentId, addLog],
  )

  const renderPane = (id: string) => {
    return (
      <Pane id={id}>
        {(paneProps: PaneRenderProps) => {
          const { title } = getWidgetDetails(id)
          const isThisDraggedOut = id === localDismissIntentId

          return (
            <div
              className={`zeugma-pane-container h-full border border-border-primary rounded-lg overflow-hidden shadow-md bg-bg-pane relative transition-all duration-200 ${
                paneProps.isDragging
                  ? isThisDraggedOut
                    ? 'scale-[0.90] pointer-events-none select-none'
                    : 'scale-[0.98] pointer-events-none select-none'
                  : ''
              }`}
            >
              {id === 'explorer' ? (
                <MetadataWidget
                  title={title}
                  isFullscreen={paneProps.isFullscreen}
                  toggleFullscreen={paneProps.toggleFullscreen}
                  remove={paneProps.remove}
                  metadata={paneProps.metadata}
                  updateMetadata={paneProps.updateMetadata}
                />
              ) : (
                <GenericWidget
                  title={title}
                  isFullscreen={paneProps.isFullscreen}
                  toggleFullscreen={paneProps.toggleFullscreen}
                  remove={paneProps.remove}
                  metadata={paneProps.metadata}
                />
              )}
              {paneProps.isDragging && (
                <div className="absolute inset-0 bg-bg-app/40 flex items-center justify-center pointer-events-none select-none z-50">
                  {isThisDraggedOut ? (
                    <span className="text-zinc-900 font-bold uppercase tracking-wider text-[10px] bg-zinc-100 border border-zinc-300 px-2.5 py-1 rounded shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                      Close Widget
                    </span>
                  ) : (
                    <span className="text-text-secondary font-bold uppercase tracking-wider text-[10px] bg-bg-pane border border-border-primary px-2.5 py-1 rounded shadow-md">
                      Dragging...
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        }}
      </Pane>
    )
  }

  const renderDragOverlay = (id: string) => {
    const { title, icon } = getWidgetDetails(id)
    const metadata = findPaneMetadata(layout, id)
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
      <div className="px-3.5 py-2 bg-bg-sidebar border border-border-secondary rounded-lg shadow-2xl flex items-center gap-2.5 opacity-95 backdrop-blur-md pointer-events-none select-none">
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {icon}
        <span className="text-[11px] uppercase tracking-wider text-text-primary font-bold">
          {currentTitle}
        </span>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-bg-app overflow-hidden transition-colors duration-200">
      <h1 className="sr-only">react-zeugma Live Workspace Demo</h1>
      <DashboardProvider
        layout={layout}
        onChange={handleLayoutChange}
        renderPane={renderPane}
        renderDragOverlay={renderDragOverlay}
        fullscreenPaneId={fullscreenPaneId}
        onFullscreenChange={setFullscreenPaneId}
        onRemove={handleRemove}
        snapThreshold={snapThreshold}
        minSplitPercentage={minSplit}
        maxSplitPercentage={maxSplit}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDismissIntentChange={handleDismissIntentChange}
        enableDragToDismiss={true}
        dismissThreshold={60}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
        renderResizer={
          useCustomResizer
            ? ({ direction, isResizing, onPointerDown }: ResizerRenderProps) => {
                const isRow = direction === 'row'
                return (
                  <div
                    role="separator"
                    data-direction={direction}
                    onPointerDown={onPointerDown}
                    style={{ touchAction: 'none' }}
                    className={`transition-all duration-150 z-50 flex items-center justify-center select-none ${
                      isRow ? 'w-1 h-full cursor-col-resize' : 'h-1 w-full cursor-row-resize'
                    } ${isResizing ? 'bg-indigo-500' : 'bg-transparent hover:bg-indigo-500/20'}`}
                  >
                    <div
                      className={`rounded-full bg-zinc-600 transition-all duration-150 ${
                        isResizing ? 'bg-indigo-500 opacity-0' : 'opacity-100'
                      } ${isRow ? 'w-[1.5px] h-3.5' : 'w-3.5 h-[1.5px]'}`}
                    />
                  </div>
                )
              }
            : undefined
        }
        classNames={{
          dropPreview:
            'bg-indigo-500/10 backdrop-blur-[2px] border-2 border-dashed border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.2)] rounded-lg transition-all duration-200',
          swapPreview:
            'bg-amber-500/10 backdrop-blur-[2px] border-2 border-dashed border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] rounded-lg transition-all duration-200',
          resizer:
            'bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors duration-150 z-50',
          dismissPreview: 'zeugma-dismiss-preview',
        }}
      >
        <SidebarWrapper
          snapThreshold={snapThreshold}
          onSnapThresholdChange={setSnapThreshold}
          minSplitPercentage={minSplit}
          onMinSplitPercentageChange={setMinSplit}
          maxSplitPercentage={maxSplit}
          onMaxSplitPercentageChange={setMaxSplit}
          logs={logs}
          useCustomResizer={useCustomResizer}
          onUseCustomResizerChange={handleUseCustomResizerChange}
        >
          <div className="h-full w-full p-2 overflow-hidden bg-bg-app">
            {layout ? (
              <PaneTree />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                <p className="mb-4">All panes closed.</p>
                <button
                  onClick={() => handleLayoutChange(defaultIDELayout)}
                  className="px-4 py-2 bg-text-primary hover:bg-text-primary/90 text-bg-app rounded text-sm transition-colors cursor-pointer"
                >
                  Reset Layout
                </button>
              </div>
            )}
          </div>
        </SidebarWrapper>
      </DashboardProvider>
    </div>
  )
}
