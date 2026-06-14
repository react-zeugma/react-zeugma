export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number
}

export interface PaneNode {
  type: 'pane'
  paneId: string
  locked?: boolean
  metadata?: Record<string, unknown>
}

export type TreeNode = SplitNode | PaneNode
