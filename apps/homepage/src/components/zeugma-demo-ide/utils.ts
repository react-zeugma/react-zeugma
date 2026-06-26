import { TreeNode } from 'react-zeugma'

export function isTabOpenInTree(node: TreeNode | null, tabId: string): boolean {
  if (!node) return false
  if (node.type === 'pane') return node.tabIds.includes(tabId)
  return isTabOpenInTree(node.first, tabId) || isTabOpenInTree(node.second, tabId)
}

export function findActiveEditorPane(node: TreeNode | null): string | null {
  if (!node) return null
  if (node.type === 'pane') {
    if (
      node.id !== 'pane-explorer' &&
      node.id !== 'pane-terminal' &&
      node.id !== 'pane-performance' &&
      node.id !== 'pane-inspector'
    )
      return node.id
    return null
  }
  return findActiveEditorPane(node.first) || findActiveEditorPane(node.second)
}
