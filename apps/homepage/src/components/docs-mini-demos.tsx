'use client'

import { useState, useMemo } from 'react'
import { useZeugma, Zeugma, Pane, TreeNode, PaneNode } from 'react-zeugma'
import { Split, Plus, Trash2, CheckCircle2, Palette, LayoutGrid } from 'lucide-react'

// ─── HELPER FUNCTIONS FOR RECURSIVE TREE TRAVERSAL ───────────────────────────

function findFirstPane(node: TreeNode | null): PaneNode | null {
  if (!node) return null
  if (node.type === 'pane') return node
  return findFirstPane(node.first) || findFirstPane(node.second)
}

function getLayoutTabsAndActive(node: TreeNode | null): {
  tabIds: string[]
  activeTabIds: string[]
} {
  const tabIds: string[] = []
  const activeTabIds: string[] = []

  function traverse(n: TreeNode | null) {
    if (!n) return
    if (n.type === 'pane') {
      tabIds.push(...n.tabIds)
      if (n.activeTabId) {
        activeTabIds.push(n.activeTabId)
      }
    } else {
      traverse(n.first)
      traverse(n.second)
    }
  }

  traverse(node)
  return { tabIds, activeTabIds }
}

// ─── 1. BASIC SPLIT DEMO ─────────────────────────────────────────────────────

export function BasicSplitDemo() {
  const [direction, setDirection] = useState<'row' | 'column'>('row')

  const initialLayout: TreeNode = {
    type: 'split',
    direction,
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'Pane-1',
      tabIds: ['Left Pane'],
      activeTabId: 'Left Pane',
    },
    second: {
      type: 'pane',
      id: 'Pane-2',
      tabIds: ['Right Pane'],
      activeTabId: 'Right Pane',
    },
  }

  const controller = useZeugma({ initialLayout })

  const toggleDirection = () => {
    const nextDir = direction === 'row' ? 'column' : 'row'
    setDirection(nextDir)
    controller.setLayout({
      type: 'split',
      direction: nextDir,
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'Pane-1',
        tabIds: [nextDir === 'row' ? 'Left Pane' : 'Top Pane'],
        activeTabId: nextDir === 'row' ? 'Left Pane' : 'Top Pane',
      },
      second: {
        type: 'pane',
        id: 'Pane-2',
        tabIds: [nextDir === 'row' ? 'Right Pane' : 'Bottom Pane'],
        activeTabId: nextDir === 'row' ? 'Right Pane' : 'Bottom Pane',
      },
    })
  }

  return (
    <div className="border border-border-primary rounded-xl overflow-hidden bg-bg-pane shadow-2xs my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-sidebar/40 border-b border-border-primary text-xs select-none">
        <span className="text-text-primary font-semibold flex items-center gap-1.5">
          <Split className="w-3.5 h-3.5 text-indigo-500" /> Split Direction
        </span>
        <button
          onClick={toggleDirection}
          className="px-2.5 py-0.5 font-bold border border-border-primary/80 bg-bg-pane hover:bg-bg-sidebar text-[10px] rounded-md cursor-pointer transition-all"
        >
          Toggle: {direction === 'row' ? 'Vertical' : 'Horizontal'}
        </button>
      </div>

      <div className="h-44 p-3 bg-bg-pane-inner/10">
        <Zeugma
          controller={controller}
          resizerSize={6}
          renderPane={(paneId) => (
            <Pane id={paneId}>
              <div className="flex flex-col h-full bg-bg-pane border border-border-primary rounded-lg p-2 justify-center items-center text-center shadow-3xs">
                <span className="text-[11px] font-bold text-text-primary">{paneId}</span>
                <span className="text-[9px] text-text-muted mt-0.5 font-mono">
                  {paneId === 'Pane-1'
                    ? direction === 'row'
                      ? 'Left Child'
                      : 'Top Child'
                    : direction === 'row'
                      ? 'Right Child'
                      : 'Bottom Child'}
                </span>
              </div>
            </Pane>
          )}
          classNames={{
            resizer: 'zeugma-resizer',
            dropPreview: 'bg-indigo-500/5 border border-indigo-500 border-dashed rounded-lg',
          }}
        />
      </div>
    </div>
  )
}

// ─── 2. TAB CONTROLLER DEMO ──────────────────────────────────────────────────

export function TabControllerDemo() {
  const initialLayout: TreeNode = {
    type: 'pane',
    id: 'Main-Pane',
    tabIds: ['Dashboard', 'Analytics'],
    activeTabId: 'Dashboard',
  }

  const controller = useZeugma({ initialLayout })
  const [tabCounter, setTabCounter] = useState(1)

  // Recursively extract all tabs and active tabs to handle split layouts robustly
  const { tabIds: currentTabs, activeTabIds } = useMemo(() => {
    return getLayoutTabsAndActive(controller.layout)
  }, [controller.layout])

  const activeTabId = activeTabIds[0] || ''

  const handleAddTab = () => {
    const newTabName = `Custom Tab ${tabCounter}`

    // Find the first available pane to append to, or default to Main-Pane
    let targetPaneId = 'Main-Pane'
    if (controller.layout) {
      const firstPane = findFirstPane(controller.layout)
      if (firstPane) {
        targetPaneId = firstPane.id
      }
    }

    controller.addTab(newTabName, targetPaneId)
    controller.selectTab(targetPaneId, newTabName)
    setTabCounter((prev) => prev + 1)
  }

  const handleRemoveActive = () => {
    if (activeTabId) {
      controller.removeTab(activeTabId)
    }
  }

  const handleSelectTab = (tabName: string) => {
    // Dynamically find which pane currently contains the tab
    const pane = controller.findPaneContainingTab(tabName)
    if (pane) {
      controller.selectTab(pane.id, tabName)
    }
  }

  return (
    <div className="border border-border-primary rounded-xl overflow-hidden bg-bg-pane shadow-2xs my-4">
      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-bg-sidebar/40 border-b border-border-primary gap-2 select-none text-xs">
        <span className="text-text-primary font-semibold flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" /> Tab Controller
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleAddTab}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-3xs cursor-pointer transition-all"
          >
            <Plus className="w-3 h-3" /> Add Tab
          </button>
          <button
            onClick={handleRemoveActive}
            disabled={currentTabs.length <= 1}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/10 hover:bg-rose-500/25 text-rose-500 shadow-3xs cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3 h-3" /> Close Active
          </button>
        </div>
      </div>

      {/* Main Row layout (No side columns, just top controls & bottom preview) */}
      <div className="p-3 bg-bg-pane-inner/10 space-y-3">
        {/* Inline tabs selector */}
        <div className="flex flex-wrap gap-1 items-center bg-bg-sidebar/20 p-1.5 rounded-lg border border-border-primary/50">
          <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted mr-2">
            Focus Tab:
          </span>
          {currentTabs.map((t: string) => {
            const isActive = activeTabIds.includes(t)
            return (
              <button
                key={t}
                onClick={() => handleSelectTab(t)}
                className={`px-2 py-0.5 text-[9px] font-bold rounded-md border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 shadow-3xs'
                    : 'bg-bg-pane text-text-secondary border-border-primary/50 hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>

        {/* Dashboard Area */}
        <div className="h-36 relative">
          {controller.layout ? (
            <Zeugma
              controller={controller}
              resizerSize={6}
              classNames={{
                resizer: 'zeugma-resizer',
                dropPreview: 'bg-indigo-500/5 border border-indigo-500 border-dashed rounded-lg',
                tabDropPreview: 'bg-indigo-500/10 border-l-2 border-indigo-500',
              }}
              renderPane={(paneId) => (
                <Pane id={paneId}>
                  <div className="flex flex-col h-full bg-bg-pane border border-border-primary rounded-lg overflow-hidden shadow-3xs">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-1 bg-bg-sidebar border-b border-border-primary/60">
                      <Pane.Tabs
                        classNames={{
                          container: 'flex items-center gap-1 overflow-x-auto scrollbar-none',
                          tab: 'px-2 py-0.5 text-[9px] font-bold rounded transition-colors cursor-grab active:cursor-grabbing',
                        }}
                        renderTab={({ id, isActive, onSelect }) => (
                          <button
                            onClick={onSelect}
                            className={`cursor-grab active:cursor-grabbing ${
                              isActive
                                ? 'bg-bg-pane text-indigo-500'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {id}
                          </button>
                        )}
                      />
                    </div>
                    {/* Body */}
                    <Pane.Content className="flex-1 p-3 flex flex-col justify-center items-center text-center bg-bg-pane-inner/25">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 mb-1" />
                      <span className="text-[10px] font-bold text-text-primary">
                        Viewing: {activeTabIds.join(', ')}
                      </span>
                    </Pane.Content>
                  </div>
                </Pane>
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[11px] text-text-muted">
              No panes remaining.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 3. CUSTOM STYLING DEMO ──────────────────────────────────────────────────

type ThemeStyle = 'modern' | 'vscode' | 'neon'

export function CustomStylingDemo() {
  const [activeTheme, setActiveTheme] = useState<ThemeStyle>('modern')

  const initialLayout: TreeNode = {
    type: 'split',
    direction: 'row',
    splitPercentage: 40,
    first: {
      type: 'pane',
      id: 'Explorer',
      tabIds: ['explorer'],
      activeTabId: 'explorer',
    },
    second: {
      type: 'pane',
      id: 'Code',
      tabIds: ['index.ts'],
      activeTabId: 'index.ts',
    },
  }

  const controller = useZeugma({ initialLayout })

  const themeClasses = {
    modern: {
      dashboard: 'p-1 gap-1.5 bg-bg-app',
      pane: 'border border-border-primary bg-bg-pane rounded-lg overflow-hidden shadow-3xs',
      resizer: 'zeugma-resizer',
      dropPreview: 'bg-indigo-500/5 border border-indigo-500 border-dashed rounded-lg',
    },
    vscode: {
      dashboard: 'gap-0.5 bg-[#1e1e1e]',
      pane: 'border border-[#2d2d2d] bg-[#1e1e1e] rounded-none overflow-hidden',
      resizer: 'bg-[#2d2d2d] hover:bg-[#007acc] transition-colors w-0.5 h-0.5',
      dropPreview: 'bg-[#007acc]/10 border border-[#007acc]',
    },
    neon: {
      dashboard: 'p-2 gap-2 bg-[#0a0514] border border-fuchsia-500/10 rounded-xl',
      pane: 'border border-fuchsia-500/20 bg-[#0f0720]/80 rounded-md overflow-hidden shadow-[0_0_10px_rgba(240,46,170,0.02)]',
      resizer: 'bg-fuchsia-500/10 hover:bg-fuchsia-500/70 rounded-full transition-all w-1 h-1',
      dropPreview: 'bg-fuchsia-500/5 border border-fuchsia-500 rounded-md',
    },
  }

  const activeClasses = themeClasses[activeTheme]

  return (
    <div className="border border-border-primary rounded-xl overflow-hidden bg-bg-pane shadow-2xs my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-sidebar/40 border-b border-border-primary text-xs select-none">
        <span className="text-text-primary font-semibold flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-500" /> Headless Themes
        </span>
        <div className="flex gap-1">
          {(['modern', 'vscode', 'neon'] as ThemeStyle[]).map((theme) => (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={`px-2 py-0.5 text-[9px] font-bold rounded-md capitalize border transition-all cursor-pointer ${
                activeTheme === theme
                  ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 shadow-3xs'
                  : 'bg-bg-pane text-text-secondary border-border-primary/60 hover:text-text-primary'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="h-36 p-3 bg-bg-pane-inner/10">
        <Zeugma
          controller={controller}
          resizerSize={activeTheme === 'vscode' ? 2 : 6}
          renderPane={(paneId) => (
            <Pane id={paneId}>
              <div className="flex flex-col h-full w-full justify-between p-2 select-none">
                <span className="text-[9px] font-bold tracking-wider uppercase text-text-secondary">
                  {paneId}
                </span>
                <span className="text-[8px] text-text-muted font-mono self-end">{activeTheme}</span>
              </div>
            </Pane>
          )}
          classNames={activeClasses}
        />
      </div>
    </div>
  )
}
