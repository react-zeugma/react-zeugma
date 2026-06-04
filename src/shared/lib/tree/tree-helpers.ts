import { TreeNode, SplitNode, SplitDirection, PaneNode } from '../../model'

/**
 * Tree Helper: Remove a pane and consolidate the tree structure.
 */
export function removePane(tree: TreeNode | null, idToRemove: string): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.paneId === idToRemove ? null : tree
  }
  const newFirst = removePane(tree.first, idToRemove)
  const newSecond = removePane(tree.second, idToRemove)
  if (newFirst === null) return newSecond
  if (newSecond === null) return newFirst
  return { ...tree, first: newFirst, second: newSecond }
}

/**
 * Tree Helper: Insert a pane by splitting an existing target node.
 */
export function splitPane(
  tree: TreeNode | null,
  targetId: string,
  direction: SplitDirection,
  splitType: 'left' | 'right' | 'top' | 'bottom',
  paneToAdd: string | PaneNode,
): TreeNode | null {
  if (tree === null) {
    return typeof paneToAdd === 'string' ? { type: 'pane', paneId: paneToAdd } : paneToAdd
  }
  if (tree.type === 'pane') {
    if (tree.paneId === targetId) {
      const addedNode: PaneNode =
        typeof paneToAdd === 'string' ? { type: 'pane', paneId: paneToAdd } : paneToAdd
      const isFirst = splitType === 'left' || splitType === 'top'
      return {
        type: 'split',
        direction,
        first: isFirst ? addedNode : tree,
        second: isFirst ? tree : addedNode,
        splitPercentage: 50,
      }
    }
    return tree
  }
  return {
    ...tree,
    first: splitPane(tree.first, targetId, direction, splitType, paneToAdd) || tree.first,
    second: splitPane(tree.second, targetId, direction, splitType, paneToAdd) || tree.second,
  }
}

/**
 * Tree Helper: Swap the position of two panes in the tree structure.
 */
export function swapPanes(tree: TreeNode | null, idA: string, idB: string): TreeNode | null {
  if (tree === null) return null

  // First pass: collect the full PaneNode references
  const nodeA = findPaneNode(tree, idA)
  const nodeB = findPaneNode(tree, idB)
  if (!nodeA || !nodeB) return tree

  // Second pass: replace each location with the other node
  function swap(node: TreeNode): TreeNode {
    if (node.type === 'pane') {
      if (node.paneId === idA) return { ...nodeB! }
      if (node.paneId === idB) return { ...nodeA! }
      return node
    }
    return {
      ...node,
      first: swap(node.first),
      second: swap(node.second),
    }
  }

  return swap(tree)
}

/**
 * Tree Helper: Add a pane by recursively splitting the rightmost/bottommost pane in the tree.
 */
export function addPane(tree: TreeNode | null, paneToAdd: string): TreeNode {
  if (tree === null) {
    return { type: 'pane', paneId: paneToAdd }
  }

  function insert(node: TreeNode, parentDirection: SplitDirection | null): TreeNode {
    if (node.type === 'pane') {
      const direction: SplitDirection = parentDirection === 'row' ? 'column' : 'row'
      return {
        type: 'split',
        direction,
        splitPercentage: 50,
        first: node,
        second: { type: 'pane', paneId: paneToAdd },
      }
    }

    return {
      ...node,
      second: insert(node.second, node.direction),
    }
  }

  return insert(tree, null)
}

/**
 * Tree Helper: Update split percentage recursively.
 */
export function updateSplitPercentage(
  tree: TreeNode | null,
  target: SplitNode,
  newPercentage: number,
): TreeNode | null {
  if (tree === null) return null
  if (tree === target) {
    return { ...tree, splitPercentage: newPercentage } as SplitNode
  }
  if (tree.type === 'split') {
    return {
      ...tree,
      first: updateSplitPercentage(tree.first, target, newPercentage) || tree.first,
      second: updateSplitPercentage(tree.second, target, newPercentage) || tree.second,
    }
  }
  return tree
}

/**
 * Tree Helper: Split the entire tree at the root using a dragged pane.
 */
export function splitRoot(
  tree: TreeNode | null,
  draggingId: string,
  splitType: 'left' | 'right' | 'top' | 'bottom',
): TreeNode | null {
  // Preserve dragged pane's metadata
  const draggedPaneNode: PaneNode = findPaneNode(tree, draggingId) ?? {
    type: 'pane',
    paneId: draggingId,
  }
  const treeWithoutDragging = removePane(tree, draggingId)
  if (treeWithoutDragging === null) {
    return { ...draggedPaneNode }
  }

  const direction: SplitDirection = splitType === 'left' || splitType === 'right' ? 'row' : 'column'
  const isFirst = splitType === 'left' || splitType === 'top'
  const draggedNode: TreeNode = { ...draggedPaneNode }

  return {
    type: 'split',
    direction,
    first: isFirst ? draggedNode : treeWithoutDragging,
    second: isFirst ? treeWithoutDragging : draggedNode,
    splitPercentage: 50,
  }
}

/**
 * Find a PaneNode by its paneId.
 */
export function findPaneNode(tree: TreeNode | null, paneId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.paneId === paneId ? tree : null
  }
  return findPaneNode(tree.first, paneId) ?? findPaneNode(tree.second, paneId)
}

/**
 * Update metadata on a specific pane node using an updater function.
 */
export function updatePaneMetadata(
  tree: TreeNode | null,
  paneId: string,
  updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.paneId === paneId) {
      const newMetadata = updater(tree.metadata)
      if (newMetadata === undefined) {
        // Remove metadata key
        const { metadata: _, ...rest } = tree
        return rest as PaneNode
      }
      return { ...tree, metadata: newMetadata }
    }
    return tree
  }
  return {
    ...tree,
    first: updatePaneMetadata(tree.first, paneId, updater) ?? tree.first,
    second: updatePaneMetadata(tree.second, paneId, updater) ?? tree.second,
  }
}
