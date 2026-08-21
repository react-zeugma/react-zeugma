import { BasicSplitDemo } from '../../components/docs-mini-demos'
import { DocCodeBlock } from '../../components/mdx-renderer'
import { DocParagraph, DocCode, DocHeading, DocList } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const TREE_LAYOUT_CODE = `export type TreeNode = SplitNode | PaneNode

export interface SplitNode {
  type: 'split'
  direction: 'row' | 'column' // 'row' splits horizontally (left/right), 'column' splits vertically (top/bottom)
  splitPercentage: number // Percentage of the first child's size relative to the parent (5 to 95)
  first: TreeNode         // Left/Top child node
  second: TreeNode        // Right/Bottom child node
}

export interface PaneNode {
  type: 'pane'
  id: string              // Unique identifier for the pane
  tabIds: string[]        // List of tab IDs docked inside this pane
  activeTabId: string     // The currently selected tab ID
  locked?: boolean        // Optional lock to disable dragging this specific pane
}`

export const treeLayoutSection: DocSection = {
  id: 'tree-layout',
  title: 'Tree-based Layouts',
  category: 'core',
  content: (
    <div className="space-y-6">
      <DocParagraph>
        React Zeugma models your dashboard layout as a recursive <strong>Binary Tree</strong>. Every
        node in the tree is either a <strong className="text-text-primary">SplitNode</strong> (which
        divides space horizontally or vertically between two children) or a{' '}
        <strong className="text-text-primary">PaneNode</strong> (which acts as a leaf container
        containing active tabs).
      </DocParagraph>

      <BasicSplitDemo />

      <DocCodeBlock code={TREE_LAYOUT_CODE} language="typescript" />

      <DocHeading>Split Node Logic</DocHeading>
      <DocParagraph>
        The <DocCode highlight>direction</DocCode> property determines how children are aligned:
      </DocParagraph>
      <DocList
        items={[
          <>
            <DocCode>row</DocCode>: The resizer handle is vertical. The <DocCode>first</DocCode>{' '}
            child is positioned on the left, and the <DocCode>second</DocCode> is on the right.
          </>,
          <>
            <DocCode>column</DocCode>: The resizer handle is horizontal. The{' '}
            <DocCode>first</DocCode> child is positioned on the top, and the{' '}
            <DocCode>second</DocCode> is on the bottom.
          </>,
        ]}
      />
    </div>
  ),
}
