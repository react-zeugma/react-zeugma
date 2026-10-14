import { DocSection } from '../docs-data'
import {
  DocParagraph,
  DocCode,
  DocCallout,
  InfoCard,
  DocStepper,
} from '../../components/docs-elements'
import { Bot, FileText, ExternalLink, Sparkles } from 'lucide-react'

export const SKILL_MD_CONTENT = `---
name: react-zeugma
description: Rules, types, component composition, and programmatic manipulation guidelines for integrating and using the react-zeugma dashboard layout engine.
---

# Skill: Using react-zeugma

\`react-zeugma\` is a recursive drag-and-drop dashboard layout engine for React. It manages tree-based pane splitting (similar to \`react-mosaic\`) and provides a declarative state-driven API (similar to \`react-grid-layout\`) built on \`@dnd-kit/core\`.

---

## 1. Core AI Rules & Constraints

- **Immutable State Rule**: Never mutate layout \`TreeNode\` objects directly in-place. You must treat them as immutable. Always use the pure utility functions exported by \`react-zeugma/utils\` to perform mutations and return fresh tree references.
- **Headless Styling Rule**: \`react-zeugma\` is 100% style-agnostic and applies no default CSS. You MUST specify class names in the \`classNames\` configuration on \`<Zeugma>\` (specifically for \`resizer\`, \`dropPreview\`, \`tabDropPreview\`, \`paneDragPreview\`, and \`tabDragPreview\`) or the layout features will be invisible/non-functional.
- **renderPane Placement Rule**: If using \`<Zeugma>\` with \`children\` (Context Provider Mode), you MUST pass the \`renderPane\` prop directly to \`<PaneTree renderPane={renderPane} />\`, and \`renderPane\` is forbidden on \`<Zeugma>\`. If using \`<Zeugma>\` in standalone mode (without \`children\`), you MUST pass \`renderPane\` directly to \`<Zeugma renderPane={renderPane} />\`.
- **DragHandle Placement**: Draggable panes require a child \`<Pane.DragHandle>\` component to define the interactive drag region.
- **Stable Layout During Drag Rule**: The logical \`layout\` object from the controller or context does not update in real-time during a drag session. It only updates once the drop action is committed. The active visual removals and split previews are managed by the library's internal rendering layout.
- **Immutable Tab Metadata**: Tab metadata is decoupled from the layout topology (\`TreeNode\`). Metadata is registered at tab creation (\`initialMetadata\`, \`addTab(tabId, targetPaneId?, metadata?)\`) and read via \`findTabById(tabId)?.metadata\`, \`getTabMetadata(tabId)\`, or \`useTabMetadata(tabId)\`. No imperative \`updateMetadata\` mutations exist.

---

## 2. Layout Data Model (JSON Schema)

The dashboard layout is serialized as a recursive binary tree of \`TreeNode\` elements:

\`\`\`ts
export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number // 0 to 100
}

export interface PaneNode {
  type: 'pane'
  id: string
  tabIds: string[]
  activeTabId: string
  locked?: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
}

export type TreeNode = SplitNode | PaneNode

export interface TabDetails {
  id: string
  paneId: string
  isActive: boolean
  index: number
  metadata: Record<string, unknown> | undefined
}
\`\`\`

- **\`PaneNode\` (Leaf)**: Holds active tab IDs (\`tabIds\`) and the selected \`activeTabId\`.
- **\`SplitNode\` (Branch)**: Divides space into \`first\` and \`second\` sub-trees based on \`splitPercentage\` (percentage of the first child's size relative to the parent boundary).

---

## 3. Component Composition Rules

### Standalone Renderer

\`\`\`tsx
import { useZeugma, Zeugma, Pane } from 'react-zeugma'

function Dashboard() {
  const controller = useZeugma({ initialLayout })
  return (
    <Zeugma
      controller={controller}
      renderPane={(id) => (
        <Pane id={id}>
          <Pane.DragHandle className="drag">Header</Pane.DragHandle>
          <Pane.Content>{(tab) => <div>{tab.id}</div>}</Pane.Content>
        </Pane>
      )}
    />
  )
}
\`\`\`

### Context Provider Mode

If \`<Zeugma>\` wraps child components, it serves as a Context Provider. Use \`<PaneTree>\` (imported from \`react-zeugma\`) inside it to render the visual panels and pass the \`renderPane\` function directly to \`<PaneTree>\`:

\`\`\`tsx
import { useZeugma, Zeugma, PaneTree, Pane } from 'react-zeugma'

function Dashboard() {
  const controller = useZeugma({ initialLayout })
  const renderPane = (id: string) => (
    <Pane id={id}>
      <Pane.DragHandle className="drag">Header</Pane.DragHandle>
      <Pane.Content>{(tab) => <div>{tab.id}</div>}</Pane.Content>
    </Pane>
  )
  return (
    <Zeugma controller={controller}>
      <div className="custom-wrapper">
        <PaneTree renderPane={renderPane} />
      </div>
    </Zeugma>
  )
}
\`\`\`

---

## 4. API Reference and Configurations

### \`<Zeugma>\` Component Props

- \`controller\`: The layout state controller returned by \`useZeugma(options)\`.
- \`persist?: boolean | ZeugmaPersistOptions\`: Layout persistence configuration in localStorage.
  - \`enabled?: boolean\`: Whether layout persistence is enabled (defaults to true).
  - \`key?: string\`: The localStorage key (defaults to \`'zeugma-layout'\`).
- \`renderPopoutWrapper?: (props: { tabId: string; document: Document; window: Window; children: React.ReactNode }) => React.ReactNode\`: [Experimental] Optional custom wrapper to inject style managers or providers into popout windows.

### \`useZeugma(options)\`

Instantiates the dashboard state engine.

- \`initialLayout?: TreeNode | null\` (Initial uncontrolled tree)
- \`layout?: TreeNode | null\` (Controlled layout tree)
- \`onChange?: (newLayout: TreeNode | null) => void\` (Layout updates handler)
- \`locked?: boolean\` (Disable all resize/drag-and-drop operations)
- \`fullscreenPaneId?: string | null\` (Maximize target pane ID. When active, structural layout changes are blocked)
- \`onFullscreenChange?: (paneId: string | null) => void\` (Maximize toggle handler)

### \`useZeugmaContext()\`

Access actions and queries from parent \`<Zeugma>\` context:

\`\`\`ts
const {
  layout,
  locked,
  setLocked,
  setLayout,
  removePane,
  addTab,
  selectTab,
  splitPane,
  updatePaneLock,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  getTabMetadata,
  getActiveTabMetadata,
  poppedOutTabIds,
  popoutTab,
  dockTab,
} = useZeugmaContext()
\`\`\`

### \`usePaneContext()\`

Access details inside a child component of \`<Pane>\`:

\`\`\`ts
const {
  id,
  tabIds,
  activeTabId,
  isDragging,
  isFullscreen,
  toggleFullscreen,
  remove,
  selectTab,
  removeTab,
  metadata,
  locked,
  tabsMetadata,
  isActiveTabPoppedOut,
  popoutTab,
  dockTab,
} = usePaneContext()
\`\`\`

---

## 5. Pure Tree Manipulation Utilities

Import these layout mutators/queries from \`react-zeugma/utils\`:

- **\`splitPane(tree, targetId, direction, splitType, paneToAdd)\`**: Splits \`targetId\` pane in a direction (\`'row'\` / \`'column'\`) and split type (\`'left'\` | \`'right'\` | \`'top'\` | \`'bottom'\`). \`paneToAdd\` can be a tab ID string or a full \`PaneNode\`. Returns the updated tree.
- **\`removePane(tree, paneId)\`**: Removes a pane and collapses the parent split. Returns the updated tree.
- **\`addTab(tree, targetPaneId, tabId, metadata?)\`**: Appends a tab to a target pane and sets it active. Returns the updated tree.
- **\`removeTab(tree, tabId)\`**: Removes a tab from its pane; collapses empty panes. Returns the updated tree.
- **\`selectTab(tree, paneId, tabId)\`**: Activates a tab inside a pane. Returns the updated tree.
- **\`mergeTab(tree, draggedTabId, targetPaneId)\`**: Moves a tab from its source pane to target pane. Returns the updated tree.
- **\`moveTab(tree, draggedTabId, targetTabId, position?)\`**: Moves a tab before/after target tab, or swaps them if position is \`'center'\`. Returns the updated tree.
- **\`swapTabs(tree, draggedTabId, targetTabId)\`**: Swaps the positions and active states of two tabs. Returns the updated tree.
- **\`movePaneTabs(tree, draggedPaneId, targetTabId, position?)\`**: Moves all tabs from a dragged pane before/after target tab. Returns the updated tree.
- **\`findPaneById(tree, paneId)\`**: Returns matching \`PaneNode\` or \`null\`.
- **\`findPaneContainingTab(tree, tabId)\`**: Returns parent \`PaneNode\` containing the tab, or \`null\`.
- **\`findTabById(tree, tabId)\`**: Returns \`TabDetails\` or \`null\`.
- **\`updatePaneLock(tree, paneId, locked)\`**: Updates the lock state of a specific pane. Returns the updated tree.
- **\`isValidTreeNode(node)\`**: Validates that an object conforms to the structural \`TreeNode\` schema with cycle detection.
- **\`computeLayout(tree)\`**: Calculates absolute positions (\`{ left, top, width, height }\` as percentages) for all panes and splitters.

---

## 6. Popout Window Styling (Experimental)

When using CSS-in-JS libraries like \`styled-components\` or \`@ant-design/cssinjs\` (Ant Design) inside widgets, dynamic styles are injected into the main document's head by default. To make styles apply in popout windows (which are separate windows/documents), use \`renderPopoutWrapper\` to wrap popped-out widgets with appropriate style providers and cache targets.

React Zeugma automatically clones and syncs static stylesheets, \`<link>\` tags, and document attributes (such as \`data-theme\`) to popouts in real-time. Only dynamic CSS-in-JS injection needs wrapping.

### Example Configuration:

\`\`\`tsx
import React, { useMemo } from 'react'
import { StyleSheetManager } from 'styled-components'
import { StyleProvider, createCache } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'

// 1. Create a wrapper component to instantiate a style cache per window
function PopoutStyleManager({ document, children }) {
  const cache = useMemo(() => createCache(), [])

  return (
    <StyleSheetManager target={document.head}>
      <StyleProvider cache={cache} container={document.head}>
        <ConfigProvider getPopupContainer={() => document.body}>
          {children}
        </ConfigProvider>
      </StyleProvider>
    </StyleSheetManager>
  )
}

// 2. Pass it as renderPopoutWrapper
<Zeugma
  controller={controller}
  renderPopoutWrapper={({ document, children }) => (
    <PopoutStyleManager document={document}>{children}</PopoutStyleManager>
  )}
/>
\`\`\`

---

## 7. DevTools & Performance Profiling (\`react-zeugma/devtools\`)

Import mount and render counter utilities from \`react-zeugma/devtools\` or \`react-zeugma\`:

- **\`useRenderCounter(idOrOptions?, options?)\`**: Tracks component mount counts and render cycle passes in a React 18/19 StrictMode safe manner. Returns \`{ mounts, renders, reset }\`.
- **\`<RenderCounterBadge id={id} position="top-right" disabled={disabled} className="..." />\`**: Unstyled overlay badge displaying mount and render metrics.
- **\`<RenderCounterFooter id={id} label={label} disabled={disabled} className="..." footerClassName="...">\`**: Unstyled bottom status footer bar for tabbed widgets or layout panels.

---

## 8. LLM Context Standard (llms.txt)

React Zeugma provides an official, curated \`/llms.txt\` document conforming to the [llmstxt.org](https://llmstxt.org) standard:
- **URL**: \`https://react-zeugma.vercel.app/llms.txt\`
- **Use Case**: Ingesting high-density architecture, layout schemas, and API reference into LLMs (NotebookLM, Claude, ChatGPT, or custom RAG vectors) without parsing HTML.
`

export const skillMdSection: DocSection = {
  id: 'skill-md',
  title: 'AI Integration (SKILL.md & llms.txt)',
  category: 'advanced',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          React Zeugma is designed AI-first. We provide two official, pre-configured specifications
          designed to eliminate hallucinations: an authoritative{' '}
          <strong className="text-text-primary font-semibold">SKILL.md</strong> file for agentic IDE
          assistants, and a curated{' '}
          <strong className="text-text-primary font-semibold">llms.txt</strong> index for LLMs and
          RAG pipelines.
        </DocParagraph>
      </div>

      {/* Two Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-accent/30 bg-accent/5 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                SKILL.md for Agentic Assistants
              </h4>
              <span className="text-[11px] text-text-muted">
                Antigravity, Cursor, Claude Code, Copilot
              </span>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Encodes all 6 architectural invariants, layout constraints, headless styling contracts,
            and TypeScript schemas directly into the assistant&apos;s workspace rules. Guarantees
            100% syntactically and structurally correct React Zeugma code on the first attempt.
          </p>
        </div>

        <div className="border border-border-primary rounded-2xl p-5 bg-bg-pane space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-bg-pane-inner border border-border-primary flex items-center justify-center text-text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">llms.txt Standard Index</h4>
              <span className="text-[11px] text-text-muted">
                llmstxt.org Standard Plaintext Reference
              </span>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            A high-density, structured markdown file hosted at <DocCode>/llms.txt</DocCode> designed
            for ingestion into ChatGPT, Claude Projects, NotebookLM, or custom RAG knowledge bases
            without web scrapers or HTML noise.
          </p>
        </div>
      </div>
    </div>
  ),
  subsections: [
    {
      id: 'skill-configuration',
      title: 'SKILL.md for Agentic IDEs',
      content: (
        <div className="space-y-6">
          <DocParagraph>
            When AI coding models are asked to build dashboards, they frequently hallucinate legacy
            12-column coordinate grids or forget that React Zeugma is 100% headless (omitting the
            mandatory resizer and drop-preview class names). By placing our pre-configured{' '}
            <DocCode>SKILL.md</DocCode> into your workspace, the agent immediately knows how to
            construct valid recursive binary trees and compound pane components.
          </DocParagraph>

          <DocCallout variant="tip" title="Why AI Assistants Need SKILL.md">
            AI models without library skills often attempt to pass <DocCode>renderPane</DocCode> to{' '}
            <DocCode>&lt;Zeugma&gt;</DocCode> even when children are present (violating the Provider
            mode contract), or forget to render <DocCode>&lt;Pane.DragHandle&gt;</DocCode>. The
            SKILL.md rules prevent these errors before code is generated.
          </DocCallout>

          <DocStepper
            steps={[
              {
                title: 'Download or copy SKILL.md',
                children: (
                  <span>
                    Click the <strong>Download SKILL.md</strong> button below, or copy the
                    configuration code block directly into your project.
                  </span>
                ),
              },
              {
                title: 'Place in your project configuration root',
                children: (
                  <div className="space-y-2">
                    <p className="text-xs text-text-secondary">
                      Place the file in your preferred assistant directory:
                    </p>
                    <ul className="text-xs font-mono text-text-muted space-y-1 list-disc list-outside pl-4">
                      <li>
                        <strong className="text-text-primary">Google Antigravity:</strong>{' '}
                        <DocCode>.agents/skills/react-zeugma/SKILL.md</DocCode>
                      </li>
                      <li>
                        <strong className="text-text-primary">Cursor:</strong>{' '}
                        <DocCode>.cursor/rules/react-zeugma.md</DocCode>
                      </li>
                      <li>
                        <strong className="text-text-primary">Claude Code:</strong>{' '}
                        <DocCode>.claude/skills/react-zeugma.md</DocCode>
                      </li>
                      <li>
                        <strong className="text-text-primary">GitHub Copilot:</strong>{' '}
                        <DocCode>.github/copilot-instructions.md</DocCode>
                      </li>
                    </ul>
                  </div>
                ),
              },
              {
                title: 'Prompt your assistant naturally',
                children: (
                  <span>
                    Ask your agent:{' '}
                    <em>
                      &quot;Build a 3-pane trading cockpit with recursive split dividers and custom
                      resizer styles using react-zeugma&quot;
                    </em>
                    .
                  </span>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      id: 'llms-txt',
      title: 'llms.txt Standard Index',
      content: (
        <div className="space-y-6">
          <DocParagraph>
            Following the official{' '}
            <strong className="text-text-primary font-semibold">llmstxt.org</strong> open standard,
            we publish a curated plaintext reference at <DocCode>/llms.txt</DocCode>. This file
            contains concise, structured documentation, complete type signatures, and architectural
            constraints optimized for prompt contexts and RAG ingestion.
          </DocParagraph>

          <div className="border border-border-primary bg-bg-pane rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border-primary/60">
              <div className="space-y-1">
                <span className="eyebrow text-accent font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Live LLM Endpoint
                </span>
                <h4 className="text-base font-bold text-text-primary">
                  https://react-zeugma.vercel.app/llms.txt
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/llms.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/90 transition-colors"
                >
                  <span>Open /llms.txt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-text-secondary font-medium">
                Fetch via terminal or pipeline:
              </span>
              <pre className="p-3 rounded-lg bg-bg-pane-inner border border-border-primary font-mono text-xs text-accent overflow-x-auto select-all">
                curl -s https://react-zeugma.vercel.app/llms.txt
              </pre>
            </div>
          </div>

          <DocCallout variant="note" title="Using llms.txt in ChatGPT, Claude, and NotebookLM">
            When starting a new conversation with an LLM about your dashboard architecture, simply
            attach or paste the contents of <DocCode>/llms.txt</DocCode> as project context. The
            model will understand the entire component surface, recursive tree mathematics, and
            headless styling requirements without requiring manual prompt engineering.
          </DocCallout>
        </div>
      ),
    },
    {
      id: 'prompting-guide',
      title: 'Prompting Recipes & Best Practices',
      content: (
        <div className="space-y-6">
          <DocParagraph>
            When pairing with AI assistants equipped with the React Zeugma skill, use these
            battle-tested prompting patterns for the highest quality code generation:
          </DocParagraph>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard title="Recipe: Multi-Tab Analytics Dashboard" titleClassName="text-accent">
              <p className="text-xs text-text-secondary leading-relaxed font-mono bg-bg-pane-inner/60 p-2.5 rounded-lg border border-border-primary/60">
                &quot;Create a dashboard using react-zeugma with 2 side-by-side panes. The left pane
                should have 3 tabs (&apos;Summary&apos;, &apos;Logs&apos;, &apos;Metrics&apos;).
                Include custom Tailwind styling for Pane.DragHandle and resizer.&quot;
              </p>
            </InfoCard>

            <InfoCard title="Recipe: Arbitrary Dynamic Splitting" titleClassName="text-accent">
              <p className="text-xs text-text-secondary leading-relaxed font-mono bg-bg-pane-inner/60 p-2.5 rounded-lg border border-border-primary/60">
                &quot;Use react-zeugma/utils to implement an &apos;Add Terminal&apos; button that
                calls splitPane() on the active editor pane and inserts a new terminal pane split at
                the bottom.&quot;
              </p>
            </InfoCard>
          </div>
        </div>
      ),
    },
  ],
}
