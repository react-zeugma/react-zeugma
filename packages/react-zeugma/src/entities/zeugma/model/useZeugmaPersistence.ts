import { useEffect, useState, SetStateAction } from 'react'
import { TreeNode, ZeugmaPersistOptions } from '../../../shared'

export interface UseZeugmaPersistenceProps {
  persist?: boolean | ZeugmaPersistOptions
  layout: TreeNode | null
  setLayout: (nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => void
}

export function isValidTreeNode(node: unknown): node is TreeNode {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const candidate = node as Record<string, unknown>

  if (candidate.type === 'pane') {
    return (
      typeof candidate.id === 'string' &&
      Array.isArray(candidate.tabIds) &&
      candidate.tabIds.every((id) => typeof id === 'string') &&
      typeof candidate.activeTabId === 'string'
    )
  }

  if (candidate.type === 'split') {
    return (
      (candidate.direction === 'row' || candidate.direction === 'column') &&
      typeof candidate.splitPercentage === 'number' &&
      isValidTreeNode(candidate.first) &&
      isValidTreeNode(candidate.second)
    )
  }

  return false
}

export function useZeugmaPersistence({ persist, layout, setLayout }: UseZeugmaPersistenceProps) {
  const isEnabled = typeof persist === 'object' ? persist.enabled !== false : !!persist
  const persistKey = (typeof persist === 'object' && persist.key) || 'zeugma-layout'

  const [isLoaded, setIsLoaded] = useState(false)

  // Load layout from localStorage on mount if persist is enabled
  useEffect(() => {
    if (isEnabled) {
      try {
        const saved = localStorage.getItem(persistKey)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (isValidTreeNode(parsed)) {
            setLayout(parsed)
          }
        }
      } catch (e) {
        console.error('Failed to parse persisted zeugma layout', e)
      }
    }
    setIsLoaded(true)
  }, [isEnabled, persistKey, setLayout])

  // Save layout to localStorage when layout changes if persist is enabled
  useEffect(() => {
    if (isEnabled && isLoaded) {
      try {
        if (layout) {
          localStorage.setItem(persistKey, JSON.stringify(layout))
        } else {
          localStorage.removeItem(persistKey)
        }
      } catch (e) {
        console.error('Failed to save persisted zeugma layout', e)
      }
    }
  }, [isEnabled, persistKey, layout, isLoaded])
}
