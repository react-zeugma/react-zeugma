import { BasicSplitDemo } from '../../components/docs-mini-demos'
import { DocCodeBlock } from '../../components/mdx-renderer'
import {
  DocParagraph,
  DocCode,
  DocHeading,
  DocList,
  InfoCard,
  DocCallout,
  DocTable,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const TREE_TYPES_CODE = `export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection // 'row' = horizontal split (left/right), 'column' = vertical split (top/bottom)
  first: TreeNode           // First child (left or top)
  second: TreeNode          // Second child (right or bottom)
  splitPercentage: number   // Percentage allocated to 'first' child (5 to 95)
}

export interface PaneNode {
  type: 'pane'
  id: string                // Unique pane container identifier
  tabIds: string[]          // Array of docked tab IDs in rendering order
  activeTabId: string       // Currently active tab ID
  locked?: boolean          // Optional pane-level freeze (prevents drag/close)
  tabsMetadata?: Record<string, Record<string, unknown>> // Per-tab persistent metadata
}

export type TreeNode = SplitNode | PaneNode`

const PURE_MUTATION_CODE = `import { splitPane, removePane, isValidTreeNode, computeLayout } from 'react-zeugma/utils'

// 1. Validate tree structure and prevent cycles
const valid = isValidTreeNode(currentLayout)

// 2. Pure immutable split: adds a new pane to the right of 'editor-pane'
const updatedTree = splitPane(
  currentLayout,
  'editor-pane',   // target pane ID
  'row',           // direction ('row' | 'column')
  'right',         // position: 'left' | 'right' | 'top' | 'bottom'
  'terminal-pane'  // new pane ID or full PaneNode
)

// 3. Remove a pane (automatically collapses parent split with sibling)
const collapsedTree = removePane(updatedTree, 'terminal-pane')

// 4. Compute absolute percentage boxes for headless rendering
const layoutGeometry = computeLayout(updatedTree)
// Returns: { [paneId]: { left: number, top: number, width: number, height: number } }`

const TREE_UTILS_TABLE = [
  [
    'splitPane',
    '(tree, targetId, direction, splitType, paneToAdd) => TreeNode',
    'Partitions target pane into two siblings and inserts the new pane.',
  ],
  [
    'removePane',
    '(tree, paneId) => TreeNode | null',
    'Deletes target pane and collapses the parent split, giving full space to the sibling.',
  ],
  [
    'addTab',
    '(tree, targetPaneId, tabId, metadata?) => TreeNode',
    'Appends a tab into a pane and activates it. Auto-registers tab metadata if provided.',
  ],
  [
    'removeTab',
    '(tree, tabId) => TreeNode | null',
    'Closes target tab. If the pane has no remaining tabs, the pane collapses automatically.',
  ],
  ['selectTab', '(tree, paneId, tabId) => TreeNode', 'Switches the active tab in target pane.'],
  [
    'mergeTab',
    '(tree, draggedTabId, targetPaneId) => TreeNode',
    'Transfers a tab from one pane into another.',
  ],
  [
    'moveTab',
    '(tree, draggedTabId, targetTabId, position?) => TreeNode',
    'Reorders tabs within or across panes (before, after, or center swap).',
  ],
  [
    'swapTabs',
    '(tree, draggedTabId, targetTabId) => TreeNode',
    'Swaps the positions and active status between two tabs.',
  ],
  [
    'findPaneById',
    '(tree, paneId) => PaneNode | null',
    'Searches the tree recursively and returns matching PaneNode.',
  ],
  [
    'findPaneContainingTab',
    '(tree, tabId) => PaneNode | null',
    'Locates the PaneNode currently housing a tab ID.',
  ],
  [
    'findTabById',
    '(tree, tabId) => TabDetails | null',
    'Returns TabDetails (id, paneId, isActive, index, metadata).',
  ],
  [
    'isValidTreeNode',
    '(node) => boolean',
    'Validates conforming tree structure with cycle detection.',
  ],
  [
    'computeLayout',
    '(tree) => Record<string, { left, top, width, height }>',
    'Calculates relative percentage bounding boxes for headless layout rendering.',
  ],
]

export const treeLayoutSection: DocSection = {
  id: 'tree-layout',
  title: 'Tree-based Layouts',
  category: 'core',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          React Zeugma models your dashboard workspace as a recursive{' '}
          <strong>Binary Space Partitioning (BSP) tree</strong>. Unlike flat 12-column grid systems
          that suffer from coordinate overlaps and empty cell gaps, binary trees guarantee that
          every pixel of the container is systematically accounted for and resizable in all
          dimensions.
        </DocParagraph>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard
          title="SplitNode (Branch Node)"
          titleClassName="text-accent font-mono text-xs uppercase tracking-wider"
        >
          <DocParagraph size="sm">
            Divides container area along an axis (<DocCode>row</DocCode> or{' '}
            <DocCode>column</DocCode>) into two child branches (<DocCode>first</DocCode> and{' '}
            <DocCode>second</DocCode>) using a dynamic percentage ratio.
          </DocParagraph>
        </InfoCard>
        <InfoCard
          title="PaneNode (Leaf Node)"
          titleClassName="text-accent font-mono text-xs uppercase tracking-wider"
        >
          <DocParagraph size="sm">
            The terminal workspace unit. Houses one or more docked tabs (<DocCode>tabIds</DocCode>),
            tracks the focused tab (<DocCode>activeTabId</DocCode>), and maintains isolated tab
            metadata.
          </DocParagraph>
        </InfoCard>
      </div>

      <BasicSplitDemo />

      <DocHeading>Data Model &amp; Schema</DocHeading>
      <DocParagraph>
        The entire layout is serializable as standard JSON, making it effortless to save to local
        storage, sync with remote databases, or transmit over WebSockets:
      </DocParagraph>

      <DocCodeBlock code={TREE_TYPES_CODE} language="typescript" />

      <DocHeading>Split Direction Semantics</DocHeading>
      <DocParagraph>
        The <DocCode highlight>direction</DocCode> property governs the orientation of the divider
        and the spatial relationship between children:
      </DocParagraph>
      <DocList
        items={[
          <>
            <DocCode highlight>direction: &apos;row&apos;</DocCode> — Splits the container
            horizontally across the X-axis. The divider handle is vertical. <DocCode>first</DocCode>{' '}
            occupies the <strong>Left</strong> side, and <DocCode>second</DocCode> occupies the{' '}
            <strong>Right</strong> side.
          </>,
          <>
            <DocCode highlight>direction: &apos;column&apos;</DocCode> — Splits the container
            vertically across the Y-axis. The divider handle is horizontal. <DocCode>first</DocCode>{' '}
            occupies the <strong>Top</strong> side, and <DocCode>second</DocCode> occupies the{' '}
            <strong>Bottom</strong> side.
          </>,
          <>
            <DocCode highlight>splitPercentage</DocCode> — A float between <DocCode>0</DocCode> and{' '}
            <DocCode>100</DocCode> (clamped safely between 5% and 95% during user dragging)
            representing the proportion of available space given to <DocCode>first</DocCode>. The
            sibling receives <DocCode>100 - splitPercentage</DocCode>.
          </>,
        ]}
      />

      <DocHeading>Tree Invariants &amp; Auto-Collapse</DocHeading>
      <DocParagraph>
        React Zeugma enforces structural invariants so your layout never degrades into invalid or
        orphaned states:
      </DocParagraph>
      <DocList
        items={[
          <>
            <strong>Automatic Split Collapse</strong>: When all tabs in a pane are closed or dragged
            elsewhere, the empty <DocCode>PaneNode</DocCode> is removed. Its parent{' '}
            <DocCode>SplitNode</DocCode> collapses immediately, and the surviving sibling expands to
            reclaim the full parent boundary without leaving dead space.
          </>,
          <>
            <strong>Cycle-Free Topology</strong>: Layout mutations pass through cycle detection
            before committing to state. Circular tree references are rejected automatically.
          </>,
          <>
            <strong>Root Normalization</strong>: If only a single pane remains in the layout, the
            root of the tree simplifies directly into that <DocCode>PaneNode</DocCode>, stripping
            all redundant split wrappers.
          </>,
        ]}
      />

      <DocCallout variant="caution" title="Immutable State Rule">
        Never mutate <DocCode>TreeNode</DocCode> objects directly in place! Always treat them as
        immutable. Use the pure utility functions exported by <DocCode>react-zeugma/utils</DocCode>{' '}
        or controller actions to perform mutations and return fresh tree references. Direct object
        mutations break React state re-renders and drag synchronization.
      </DocCallout>

      <DocHeading>Pure Functional Tree Utilities (`react-zeugma/utils`)</DocHeading>
      <DocParagraph>
        Each utility returns a fresh, cycle-verified tree reference suitable for React state
        setters, Redux reducers, or Zustand actions:
      </DocParagraph>

      <DocCodeBlock code={PURE_MUTATION_CODE} language="typescript" />

      <DocTable
        headers={['Utility Function', 'Signature', 'Description']}
        rows={TREE_UTILS_TABLE}
        searchable
        searchPlaceholder="Filter tree utilities..."
        caption="Pure Tree Manipulation Utilities"
      />
    </div>
  ),
}
