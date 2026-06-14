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
  const nodeA = findPane(tree, idA)
  const nodeB = findPane(tree, idB)
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
 * Find a PaneNode by its paneId.
 */
export function findPane(tree: TreeNode | null, paneId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.paneId === paneId ? tree : null
  }
  return findPane(tree.first, paneId) ?? findPane(tree.second, paneId)
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

/**
 * Update the locked status on a specific pane node in the layout tree.
 */
export function updatePaneLock(
  tree: TreeNode | null,
  paneId: string,
  locked: boolean,
): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.paneId === paneId) {
      if (locked === false) {
        // If false, we can delete the key or keep it. Let's delete it if false or just set it
        const { locked: _, ...rest } = tree
        return rest as PaneNode
      }
      return { ...tree, locked }
    }
    return tree
  }
  return {
    ...tree,
    first: updatePaneLock(tree.first, paneId, locked) ?? tree.first,
    second: updatePaneLock(tree.second, paneId, locked) ?? tree.second,
  }
}
