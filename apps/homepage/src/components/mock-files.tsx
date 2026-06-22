import React from 'react'
import { FileCode2, FileText } from 'lucide-react'
import { Token, tokenizeJS } from './syntax-code'
import { TreeNode } from 'react-zeugma'

// ─── Code Strings ─────────────────────────────────────────────────────────────

const APP_TSX_CODE = `import React from 'react'
import { useZeugma, Zeugma, PaneTree, Pane, DragHandle, Tabs, TreeNode } from 'react-zeugma'

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 25,
  first: { type: 'pane', id: 'pane-explorer', tabs: ['explorer'], activeTabId: 'explorer' },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 70,
    first: { type: 'pane', id: 'pane-editor', tabs: ['README.md', 'src/App.tsx'], activeTabId: 'src/App.tsx' },
    second: { type: 'pane', id: 'pane-terminal', tabs: ['terminal'], activeTabId: 'terminal' },
  },
}

function WorkspacePane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {(paneProps) => (
        <div className="pane">
          <div className="pane-header">
            <Tabs
              {...paneProps}
              renderTab={({ tabId }) => (
                <div key={tabId} onClick={() => paneProps.selectTab(tabId)} className="tab">
                  <span>{tabId}</span>
                  <button onClick={(e) => { e.stopPropagation(); paneProps.removeTab(tabId); }}>×</button>
                </div>
              )}
            />
            <DragHandle className="drag-handle" />
          </div>
          <div className="pane-content">{paneProps.renderActiveTab()}</div>
        </div>
      )}
    </Pane>
  )
}

export default function App() {
  const zeugma = useZeugma({ initialLayout })

  const renderWidget = (tabId: string) => {
    if (tabId === 'explorer') return <div>File Tree</div>
    if (tabId === 'terminal') return <div>Terminal Output</div>
    if (tabId === 'README.md') return <div>Hello react-zeugma!</div>
    if (tabId === 'src/App.tsx') return <div>Source Editor</div>
    return null
  }

  return (
    <Zeugma
      {...zeugma}
      renderPane={(id) => <WorkspacePane id={id} />}
      renderWidget={renderWidget}
      classNames={{
        resizer: 'resizer',
        dropPreview: 'drop-preview',
        tabDropPreview: 'tab-preview',
      }}
    >
      <div className="workspace">
        <PaneTree />
      </div>
    </Zeugma>
  )
}`

// ─── File Registry ────────────────────────────────────────────────────────────

interface FileEntry {
  language: string
  icon: React.ReactElement
  tokens: Token[] | null
}

export const FILES: Record<string, FileEntry> = {
  'src/App.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />,
    tokens: tokenizeJS(APP_TSX_CODE),
  },
  'README.md': {
    language: 'markdown',
    icon: <FileText className="w-3.5 h-3.5 text-zinc-400" />,
    tokens: null,
  },
}

// ─── File tree structure for explorer ─────────────────────────────────────────

export interface TreeEntry {
  name: string
  fileKey?: string
  isFolder?: boolean
  collapsed?: boolean
  children?: TreeEntry[]
}

export const FILE_TREE: TreeEntry[] = [
  { name: 'src/App.tsx', fileKey: 'src/App.tsx' },
  { name: 'README.md', fileKey: 'README.md' },
]

export const defaultOuterLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 75,
  first: {
    type: 'split',
    direction: 'row',
    splitPercentage: 25,
    first: {
      type: 'pane',
      id: 'pane-explorer',
      tabs: ['explorer'],
      activeTabId: 'explorer',
    },
    second: {
      type: 'split',
      direction: 'column',
      splitPercentage: 75,
      first: {
        type: 'pane',
        id: 'pane-editor',
        tabs: ['README.md', 'src/App.tsx'],
        activeTabId: 'README.md',
      },
      second: {
        type: 'pane',
        id: 'pane-terminal',
        tabs: ['terminal'],
        activeTabId: 'terminal',
      },
    },
  },
  second: {
    type: 'pane',
    id: 'pane-inspector',
    tabs: ['inspector'],
    activeTabId: 'inspector',
  },
}

// ─── Layout Presets ───────────────────────────────────────────────────────────

export interface LayoutPreset {
  key: string
  label: string
  layout: TreeNode
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    key: 'default',
    label: 'Default IDE',
    layout: defaultOuterLayout,
  },
  {
    key: 'focused',
    label: 'Focused Editor',
    layout: {
      type: 'split',
      direction: 'column',
      splitPercentage: 75,
      first: {
        type: 'pane',
        id: 'pane-editor',
        tabs: ['README.md', 'src/App.tsx'],
        activeTabId: 'src/App.tsx',
      },
      second: {
        type: 'pane',
        id: 'pane-terminal',
        tabs: ['terminal'],
        activeTabId: 'terminal',
      },
    },
  },
  {
    key: 'side-by-side',
    label: 'Side-by-Side',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-editor-left',
        tabs: ['src/App.tsx', 'README.md'],
        activeTabId: 'src/App.tsx',
      },
      second: {
        type: 'split',
        direction: 'column',
        splitPercentage: 70,
        first: {
          type: 'pane',
          id: 'pane-editor-right',
          tabs: ['src/App.tsx'],
          activeTabId: 'src/App.tsx',
        },
        second: {
          type: 'pane',
          id: 'pane-terminal',
          tabs: ['terminal'],
          activeTabId: 'terminal',
        },
      },
    },
  },
  {
    key: 'minimal',
    label: 'Minimal',
    layout: {
      type: 'pane',
      id: 'pane-editor',
      tabs: ['src/App.tsx'],
      activeTabId: 'src/App.tsx',
    },
  },
  {
    key: 'three-column',
    label: 'Three Column',
    layout: {
      type: 'split',
      direction: 'row',
      splitPercentage: 25,
      first: {
        type: 'pane',
        id: 'pane-explorer',
        tabs: ['explorer'],
        activeTabId: 'explorer',
      },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 60,
        first: {
          type: 'split',
          direction: 'column',
          splitPercentage: 70,
          first: {
            type: 'pane',
            id: 'pane-editor',
            tabs: ['src/App.tsx'],
            activeTabId: 'src/App.tsx',
          },
          second: {
            type: 'pane',
            id: 'pane-terminal',
            tabs: ['terminal'],
            activeTabId: 'terminal',
          },
        },
        second: {
          type: 'pane',
          id: 'pane-inspector',
          tabs: ['inspector'],
          activeTabId: 'inspector',
        },
      },
    },
  },
]
