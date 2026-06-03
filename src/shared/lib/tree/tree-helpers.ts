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
  paneToAdd: string,
): TreeNode | null {
  if (tree === null) return { type: 'pane', paneId: paneToAdd }
  if (tree.type === 'pane') {
    if (tree.paneId === targetId) {
      const addedNode: PaneNode = { type: 'pane', paneId: paneToAdd }
      const originalNode: PaneNode = { type: 'pane', paneId: targetId }
      const isFirst = splitType === 'left' || splitType === 'top'
      return {
        type: 'split',
        direction,
        first: isFirst ? addedNode : originalNode,
        second: isFirst ? originalNode : addedNode,
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
  if (tree.type === 'pane') {
    if (tree.paneId === idA) return { ...tree, paneId: idB }
    if (tree.paneId === idB) return { ...tree, paneId: idA }
    return tree
  }
  return {
    ...tree,
    first: swapPanes(tree.first, idA, idB) || tree.first,
    second: swapPanes(tree.second, idA, idB) || tree.second,
  }
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
