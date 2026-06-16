'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Folder,
  FileCode2,
  FileText,
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
} from 'react-zeugma'

// ─── Syntax Highlighting ──────────────────────────────────────────────────────

type TokenType =
  | 'kw'
  | 'fn'
  | 'str'
  | 'num'
  | 'cmt'
  | 'cls'
  | 'op'
  | 'prop'
  | 'tag'
  | 'attr'
  | 'punc'
  | 'bool'
  | 'plain'

type Token = [TokenType, string] | string

function tokensToHTML(tokens: Token[]): string {
  const COLOR: Record<TokenType, string> = {
    kw: '#c678dd',
    fn: '#61afef',
    str: '#98c379',
    num: '#d19a66',
    cmt: '#5c6370',
    cls: '#e5c07b',
    op: '#56b6c2',
    prop: '#e06c75',
    tag: '#e06c75',
    attr: '#d19a66',
    punc: '#abb2bf',
    bool: '#56b6c2',
    plain: '#abb2bf',
  }
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return tokens
    .map((t) => {
      if (typeof t === 'string') return esc(t)
      const [cls, text] = t
      const style = cls === 'cmt' ? `color:${COLOR[cls]};font-style:italic` : `color:${COLOR[cls]}`
      return `<span style="${style}">${esc(text)}</span>`
    })
    .join('')
}

// Highlighted code block component
function SyntaxCode({ tokens }: { tokens: Token[]; language: string }) {
  const html = useMemo(() => tokensToHTML(tokens), [tokens])
  const lines = useMemo(() => {
    // count newlines in the token stream
    const raw = tokens.map((t) => (typeof t === 'string' ? t : t[1])).join('')
    return raw.split('\n').length
  }, [tokens])

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex font-mono text-[12px] leading-[22px] text-[#abb2bf] select-text">
      {/* Gutter */}
      <div className="py-4 pr-3 pl-4 bg-[#1e1e1e] border-r border-[#2d2d30] text-right text-[#4e5066] select-none min-w-[44px] flex-shrink-0">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      {/* Code */}
      <div
        className="p-4 flex-1 whitespace-pre overflow-auto selection:bg-indigo-500/30"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

// ─── Token definitions for each file ─────────────────────────────────────────

const APP_TSX_TOKENS: Token[] = [
  ['kw', 'import'],
  ' ',
  ['cls', 'React'],
  ' ',
  ['kw', 'from'],
  ' ',
  ['str', "'react'"],
  ';\n',
  ['kw', 'import'],
  ' ',
  ['punc', '{ '],
  ['cls', 'Zeugma'],
  ['punc', ', '],
  ['cls', 'PaneTree'],
  ['punc', ', '],
  ['fn', 'useZeugma'],
  ['punc', ' }'],
  ' ',
  ['kw', 'from'],
  ' ',
  ['str', "'react-zeugma'"],
  ';\n',
  ['kw', 'import'],
  ' ',
  ['punc', '{ '],
  ['cls', 'Dashboard'],
  ['punc', ' }'],
  ' ',
  ['kw', 'from'],
  ' ',
  ['str', "'./Dashboard'"],
  ';\n\n',
  ['kw', 'export'],
  ' ',
  ['kw', 'default'],
  ' ',
  ['kw', 'function'],
  ' ',
  ['fn', 'App'],
  ['punc', '() {\n'],
  '  ',
  ['kw', 'const'],
  ' workspace ',
  ['op', '='],
  ' ',
  ['fn', 'useZeugma'],
  ['punc', '({\n'],
  '    initialLayout',
  ['punc', ': {\n'],
  '      type',
  ['punc', ': '],
  ['str', "'split'"],
  ['punc', ',\n'],
  '      direction',
  ['punc', ': '],
  ['str', "'row'"],
  ['punc', ',\n'],
  '      splitPercentage',
  ['punc', ': '],
  ['num', '25'],
  ['punc', ',\n'],
  '      first',
  ['punc', ': {\n'],
  '        type',
  ['punc', ': '],
  ['str', "'pane'"],
  ['punc', ', id: '],
  ['str', "'sidebar'"],
  ['punc', ',\n'],
  '        tabs',
  ['punc', ': ['],
  ['str', "'explorer'"],
  ['punc', '],\n'],
  '        activeTabId',
  ['punc', ': '],
  ['str', "'explorer'"],
  ['punc', '\n'],
  '      ',
  ['punc', '},\n'],
  '      second',
  ['punc', ': {\n'],
  '        type',
  ['punc', ': '],
  ['str', "'pane'"],
  ['punc', ', id: '],
  ['str', "'editor'"],
  ['punc', ',\n'],
  '        tabs',
  ['punc', ': ['],
  ['str', "'App.tsx'"],
  ['punc', ', '],
  ['str', "'Dashboard.tsx'"],
  ['punc', '],\n'],
  '        activeTabId',
  ['punc', ': '],
  ['str', "'App.tsx'"],
  ['punc', '\n'],
  '      ',
  ['punc', '}\n'],
  '    ',
  ['punc', '}\n'],
  '  ',
  ['punc', ']);\n\n'],
  '  ',
  ['kw', 'return'],
  ' ',
  ['punc', '(\n'],
  '    ',
  ['punc', '<'],
  ['tag', 'div'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"w-full h-full bg-[#1e1e1e] text-white"'],
  ['punc', '>\n'],
  '      ',
  ['punc', '<'],
  ['tag', 'Zeugma'],
  ' ',
  ['punc', '{...'],
  ['prop', 'workspace'],
  ['punc', '}>\n'],
  '        ',
  ['punc', '<'],
  ['tag', 'PaneTree'],
  ' ',
  ['punc', '/>\n'],
  '      ',
  ['punc', '</'],
  ['tag', 'Zeugma'],
  ['punc', '>\n'],
  '    ',
  ['punc', '</'],
  ['tag', 'div'],
  ['punc', '>\n'],
  '  ',
  ['punc', ');\n'],
  ['punc', '}'],
]

const DASHBOARD_TSX_TOKENS: Token[] = [
  ['kw', 'import'],
  ' ',
  ['cls', 'React'],
  ' ',
  ['kw', 'from'],
  ' ',
  ['str', "'react'"],
  ';\n\n',
  ['kw', 'export'],
  ' ',
  ['kw', 'function'],
  ' ',
  ['fn', 'Dashboard'],
  ['punc', '() {\n'],
  '  ',
  ['kw', 'return'],
  ' ',
  ['punc', '(\n'],
  '    ',
  ['punc', '<'],
  ['tag', 'div'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"p-6 bg-zinc-900 rounded-xl border border-zinc-800"'],
  ['punc', '>\n'],
  '      ',
  ['punc', '<'],
  ['tag', 'h3'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"text-sm font-bold text-white mb-2"'],
  ['punc', '>\n'],
  '        Metrics Summary\n',
  '      ',
  ['punc', '</'],
  ['tag', 'h3'],
  ['punc', '>\n'],
  '      ',
  ['punc', '<'],
  ['tag', 'div'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"grid grid-cols-2 gap-4"'],
  ['punc', '>\n'],
  '        ',
  ['punc', '<'],
  ['tag', 'div'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"bg-zinc-800 p-4"'],
  ['punc', '>\n'],
  '          ',
  ['punc', '<'],
  ['tag', 'span'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"text-xs text-zinc-400"'],
  ['punc', '>'],
  'Total Visits',
  ['punc', '</'],
  ['tag', 'span'],
  ['punc', '>\n'],
  '          ',
  ['punc', '<'],
  ['tag', 'span'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"text-xl font-bold text-emerald-400 block"'],
  ['punc', '>'],
  ['num', '42,904'],
  ['punc', '</'],
  ['tag', 'span'],
  ['punc', '>\n'],
  '        ',
  ['punc', '</'],
  ['tag', 'div'],
  ['punc', '>\n'],
  '        ',
  ['punc', '<'],
  ['tag', 'div'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"bg-zinc-800 p-4"'],
  ['punc', '>\n'],
  '          ',
  ['punc', '<'],
  ['tag', 'span'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"text-xs text-zinc-400"'],
  ['punc', '>'],
  'CPU Usage',
  ['punc', '</'],
  ['tag', 'span'],
  ['punc', '>\n'],
  '          ',
  ['punc', '<'],
  ['tag', 'span'],
  ' ',
  ['attr', 'className'],
  ['punc', '='],
  ['str', '"text-xl font-bold text-indigo-400 block"'],
  ['punc', '>'],
  ['num', '12.4%'],
  ['punc', '</'],
  ['tag', 'span'],
  ['punc', '>\n'],
  '        ',
  ['punc', '</'],
  ['tag', 'div'],
  ['punc', '>\n'],
  '      ',
  ['punc', '</'],
  ['tag', 'div'],
  ['punc', '>\n'],
  '    ',
  ['punc', '</'],
  ['tag', 'div'],
  ['punc', '>\n'],
  '  ',
  ['punc', ');\n'],
  ['punc', '}'],
]

const GLOBAL_CSS_TOKENS: Token[] = [
  ['prop', ':root'],
  ' ',
  ['punc', '{\n'],
  '  ',
  ['cmt', '/* custom styling variables for react-zeugma */\n'],
  '  ',
  ['prop', '--zeugma-resizer-thickness'],
  ['punc', ': '],
  ['num', '4px'],
  ['punc', ';\n'],
  '  ',
  ['prop', '--zeugma-drop-zone-color'],
  ['punc', ': '],
  ['fn', 'rgba'],
  ['punc', '('],
  ['num', '99'],
  ['punc', ', '],
  ['num', '102'],
  ['punc', ', '],
  ['num', '241'],
  ['punc', ', '],
  ['num', '0.15'],
  ['punc', ');\n'],
  '  ',
  ['prop', '--zeugma-drop-zone-border'],
  ['punc', ': '],
  ['num', '2px'],
  ' ',
  ['str', 'dashed'],
  ' ',
  ['str', '#6366f1'],
  ['punc', ';\n'],
  ['punc', '}\n\n'],
  ['fn', '.zeugma-resizer'],
  ' ',
  ['punc', '{\n'],
  '  ',
  ['prop', 'transition'],
  ['punc', ': '],
  ['str', 'all'],
  ' ',
  ['num', '0.2s'],
  ' ',
  ['str', 'ease'],
  ['punc', ';\n'],
  '  ',
  ['prop', 'background-color'],
  ['punc', ': '],
  ['str', 'transparent'],
  ['punc', ';\n'],
  ['punc', '}\n\n'],
  ['fn', '.zeugma-resizer:hover'],
  ' ',
  ['punc', '{\n'],
  '  ',
  ['prop', 'background-color'],
  ['punc', ': '],
  ['str', '#3f3f46'],
  ['punc', ';\n'],
  ['punc', '}\n\n'],
  ['fn', ".zeugma-resizer[data-resizing='true']"],
  ' ',
  ['punc', '{\n'],
  '  ',
  ['prop', 'background-color'],
  ['punc', ': '],
  ['str', '#6366f1'],
  ['punc', ';\n'],
  ['punc', '}'],
]

const PACKAGE_JSON_TOKENS: Token[] = [
  ['punc', '{\n'],
  '  ',
  ['prop', '"name"'],
  ['punc', ': '],
  ['str', '"zeugma-demo"'],
  ['punc', ',\n'],
  '  ',
  ['prop', '"version"'],
  ['punc', ': '],
  ['str', '"1.0.0"'],
  ['punc', ',\n'],
  '  ',
  ['prop', '"private"'],
  ['punc', ': '],
  ['bool', 'true'],
  ['punc', ',\n'],
  '  ',
  ['prop', '"dependencies"'],
  ['punc', ': {\n'],
  '    ',
  ['prop', '"react"'],
  ['punc', ': '],
  ['str', '"^19.0.0"'],
  ['punc', ',\n'],
  '    ',
  ['prop', '"react-dom"'],
  ['punc', ': '],
  ['str', '"^19.0.0"'],
  ['punc', ',\n'],
  '    ',
  ['prop', '"react-zeugma"'],
  ['punc', ': '],
  ['str', '"workspace:*"'],
  ['punc', '\n'],
  '  ',
  ['punc', '}\n'],
  ['punc', '}'],
]

// ─── JSON Inspector ───────────────────────────────────────────────────────────

function JSONFormatter({ json }: { json: any }) {
  const formatted = useMemo(() => {
    if (!json) return ''
    const str = JSON.stringify(json, null, 2)
    return str.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let style = 'color:#d19a66'
        if (/^"/.test(match)) {
          style = /:$/.test(match) ? 'color:#c678dd;font-weight:600' : 'color:#98c379'
        } else if (/true|false/.test(match)) {
          style = 'color:#56b6c2'
        } else if (/null/.test(match)) {
          style = 'color:#5c6370'
        }
        return `<span style="${style}">${match}</span>`
      },
    )
  }, [json])

  return (
    <pre
      className="m-0 text-[11px] leading-relaxed text-[#abb2bf] font-mono whitespace-pre overflow-x-auto p-4 select-text"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}

// ─── File registry ────────────────────────────────────────────────────────────

const FILES = {
  'README.md': {
    language: 'markdown',
    icon: <FileText className="w-3.5 h-3.5 text-indigo-400" />,
    tokens: null, // rendered as rich preview instead
  },
  'App.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />,
    tokens: APP_TSX_TOKENS,
  },
  'Dashboard.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />,
    tokens: DASHBOARD_TSX_TOKENS,
  },
  'global.css': {
    language: 'css',
    icon: <FileText className="w-3.5 h-3.5 text-amber-400" />,
    tokens: GLOBAL_CSS_TOKENS,
  },
  'package.json': {
    language: 'json',
    icon: <FileText className="w-3.5 h-3.5 text-sky-400" />,
    tokens: PACKAGE_JSON_TOKENS,
  },
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

const defaultOuterLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 20,
  first: {
    type: 'pane',
    id: 'pane-explorer',
    tabs: ['explorer'],
    activeTabId: 'explorer',
  },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 70,
    first: {
      type: 'pane',
      id: 'pane-editor',
      tabs: ['README.md', 'App.tsx', 'Dashboard.tsx', 'global.css'],
      activeTabId: 'README.md',
    },
    second: {
      type: 'pane',
      id: 'pane-terminal',
      tabs: ['terminal', 'inspector'],
      activeTabId: 'terminal',
    },
  },
}

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

// ─── Main component ───────────────────────────────────────────────────────────

export function ZeugmaDemoIDE() {
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

                    let title = tabId
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
                      icon = FILES[tabId as keyof typeof FILES]?.icon ?? icon
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
                              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-indigo-500'
                              : 'bg-[#2d2d2d] text-[#858585] hover:text-[#cccccc] hover:bg-[#252526] border-t-2 border-t-transparent'
                          }
                          ${isOver ? 'bg-indigo-500/10 animate-pulse' : ''}
                          ${isDragging ? 'opacity-40' : ''}
                        `}
                      >
                        {icon}
                        <span className="truncate max-w-[100px]">{title}</span>

                        {/* Close button — shown on active tab always; on inactive on hover */}
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

                {/* Free area = drag handle */}
                <DragHandle className="flex-1 h-full cursor-grab active:cursor-grabbing self-stretch min-w-[20px]" />

                {/* Panel fullscreen toggle */}
                <div className="flex items-center gap-1.5 px-3 z-10 drag-cancel shrink-0">
                  {!isSidebar && (
                    <button
                      onClick={paneProps.toggleFullscreen}
                      className="w-5 h-5 flex items-center justify-center rounded text-[#858585] hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                      title={paneProps.isFullscreen ? 'Exit Panel Fullscreen' : 'Fullscreen Panel'}
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

              {/* Content body */}
              <div className="flex-1 overflow-auto bg-[#1e1e1e] relative h-full">
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
      // 1. File Explorer
      if (tabId === 'explorer') {
        return (
          <div className="h-full w-full bg-[#252526] p-4 flex flex-col gap-4 text-xs font-semibold text-[#cccccc]">
            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[9px] text-[#858585] font-black select-none">
              <ChevronDown className="w-3.5 h-3.5" />
              <span>ZEUGMA-DEMO</span>
            </div>
            <div className="flex flex-col gap-1 pl-1">
              {Object.entries(FILES).map(([filename, file]) => (
                <button
                  key={filename}
                  onClick={() => handleOpenFile(filename)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-md text-left transition-all hover:bg-[#2d2d2d] hover:text-white border border-transparent cursor-pointer group"
                >
                  {file.icon}
                  <span className="font-mono text-[11.5px]">{filename}</span>
                </button>
              ))}
            </div>
          </div>
        )
      }

      // 2. Terminal
      if (tabId === 'terminal') {
        return (
          <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-[#858585] select-text">
            <div className="flex justify-between items-center pb-2 border-b border-[#2d2d30] mb-3 text-zinc-500">
              <span>bash (npm run dev)</span>
              <span>UTC</span>
            </div>
            <div className="text-[#abb2bf]">
              <span className="text-emerald-400">user@react-zeugma:~$</span> npm run dev
              <br />
              <span className="text-[#5c6370]">{`> zeugma-demo@1.0.0 dev`}</span>
              <br />
              <span className="text-[#5c6370]">{`> vite`}</span>
              <br />
              <br />
              <span className="text-cyan-400">{'  VITE v5.1.4  ready in 184 ms'}</span>
              <br />
              <br />
              {'  ➜  '}Local:{' '}
              <span className="text-indigo-400 underline cursor-pointer">
                http://localhost:5173/
              </span>
              <br />
              {'  ➜  '}Network: use --host to expose
              <br />
              <br />
              <span className="text-zinc-600 animate-pulse">▋</span>
            </div>
          </div>
        )
      }

      // 3. Layout Inspector
      if (tabId === 'inspector') {
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
            <JSONFormatter json={outerZeugma.layout} />
          </div>
        )
      }

      // 4. README.md — rich preview
      if (tabId === 'README.md') {
        return (
          <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-6 text-zinc-300 select-text font-sans">
            <h1 className="text-lg font-black text-white mb-3 flex items-center gap-2">
              <span>React Zeugma Workspace Demo</span>
            </h1>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Welcome to the interactive style layout workspace. Test composition, drag-and-split,
              and resizable layout capabilities of{' '}
              <code className="bg-zinc-800 text-indigo-300 px-1 py-0.5 rounded text-[10px]">
                react-zeugma
              </code>
              .
            </p>
            <div className="space-y-4">
              {[
                {
                  color: 'text-indigo-400',
                  label: '1. Layout customization',
                  desc: 'Drag file tabs (like App.tsx or global.css) out of the editor pane to split windows horizontally or vertically. You can move tabs between the editor and terminal panes.',
                },
                {
                  color: 'text-emerald-400',
                  label: '2. File tree integration',
                  desc: 'Click on files in the simulated explorer sidebar. If closed, they will dynamically reopen as a tab inside the active editor pane.',
                },
                {
                  color: 'text-violet-400',
                  label: '3. Layout state inspector',
                  desc: 'Switch to the Layout Inspector tab at the bottom to watch the serialized JSON representation update in real-time as you drag or resize.',
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

      // 5. Code files — syntax highlighted
      const file = FILES[tabId as keyof typeof FILES]
      if (file?.tokens) {
        return <SyntaxCode tokens={file.tokens} language={file.language} />
      }

      return null
    },
    [outerZeugma.layout],
  )

  // ── Drag overlay ────────────────────────────────────────────────────────────
  const renderDragOverlay = useCallback((id: string) => {
    let title = id
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
      icon = FILES[id as keyof typeof FILES]?.icon ?? icon
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
    <div className="w-full flex flex-col text-left">
      {/* Mac window chrome */}
      <div className="w-full bg-[#2d2d2d] rounded-t-2xl border border-b-0 border-[#3a3a3a] px-4 py-2 flex items-center gap-2 shadow-2xl">
        {/* Traffic lights */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer hover:brightness-90 transition-all"
            title="Close"
          />
          <div
            className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d4a017] cursor-pointer hover:brightness-90 transition-all"
            title="Minimize"
          />
          <div
            className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] cursor-pointer hover:brightness-90 transition-all"
            title="Fullscreen"
          />
        </div>
        {/* Fake address / title bar */}
        <div className="flex-1 flex justify-center">
          <div className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-md px-4 py-0.5 flex items-center gap-2 text-[11px] font-mono text-[#858585] min-w-[220px] justify-center select-none">
            <Code className="w-3 h-3 text-indigo-400" />
            <span>zeugma-demo — editor</span>
          </div>
        </div>
        {/* Spacer to balance traffic lights */}
        <div className="w-16" />
      </div>

      <div
        id="workspace-frame"
        className="w-full aspect-16/10 min-h-[580px] bg-[#1e1e1e] border border-t-0 border-[#3a3a3a] rounded-b-2xl flex flex-col overflow-hidden shadow-2xl relative"
      >
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Activity bar */}
          <div className="w-12 bg-[#2d2d2d] border-r border-[#1e1e1e] flex flex-col items-center py-4 gap-6 select-none shrink-0 z-30">
            <div className="w-full flex items-center justify-center border-l-2 border-l-indigo-500 py-1 cursor-pointer">
              <Folder className="w-5 h-5 text-white" />
            </div>
            {[Search, GitBranch, Blocks].map((Icon, i) => (
              <div
                key={i}
                className="w-full flex items-center justify-center py-1 cursor-not-allowed opacity-40"
              >
                <Icon className="w-5 h-5 text-zinc-400" />
              </div>
            ))}
            <div className="w-full flex items-center justify-center mt-auto mb-2 cursor-not-allowed opacity-40">
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
                    'bg-zinc-800/50 border border-solid border-zinc-700 transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
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
