import { useState, useRef, useEffect, useCallback } from 'react'
import { TreeNode, SplitDirection, SplitNode } from '../../../shared/model'
import { UseZeugmaOptions, ZeugmaController } from './types'
import { DEFAULT_DRAG_ACTIVATION_DISTANCE, DEFAULT_SNAP_THRESHOLD } from '../../../shared/config'
import {
  removePane,
  addPane,
  splitPane,
  updateSplitPercentage,
  updateTabMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  removeTab,
  findPane,
} from '../../../shared/lib/tree'

export function useZeugma(options: UseZeugmaOptions): ZeugmaController {
  const {
    initialLayout,
    onChange,
    fullscreenPaneId: controlledFullscreenPaneId,
    onFullscreenChange,
    locked: initialLocked = false,
    dragActivationDistance = DEFAULT_DRAG_ACTIVATION_DISTANCE,
    snapThreshold = DEFAULT_SNAP_THRESHOLD,
    minSplitPercentage = 5,
    maxSplitPercentage = 95,
    enableDragToDismiss = false,
    dismissThreshold = 60,
    onRemove,
    onDragStart,
    onDragEnd,
    onResizeStart,
    onResize,
    onResizeEnd,
    onDismissIntentChange,
  } = options

  const [layout, setLayout] = useState<TreeNode | null>(initialLayout)
  const [fullscreenPaneId, setLocalFullscreenPaneId] = useState<string | null>(
    controlledFullscreenPaneId || null,
  )
  const [locked, setLocked] = useState(initialLocked)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'pane' | 'tab' | null>(null)
  const [dismissIntentId, setDismissIntentId] = useState<string | null>(null)

  const containerRef = useRef<HTMLElement | null>(null)

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element
  }, [])

  const setFullscreenPaneId = useCallback(
    (paneId: string | null) => {
      setLocalFullscreenPaneId(paneId)
      onFullscreenChange?.(paneId)
    },
    [onFullscreenChange],
  )

  // Sync state if options change
  useEffect(() => {
    setLocked(initialLocked)
  }, [initialLocked])

  useEffect(() => {
    if (controlledFullscreenPaneId !== undefined) {
      setLocalFullscreenPaneId(controlledFullscreenPaneId)
    }
  }, [controlledFullscreenPaneId])

  // Trigger onChange when layout state changes
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onChange?.(layout)
  }, [layout, onChange])

  // Layout Modification Actions using functional updates to remain stable
  const handleRemovePane = useCallback((paneId: string) => {
    setLayout((prev) => removePane(prev, paneId))
  }, [])

  const handleAddPane = useCallback((paneId: string) => {
    setLayout((prev) => addPane(prev, paneId))
  }, [])

  const handleSplitPane = useCallback(
    (
      targetId: string,
      direction: SplitDirection,
      splitType: 'left' | 'right' | 'top' | 'bottom',
      paneToAdd: string,
    ) => {
      setLayout((prev) => {
        const draggedPaneNode = findPane(prev, paneToAdd) ?? {
          type: 'pane',
          id: paneToAdd,
          tabs: [paneToAdd],
          activeTabId: paneToAdd,
        }
        const treeWithoutDragging = removePane(prev, paneToAdd)
        return splitPane(treeWithoutDragging, targetId, direction, splitType, draggedPaneNode)
      })
    },
    [],
  )

  const handleUpdateSplitPercentage = useCallback((currentNode: SplitNode, percentage: number) => {
    setLayout((prev) => updateSplitPercentage(prev, currentNode, percentage))
  }, [])

  const handleUpdateTabMetadata = useCallback(
    (
      tabId: string,
      updater: (
        current: Record<string, unknown> | undefined,
      ) => Record<string, unknown> | undefined,
    ) => {
      setLayout((prev) => updateTabMetadata(prev, tabId, updater))
    },
    [],
  )

  const handleUpdatePaneLock = useCallback((paneId: string, isLocked: boolean) => {
    setLayout((prev) => updatePaneLock(prev, paneId, isLocked))
  }, [])

  const handleSelectTab = useCallback((paneId: string, tabId: string) => {
    setLayout((prev) => selectTab(prev, paneId, tabId))
  }, [])

  const handleMergeTab = useCallback((draggedTabId: string, targetPaneId: string) => {
    setLayout((prev) => mergeTab(prev, draggedTabId, targetPaneId))
  }, [])

  const handleMoveTab = useCallback(
    (draggedTabId: string, targetTabId: string, position?: 'before' | 'after') => {
      setLayout((prev) => moveTab(prev, draggedTabId, targetTabId, position))
    },
    [],
  )

  const handleRemoveTab = useCallback((tabId: string) => {
    setLayout((prev) => removeTab(prev, tabId))
  }, [])

  return {
    layout,
    setLayout,
    fullscreenPaneId,
    setFullscreenPaneId,
    locked,
    setLocked,
    activeId,
    setActiveId,
    activeType,
    setActiveType,
    dismissIntentId,
    setDismissIntentId,
    containerRef,
    setContainerRef,

    // Config options
    dragActivationDistance,
    snapThreshold,
    minSplitPercentage,
    maxSplitPercentage,
    enableDragToDismiss,
    dismissThreshold,

    // Callbacks
    onRemove,
    onDragStart,
    onDragEnd,
    onResizeStart,
    onResize,
    onResizeEnd,
    onDismissIntentChange,

    // Actions
    removePane: handleRemovePane,
    addPane: handleAddPane,
    splitPane: handleSplitPane,
    updateSplitPercentage: handleUpdateSplitPercentage,
    updateTabMetadata: handleUpdateTabMetadata,
    updatePaneLock: handleUpdatePaneLock,
    selectTab: handleSelectTab,
    mergeTab: handleMergeTab,
    moveTab: handleMoveTab,
    removeTab: handleRemoveTab,
  }
}
