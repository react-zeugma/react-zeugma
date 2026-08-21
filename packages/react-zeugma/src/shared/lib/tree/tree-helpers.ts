import { TreeNode, SplitNode, SplitDirection, PaneNode, TabDetails } from '../../model'

export function generateUniqueId(): string {
  return 'pane-' + Math.random().toString(36).substring(2, 11)
}

/**
 * Tree Helper: Remove a pane container and consolidate the tree structure.
 */
export function removePane(tree: TreeNode | null, paneId: string): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.id === paneId) return null
    return tree
  }
  const newFirst = removePane(tree.first, paneId)
  const newSecond = removePane(tree.second, paneId)
  if (newFirst === null) return newSecond
  if (newSecond === null) return newFirst
  return { ...tree, first: newFirst, second: newSecond }
}

/**
 * Tree Helper: Remove a tab from a pane and consolidate the tree structure if no tabs remain.
 */
export function removeTab(tree: TreeNode | null, tabId: string): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.tabIds.includes(tabId)) {
      const newTabs = tree.tabIds.filter((t) => t !== tabId)
      if (newTabs.length === 0) return null
      let newActive = tree.activeTabId
      if (tree.activeTabId === tabId) {
        newActive = newTabs[0]
      }
      return {
        ...tree,
        tabIds: newTabs,
        activeTabId: newActive,
      }
    }
    return tree
  }
  const newFirst = removeTab(tree.first, tabId)
  const newSecond = removeTab(tree.second, tabId)
  if (newFirst === null) return newSecond
  if (newSecond === null) return newFirst
  return { ...tree, first: newFirst, second: newSecond }
}

/**
 * Tree Helper: Insert a pane or widget by splitting an existing target node.
 */
export function splitPane(
  tree: TreeNode | null,
  targetId: string,
  direction: SplitDirection,
  splitType: 'left' | 'right' | 'top' | 'bottom',
  paneToAdd: string | PaneNode,
): TreeNode | null {
  if (tree === null) {
    if (typeof paneToAdd === 'string') {
      return { type: 'pane', id: generateUniqueId(), tabIds: [paneToAdd], activeTabId: paneToAdd }
    }
    return paneToAdd
  }
  if (tree.type === 'pane') {
    if (tree.id === targetId) {
      const addedNode: PaneNode =
        typeof paneToAdd === 'string'
          ? { type: 'pane', id: generateUniqueId(), tabIds: [paneToAdd], activeTabId: paneToAdd }
          : paneToAdd
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
 * Helper to insert a leaf node (PaneNode or WidgetNode) into the layout tree.
 */
export function insertLeaf(tree: TreeNode | null, leafNode: PaneNode): TreeNode {
  if (tree === null) {
    return leafNode
  }

  function insert(node: TreeNode, parentDirection: SplitDirection | null): TreeNode {
    if (node.type === 'pane') {
      const direction: SplitDirection = parentDirection === 'row' ? 'column' : 'row'
      return {
        type: 'split',
        direction,
        splitPercentage: 50,
        first: node,
        second: leafNode,
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
 * Tree Helper: Add a tab into a target pane node, or splits/creates a new pane if no target pane ID is provided.
 */
export function addTab(
  tree: TreeNode | null,
  targetPaneId: string | undefined | null,
  tabId: string,
): TreeNode | null {
  if (tree === null) {
    return {
      type: 'pane',
      id: generateUniqueId(),
      tabIds: [tabId],
      activeTabId: tabId,
    }
  }

  const targetPane = targetPaneId ? findPaneById(tree, targetPaneId) : null
  if (targetPane && targetPane.type === 'pane') {
    function appendTabToTarget(node: TreeNode): TreeNode {
      if (node.type === 'pane' && node.id === targetPaneId) {
        const newTabs = [...node.tabIds]
        if (!newTabs.includes(tabId)) {
          newTabs.push(tabId)
        }
        return {
          ...node,
          tabIds: newTabs,
          activeTabId: tabId,
        }
      }
      if (node.type === 'split') {
        return {
          ...node,
          first: appendTabToTarget(node.first),
          second: appendTabToTarget(node.second),
        }
      }
      return node
    }
    return appendTabToTarget(tree)
  }

  const newPane: PaneNode = {
    type: 'pane',
    id: generateUniqueId(),
    tabIds: [tabId],
    activeTabId: tabId,
  }
  return insertLeaf(tree, newPane)
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
    return { ...tree, splitPercentage: newPercentage }
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
 * Find a PaneNode or WidgetNode by its ID.
 */
export function findPaneById(tree: TreeNode | null, paneId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.id === paneId ? tree : null
  }
  if (tree.type === 'split') {
    return findPaneById(tree.first, paneId) ?? findPaneById(tree.second, paneId)
  }
  return null
}

/**
 * Find a PaneNode containing the given tab ID.
 */
export function findPaneContainingTab(tree: TreeNode | null, tabId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.tabIds.includes(tabId) ? tree : null
  }
  if (tree.type === 'split') {
    return findPaneContainingTab(tree.first, tabId) ?? findPaneContainingTab(tree.second, tabId)
  }
  return null
}

/**
 * Find a PaneNode by its own ID, or by a tab ID it contains.
 */
export function findPaneOrContainingTab(tree: TreeNode | null, id: string): PaneNode | null {
  return findPaneById(tree, id) ?? findPaneContainingTab(tree, id)
}

/**
 * Find the details of a tab by its ID.
 */
export function findTabById(tree: TreeNode | null, tabId: string): TabDetails | null {
  const pane = findPaneContainingTab(tree, tabId)
  if (!pane) return null
  const index = pane.tabIds.indexOf(tabId)
  return {
    id: tabId,
    paneId: pane.id,
    isActive: pane.activeTabId === tabId,
    index,
    metadata: undefined,
  }
}

/**
 * Update the locked status on a specific pane or widget node in the layout tree.
 */
export function updatePaneLock(
  tree: TreeNode | null,
  paneId: string,
  locked: boolean,
): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.id === paneId) {
      if (locked === false) {
        const { locked: _, ...rest } = tree
        return rest as PaneNode
      }
      return { ...tree, locked }
    }
    return tree
  }
  if (tree.type === 'split') {
    return {
      ...tree,
      first: updatePaneLock(tree.first, paneId, locked) ?? tree.first,
      second: updatePaneLock(tree.second, paneId, locked) ?? tree.second,
    }
  }
  return tree
}

/**
 * Tree Helper: Activate a tab within a pane.
 */
export function selectTab(tree: TreeNode | null, paneId: string, tabId: string): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.id === paneId) {
      if (tree.activeTabId === tabId) return tree
      return { ...tree, activeTabId: tabId }
    }
    return tree
  }
  if (tree.type === 'split') {
    return {
      ...tree,
      first: selectTab(tree.first, paneId, tabId) ?? tree.first,
      second: selectTab(tree.second, paneId, tabId) ?? tree.second,
    }
  }
  return tree
}

/**
 * Tree Helper: Merge a tab into a target pane node.
 */
export function mergeTab(
  tree: TreeNode | null,
  draggedTabId: string,
  targetPaneId: string,
): TreeNode | null {
  if (tree === null) return null

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return {
      type: 'pane',
      id: generateUniqueId(),
      tabIds: [draggedTabId],
      activeTabId: draggedTabId,
    }
  }

  function insert(node: TreeNode): TreeNode {
    if (node.type === 'pane') {
      if (node.id === targetPaneId) {
        const newTabs = [...node.tabIds]
        if (!newTabs.includes(draggedTabId)) {
          newTabs.push(draggedTabId)
        }
        return {
          ...node,
          tabIds: newTabs,
          activeTabId: draggedTabId,
        }
      }
      return node
    }
    if (node.type === 'split') {
      return {
        ...node,
        first: insert(node.first),
        second: insert(node.second),
      }
    }
    return node
  }

  return insert(cleanTree)
}

export function swapTabs(
  tree: TreeNode | null,
  draggedTabId: string,
  targetTabId: string,
): TreeNode | null {
  if (tree === null) return null
  if (draggedTabId === targetTabId) return tree

  const sourcePane = findPaneContainingTab(tree, draggedTabId)
  const targetPane = findPaneContainingTab(tree, targetTabId)

  if (!sourcePane || !targetPane) return tree

  const sourcePaneId = sourcePane.id
  const targetPaneId = targetPane.id

  function swap(node: TreeNode): TreeNode {
    if (node.type === 'pane') {
      let changed = false
      let newTabIds = [...node.tabIds]
      let newActiveTabId = node.activeTabId

      if (sourcePaneId === targetPaneId) {
        if (node.id === sourcePaneId) {
          const dragIdx = newTabIds.indexOf(draggedTabId)
          const targetIdx = newTabIds.indexOf(targetTabId)
          if (dragIdx !== -1 && targetIdx !== -1) {
            newTabIds[dragIdx] = targetTabId
            newTabIds[targetIdx] = draggedTabId
          }
          newActiveTabId = draggedTabId
          changed = true
        }
      } else {
        if (node.id === sourcePaneId) {
          newTabIds = newTabIds.map((id) => (id === draggedTabId ? targetTabId : id))
          if (newActiveTabId === draggedTabId) {
            newActiveTabId = targetTabId
          }
          changed = true
        }
        if (node.id === targetPaneId) {
          newTabIds = newTabIds.map((id) => (id === targetTabId ? draggedTabId : id))
          if (newActiveTabId === targetTabId) {
            newActiveTabId = draggedTabId
          }
          changed = true
        }
      }

      if (changed) {
        return {
          ...node,
          tabIds: newTabIds,
          activeTabId: newActiveTabId,
        }
      }
      return node
    }
    if (node.type === 'split') {
      return {
        ...node,
        first: swap(node.first),
        second: swap(node.second),
      }
    }
    return node
  }

  return swap(tree)
}

/**
 * Tree Helper: Move/reorder a tab inside or to a target pane next to a target tab.
 */
export function moveTab(
  tree: TreeNode | null,
  draggedTabId: string,
  targetTabId: string,
  position: 'before' | 'after' | 'center' = 'before',
): TreeNode | null {
  if (tree === null) return null
  if (draggedTabId === targetTabId) return tree

  if (position === 'center') {
    return swapTabs(tree, draggedTabId, targetTabId)
  }

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return {
      type: 'pane',
      id: generateUniqueId(),
      tabIds: [draggedTabId],
      activeTabId: draggedTabId,
    }
  }

  function insert(node: TreeNode): TreeNode {
    if (node.type === 'pane') {
      if (node.tabIds.includes(targetTabId)) {
        const newTabs = [...node.tabIds]
        const filteredTabs = newTabs.filter((t) => t !== draggedTabId)
        let insertIndex = filteredTabs.indexOf(targetTabId)
        if (insertIndex < 0) {
          insertIndex = 0
        }
        if (position === 'after') {
          insertIndex += 1
        }
        filteredTabs.splice(insertIndex, 0, draggedTabId)

        return {
          ...node,
          tabIds: filteredTabs,
          activeTabId: draggedTabId,
        }
      }
      return node
    }
    if (node.type === 'split') {
      return {
        ...node,
        first: insert(node.first),
        second: insert(node.second),
      }
    }
    return node
  }

  return insert(cleanTree)
}

export interface ComputedPane {
  paneId: string
  left: number
  top: number
  width: number
  height: number
  node: PaneNode
}

export interface ComputedSplitter {
  id: string
  currentNode: SplitNode
  direction: SplitDirection
  left: number
  top: number
  width: number
  height: number
  parentLeft: number
  parentTop: number
  parentWidth: number
  parentHeight: number
}

export function computeLayout(
  node: TreeNode | null,
  left = 0,
  top = 0,
  width = 100,
  height = 100,
  path = 'root',
): { panes: ComputedPane[]; splitters: ComputedSplitter[] } {
  if (node === null) return { panes: [], splitters: [] }
  if (node.type === 'pane') {
    return {
      panes: [{ paneId: node.id, left, top, width, height, node }],
      splitters: [],
    }
  }

  const { direction, splitPercentage, first, second } = node
  const splitterId = `splitter-${path}-${direction}`

  const currentSplitter: ComputedSplitter = {
    id: splitterId,
    currentNode: node,
    direction,
    left: direction === 'row' ? left + width * (splitPercentage / 100) : left,
    top: direction === 'column' ? top + height * (splitPercentage / 100) : top,
    width: direction === 'row' ? 0 : width,
    height: direction === 'column' ? 0 : height,
    parentLeft: left,
    parentTop: top,
    parentWidth: width,
    parentHeight: height,
  }

  let firstLayout = { panes: [] as ComputedPane[], splitters: [] as ComputedSplitter[] }
  let secondLayout = { panes: [] as ComputedPane[], splitters: [] as ComputedSplitter[] }

  if (direction === 'row') {
    const firstWidth = width * (splitPercentage / 100)
    firstLayout = computeLayout(first, left, top, firstWidth, height, `${path}-L`)
    secondLayout = computeLayout(
      second,
      left + firstWidth,
      top,
      width - firstWidth,
      height,
      `${path}-R`,
    )
  } else {
    const firstHeight = height * (splitPercentage / 100)
    firstLayout = computeLayout(first, left, top, width, firstHeight, `${path}-T`)
    secondLayout = computeLayout(
      second,
      left,
      top + firstHeight,
      width,
      height - firstHeight,
      `${path}-B`,
    )
  }

  return {
    panes: [...firstLayout.panes, ...secondLayout.panes],
    splitters: [currentSplitter, ...firstLayout.splitters, ...secondLayout.splitters],
  }
}

/**
 * Tree Helper: Move/insert all tabs of a dragged pane next to a target tab in another pane.
 */
export function movePaneTabs(
  tree: TreeNode | null,
  draggedPaneId: string,
  targetTabId: string,
  position: 'before' | 'after' = 'before',
): TreeNode | null {
  if (tree === null) return null

  // 1. Find the dragged pane to get its tabs and activeTabId
  const sourcePane = findPaneById(tree, draggedPaneId)
  if (!sourcePane) return tree

  const draggedTabIds = sourcePane.tabIds
  const draggedActiveTabId = sourcePane.activeTabId

  // 2. Remove the dragged pane from the layout tree
  const cleanTree = removePane(tree, draggedPaneId)
  if (cleanTree === null) {
    return sourcePane
  }

  // 3. Insert the dragged pane's tabs into the target pane next to targetTabId
  function insert(node: TreeNode): TreeNode {
    if (node.type === 'pane') {
      if (node.tabIds.includes(targetTabId)) {
        const newTabs = [...node.tabIds]
        // Filter out any of the dragged tabs if they somehow already existed
        const filteredTabs = newTabs.filter((t) => !draggedTabIds.includes(t))
        let insertIndex = filteredTabs.indexOf(targetTabId)
        if (insertIndex < 0) {
          insertIndex = 0
        }
        if (position === 'after') {
          insertIndex += 1
        }
        filteredTabs.splice(insertIndex, 0, ...draggedTabIds)

        return {
          ...node,
          tabIds: filteredTabs,
          activeTabId: draggedActiveTabId,
        }
      }
      return node
    }
    if (node.type === 'split') {
      return {
        ...node,
        first: insert(node.first),
        second: insert(node.second),
      }
    }
    return node
  }

  return insert(cleanTree)
}

/**
 * Calculates the target drop insertion index in a list of tabs during a drag.
 * Returns -1 if the drop target is not in the list.
 */
export function calculateTabDropIndex(
  tabIds: string[],
  activeType: string | null,
  overTabId: string | null,
  overTabPosition: 'before' | 'after' | null,
): number {
  const isDraggingTabOrPane = activeType === 'tab' || activeType === 'pane'
  const isHoveredTabInThisPane = isDraggingTabOrPane && overTabId && tabIds.includes(overTabId)
  if (!isHoveredTabInThisPane || !overTabPosition) {
    return -1
  }
  const index = tabIds.indexOf(overTabId)
  return overTabPosition === 'before' ? index : index + 1
}
