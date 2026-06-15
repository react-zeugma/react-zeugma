import { TreeNode, SplitNode, SplitDirection, PaneNode } from '../../model'

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
    if (tree.tabs.includes(tabId)) {
      const newTabs = tree.tabs.filter((t) => t !== tabId)
      if (newTabs.length === 0) return null
      let newActive = tree.activeTabId
      if (tree.activeTabId === tabId) {
        newActive = newTabs[0]
      }
      const newTabsMetadata = { ...tree.tabsMetadata }
      delete newTabsMetadata[tabId]
      return {
        ...tree,
        tabs: newTabs,
        activeTabId: newActive,
        tabsMetadata: Object.keys(newTabsMetadata).length > 0 ? newTabsMetadata : undefined,
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
    if (typeof paneToAdd === 'string') {
      return { type: 'pane', id: generateUniqueId(), tabs: [paneToAdd], activeTabId: paneToAdd }
    }
    return paneToAdd
  }
  if (tree.type === 'pane') {
    if (tree.id === targetId) {
      const addedNode: PaneNode =
        typeof paneToAdd === 'string'
          ? { type: 'pane', id: generateUniqueId(), tabs: [paneToAdd], activeTabId: paneToAdd }
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
 * Tree Helper: Add a pane by recursively splitting the rightmost/bottommost pane in the tree.
 */
export function addPane(tree: TreeNode | null, paneToAdd: string): TreeNode {
  if (tree === null) {
    return { type: 'pane', id: generateUniqueId(), tabs: [paneToAdd], activeTabId: paneToAdd }
  }

  function insert(node: TreeNode, parentDirection: SplitDirection | null): TreeNode {
    if (node.type === 'pane') {
      const direction: SplitDirection = parentDirection === 'row' ? 'column' : 'row'
      return {
        type: 'split',
        direction,
        splitPercentage: 50,
        first: node,
        second: { type: 'pane', id: generateUniqueId(), tabs: [paneToAdd], activeTabId: paneToAdd },
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
 * Find a PaneNode by its ID.
 */
export function findPaneById(tree: TreeNode | null, paneId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.id === paneId ? tree : null
  }
  return findPaneById(tree.first, paneId) ?? findPaneById(tree.second, paneId)
}

/**
 * Find a PaneNode containing the given tab ID.
 */
export function findPaneContainingTab(tree: TreeNode | null, tabId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.tabs.includes(tabId) ? tree : null
  }
  return findPaneContainingTab(tree.first, tabId) ?? findPaneContainingTab(tree.second, tabId)
}

/**
 * Update metadata on a specific tab node using an updater function.
 */
export function updateTabMetadata(
  tree: TreeNode | null,
  tabId: string,
  updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.tabs.includes(tabId)) {
      const currentTabsMetadata = tree.tabsMetadata || {}
      const currentTabMeta = currentTabsMetadata[tabId]
      const newTabMeta = updater(currentTabMeta)

      const newTabsMetadata = { ...currentTabsMetadata }
      if (newTabMeta === undefined) {
        delete newTabsMetadata[tabId]
      } else {
        newTabsMetadata[tabId] = newTabMeta
      }

      return {
        ...tree,
        tabsMetadata: Object.keys(newTabsMetadata).length > 0 ? newTabsMetadata : undefined,
      }
    }
    return tree
  }
  return {
    ...tree,
    first: updateTabMetadata(tree.first, tabId, updater) ?? tree.first,
    second: updateTabMetadata(tree.second, tabId, updater) ?? tree.second,
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
    if (tree.id === paneId) {
      if (locked === false) {
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

/**
 * Tree Helper: Activate a tab within a pane.
 */
export function selectTab(tree: TreeNode | null, paneId: string, tabId: string): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    if (tree.id === paneId) {
      return { ...tree, activeTabId: tabId }
    }
    return tree
  }
  return {
    ...tree,
    first: selectTab(tree.first, paneId, tabId) ?? tree.first,
    second: selectTab(tree.second, paneId, tabId) ?? tree.second,
  }
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

  const sourcePane = findPaneContainingTab(tree, draggedTabId)
  const sourceMetadata = sourcePane?.tabsMetadata?.[draggedTabId]

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return {
      type: 'pane',
      id: generateUniqueId(),
      tabs: [draggedTabId],
      activeTabId: draggedTabId,
      tabsMetadata: sourceMetadata ? { [draggedTabId]: sourceMetadata } : undefined,
    }
  }

  function insert(node: TreeNode): TreeNode {
    if (node.type === 'pane') {
      if (node.id === targetPaneId) {
        const newTabs = [...node.tabs]
        if (!newTabs.includes(draggedTabId)) {
          newTabs.push(draggedTabId)
        }
        const newTabsMetadata = { ...node.tabsMetadata }
        if (sourceMetadata) {
          newTabsMetadata[draggedTabId] = sourceMetadata
        }
        return {
          ...node,
          tabs: newTabs,
          activeTabId: draggedTabId,
          tabsMetadata: Object.keys(newTabsMetadata).length > 0 ? newTabsMetadata : undefined,
        }
      }
      return node
    }
    return {
      ...node,
      first: insert(node.first),
      second: insert(node.second),
    }
  }

  return insert(cleanTree)
}

/**
 * Tree Helper: Move/reorder a tab inside or to a target pane next to a target tab.
 */
export function moveTab(
  tree: TreeNode | null,
  draggedTabId: string,
  targetTabId: string,
  position: 'before' | 'after' = 'before',
): TreeNode | null {
  if (tree === null) return null

  const sourcePane = findPaneContainingTab(tree, draggedTabId)
  const sourceMetadata = sourcePane?.tabsMetadata?.[draggedTabId]

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return {
      type: 'pane',
      id: generateUniqueId(),
      tabs: [draggedTabId],
      activeTabId: draggedTabId,
      tabsMetadata: sourceMetadata ? { [draggedTabId]: sourceMetadata } : undefined,
    }
  }

  function insert(node: TreeNode): TreeNode {
    if (node.type === 'pane') {
      if (node.tabs.includes(targetTabId)) {
        const newTabs = [...node.tabs]
        const filteredTabs = newTabs.filter((t) => t !== draggedTabId)
        let insertIndex = filteredTabs.indexOf(targetTabId)
        if (insertIndex < 0) {
          insertIndex = 0
        }
        if (position === 'after') {
          insertIndex += 1
        }
        filteredTabs.splice(insertIndex, 0, draggedTabId)

        const newTabsMetadata = { ...node.tabsMetadata }
        if (sourceMetadata) {
          newTabsMetadata[draggedTabId] = sourceMetadata
        }
        return {
          ...node,
          tabs: filteredTabs,
          activeTabId: draggedTabId,
          tabsMetadata: Object.keys(newTabsMetadata).length > 0 ? newTabsMetadata : undefined,
        }
      }
      return node
    }
    return {
      ...node,
      first: insert(node.first),
      second: insert(node.second),
    }
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
