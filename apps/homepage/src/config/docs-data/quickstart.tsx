import { DocCodeBlock } from '../../components/mdx-renderer'
import {
  DocParagraph,
  DocCode,
  DocHeading,
  DocCallout,
  PackageManagerTabs,
  DocStepper,
} from '../../components/docs-elements'
import { BasicSplitDemo } from '../../components/docs-mini-demos'
import { DocSection } from '../docs-data'

const QUICKSTART_CODE = `import React from 'react'
import { useZeugma, Zeugma, Pane, TreeNode } from 'react-zeugma'

// 1. Declare the initial binary layout topology
const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row', // 'row' = vertical divider (left/right children)
  splitPercentage: 35, // 35% allocated to the left panel
  first: {
    type: 'pane',
    id: 'sidebar-pane',
    tabIds: ['Explorer'],
    activeTabId: 'Explorer',
  },
  second: {
    type: 'pane',
    id: 'editor-pane',
    tabIds: ['main.tsx', 'styles.css'],
    activeTabId: 'main.tsx',
  },
}

// 2. Build your custom pane wrapper using compound components
function WorkspacePane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {/* Header with drag handle and tabs */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-850/80 border-b border-zinc-800">
          <Pane.Tabs
            classNames={{
              container: 'flex items-center gap-1',
              tab: 'px-2.5 py-1 text-xs rounded-md transition-colors cursor-grab active:cursor-grabbing font-medium',
            }}
            renderTab={({ id: tabId, isActive, onSelect, onRemove }) => (
              <button
                key={tabId}
                onClick={onSelect}
                className={
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }
              >
                {tabId}
              </button>
            )}
          />
          <Pane.DragHandle className="px-2 py-0.5 text-[11px] font-mono text-zinc-400 bg-zinc-800/60 rounded cursor-grab select-none">
            Drag
          </Pane.DragHandle>
        </div>

        {/* Dynamic active tab content */}
        <Pane.Content className="flex-1 p-4 text-zinc-300 text-sm overflow-auto">
          {(tab) => (
            <div>
              <p className="font-semibold text-white">Active Widget: {tab.id}</p>
              <p className="text-xs text-zinc-500 mt-1">Docked inside pane {id}</p>
            </div>
          )}
        </Pane.Content>
      </div>
    </Pane>
  )
}

// 3. Mount the layout controller and dashboard engine
export default function DashboardApp() {
  const controller = useZeugma({ initialLayout })

  return (
    <div className="w-screen h-screen p-4 bg-zinc-950">
      <Zeugma
        controller={controller}
        renderPane={(paneId) => <WorkspacePane id={paneId} />}
        resizerSize={6}
        snapThreshold={8}
        classNames={{
          resizer: 'bg-zinc-800 hover:bg-orange-500 transition-colors w-1.5 cursor-col-resize',
          dropPreview: 'bg-orange-500/15 border-2 border-dashed border-orange-500 rounded-xl',
          tabDropPreview: 'bg-orange-500/20 border-l-2 border-orange-500',
        }}
      />
    </div>
  )
}`

export const quickstartSection: DocSection = {
  id: 'quickstart',
  title: 'Quick Start & Installation',
  category: 'overview',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          Get up and running with{' '}
          <strong className="text-text-primary font-semibold">react-zeugma</strong> in under five
          minutes. Install the package via your favorite package manager, declare your spatial
          binary layout tree, and assemble your first custom pane layout with full drag-and-drop
          support.
        </DocParagraph>
      </div>

      {/* Package Manager Installation Tabs */}
      <div className="space-y-3">
        <DocHeading level={4}>Package Installation</DocHeading>
        <PackageManagerTabs packageNames="react-zeugma" />
      </div>

      <DocCallout variant="note" title="Peer Dependencies Compatibility">
        Requires <DocCode>react</DocCode> and <DocCode>react-dom</DocCode> (
        <DocCode>&gt;=18.0.0 || &gt;=19.0.0</DocCode>). Full React 19 StrictMode compatibility is
        tested out of the box with zero runtime warnings or lifecycle memory leaks.
      </DocCallout>

      <DocCallout variant="important" title="Headless Styling Rule">
        React Zeugma is 100% style-agnostic and injects no opinionated CSS. You{' '}
        <strong>must</strong> provide class names in the <DocCode>classNames</DocCode> prop on{' '}
        <DocCode>&lt;Zeugma&gt;</DocCode> (specifically for <DocCode>resizer</DocCode>,{' '}
        <DocCode>dropPreview</DocCode>, and <DocCode>tabDropPreview</DocCode>), or the interactive
        layout divider and drop indicator elements will be visually invisible!
      </DocCallout>

      {/* Numbered Procedure Stepper */}
      <div className="space-y-4">
        <DocHeading level={4}>Step-by-Step Implementation Guide</DocHeading>
        <DocStepper
          steps={[
            {
              title: 'Declare Spatial Topology',
              badge: 'Step 1',
              children: (
                <DocParagraph>
                  Define your initial workspace topology as a binary <DocCode>TreeNode</DocCode>. A{' '}
                  <DocCode>split</DocCode> node partitions space between its{' '}
                  <DocCode>first</DocCode> and <DocCode>second</DocCode> children along an axis (
                  <DocCode>row</DocCode> or <DocCode>column</DocCode>) with a{' '}
                  <DocCode>splitPercentage</DocCode>.
                </DocParagraph>
              ),
            },
            {
              title: 'Assemble Headless Panes',
              badge: 'Step 2',
              children: (
                <DocParagraph>
                  Each pane container is constructed with the <DocCode>&lt;Pane&gt;</DocCode>{' '}
                  compound component family. Nest <DocCode>&lt;Pane.DragHandle&gt;</DocCode> to
                  activate drag grabbing and <DocCode>&lt;Pane.Content&gt;</DocCode> to render the
                  active tab content.
                </DocParagraph>
              ),
            },
            {
              title: 'Instantiate Layout Controller',
              badge: 'Step 3',
              children: (
                <DocParagraph>
                  Call <DocCode>useZeugma(&#123; initialLayout &#125;)</DocCode> to instantiate the
                  dashboard state engine. The controller manages internal tree mutations, transient
                  drag states, split ratio resizes, and workspace locking.
                </DocParagraph>
              ),
            },
            {
              title: 'Configure Styling & Mount Engine',
              badge: 'Step 4',
              children: (
                <DocParagraph>
                  Render <DocCode>&lt;Zeugma&gt;</DocCode> passing your controller, your{' '}
                  <DocCode>renderPane</DocCode> callback, and the <DocCode>classNames</DocCode> for
                  resizers and drop preview highlights.
                </DocParagraph>
              ),
            },
          ]}
        />
      </div>

      {/* Complete Working TypeScript Example */}
      <div className="space-y-3">
        <DocHeading level={4}>Complete Working TypeScript Example</DocHeading>
        <DocParagraph>
          The following self-contained component demonstrates tree declaration, pane compound
          composition, and mounting the root engine:
        </DocParagraph>
        <DocCodeBlock code={QUICKSTART_CODE} language="tsx" />
      </div>

      {/* Interactive Mini Demo */}
      <div className="space-y-3">
        <DocHeading level={4}>Live Interactive Split Demo</DocHeading>
        <DocParagraph>
          Toggle between horizontal and vertical split directions dynamically using the
          controller&apos;s <DocCode>setLayout</DocCode> method:
        </DocParagraph>
        <BasicSplitDemo />
      </div>
    </div>
  ),
}
