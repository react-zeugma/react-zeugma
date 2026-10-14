import { TabControllerDemo } from '../../components/docs-mini-demos'
import { DocCodeBlock } from '../../components/mdx-renderer'
import {
  DocParagraph,
  DocCode,
  DocHeading,
  DocList,
  InfoCard,
  DocTable,
  DocCallout,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const USE_ZEUGMA_SIGNATURE = `import { useZeugma, TreeNode } from 'react-zeugma'

// 1. Uncontrolled Mode (state managed internally by hook)
const controller = useZeugma({
  initialLayout: defaultLayout,
  locked: false,
})

// 2. Controlled Mode (state driven by external state / database)
const [layout, setLayout] = useState<TreeNode | null>(defaultLayout)

const controller = useZeugma({
  layout,
  onChange: (newLayout) => {
    setLayout(newLayout)
    persistToBackend(newLayout)
  },
  locked: isWorkspaceLocked,
  fullscreenPaneId: activeFullscreenId,
  onFullscreenChange: setActiveFullscreenId,
})`

const CONTROLLER_USAGE_EXAMPLE = `import { useZeugma, Zeugma, Pane } from 'react-zeugma'

function WorkspaceToolbar({ controller }: { controller: ReturnType<typeof useZeugma> }) {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      {/* Dynamic Tab Insertion */}
      <button onClick={() => controller.addTab(\`Terminal-\${Date.now()}\`)}>
        + New Terminal
      </button>

      {/* Programmatic Split */}
      <button onClick={() => controller.splitPane('editor-pane', 'row', 'right', 'preview-pane')}>
        Split Right
      </button>

      {/* Workspace Freeze */}
      <button onClick={() => controller.setLocked(!controller.locked)}>
        {controller.locked ? 'Unlock Layout' : 'Lock Layout'}
      </button>

      {/* Inspection */}
      <span>Total Panes: {controller.layout ? countPanes(controller.layout) : 0}</span>
    </div>
  )
}`

const CONTEXT_CONSUMER_EXAMPLE = `import { useZeugmaContext } from 'react-zeugma'

// Any component nested inside <Zeugma> can consume the layout engine context
export function GlobalBreadcrumbs() {
  const { layout, locked, selectTab, findPaneContainingTab } = useZeugmaContext()

  return (
    <nav className="flex items-center gap-2 text-xs">
      <span className="font-semibold text-accent">Active Workspace</span>
      {locked && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono">LOCKED</span>}
    </nav>
  )
}`

const CONTROLLER_METHODS_TABLE = [
  [
    'addTab',
    '(tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => void',
    'Appends a tab into a target pane, or splits/creates a pane if omitted.',
  ],
  [
    'removeTab',
    '(tabId: string) => void',
    'Removes a tab by ID. Automatically collapses the enclosing pane if it was the last tab.',
  ],
  [
    'selectTab',
    '(paneId: string, tabId: string) => void',
    'Sets the active/visible tab for the specified pane.',
  ],
  [
    'splitPane',
    '(targetId: string, direction: SplitDirection, type: SplitType, paneToAdd: string) => void',
    'Splits a target pane in the given direction and inserts a new pane.',
  ],
  [
    'removePane',
    '(paneId: string) => void',
    'Removes an entire pane container and collapses the parent split with its sibling.',
  ],
  [
    'setLocked',
    '(locked: boolean) => void',
    'Globally freezes all resize dividers and drag-and-drop operations.',
  ],
  [
    'updatePaneLock',
    '(paneId: string, locked: boolean) => void',
    'Freezes or unfreezes a single pane independently.',
  ],
  [
    'mergeTab',
    '(draggedTabId: string, targetPaneId: string) => void',
    'Moves a tab from its source pane into the target pane tab bar.',
  ],
  [
    'moveTab',
    '(draggedTabId: string, targetTabId: string, position?: "before" | "after" | "center") => void',
    'Reorders a tab relative to another tab, or swaps them if position is center.',
  ],
  [
    'popoutTab',
    '(tabId: string) => void',
    '[Experimental] Detaches a tab into an independent multi-window browser popout.',
  ],
  [
    'dockTab',
    '(tabId: string) => void',
    '[Experimental] Re-docks a popped-out tab back into the primary dashboard layout.',
  ],
  [
    'findPaneById',
    '(paneId: string) => PaneNode | null',
    'Queries a PaneNode in the tree by its unique identifier.',
  ],
  [
    'findPaneContainingTab',
    '(tabId: string) => PaneNode | null',
    'Finds which pane currently houses a particular tab ID.',
  ],
  [
    'findTabById',
    '(tabId: string) => TabDetails | null',
    'Returns metadata, active status, pane ID, and index of a tab.',
  ],
]

export const stateControllerSection: DocSection = {
  id: 'state-controller',
  title: 'State & Controller',
  category: 'core',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          The <DocCode highlight>useZeugma</DocCode> hook is the state engine of React Zeugma. It
          orchestrates the underlying binary partition tree, manages user drag-and-drop transactions
          via <DocCode>@dnd-kit</DocCode>, and exposes a rich imperative controller interface (
          <DocCode>ZeugmaController</DocCode>) for programmatic control.
        </DocParagraph>
      </div>

      <TabControllerDemo />

      <DocHeading>Controlled vs. Uncontrolled Mode</DocHeading>
      <DocParagraph>
        React Zeugma seamlessly supports both state paradigms depending on your persistence and
        architecture needs:
      </DocParagraph>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard title="Uncontrolled Mode (initialLayout)" titleClassName="text-accent">
          <DocParagraph size="sm">
            Pass <DocCode highlight>initialLayout</DocCode>. The hook initializes the tree and
            internally updates state on every drag or resize. Pair with the{' '}
            <DocCode>persist</DocCode> prop on <DocCode>&lt;Zeugma&gt;</DocCode> for zero-code
            localStorage hydration.
          </DocParagraph>
        </InfoCard>
        <InfoCard title="Controlled Mode (layout + onChange)" titleClassName="text-accent">
          <DocParagraph size="sm">
            Pass both <DocCode highlight>layout</DocCode> and <DocCode highlight>onChange</DocCode>.
            You own the state. Every drop, split, and divider resize fires your{' '}
            <DocCode>onChange</DocCode> callback. Perfect for Zustand/Redux integration, remote
            database sync, and multiplayer WebSockets.
          </DocParagraph>
        </InfoCard>
      </div>

      <DocCodeBlock code={USE_ZEUGMA_SIGNATURE} language="typescript" />

      <DocCallout variant="note" title="Stable State During Drag Sessions">
        While a user is actively dragging a tab or resizing a divider, the public{' '}
        <DocCode>layout</DocCode> tree does <em>not</em> trigger re-renders on the rest of your
        application. Drag previews and drop zones are managed in an isolated transient rendering
        layer. The layout state updates only once the pointer action commits upon drop, preventing
        cascading reflows and layout jank in heavy widget trees!
      </DocCallout>

      <DocHeading>ZeugmaController Methods &amp; Queries</DocHeading>
      <DocParagraph>
        The controller object returned by <DocCode highlight>useZeugma()</DocCode> provides an
        exhaustive suite of programmatic layout mutators and spatial queries:
      </DocParagraph>

      <DocTable
        headers={['Method / Query', 'Signature', 'Description']}
        rows={CONTROLLER_METHODS_TABLE}
        searchable
        searchPlaceholder="Filter controller methods..."
        caption="Controller Methods & Layout Queries"
      />

      <DocHeading>Imperative Controller Usage in Toolbars</DocHeading>
      <DocParagraph>
        You can pass the <DocCode highlight>controller</DocCode> down to custom workspace toolbars,
        hotkey managers, or command palettes to trigger splits, add tabs, or freeze layouts on
        demand:
      </DocParagraph>

      <DocCodeBlock code={CONTROLLER_USAGE_EXAMPLE} language="tsx" />

      <DocHeading>Consuming via Context (useZeugmaContext)</DocHeading>
      <DocParagraph>
        When your dashboard contains deeply nested toolbars, status bars, or keyboard shortcut
        handlers, you don&apos;t need to prop-drill the controller. Any component placed inside{' '}
        <DocCode>&lt;Zeugma&gt;</DocCode> can call <DocCode highlight>useZeugmaContext()</DocCode>{' '}
        to access the active controller directly:
      </DocParagraph>

      <DocCodeBlock code={CONTEXT_CONSUMER_EXAMPLE} language="tsx" />

      <DocHeading>Zero-Jank Guarantees</DocHeading>
      <DocList
        items={[
          <>
            <strong>No Intermediate Layout Thrashing</strong>: Resizing dividers or hovering drop
            zones never fires <DocCode>onChange</DocCode> until released.
          </>,
          <>
            <strong>Isolated Reactivity</strong>: Tab metadata updates never recalculate spatial
            coordinates or trigger divider re-renders.
          </>,
          <>
            <strong>Safe Fullscreen Toggling</strong>: Calling{' '}
            <DocCode>setFullscreenPaneId(paneId)</DocCode> maximizes the target pane to 100%
            boundary without altering the underlying tree topology.
          </>,
        ]}
      />
    </div>
  ),
}
