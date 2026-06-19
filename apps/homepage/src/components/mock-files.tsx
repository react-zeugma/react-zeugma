import React from 'react'
import { FileCode2, FileText } from 'lucide-react'
import { Token, tokenizeJS, tokenizeCSS, tokenizeHTML } from './syntax-code'
import { TreeNode } from 'react-zeugma'

// ─── Code Strings ─────────────────────────────────────────────────────────────

const APP_TSX_CODE = `import React from 'react'
import { useZeugma, Zeugma, PaneTree } from 'react-zeugma'
import WorkspacePane from './components/WorkspacePane'
import { WIDGETS } from './components/Widgets'
import './styles/App.css'

// 1. Initial layout tree structure
const initialLayout = {
  type: 'split',
  direction: 'row',
  splitPercentage: 25,
  first: {
    type: 'pane',
    id: 'sidebar-pane',
    tabs: ['explorer'],
    activeTabId: 'explorer',
  },
  second: {
    type: 'pane',
    id: 'editor-pane',
    tabs: ['App.tsx', 'styles.css'],
    activeTabId: 'App.tsx',
  },
}

export default function App() {
  const zeugma = useZeugma({
    initialLayout,
    dragActivationDistance: 6,
    tabDetachThreshold: 40,
  })

  return (
    <Zeugma
      {...zeugma}
      renderPane={(id) => <WorkspacePane id={id} />}
      renderWidget={(tabId) => WIDGETS[tabId] || <div className="widget-container">Empty</div>}
      classNames={{
        resizer: 'resizer-bar',
        dropPreview: 'pane-drop-preview',
      }}
    >
      <div className="app-container">
        <PaneTree resizerSize={4} />
      </div>
    </Zeugma>
  )
}`

const WIDGETS_TSX_CODE = `import React from 'react'

export const WIDGETS = {
  explorer: (
    <div className="widget-container">
      <h3 className="widget-title">Project Explorer</h3>
      <p className="widget-desc">Drag and split tabs to organize your workspace.</p>
    </div>
  ),
  'App.tsx': (
    <div className="widget-container code">
      <p className="comment">// App.tsx component source code wrapper</p>
      <p>export default function App() &#123; ... &#125;</p>
    </div>
  ),
  'styles.css': (
    <div className="widget-container code">
      <p className="comment">/* Custom workspace styles */</p>
      <p>.resizer-bar &#123; background: #3f3f46; &#125;</p>
    </div>
  ),
}`

const PANE_CONTROL_TSX_CODE = `import React from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'

interface PaneControlProps {
  toggleFullscreen: () => void
  isFullscreen: boolean
  remove: () => void
}

export default function PaneControl({
  toggleFullscreen,
  isFullscreen,
  remove,
}: PaneControlProps) {
  return (
    <div className="pane-controls">
      <button 
        onClick={toggleFullscreen}
        className="pane-control-btn"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
      </button>
      <button 
        onClick={remove}
        className="pane-control-btn close"
        title="Close Pane"
      >
        <X size={12} />
      </button>
    </div>
  )
}`

const PANE_TAB_TSX_CODE = `import React from 'react'
import { X } from 'lucide-react'

interface PaneTabProps {
  tabId: string
  activeTabId: string
  selectTab: (id: string) => void
  removeTab: (id: string) => void
}

export default function PaneTab({
  tabId,
  activeTabId,
  selectTab,
  removeTab,
}: PaneTabProps) {
  const isActive = activeTabId === tabId

  return (
    <div
      onClick={() => selectTab(tabId)}
      className={\`pane-tab \${isActive ? 'active' : ''}\`}
    >
      <span>{tabId}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          removeTab(tabId)
        }}
        className="tab-close-btn"
      >
        <X size={8} />
      </button>
    </div>
  )
}`

const WORKSPACE_PANE_TSX_CODE = `import React from 'react'
import { Pane, DragHandle, Tabs } from 'react-zeugma'
import PaneControl from './PaneControl'
import PaneTab from './PaneTab'

export default function WorkspacePane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {({ tabs, activeTabId, selectTab, removeTab, renderActiveTab, toggleFullscreen, isFullscreen, remove }) => (
        <div className="workspace-pane">
          {/* Header containing tabs, grab area, and actions */}
          <div className="pane-header">
            <Tabs
              tabs={tabs}
              activeTabId={activeTabId}
              selectTab={selectTab}
              removeTab={removeTab}
              renderTab={({ tabId, activeTabId, selectTab, removeTab }) => (
                <PaneTab
                  tabId={tabId}
                  activeTabId={activeTabId}
                  selectTab={selectTab}
                  removeTab={removeTab}
                />
              )}
            />
            {/* Grab handle to move the pane */}
            <DragHandle className="pane-drag-handle" />
            
            {/* Controls for fullscreen and close */}
            <PaneControl
              toggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              remove={remove}
            />
          </div>

          {/* Active Tab contents target */}
          <div className="pane-content">
            {renderActiveTab()}
          </div>
        </div>
      )}
    </Pane>
  )
}`

const APP_CSS_CODE = `/* App Container & Widgets */
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: #09090b;
  padding: 8px;
  box-sizing: border-box;
}

.widget-container {
  padding: 16px;
  color: #d4d4d8;
  font-size: 14px;
}

.widget-container.code {
  color: #d4d4d8;
  font-family: monospace;
  font-size: 12px;
}

.widget-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #a1a1aa;
}

.widget-desc {
  font-size: 12px;
  color: #71717a;
}

.comment {
  color: #52525b;
}

/* Workspace Pane Component styling */
.workspace-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  overflow: hidden;
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #27272a;
  height: 36px;
  border-bottom: 1px solid #09090b;
  user-select: none;
}

.pane-tab {
  padding: 8px 12px;
  font-size: 12px;
  font-family: monospace;
  cursor: pointer;
  border-right: 1px solid #09090b;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.15s ease, color 0.15s ease;
  background-color: #27272a;
  color: #a1a1aa;
}

.pane-tab:hover {
  background-color: #3f3f46;
  color: #e4e4e7;
}

.pane-tab.active {
  background-color: #18181b;
  color: #ffffff;
  font-weight: 600;
}

.tab-close-btn {
  background: none;
  border: none;
  color: #71717a;
  font-weight: bold;
  margin-left: 4px;
  font-size: 10px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.tab-close-btn:hover {
  color: #ef4444;
}

.pane-drag-handle {
  flex: 1;
  height: 100%;
  cursor: grab;
}

.pane-drag-handle:active {
  cursor: grabbing;
}

.pane-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.pane-control-btn {
  background: none;
  border: none;
  color: #a1a1aa;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.pane-control-btn:hover {
  color: #ffffff;
}

.pane-control-btn.close:hover {
  color: #ef4444;
}

.pane-content {
  flex: 1;
  overflow: auto;
  background-color: #18181b;
}

/* Custom classes styled via Zeugma provider config */

/* Custom styled resizer border */
.resizer-bar {
  background: #27272a;
  transition: background 0.15s ease;
}
.resizer-bar:hover {
  background: #6366f1;
}

/* Custom styled edge drop target preview overlay */
.pane-drop-preview {
  background: rgba(99, 102, 241, 0.08);
  border: 2px dashed rgba(99, 102, 241, 0.4);
  border-radius: 6px;
}
`

const PACKAGE_JSON_CODE = `{
  "name": "my-zeugma-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-zeugma": "^5.7.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "~5.7.2",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}`

const TSCONFIG_JSON_CODE = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "skipLibCheck": true
  },
  "include": ["src"]
}`

const INDEX_HTML_CODE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Zeugma App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/App.tsx"></script>
  </body>
</html>`

const VITE_CONFIG_TS_CODE = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`

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
  'src/components/WorkspacePane.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />,
    tokens: tokenizeJS(WORKSPACE_PANE_TSX_CODE),
  },
  'src/components/PaneControl.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />,
    tokens: tokenizeJS(PANE_CONTROL_TSX_CODE),
  },
  'src/components/PaneTab.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />,
    tokens: tokenizeJS(PANE_TAB_TSX_CODE),
  },
  'src/components/Widgets.tsx': {
    language: 'tsx',
    icon: <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />,
    tokens: tokenizeJS(WIDGETS_TSX_CODE),
  },
  'src/styles/App.css': {
    language: 'css',
    icon: <FileText className="w-3.5 h-3.5 text-amber-400" />,
    tokens: tokenizeCSS(APP_CSS_CODE),
  },
  'index.html': {
    language: 'html',
    icon: <FileText className="w-3.5 h-3.5 text-orange-400" />,
    tokens: tokenizeHTML(INDEX_HTML_CODE),
  },
  'package.json': {
    language: 'json',
    icon: <FileText className="w-3.5 h-3.5 text-sky-400" />,
    tokens: tokenizeJS(PACKAGE_JSON_CODE),
  },
  'tsconfig.json': {
    language: 'json',
    icon: <FileText className="w-3.5 h-3.5 text-sky-400" />,
    tokens: tokenizeJS(TSCONFIG_JSON_CODE),
  },
  'vite.config.ts': {
    language: 'typescript',
    icon: <FileCode2 className="w-3.5 h-3.5 text-violet-400" />,
    tokens: tokenizeJS(VITE_CONFIG_TS_CODE),
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
  {
    name: 'node_modules',
    isFolder: true,
    collapsed: true,
    children: [
      { name: 'react', isFolder: true, collapsed: true },
      { name: 'react-dom', isFolder: true, collapsed: true },
      { name: 'react-zeugma', isFolder: true, collapsed: true },
    ],
  },
  { name: 'public', isFolder: true, collapsed: true },
  {
    name: 'src',
    isFolder: true,
    children: [
      {
        name: 'components',
        isFolder: true,
        children: [
          { name: 'WorkspacePane.tsx', fileKey: 'src/components/WorkspacePane.tsx' },
          { name: 'PaneControl.tsx', fileKey: 'src/components/PaneControl.tsx' },
          { name: 'PaneTab.tsx', fileKey: 'src/components/PaneTab.tsx' },
          { name: 'Widgets.tsx', fileKey: 'src/components/Widgets.tsx' },
        ],
      },
      {
        name: 'styles',
        isFolder: true,
        children: [{ name: 'App.css', fileKey: 'src/styles/App.css' }],
      },
      { name: 'App.tsx', fileKey: 'src/App.tsx' },
    ],
  },
  { name: 'index.html', fileKey: 'index.html' },
  { name: 'package.json', fileKey: 'package.json' },
  { name: 'tsconfig.json', fileKey: 'tsconfig.json' },
  { name: 'vite.config.ts', fileKey: 'vite.config.ts' },
  { name: 'README.md', fileKey: 'README.md' },
]

export const defaultOuterLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 75,
  first: {
    type: 'split',
    direction: 'row',
    splitPercentage: 26.6667,
    first: {
      type: 'split',
      direction: 'column',
      splitPercentage: 75,
      first: {
        type: 'pane',
        id: 'pane-explorer',
        tabs: ['explorer'],
        activeTabId: 'explorer',
      },
      second: {
        type: 'pane',
        id: 'pane-performance',
        tabs: ['performance'],
        activeTabId: 'performance',
      },
    },
    second: {
      type: 'split',
      direction: 'column',
      splitPercentage: 75,
      first: {
        type: 'pane',
        id: 'pane-editor',
        tabs: [
          'README.md',
          'src/App.tsx',
          'src/components/WorkspacePane.tsx',
          'src/components/PaneControl.tsx',
          'src/components/PaneTab.tsx',
          'src/components/Widgets.tsx',
          'src/styles/App.css',
        ],
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
    tabs: ['copilot', 'inspector'],
    activeTabId: 'copilot',
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
        tabs: [
          'README.md',
          'src/App.tsx',
          'src/components/WorkspacePane.tsx',
          'src/styles/App.css',
        ],
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
          tabs: ['src/components/WorkspacePane.tsx', 'src/styles/App.css'],
          activeTabId: 'src/components/WorkspacePane.tsx',
        },
        second: {
          type: 'pane',
          id: 'pane-terminal',
          tabs: ['terminal', 'copilot'],
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
            tabs: ['src/App.tsx', 'src/components/WorkspacePane.tsx'],
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
          tabs: ['copilot', 'inspector'],
          activeTabId: 'copilot',
        },
      },
    },
  },
]
