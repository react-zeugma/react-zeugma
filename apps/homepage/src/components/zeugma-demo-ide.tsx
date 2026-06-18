'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Folder,
  FileCode2,
  Terminal,
  Settings,
  Search,
  GitBranch,
  Blocks,
  Lock,
  Unlock,
  RefreshCw,
  Code,
  Maximize2,
  Minimize2,
  X,
  Activity,
} from 'lucide-react'
import { Zeugma, PaneTree, Pane, DragHandle, Tabs, useZeugma, PaneRenderProps } from 'react-zeugma'

import { SyntaxCode } from './syntax-code'
import { FILES, defaultOuterLayout } from './mock-files'

import { isTabOpenInTree, findActiveEditorPane } from './zeugma-demo-ide/utils'
import { TabContentWrapper } from './zeugma-demo-ide/TabContentWrapper'
import { InspectorWidget } from './zeugma-demo-ide/InspectorWidget'
import { FileExplorer } from './zeugma-demo-ide/FileExplorer'
import { TerminalWidget } from './zeugma-demo-ide/TerminalWidget'
import { ReadmeWidget } from './zeugma-demo-ide/ReadmeWidget'
import { FpsMonitor } from './fps-monitor'

export function ZeugmaDemoIDE({
  className = 'aspect-16/10 min-h-[580px]',
  hideChrome = false,
}: {
  className?: string
  hideChrome?: boolean
}) {
  const [locked, setLocked] = useState(false)
  const outerZeugma = useZeugma({ initialLayout: defaultOuterLayout })

  const handleReset = () => {
    if (locked) return
    outerZeugma.setLayout(defaultOuterLayout)
    setLocked(false)
    outerZeugma.setLocked(false)
  }

  const handleOpenFile = (filename: string) => {
    const isAlreadyOpen = isTabOpenInTree(outerZeugma.layout, filename)
    if (isAlreadyOpen) {
      const pane = outerZeugma.findPaneContainingTab(filename)
      if (pane) outerZeugma.selectTab(pane.id, filename)
    } else {
      const targetPaneId = findActiveEditorPane(outerZeugma.layout)
      if (targetPaneId) {
        outerZeugma.addTab(targetPaneId, filename)
        outerZeugma.selectTab(targetPaneId, filename)
      } else {
        outerZeugma.addPane(filename)
      }
    }
  }

  const handleOpenFileRef = useRef(handleOpenFile)
  useEffect(() => {
    handleOpenFileRef.current = handleOpenFile
  }, [handleOpenFile])

  const stableHandleOpenFile = useCallback((filename: string) => {
    handleOpenFileRef.current(filename)
  }, [])

  // ── Pane shell ──────────────────────────────────────────────────────────────
  const renderPane = useCallback(
    (paneId: string) => (
      <Pane id={paneId}>
        {(paneProps: PaneRenderProps) => {
          const isSidebar =
            paneId === 'pane-explorer' ||
            paneId === 'pane-performance' ||
            paneId === 'pane-inspector'

          return (
            <div className="h-full w-full flex flex-col bg-[#1e1e1e] border border-[#2d2d30] overflow-hidden shadow-2xl">
              {/* Tab bar */}
              <div className="flex items-center justify-between bg-[#2d2d2d] border-b border-[#1e1e1e] h-9 select-none">
                <Tabs
                  tabs={paneProps.tabs}
                  activeTabId={paneProps.activeTabId}
                  locked={locked || outerZeugma.locked}
                  selectTab={(id) => paneProps.selectTab(id)}
                  removeTab={(id) => paneProps.removeTab(id)}
                  classNames={{
                    container: 'overflow-x-auto scrollbar-none min-w-0 h-full shrink',
                    tab: 'h-full flex',
                  }}
                  renderTab={({ tabId, activeTabId, isDragging, isOver }) => {
                    const isTabActive = activeTabId === tabId

                    const basename = tabId.includes('/') ? tabId.split('/').pop()! : tabId
                    let title = basename
                    let icon = <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                    let closeable = true

                    if (tabId === 'explorer') {
                      title = 'Explorer'
                      icon = <Folder className="w-3.5 h-3.5 text-indigo-400" />
                      closeable = false
                    } else if (tabId === 'performance') {
                      title = 'Performance'
                      icon = <Activity className="w-3.5 h-3.5 text-indigo-400" />
                      closeable = false
                    } else if (tabId === 'terminal') {
                      title = 'Terminal'
                      icon = <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      closeable = false
                    } else if (tabId === 'inspector') {
                      title = 'Layout Inspector'
                      icon = <Code className="w-3.5 h-3.5 text-violet-400" />
                      closeable = false
                    } else {
                      icon = FILES[tabId]?.icon ?? icon
                    }

                    return (
                      <div
                        onClick={() => paneProps.selectTab(tabId)}
                        className={`
                          px-3 flex items-center gap-1.5 border-r border-[#1e1e1e]
                          text-[11px] font-mono tracking-wide transition-all cursor-pointer
                          h-full relative group
                          ${
                            isTabActive
                              ? 'bg-[#1e1e1e] text-white border-t border-t-indigo-500'
                              : 'bg-[#2d2d2d] text-[#858585] hover:text-[#cccccc] hover:bg-[#252526] border-t border-t-transparent'
                          }
                          ${isOver ? 'bg-indigo-500/10 animate-pulse' : ''}
                          ${isDragging ? 'opacity-40' : ''}
                        `}
                      >
                        {icon}
                        <span className="truncate max-w-[100px]">{title}</span>

                        {closeable && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              paneProps.removeTab(tabId)
                            }}
                            className={`
                              ml-0.5 w-4 h-4 rounded flex items-center justify-center
                              transition-all shrink-0
                              ${
                                isTabActive
                                  ? 'text-[#858585] hover:text-white hover:bg-zinc-700'
                                  : 'opacity-0 group-hover:opacity-100 text-[#858585] hover:text-white hover:bg-zinc-700'
                              }
                            `}
                            title={`Close ${title}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )
                  }}
                />

                <DragHandle className="flex-1 h-full cursor-grab active:cursor-grabbing self-stretch min-w-[20px]" />

                <div className="flex items-center gap-1.5 px-3 z-10 drag-cancel shrink-0">
                  {!isSidebar && (
                    <>
                      <button
                        onClick={paneProps.toggleFullscreen}
                        className="w-5 h-5 flex items-center justify-center rounded text-[#858585] hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        title={paneProps.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      >
                        {paneProps.isFullscreen ? (
                          <Minimize2 className="w-3 h-3" />
                        ) : (
                          <Maximize2 className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={paneProps.remove}
                        className="w-5 h-5 flex items-center justify-center rounded text-[#858585] hover:text-rose-450 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Close Pane"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] relative h-full overflow-hidden">
                {paneProps.renderActiveTab()}
              </div>
            </div>
          )
        }}
      </Pane>
    ),
    [locked],
  )

  // ── Tab content ─────────────────────────────────────────────────────────────
  const renderWidget = useCallback(
    (tabId: string) => {
      const getContent = () => {
        if (tabId === 'explorer') {
          return <FileExplorer onOpenFile={stableHandleOpenFile} />
        }

        if (tabId === 'performance') {
          return <FpsMonitor />
        }

        if (tabId === 'terminal') {
          return <TerminalWidget />
        }

        if (tabId === 'inspector') {
          return <InspectorWidget />
        }

        if (tabId === 'README.md') {
          return <ReadmeWidget />
        }

        const file = FILES[tabId]
        if (file?.tokens) {
          return <SyntaxCode tokens={file.tokens} language={file.language} />
        }

        return null
      }

      return <TabContentWrapper tabId={tabId}>{getContent()}</TabContentWrapper>
    },
    [stableHandleOpenFile],
  )

  // ── Drag overlay ────────────────────────────────────────────────────────────
  const renderDragOverlay = useCallback((id: string) => {
    const basename = id.includes('/') ? id.split('/').pop()! : id
    let title = basename
    let icon = <FileCode2 className="w-4 h-4 text-indigo-400" />
    if (id === 'explorer') {
      title = 'Explorer'
      icon = <Folder className="w-4 h-4 text-indigo-400" />
    } else if (id === 'performance') {
      title = 'Performance'
      icon = <Activity className="w-4 h-4 text-indigo-400" />
    } else if (id === 'terminal') {
      title = 'Terminal'
      icon = <Terminal className="w-4 h-4 text-emerald-400" />
    } else if (id === 'inspector') {
      title = 'Layout Inspector'
      icon = <Code className="w-4 h-4 text-violet-400" />
    } else {
      icon = FILES[id]?.icon ?? icon
    }

    return (
      <div className="px-4 py-2 bg-[#2d2d2d] border border-indigo-500/30 shadow-2xl flex items-center gap-2.5 opacity-95 text-xs text-white font-bold uppercase tracking-wider pointer-events-none font-mono">
        {icon}
        <span>{title}</span>
      </div>
    )
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`w-full flex flex-col text-left ${
        hideChrome
          ? ''
          : 'rounded-2xl shadow-[0_30px_100px_-10px_rgba(0,0,0,0.85)] border border-[#3a3a3a] overflow-hidden'
      } ${className}`}
    >
      {/* Mac window chrome */}
      {!hideChrome && (
        <div className="w-full bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-b-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a017] cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] cursor-pointer" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-md px-4 py-0.5 flex items-center gap-2 text-[11px] font-mono text-[#858585] min-w-[220px] justify-center select-none">
              <Code className="w-3 h-3 text-indigo-400" />
              <span>my-zeugma-app — Zeugma Code</span>
            </div>
          </div>
          <div className="w-16" />
        </div>
      )}

      <div
        id="workspace-frame"
        className="w-full flex-1 min-h-0 bg-[#1e1e1e] flex flex-col overflow-hidden relative"
      >
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Activity bar */}
          <div className="w-12 bg-[#2d2d2d] border-r border-[#1e1e1e] flex flex-col items-center py-4 gap-6 select-none shrink-0 z-30">
            <div className="w-full flex items-center justify-center border-l-2 border-l-indigo-500 py-1 cursor-pointer">
              <Folder className="w-5 h-5 text-white" />
            </div>
            {[Search, GitBranch, Blocks].map((Icon, i) => (
              <div key={i} className="w-full flex items-center justify-center py-1 opacity-40">
                <Icon className="w-5 h-5 text-zinc-400" />
              </div>
            ))}
            <div className="w-full flex items-center justify-center mt-auto mb-2 opacity-40">
              <Settings className="w-5 h-5 text-zinc-400" />
            </div>
          </div>

          {/* Zeugma workspace */}
          <div className="flex-1 min-w-0 relative p-1.5 bg-[#1e1e1e] h-full">
            {outerZeugma.layout && (
              <Zeugma
                {...outerZeugma}
                renderPane={renderPane}
                renderWidget={renderWidget}
                renderDragOverlay={renderDragOverlay}
                classNames={{
                  dropPreview:
                    'bg-zinc-800/50 border border-zinc-700 transition-all duration-200 shadow-lg',
                  resizer: 'zeugma-resizer',
                  tabDropPreview: 'zeugma-tab-drop-preview',
                }}
              >
                <PaneTree resizerSize={4} />
              </Zeugma>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="h-6 bg-[#252526] border-t border-[#1e1e1e] text-zinc-400 flex items-center justify-between px-3 text-[10.5px] select-none font-mono shrink-0 z-30">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/react-zeugma/react-zeugma"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <GitBranch className="w-3 h-3 text-indigo-400" />
              <span>master</span>
            </a>
          </div>

          <div className="flex items-center gap-2 drag-cancel">
            <button
              onClick={() => {
                const nextLock = !locked
                setLocked(nextLock)
                outerZeugma.setLocked(nextLock)
              }}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              {locked ? (
                <Lock className="w-3 h-3 text-amber-500" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
              <span>{locked ? 'Unlock Layout' : 'Lock Layout'}</span>
            </button>

            <span className="text-zinc-600">|</span>

            <button
              onClick={handleReset}
              disabled={locked}
              className={`flex items-center gap-1 transition-colors ${
                locked
                  ? 'opacity-30 cursor-not-allowed text-zinc-550'
                  : 'hover:text-white cursor-pointer text-zinc-400'
              }`}
              title={locked ? 'Unlock layout to reset' : 'Reset Layout'}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
