'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Copy,
  Check,
  Info,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Menu,
  X,
  Download,
} from 'lucide-react'
import { Footer } from '../components/footer'

interface DocSection {
  id: string
  title: string
}

const DOC_SECTIONS: DocSection[] = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'installation', title: 'Installation' },
  { id: 'quick-start', title: 'Quick Start' },
  { id: 'api-reference', title: 'API Reference' },
  { id: 'tree-utilities', title: 'Tree Utilities' },
  { id: 'custom-styling', title: 'Custom Styling' },
  { id: 'typescript-types', title: 'Types Reference' },
  { id: 'skill-md', title: 'SKILL.md' },
  { id: 'zeugma-mosaics', title: 'The Story of Zeugma' },
]

const SKILL_MD_CONTENT = `---
name: use-react-zeugma
description: Integrate, configure, style, and programmatically manipulate dashboard layouts using the react-zeugma package.
---

# Skill: Using react-zeugma

\`react-zeugma\` is a recursive drag-and-drop dashboard layout engine for React. It combines tree-based pane splitting (similar to \`react-mosaic\`) with a declarative, state-driven API (similar to \`react-grid-layout\`), built using \`@dnd-kit/core\`.

---

## 1. Data Model (Tree Nodes)

The entire dashboard layout is represented as a serializable recursive tree structure.

### Types & Interface

\`\`\`ts
export type SplitDirection = 'row' | 'column';

export interface SplitNode {
  type: 'split';
  direction: SplitDirection;
  first: TreeNode;
  second: TreeNode;
  splitPercentage: number; // 0 to 100
}

export interface PaneNode {
  type: 'pane';
  paneId: string;
}

export type TreeNode = SplitNode | PaneNode;
\`\`\`

- **\`PaneNode\` (Leaf):** Represents a single content pane. It must have a unique \`paneId\`.
- **\`SplitNode\` (Branch):** Splits its area horizontally (\`column\`) or vertically (\`row\`) into two child \`TreeNode\` nodes (\`first\` and \`second\`), based on \`splitPercentage\`.

---

## 2. Core Components

### \`<DashboardProvider>\`

The root context provider. It handles the drag-and-drop event loop and coordinates the layout state.

#### Props

- \`layout: TreeNode | null\` — The current dashboard layout tree.
- \`onChange: (newLayout: TreeNode | null) => void\` — Callback triggered when the layout tree changes (resizing, dragging to split, dragging to swap).
- \`renderPane: (paneId: string) => ReactNode\` — Callback to render the contents of a pane given its ID.
- \`renderDragOverlay?: (activeId: string) => ReactNode\` — (Optional) Renders a custom cursor-following drag preview.
- \`classNames?: ZeugmaClassNames\` — (Optional) CSS class overrides for styling various layout elements.
- \`fullscreenPaneId?: string | null\` — (Optional) ID of the pane currently in fullscreen mode.
- \`onFullscreenChange?: (paneId: string | null) => void\` — (Optional) Callback triggered when a pane enters/leaves fullscreen.
- \`onRemove?: (paneId: string) => void\` — (Optional) Callback triggered when a pane is closed/removed.
- \`dragActivationDistance?: number\` — (Optional) Minimum pointer drag distance (in pixels) required to activate dragging. Defaults to \`8\`.
- \`onDragStart?: (activeId: string) => void\` — (Optional) Callback triggered when dragging starts on a pane.
- \`onDragEnd?: (activeId: string, overId: string | null, dropAction: any) => void\` — (Optional) Callback triggered when dragging ends.
- \`onResizeStart?: (currentNode: SplitNode) => void\` — (Optional) Callback triggered when resizing starts.
- \`onResize?: (currentNode: SplitNode, percentage: number) => void\` — (Optional) Callback triggered during resizing.
- \`onResizeEnd?: (currentNode: SplitNode, percentage: number) => void\` — (Optional) Callback triggered when resizing ends.
- \`renderResizer?: (props: ResizerRenderProps) => ReactNode\` — (Optional) Custom resizer bar component renderer.
- \`minSplitPercentage?: number\` — (Optional) Minimum resizing limit percentage (defaults to \`5\`).
- \`maxSplitPercentage?: number\` — (Optional) Maximum resizing limit percentage (defaults to \`95\`).

### \`<PaneTree>\`

Recursively renders the split nodes and pane nodes. Must be placed inside \`<DashboardProvider>\`.

#### Props

- \`tree?: TreeNode | null\` — (Optional) Custom subtree to render. Defaults to the provider's root \`layout\`.
- \`resizerSize?: number\` — (Optional) Thickness of the split resizer bars in pixels. Defaults to \`4\`.

### \`<Pane>\`

Wraps the contents of an individual pane. It sets up draggable and droppable zones.

#### Props

- \`id: string\` — The unique ID corresponding to a \`PaneNode\`'s \`paneId\`.
- \`children: (props: PaneRenderProps) => ReactNode\` — Render prop function.

#### \`PaneRenderProps\`

\`\`\`ts
interface PaneRenderProps {
  isDragging: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  remove: () => void;
}
\`\`\`

### \`<DragHandle>\`

Defines the interactive drag region inside a \`<Pane>\`. **Must be placed inside a \`<Pane>\` component.**

#### Props

- \`children: React.ReactNode\` — Element(s) that function as the drag handle (e.g., pane header).
- \`className?: string\`
- \`style?: React.CSSProperties\`

---

## 3. Programmatic State Utilities

Import these helpers from \`react-zeugma\` to manipulate the tree layout programmatically in your state handlers:

- **\`removePane(tree: TreeNode | null, idToRemove: string): TreeNode | null\`**
  Removes a pane from the tree and collapses the leftover sibling split node.
- **\`splitPane(tree: TreeNode | null, targetId: string, direction: SplitDirection, splitType: 'left' | 'right' | 'top' | 'bottom', paneToAdd: string): TreeNode | null\`**
  Splits a specific target pane by nesting it under a new \`SplitNode\` along with a new pane.
- **\`swapPanes(tree: TreeNode | null, idA: string, idB: string): TreeNode | null\`**
  Swaps the positions of two panes in the tree.

Alternatively, you can consume the convenient mutation helpers directly from the **\`useDashboard()\`** context hook inside pane components without importing utilities:

- **\`removePane(paneId: string) => void\`**
- **\`addPane(paneId: string) => void\`**
- **\`swapPanes(paneIdA: string, paneIdB: string) => void\`**
- **\`splitPane(targetId: string, direction: SplitDirection, splitType: string, paneToAdd: string) => void\`**
- **\`updateSplitPercentage(currentNode: SplitNode, percentage: number) => void\`**

---

## 4. Basic Integration Recipe

\`\`\`tsx
import { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma';

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: { type: 'pane', paneId: 'sidebar' },
  second: { type: 'pane', paneId: 'main' },
};

function CustomPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {({ isDragging, isFullscreen, toggleFullscreen, remove }) => (
        <div style={{ height: '100%', border: '1px solid #ccc', opacity: isDragging ? 0.5 : 1 }}>
          <div style={{ display: 'flex', background: '#eee', padding: 8 }}>
            <DragHandle style={{ flex: 1 }}>
              <strong>Header: {id}</strong>
            </DragHandle>
            <button onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <button onClick={remove}>Close</button>
          </div>
          <div style={{ padding: 16 }}>Content for {id}</div>
        </div>
      )}
    </Pane>
  );
}

export default function App() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const handleRemove = (paneId: string) => {
    // Remove the pane and update layout
    setLayout((prev) => removePane(prev, paneId));
  };

  return (
    <DashboardProvider
      layout={layout}
      onChange={setLayout}
      renderPane={(id) => <CustomPane id={id} />}
      fullscreenPaneId={fullscreenId}
      onFullscreenChange={setFullscreenId}
      onRemove={handleRemove}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <PaneTree />
      </div>
    </DashboardProvider>
  );
}
\`\`\`

---

## 5. Styling Customization

\`react-zeugma\` is style-agnostic and relies on class name configuration for visual states. Define classes in your styling framework and pass them via the \`classNames\` prop on \`<DashboardProvider>\`:

\`\`\`ts
interface ZeugmaClassNames {
  pane?: string; // Applied to the outer wrapper of <Pane>
  dropPreview?: string; // Applied to the preview box when hovering over edge dropzones
  swapPreview?: string; // Applied to the preview box when hovering over center dropzone
  dragOverlay?: string; // Applied to the cursor-following drag preview portal
  resizer?: string; // Applied to the drag-to-resize split bar
}
\`\`\`

### CSS Example:

\`\`\`css
/* Custom resizer style */
.my-resizer {
  background-color: #e2e8f0;
  transition: background-color 0.2s;
}
.my-resizer:hover {
  background-color: #3b82f6;
}

/* Edge drop previews */
.my-drop-preview {
  background-color: rgba(59, 130, 246, 0.2);
  border: 2px dashed #3b82f6;
}

/* Center swap preview */
.my-swap-preview {
  background-color: rgba(16, 185, 129, 0.25);
  border: 2px solid #10b981;
}
\`\`\`
`

function DocCodeBlock({ code, language = 'tsx' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border-primary bg-bg-pane-inner my-4 font-mono text-[13px] transition-colors duration-200">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary bg-bg-sidebar text-text-secondary text-xs select-none transition-colors duration-200">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-text-primary select-all whitespace-pre leading-relaxed">
        {code}
      </pre>
    </div>
  )
}

function Callout({
  type,
  title,
  children,
}: {
  type: 'note' | 'tip' | 'warning'
  title: string
  children: React.ReactNode
}) {
  const styles = {
    note: 'bg-indigo-500/5 border-indigo-500/20 text-text-secondary',
    tip: 'bg-emerald-500/5 border-emerald-500/20 text-text-secondary',
    warning: 'bg-rose-500/5 border-rose-500/20 text-text-secondary',
  }

  const icons = {
    note: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
    tip: <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
  }

  return (
    <div
      className={`flex gap-3 border rounded-xl p-4 my-6 text-sm leading-relaxed transition-colors duration-200 ${styles[type]}`}
    >
      {icons[type]}
      <div>
        <h5 className="font-bold text-text-primary mb-1">{title}</h5>
        {children}
      </div>
    </div>
  )
}

export function Docs() {
  const [activeSection, setActiveSection] = useState('introduction')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100

      // Bulletproof check for scroll position near the bottom of the page
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100
      if (isAtBottom && DOC_SECTIONS.length > 0) {
        setActiveSection(DOC_SECTIONS[DOC_SECTIONS.length - 1].id)
        return
      }

      for (const section of DOC_SECTIONS) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        const id = hash.replace('#', '')
        const el = document.getElementById(id)
        if (el) {
          // Add small delay to ensure rendering and DOM structure are loaded
          setTimeout(() => {
            window.scrollTo({
              top: el.offsetTop - 80,
              behavior: 'smooth',
            })
            setActiveSection(id)
          }, 100)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('hashchange', handleHashChange)

    // Check initial hash route on mount
    handleHashChange()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      // Temporarily remove id to prevent browser jumping, then restore
      el.removeAttribute('id')
      window.location.hash = id
      el.setAttribute('id', id)

      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: 'smooth',
      })
      setActiveSection(id)
      setMobileMenuOpen(false)
    }
  }

  const handleDownloadSkill = () => {
    const element = document.createElement('a')
    const file = new Blob([SKILL_MD_CONTENT], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = 'SKILL.md'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      {/* Mobile Menu Button */}
      <div className="lg:hidden sticky top-14 z-40 bg-bg-sidebar/95 backdrop-blur-sm border-b border-border-primary px-6 py-3 flex items-center justify-between text-sm select-none transition-colors duration-200">
        <span className="text-text-secondary font-semibold flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Documentation
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-bg-pane border border-border-primary text-text-secondary hover:text-text-primary cursor-pointer transition-all duration-200"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Index</span>
        </button>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row relative items-start px-6 lg:px-8 py-8 gap-8">
        {/* Navigation Sidebar Index */}
        <aside
          className={`lg:sticky lg:top-20 z-30 lg:block shrink-0 w-64 ${
            mobileMenuOpen
              ? 'fixed inset-x-0 top-28 bottom-0 bg-bg-app px-6 border-b border-border-primary overflow-y-auto z-40'
              : 'hidden'
          }`}
        >
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-primary select-none transition-colors duration-200">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Docs Index
            </span>
          </div>

          <nav className="flex flex-col gap-1 text-sm font-medium">
            {DOC_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-sidebar'
                }`}
              >
                <span>{section.title}</span>
                {activeSection === section.id && (
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Documentation Content */}
        <main className="flex-1 min-w-0 prose prose-zinc max-w-none pb-[35vh] space-y-16">
          {/* Introduction Section */}
          <section id="introduction" className="scroll-mt-24 space-y-4">
            <h1 className="group flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-2">
              <span>react-zeugma</span>
              <a
                href="#introduction"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('introduction')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h1>
            <p className="text-text-secondary text-base leading-relaxed">
              <strong>react-zeugma</strong> is a recursive drag-and-drop dashboard layout engine for
              React. It combines the tree-based, arbitrary splitting of <em>react-mosaic</em> with
              the declarative, state-driven API of <em>react-grid-layout</em>.
            </p>

            <Callout type="tip" title="Headless Design System">
              react-zeugma is entirely style-agnostic and relies on your class name configurations
              for styling visual states. You bring your own CSS/Tailwind rules, and we handle the
              complex drag-and-drop mechanics, resize handle math, and layout tree calculations.
            </Callout>

            <h3 className="text-lg font-bold text-text-primary mt-6 mb-2">Core Features</h3>
            <ul className="list-disc list-inside text-text-secondary space-y-1.5 text-sm leading-relaxed">
              <li>
                <strong>Recursive Split Trees</strong>: Nest rows and columns to any depth using a
                simple serialized JSON node structure.
              </li>
              <li>
                <strong>5-Zone Docking previews</strong>: Drag panels on the top, bottom, left, or
                right edges of another pane to split it, or onto the center to swap their positions.
              </li>
              <li>
                <strong>Native Flexbox Resizers</strong>: Fluid, non-blocking split handles built on
                pointer events.
              </li>
              <li>
                <strong>Accessible Drag-and-Drop</strong>: Built on top of the performant and
                accessible{' '}
                <a
                  href="https://dndkit.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  @dnd-kit
                </a>{' '}
                toolkit.
              </li>
              <li>
                <strong>Fullscreen Zoom Toggle</strong>: Programmatically expand any pane to cover
                the entire viewport and snap it back instantly.
              </li>
            </ul>
          </section>

          {/* Installation Section */}
          <section id="installation" className="scroll-mt-24 space-y-4">
            <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary border-b border-border-primary pb-2 transition-colors duration-200">
              <span>Installation</span>
              <a
                href="#installation"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('installation')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Install the package into your React project using your preferred package manager.
            </p>
            <DocCodeBlock code="npm install react-zeugma" language="bash" />

            <Callout type="note" title="Peer Dependencies">
              react-zeugma is compatible with both <strong>React 18</strong> and{' '}
              <strong>React 19</strong> (along with matching <code>react-dom</code>).
            </Callout>
          </section>

          {/* Quick Start Section */}
          <section id="quick-start" className="scroll-mt-24 space-y-4">
            <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary border-b border-border-primary pb-2 transition-colors duration-200">
              <span>Quick Start</span>
              <a
                href="#quick-start"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('quick-start')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Import the core components and configure the layout state inside your React
              application.
            </p>
            <DocCodeBlock
              code={`import { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma';

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 20,
  first: { type: 'pane', paneId: 'explorer' },
  second: {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'editor' },
    second: { type: 'pane', paneId: 'preview' },
  },
};

function MyPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {({ isDragging, remove }) => (
        <div className={\`h-full flex flex-col bg-[#18181b] \${isDragging ? 'opacity-30' : ''}\`}>
          <DragHandle>
            <div className="px-3 py-2 bg-[#27272a] border-b border-[#3f3f46] flex items-center justify-between cursor-grab">
              <span className="text-xs uppercase text-zinc-300 font-bold">{id}</span>
              <button onClick={remove} className="text-zinc-500 hover:text-rose-400 text-xs">×</button>
            </div>
          </DragHandle>
          <div className="flex-1 p-4 text-sm text-zinc-400">Content for {id}</div>
        </div>
      )}
    </Pane>
  );
}

export default function Dashboard() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout);

  return (
    <DashboardProvider 
      layout={layout} 
      onChange={setLayout} 
      renderPane={(id) => <MyPane id={id} />}
    >
      <div className="w-screen h-screen">
        <PaneTree />
      </div>
    </DashboardProvider>
  );
}`}
              language="tsx"
            />
          </section>

          {/* API Reference Section */}
          <section id="api-reference" className="scroll-mt-24 space-y-6">
            <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary border-b border-border-primary pb-2 transition-colors duration-200">
              <span>API Reference</span>
              <a
                href="#api-reference"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('api-reference')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>

            {/* DashboardProvider */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-text-primary">
                <code>&lt;DashboardProvider&gt;</code>
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                The context provider that sets up the drag-and-drop state machine, monitors active
                drags, and registers layout change notifications.
              </p>

              <div className="overflow-x-auto border border-border-primary rounded-lg transition-colors duration-200">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-primary bg-bg-sidebar text-text-secondary uppercase tracking-wider transition-colors duration-200">
                      <th className="px-4 py-2 font-semibold">Prop</th>
                      <th className="px-4 py-2 font-semibold">Type</th>
                      <th className="px-4 py-2 font-semibold">Required</th>
                      <th className="px-4 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary/60 text-text-primary">
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        layout
                      </td>
                      <td className="px-4 py-3 font-mono">TreeNode | null</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        Yes
                      </td>
                      <td className="px-4 py-3">The serializable tree layout schema.</td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onChange
                      </td>
                      <td className="px-4 py-3 font-mono">(layout: TreeNode | null) =&gt; void</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        Yes
                      </td>
                      <td className="px-4 py-3">
                        Fires when resizes, splits, swaps, or removes modify the tree.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        renderPane
                      </td>
                      <td className="px-4 py-3 font-mono">(paneId: string) =&gt; ReactNode</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        Yes
                      </td>
                      <td className="px-4 py-3">
                        Renderer function lookup that returns a <code>&lt;Pane&gt;</code> structure.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        classNames
                      </td>
                      <td className="px-4 py-3 font-mono">ZeugmaClassNames</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Custom classes for overriding pane, resizer, and drop preview overlays.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        fullscreenPaneId
                      </td>
                      <td className="px-4 py-3 font-mono">string | null</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Active ID of the pane taking full viewport coverage.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        renderDragOverlay
                      </td>
                      <td className="px-4 py-3 font-mono">(activeId: string) =&gt; ReactNode</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Renders a custom cursor-following drag preview overlay.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onFullscreenChange
                      </td>
                      <td className="px-4 py-3 font-mono">(paneId: string | null) =&gt; void</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Callback triggered when a pane enters or leaves fullscreen.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onRemove
                      </td>
                      <td className="px-4 py-3 font-mono">(paneId: string) =&gt; void</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Callback triggered when a pane is closed/removed from the layout tree.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        dragActivationDistance
                      </td>
                      <td className="px-4 py-3 font-mono">number</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Minimum pointer drag distance (in pixels) required to activate dragging.
                        Defaults to <code>8</code>.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onDragStart
                      </td>
                      <td className="px-4 py-3 font-mono">(activeId: string) =&gt; void</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Callback triggered when dragging starts on a pane.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onDragEnd
                      </td>
                      <td className="px-4 py-3 font-mono">
                        (activeId: string, overId: string | null, dropAction: any) =&gt; void
                      </td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Callback triggered when dragging ends, providing swap or split details.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onResizeStart
                      </td>
                      <td className="px-4 py-3 font-mono">(currentNode: SplitNode) =&gt; void</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Callback triggered when resizing starts on a split node.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onResize
                      </td>
                      <td className="px-4 py-3 font-mono">
                        (currentNode: SplitNode, percentage: number) =&gt; void
                      </td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Callback triggered continuously while resizing a split node.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        onResizeEnd
                      </td>
                      <td className="px-4 py-3 font-mono">
                        (currentNode: SplitNode, percentage: number) =&gt; void
                      </td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Callback triggered when resizing ends on a split node.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        renderResizer
                      </td>
                      <td className="px-4 py-3 font-mono">
                        (props: ResizerRenderProps) =&gt; ReactNode
                      </td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Custom renderer function for rendering custom-styled resizer bars.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        minSplitPercentage
                      </td>
                      <td className="px-4 py-3 font-mono">number</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Minimum resizing limit percentage. Defaults to <code>5</code>.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        maxSplitPercentage
                      </td>
                      <td className="px-4 py-3 font-mono">number</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Maximum resizing limit percentage. Defaults to <code>95</code>.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* PaneTree */}
            <div className="space-y-3 pt-4">
              <h3 className="text-base font-bold text-text-primary">
                <code>&lt;PaneTree&gt;</code>
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Recursively renders the split nodes and pane nodes. Must be placed inside{' '}
                <code>&lt;DashboardProvider&gt;</code>.
              </p>

              <div className="overflow-x-auto border border-border-primary rounded-lg transition-colors duration-200">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-primary bg-bg-sidebar text-text-secondary uppercase tracking-wider transition-colors duration-200">
                      <th className="px-4 py-2 font-semibold">Prop</th>
                      <th className="px-4 py-2 font-semibold">Type</th>
                      <th className="px-4 py-2 font-semibold">Required</th>
                      <th className="px-4 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary/60 text-text-primary">
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        tree
                      </td>
                      <td className="px-4 py-3 font-mono">TreeNode | null</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Custom subtree to render. Defaults to the provider's root{' '}
                        <code>layout</code>.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        resizerSize
                      </td>
                      <td className="px-4 py-3 font-mono">number</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">
                        Thickness of the split resizer bars in pixels. Defaults to <code>4</code>.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pane */}
            <div className="space-y-3 pt-4">
              <h3 className="text-base font-bold text-text-primary">
                <code>&lt;Pane id&gt;</code>
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Wraps the individual pane components inside the renderer. Utilizes a render prop
                passing active layout attributes.
              </p>

              <div className="overflow-x-auto border border-border-primary rounded-lg transition-colors duration-200">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-primary bg-bg-sidebar text-text-secondary uppercase tracking-wider transition-colors duration-200">
                      <th className="px-4 py-2 font-semibold">Prop</th>
                      <th className="px-4 py-2 font-semibold">Type</th>
                      <th className="px-4 py-2 font-semibold">Required</th>
                      <th className="px-4 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary/60 text-text-primary">
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        id
                      </td>
                      <td className="px-4 py-3 font-mono">string</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        Yes
                      </td>
                      <td className="px-4 py-3">
                        The unique ID corresponding to a <code>PaneNode</code>'s <code>paneId</code>
                        .
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        children
                      </td>
                      <td className="px-4 py-3 font-mono">
                        (props: PaneRenderProps) =&gt; ReactNode
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        Yes
                      </td>
                      <td className="px-4 py-3">Render prop function.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-xs uppercase font-bold tracking-wider text-text-secondary pt-2">
                Render Props: <code>PaneRenderProps</code>
              </h4>
              <div className="overflow-x-auto border border-border-primary rounded-lg transition-colors duration-200">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-primary bg-bg-sidebar text-text-secondary uppercase tracking-wider transition-colors duration-200">
                      <th className="px-4 py-2 font-semibold">Parameter</th>
                      <th className="px-4 py-2 font-semibold">Type</th>
                      <th className="px-4 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary/60 text-text-primary">
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        isDragging
                      </td>
                      <td className="px-4 py-3 font-mono">boolean</td>
                      <td className="px-4 py-3">
                        Returns <code>true</code> if the node wrapper is actively being dragged.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        isFullscreen
                      </td>
                      <td className="px-4 py-3 font-mono">boolean</td>
                      <td className="px-4 py-3">
                        Returns <code>true</code> if the pane is zoomed/fullscreen.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        toggleFullscreen
                      </td>
                      <td className="px-4 py-3 font-mono">() =&gt; void</td>
                      <td className="px-4 py-3">
                        Callback to toggle fullscreen viewport coverage.
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        remove
                      </td>
                      <td className="px-4 py-3 font-mono">() =&gt; void</td>
                      <td className="px-4 py-3">
                        Triggers removal of this pane from the layout tree.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* DragHandle */}
            <div className="space-y-3 pt-4">
              <h3 className="text-base font-bold text-text-primary">
                <code>&lt;DragHandle&gt;</code>
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Defines the interactive drag region inside a <code>&lt;Pane&gt;</code>.{' '}
                <strong>
                  Must be placed inside a <code>&lt;Pane&gt;</code> component.
                </strong>
              </p>

              <div className="overflow-x-auto border border-border-primary rounded-lg transition-colors duration-200">
                <table className="min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-primary bg-bg-sidebar text-text-secondary uppercase tracking-wider transition-colors duration-200">
                      <th className="px-4 py-2 font-semibold">Prop</th>
                      <th className="px-4 py-2 font-semibold">Type</th>
                      <th className="px-4 py-2 font-semibold">Required</th>
                      <th className="px-4 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary/60 text-text-primary">
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        children
                      </td>
                      <td className="px-4 py-3 font-mono">ReactNode</td>
                      <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        Yes
                      </td>
                      <td className="px-4 py-3">
                        Element(s) that function as the drag handle (e.g., pane header).
                      </td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        className
                      </td>
                      <td className="px-4 py-3 font-mono">string</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">Custom CSS class for the drag handle wrapper.</td>
                    </tr>
                    <tr className="bg-bg-pane/30 transition-colors duration-200">
                      <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400">
                        style
                      </td>
                      <td className="px-4 py-3 font-mono">React.CSSProperties</td>
                      <td className="px-4 py-3 text-text-secondary">No</td>
                      <td className="px-4 py-3">Inline styles for the drag handle wrapper.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Tree Utilities Section */}
          <section id="tree-utilities" className="scroll-mt-24 space-y-4">
            <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary border-b border-border-primary pb-2 transition-colors duration-200">
              <span>Tree Utilities</span>
              <a
                href="#tree-utilities"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('tree-utilities')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              react-zeugma exposes serializable tree utility functions for programmatically mutating
              layout schemas.
            </p>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <h4 className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                  removePane(tree: TreeNode | null, id: string): TreeNode | null
                </h4>
                <p className="text-text-secondary text-xs pl-4 leading-relaxed">
                  Recursively scans the layout tree, removes the targeted pane node, and collapses
                  redundant split boundaries.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                  addPane(tree: TreeNode | null, paneToAdd: string): TreeNode
                </h4>
                <p className="text-text-secondary text-xs pl-4 leading-relaxed">
                  Recursively matches the bottommost/rightmost pane leaf in the tree, splits it, and
                  inserts the target <code>paneToAdd</code>.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                  swapPanes(tree: TreeNode | null, idA: string, idB: string): TreeNode | null
                </h4>
                <p className="text-text-secondary text-xs pl-4 leading-relaxed">
                  Swaps the positions of <code>idA</code> and <code>idB</code> nodes directly inside
                  the tree structure.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                  splitPane(tree, targetId, direction, splitType, paneToAdd)
                </h4>
                <p className="text-text-secondary text-xs pl-4 leading-relaxed">
                  Splits the targeted <code>targetId</code> pane inside the tree with{' '}
                  <code>direction</code> (<em>row</em> / <em>column</em>) and type (<em>left</em>,{' '}
                  <em>right</em>, <em>top</em>, <em>bottom</em>) to insert <code>paneToAdd</code>.
                </p>
              </div>
            </div>
          </section>

          {/* Custom Styling Section */}
          <section id="custom-styling" className="scroll-mt-24 space-y-4">
            <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary border-b border-border-primary pb-2 transition-colors duration-200">
              <span>Custom Styling</span>
              <a
                href="#custom-styling"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('custom-styling')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Use custom CSS or styling rules to style resizers, dragging states, drop previews, or
              active nodes by overriding <code>classNames</code> in the provider.
            </p>
            <DocCodeBlock
              code={`<DashboardProvider
  layout={layout}
  onChange={setLayout}
  renderPane={renderPane}
  classNames={{
    // resizer handles
    resizer: 'bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors duration-150',
    // split previews
    dropPreview: 'bg-indigo-500/10 border-2 border-dashed border-indigo-500/50 backdrop-blur-xs',
    // swap previews
    swapPreview: 'bg-amber-500/10 border-2 border-dashed border-amber-500/50 backdrop-blur-xs',
  }}
>
  <PaneTree />
</DashboardProvider>`}
              language="tsx"
            />
          </section>

          {/* Types Reference Section */}
          <section id="typescript-types" className="scroll-mt-24 space-y-4">
            <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary border-b border-border-primary pb-2 transition-colors duration-200">
              <span>Types Reference</span>
              <a
                href="#typescript-types"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('typescript-types')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Full TypeScript type definitions utilized in the dashboard layout configuration.
            </p>
            <DocCodeBlock
              code={`export type SplitDirection = 'row' | 'column';

export interface SplitNode {
  type: 'split';
  direction: SplitDirection;
  first: TreeNode;
  second: TreeNode;
  splitPercentage: number;
}

export interface PaneNode {
  type: 'pane';
  paneId: string;
}

export type TreeNode = SplitNode | PaneNode;

export interface ZeugmaClassNames {
  pane?: string;
  dropPreview?: string;
  swapPreview?: string;
  dragOverlay?: string;
  resizer?: string;
}

export interface PaneRenderProps {
  isDragging: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  remove: () => void;
}

export interface ResizerRenderProps {
  direction: SplitDirection;
  splitPercentage: number;
  resizerSize: number;
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export interface DashboardContextValue {
  layout: TreeNode | null;
  onLayoutChange: (newLayout: TreeNode | null) => void;
  renderPane: (paneId: string) => ReactNode;
  activeId: string | null;
  fullscreenPaneId: string | null;
  classNames: ZeugmaClassNames;
  onRemove?: (paneId: string) => void;
  onFullscreenChange?: (paneId: string | null) => void;
  snapThreshold?: number;
  onResizeStart?: (currentNode: SplitNode) => void;
  onResize?: (currentNode: SplitNode, percentage: number) => void;
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void;
  renderResizer?: (props: ResizerRenderProps) => ReactNode;
  minSplitPercentage?: number;
  maxSplitPercentage?: number;
  removePane: (paneId: string) => void;
  addPane: (paneId: string) => void;
  swapPanes: (paneIdA: string, paneIdB: string) => void;
  splitPane: (
    targetId: string,
    direction: SplitDirection,
    splitType: 'left' | 'right' | 'top' | 'bottom',
    paneToAdd: string,
  ) => void;
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void;
}
`}
              language="ts"
            />
          </section>

          {/* SKILL.md Section */}
          <section id="skill-md" className="scroll-mt-24 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-primary pb-2 gap-4 transition-colors duration-200">
              <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary m-0">
                <span>SKILL.md</span>
                <a
                  href="#skill-md"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection('skill-md')
                  }}
                  className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
                >
                  #
                </a>
              </h2>
              <button
                onClick={handleDownloadSkill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer select-none"
              >
                <Download className="w-3.5 h-3.5" /> Download SKILL.md
              </button>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Below is the comprehensive developer skill configuration for integrations, tree
              manipulation, and styling patterns within <code>react-zeugma</code>. Copy or download
              it for AI agents or reference.
            </p>
            <DocCodeBlock code={SKILL_MD_CONTENT} language="markdown" />
          </section>

          {/* Historical Context Section */}
          <section id="zeugma-mosaics" className="scroll-mt-24 space-y-4">
            <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary border-b border-[#D8BA8E] pb-2 font-serif transition-colors duration-200">
              <span>The Story of Zeugma</span>
              <a
                href="#zeugma-mosaics"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('zeugma-mosaics')
                }}
                className="text-[#D8BA8E]/50 hover:text-[#D8BA8E] opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              <em>Zeugma</em> is an ancient city of Commagene, located in modern-day{' '}
              <strong>Gaziantep, Turkey</strong>. Positioned along a critical crossing point of the
              Euphrates river, Zeugma became a central hub of trade and cultural exchanges.
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              During modern excavation efforts, archeologists discovered some of the most
              breathtaking Greco-Roman mosaic panels in history, now housed inside the{' '}
              <strong>Zeugma Mosaic Museum</strong> in Gaziantep. The famous{' '}
              <em>"Gypsy Girl" (Çingene Kızı)</em> mosaic, with her hauntingly detailed eyes, has
              become a global icon of the city.
            </p>

            <div className="bg-[#D8BA8E]/5 border border-[#D8BA8E]/20 rounded-xl p-5 select-none font-serif italic text-[#c29b47] dark:text-[#D8BA8E]/90 text-sm leading-relaxed transition-colors duration-200">
              "We chose the name Zeugma because of this ancient craftsmanship. Mosaics are assembled
              from hundreds of tiny, individual tesserae tiles to form a magnificent, cohesive
              picture. In the same spirit, react-zeugma lets you build beautiful, customized
              application workspaces from simple, individual components. Many tiles, one
              masterpiece."
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  )
}
