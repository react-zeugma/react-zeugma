import React from 'react'
import { FileCode2, FileText } from 'lucide-react'
import { Token, tokenizeJS, tokenizeCSS, tokenizeHTML } from './syntax-code'
import { TreeNode } from 'react-zeugma'

// ─── Code Strings ─────────────────────────────────────────────────────────────

const APP_TSX_CODE = `import React from 'react'
import { useZeugma, Zeugma, PaneTree } from 'react-zeugma'
import WorkspacePane from './components/WorkspacePane'
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

// 2. Map widgets/tabs content to render
const WIDGETS = {
  explorer: (
    <div className="p-4 text-zinc-400 text-sm">
      <h3 className="font-bold mb-2">Project Explorer</h3>
      <p className="text-xs">Drag and split tabs to organize your workspace.</p>
    </div>
  ),
  'App.tsx': (
    <div className="p-4 text-zinc-300 font-mono text-xs">
      <p className="text-zinc-500">// App.tsx component source code wrapper</p>
      <p>export default function App() &#123; ... &#125;</p>
    </div>
  ),
  'styles.css': (
    <div className="p-4 text-zinc-300 font-mono text-xs">
      <p className="text-zinc-500">/* Custom workspace styles */</p>
      <p>.resizer-bar &#123; background: #3f3f46; &#125;</p>
    </div>
  ),
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
      renderWidget={(tabId) => WIDGETS[tabId] || <div className="p-4 text-zinc-500">Empty</div>}
      classNames={{
        resizer: 'resizer-bar',
        dropPreview: 'pane-drop-preview',
      }}
    >
      <div className="w-screen h-screen bg-zinc-950 p-2">
        <PaneTree resizerSize={4} />
      </div>
    </Zeugma>
  )
}`

const WORKSPACE_PANE_TSX_CODE = `import React from 'react'
import { Pane, DragHandle, Tabs } from 'react-zeugma'

export default function WorkspacePane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {({ tabs, activeTabId, selectTab, removeTab, renderActiveTab, toggleFullscreen, isFullscreen, remove }) => (
        <div className="flex flex-col h-full bg-zinc-900 border border-zinc-850 rounded-lg overflow-hidden">
          {/* Header containing tabs, grab area, and actions */}
          <div className="flex items-center justify-between bg-zinc-800 h-9 border-b border-zinc-950 select-none">
            <Tabs
              tabs={tabs}
              activeTabId={activeTabId}
              selectTab={selectTab}
              removeTab={removeTab}
              renderTab={({ tabId, activeTabId, selectTab, removeTab }) => (
                <div
                  onClick={() => selectTab(tabId)}
                  className={\`px-3 py-2 text-xs font-mono cursor-pointer border-r border-zinc-950 flex items-center gap-2 transition-colors \${
                    activeTabId === tabId ? 'bg-zinc-900 text-white font-semibold' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750'
                  }\`}
                >
                  <span>{tabId}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTab(tabId)
                    }}
                    className="text-zinc-500 hover:text-red-400 font-bold ml-1 transition-colors text-[10px]"
                  >
                    ×
                  </button>
                </div>
              )}
            />
            {/* Grab handle to move the pane */}
            <DragHandle className="flex-1 h-full cursor-grab active:cursor-grabbing" />
            
            {/* Controls for fullscreen and close */}
            <div className="flex items-center gap-2 px-3">
              <button 
                onClick={toggleFullscreen}
                className="text-zinc-400 hover:text-white text-xs transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                &#9974;
              </button>
              <button 
                onClick={remove}
                className="text-zinc-400 hover:text-red-400 text-xs transition-colors"
                title="Close Pane"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Active Tab contents target */}
          <div className="flex-1 overflow-auto bg-zinc-900">
            {renderActiveTab()}
          </div>
        </div>
      )}
    </Pane>
  )
}`

const APP_CSS_CODE = `/* Custom classes styled via Zeugma provider config */

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
}`

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
    "react-zeugma": "^5.7.0"
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
        children: [{ name: 'WorkspacePane.tsx', fileKey: 'src/components/WorkspacePane.tsx' }],
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
    tabs: ['inspector'],
    activeTabId: 'inspector',
  },
}
