'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
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
  ChevronDown,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import {
  Zeugma,
  PaneTree,
  Pane,
  DragHandle,
  Tabs,
  useZeugma,
  TreeNode,
  PaneRenderProps,
  useZeugmaState,
} from 'react-zeugma'

import { SyntaxCode, JSONFormatter } from './syntax-code'
import { FILES, FILE_TREE, defaultOuterLayout, TreeEntry } from './mock-files'

// ─── Layout helpers ───────────────────────────────────────────────────────────

function isTabOpenInTree(node: TreeNode | null, tabId: string): boolean {
  if (!node) return false
  if (node.type === 'pane') return node.tabs.includes(tabId)
  return isTabOpenInTree(node.first, tabId) || isTabOpenInTree(node.second, tabId)
}

function findActiveEditorPane(node: TreeNode | null): string | null {
  if (!node) return null
  if (node.type === 'pane') {
    if (node.id !== 'pane-explorer' && node.id !== 'pane-terminal') return node.id
    return null
  }
  return findActiveEditorPane(node.first) || findActiveEditorPane(node.second)
}

// ─── Render Counter Hook and Tab Item Component ─────────────────────────────────

const renderCache: Record<string, { mounts: number; renders: number }> = {}

/**
 * A custom hook that tracks the number of times a component mounts
 * and re-renders based on a unique identifier.
 */
export function useRenderCounter(id: string) {
  if (!renderCache[id]) {
    renderCache[id] = { mounts: 0, renders: 0 }
  }

  // Increment every single time the function body executes (re-renders)
  renderCache[id].renders += 1

  const [, forceUpdate] = useState(0)

  // Run exactly once per actual DOM mount
  useEffect(() => {
    renderCache[id].mounts += 1
    forceUpdate((x) => x + 1)

    // Optional: Log it to the console for real-time debugging
    console.log(`[${id}] Mounted: ${renderCache[id].mounts} | Rendered: ${renderCache[id].renders}`)
  }, [id])

  return {
    mounts: renderCache[id].mounts,
    renders: renderCache[id].renders,
  }
}

interface TabContentWrapperProps {
  tabId: string
  children: React.ReactNode
}

function TabContentWrapper({ tabId, children }: TabContentWrapperProps) {
  const { mounts, renders } = useRenderCounter(`content-${tabId}`)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 overflow-auto relative min-h-0">{children}</div>
      <div className="bg-[#252526] border-t border-[#2d2d30] px-3 py-1.5 flex items-center justify-between text-[10px] text-[#858585] font-mono shrink-0 select-none">
        <span className="truncate max-w-[150px] text-zinc-400 font-medium">View: {tabId}</span>
        <div className="flex items-center gap-3">
          <span>
            Mounts: <span className="text-emerald-400 font-bold">{mounts}</span>
          </span>
          <span className="opacity-30">|</span>
          <span>
            Renders: <span className="text-indigo-400 font-bold">{renders}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function InspectorWidget() {
  const { layout } = useZeugmaState()
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto">
      <div className="flex items-center justify-between border-b border-[#2d2d30] px-4 py-2 bg-[#2d2d2d] text-[#858585] select-none">
        <span className="text-[10px] uppercase font-bold tracking-wider">
          Active IDE Workspace Layout Tree
        </span>
        <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono uppercase animate-pulse">
          Serialized
        </span>
      </div>
      <JSONFormatter json={layout} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ZeugmaDemoIDE({
  className = 'aspect-16/10 min-h-[580px]',
}: {
  className?: string
}) {
  const [locked, setLocked] = useState(false)
  const [isIDEFullscreen, setIsIDEFullscreen] = useState(false)
  const outerZeugma = useZeugma({ initialLayout: defaultOuterLayout })

  useEffect(() => {
    const handleFullscreenChange = () => setIsIDEFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleToggleFullscreenIDE = () => {
    const element = document.getElementById('workspace-frame')
    if (!element) return
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleReset = () => {
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
      const targetPaneId = findActiveEditorPane(outerZeugma.layout) || 'pane-editor'
      outerZeugma.addTab(targetPaneId, filename)
      outerZeugma.selectTab(targetPaneId, filename)
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
          const isSidebar = paneId === 'pane-explorer'

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
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] relative h-full overflow-hidden">
                <TabContentWrapper tabId={paneProps.activeTabId}>
                  {paneProps.renderActiveTab()}
                </TabContentWrapper>
              </div>
            </div>
          )
        }}
      </Pane>
    ),
    [locked],
  )

  // ── Tab content ─────────────────────────────────────────────────────────────
  const renderWidget = useCallback((tabId: string) => {
    if (tabId === 'explorer') {
      const renderTreeNode = (entry: TreeEntry, depth: number = 0): React.ReactNode => {
        const indent = depth * 12
        if (entry.isFolder) {
          const isCollapsed = entry.collapsed
          return (
            <div key={entry.name}>
              <div
                className={`flex items-center gap-1.5 py-1 px-2 rounded text-left transition-all select-none ${
                  isCollapsed
                    ? 'text-[#6e6e6e] cursor-default'
                    : 'text-[#cccccc] hover:bg-[#2d2d2d] cursor-pointer'
                }`}
                style={{ paddingLeft: `${indent + 8}px` }}
              >
                <ChevronDown
                  className={`w-3 h-3 shrink-0 transition-transform ${
                    isCollapsed ? '-rotate-90 text-[#4e4e4e]' : ''
                  }`}
                />
                <Folder
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isCollapsed ? 'text-[#4e4e4e]' : 'text-[#dcb67a]'
                  }`}
                />
                <span
                  className={`font-mono text-[11px] truncate ${
                    isCollapsed ? 'text-[#4e4e4e]' : ''
                  }`}
                >
                  {entry.name}
                </span>
              </div>
              {!isCollapsed && entry.children?.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )
        }

        const fileKey = entry.fileKey
        const fileEntry = fileKey ? FILES[fileKey] : null
        const icon = fileEntry?.icon ?? <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />

        return (
          <button
            key={entry.name}
            onClick={() => fileKey && stableHandleOpenFile(fileKey)}
            className="flex items-center gap-1.5 py-1 px-2 rounded text-left transition-all hover:bg-[#2d2d2d] hover:text-white cursor-pointer w-full"
            style={{ paddingLeft: `${indent + 20}px` }}
          >
            {icon}
            <span className="font-mono text-[11px] truncate">{entry.name}</span>
          </button>
        )
      }

      return (
        <div className="h-full w-full bg-[#252526] py-3 flex flex-col gap-1 text-xs font-semibold text-[#cccccc] overflow-y-auto">
          <div className="flex items-center gap-1.5 uppercase tracking-wider text-[9px] text-[#858585] font-black select-none px-4 pb-2">
            <ChevronDown className="w-3.5 h-3.5" />
            <span>MY-ZEUGMA-APP</span>
          </div>
          <div className="flex flex-col">{FILE_TREE.map((entry) => renderTreeNode(entry, 0))}</div>
        </div>
      )
    }

    if (tabId === 'terminal') {
      return (
        <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-[#858585] select-text">
          <div className="flex justify-between items-center pb-2 border-b border-[#2d2d30] mb-3 text-zinc-500">
            <span>bash (npm run dev)</span>
            <span>~/my-zeugma-app</span>
          </div>
          <div className="text-[#abb2bf]">
            <span className="text-emerald-400">user@dev:~/my-zeugma-app$</span> npm run dev
            <br />
            <span className="text-[#5c6370]">{`> my-zeugma-app@0.1.0 dev`}</span>
            <br />
            <span className="text-[#5c6370]">{`> vite`}</span>
            <br />
            <br />
            <span className="text-cyan-400">{'  VITE v5.1.4  ready in 184 ms'}</span>
            <br />
            <br />
            {'  ➜  '}Local:{' '}
            <span className="text-indigo-400 underline cursor-pointer">http://localhost:5173/</span>
            <br />
            {'  ➜  '}Network: use --host to expose
            <br />
            <br />
            <span className="text-zinc-600 animate-pulse">▋</span>
          </div>
        </div>
      )
    }

    if (tabId === 'inspector') {
      return <InspectorWidget />
    }

    if (tabId === 'README.md') {
      return (
        <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-6 text-zinc-300 select-text font-sans">
          <h1 className="text-lg font-black text-white mb-3 flex items-center gap-2">
            <span>my-zeugma-app</span>
          </h1>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            A workspace layout demo built with{' '}
            <code className="bg-zinc-800 text-indigo-300 px-1 py-0.5 rounded text-[10px]">
              react-zeugma
            </code>{' '}
            + Vite + React 19. Explore the drag-and-drop split layout engine interactively.
          </p>
          <div className="space-y-4">
            {[
              {
                color: 'text-indigo-400',
                label: '1. Drag & Split',
                desc: 'Drag tabs (like App.tsx or WorkspacePane.tsx) toward the edge of another pane to split the view. Tabs reorder inline via sortable drag, and detach into floating overlays when pulled far enough — just like browser tabs.',
              },
              {
                color: 'text-emerald-400',
                label: '2. File Explorer',
                desc: 'Click any file in the sidebar to open it as a tab. The project uses a standard Vite + React structure with src/, components/, and styles/ directories.',
              },
              {
                color: 'text-violet-400',
                label: '3. Layout Inspector',
                desc: 'Switch to the Layout Inspector tab in the terminal pane to see the serialized JSON tree update live as you drag, resize, or reorder.',
              },
            ].map(({ color, label, desc }) => (
              <div key={label} className="bg-[#252526] p-4 rounded-xl border border-zinc-800/80">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${color} block mb-1`}
                >
                  {label}
                </span>
                <p className="text-[11px] text-zinc-400 leading-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    const file = FILES[tabId]
    if (file?.tokens) {
      return <SyntaxCode tokens={file.tokens} language={file.language} />
    }

    return null
  }, [])

  // ── Drag overlay ────────────────────────────────────────────────────────────
  const renderDragOverlay = useCallback((id: string) => {
    const basename = id.includes('/') ? id.split('/').pop()! : id
    let title = basename
    let icon = <FileCode2 className="w-4 h-4 text-indigo-400" />
    if (id === 'explorer') {
      title = 'Explorer'
      icon = <Folder className="w-4 h-4 text-indigo-400" />
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
      className={`w-full flex flex-col text-left rounded-2xl shadow-[0_30px_100px_-10px_rgba(0,0,0,0.85)] border border-[#3a3a3a] overflow-hidden ${className}`}
    >
      {/* Mac window chrome */}
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
            <div className="flex items-center gap-1 hover:text-white transition-colors cursor-default">
              <GitBranch className="w-3 h-3 text-indigo-400" />
              <span>main</span>
            </div>
          </div>

          <div className="flex items-center gap-2 drag-cancel">
            <button
              onClick={handleToggleFullscreenIDE}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title={isIDEFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isIDEFullscreen ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
              <span>Fullscreen</span>
            </button>

            <span className="text-zinc-600">|</span>

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
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
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
