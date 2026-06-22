import { useState, useRef, useEffect, useCallback, SetStateAction } from 'react'
import {
  TreeNode,
  SplitDirection,
  SplitNode,
  UseZeugmaOptions,
  ZeugmaController,
  ZeugmaControllerInternal,
} from '../../../shared'
import {
  removePane,
  addTab,
  splitPane,
  updateSplitPercentage,
  updateMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  removeTab,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  getTabMetadata,
  getActiveTabMetadata,
} from '../../../shared/lib/tree'
import { safeJsonStringify } from '../../../shared/lib/json'

export function useZeugma(options: UseZeugmaOptions): ZeugmaController {
  const {
    initialLayout,
    layout: controlledLayout,
    onChange,
    fullscreenPaneId: controlledFullscreenPaneId,
    onFullscreenChange,
    locked: initialLocked = false,
  } = options

  const [layout, setLocalLayout] = useState<TreeNode | null>(() => {
    return controlledLayout !== undefined ? controlledLayout : (initialLayout ?? null)
  })
  const [prevControlledLayoutJson, setPrevControlledLayoutJson] = useState<string>(() => {
    return safeJsonStringify(controlledLayout !== undefined ? controlledLayout : null)
  })
  const [fullscreenPaneId, setLocalFullscreenPaneId] = useState<string | null>(
    controlledFullscreenPaneId || null,
  )
  const [locked, setLocked] = useState(initialLocked)
  const [layoutBeforeDrag, setLayoutBeforeDrag] = useState<TreeNode | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'pane' | 'tab' | null>(null)
  const [dismissIntentId, setDismissIntentId] = useState<string | null>(null)

  const containerRef = useRef<HTMLElement | null>(null)

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element
  }, [])

  // Keep layout and callback refs in sync to make actions and queries completely stable
  const layoutRef = useRef<TreeNode | null>(layout)
  layoutRef.current = layout

  const layoutBeforeDragRef = useRef<TreeNode | null>(layoutBeforeDrag)
  layoutBeforeDragRef.current = layoutBeforeDrag

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const onFullscreenChangeRef = useRef(onFullscreenChange)
  onFullscreenChangeRef.current = onFullscreenChange

  const setFullscreenPaneId = useCallback((paneId: string | null) => {
    setLocalFullscreenPaneId(paneId)
    onFullscreenChangeRef.current?.(paneId)
  }, [])

  // Sync state if options change
  useEffect(() => {
    setLocked(initialLocked)
  }, [initialLocked])

  useEffect(() => {
    if (controlledFullscreenPaneId !== undefined) {
      setLocalFullscreenPaneId(controlledFullscreenPaneId)
    }
  }, [controlledFullscreenPaneId])

  // Sync state if controlled layout changes from outside during render
  if (controlledLayout !== undefined) {
    const currentControlledLayoutJson = safeJsonStringify(controlledLayout)
    if (currentControlledLayoutJson !== prevControlledLayoutJson) {
      setPrevControlledLayoutJson(currentControlledLayoutJson)
      setLocalLayout(controlledLayout)
    }
  }

  // A wrapper that computes the layout mutation, updates state, and triggers onChange
  const wrapMutation = useCallback(
    <Args extends unknown[]>(
      mutationFn: (current: TreeNode | null, ...args: Args) => TreeNode | null,
    ) => {
      return (...args: Args) => {
        const prev = layoutRef.current
        const next = mutationFn(prev, ...args)

        if (safeJsonStringify(prev) !== safeJsonStringify(next)) {
          layoutRef.current = next
          setLocalLayout(next)
          onChangeRef.current?.(next)
        }
      }
    },
    [],
  )

  const handleSetLayout = useCallback(
    wrapMutation((prev, nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
      return typeof nextLayoutOrUpdater === 'function'
        ? (nextLayoutOrUpdater as (prev: TreeNode | null) => TreeNode | null)(prev)
        : nextLayoutOrUpdater
    }),
    [wrapMutation],
  )

  // Internal setter used by DnD — does NOT reset transient states
  const _internalSetLayout = handleSetLayout

  // Public setter — resets transient states when layout is replaced programmatically
  const setLayout = useCallback(
    (nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
      setLocalFullscreenPaneId(null)
      onFullscreenChangeRef.current?.(null)
      setLayoutBeforeDrag(null)
      setActiveId(null)
      setActiveType(null)
      setDismissIntentId(null)
      handleSetLayout(nextLayoutOrUpdater)
    },
    [handleSetLayout],
  )

  // Layout Modification Actions using wrapped mutation functions
  const handleRemovePane = useCallback(
    wrapMutation((prev, paneId: string) => removePane(prev, paneId)),
    [wrapMutation],
  )

  const handleAddTab = useCallback(
    wrapMutation(
      (prev, tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => {
        const cleanedPrev = removeTab(prev, tabId) ?? prev
        return addTab(cleanedPrev, targetPaneId, tabId, metadata)
      },
    ),
    [wrapMutation],
  )

  const handleSplitPane = useCallback(
    wrapMutation(
      (
        prev,
        targetId: string,
        direction: SplitDirection,
        splitType: 'left' | 'right' | 'top' | 'bottom',
        paneToAdd: string,
      ) => {
        const targetPane = findPaneById(prev, targetId) ?? findPaneContainingTab(prev, targetId)
        if (!targetPane) return prev

        const draggedPaneNode = findPaneById(prev, paneToAdd) ??
          findPaneContainingTab(prev, paneToAdd) ?? {
            type: 'pane',
            id: paneToAdd,
            tabs: [paneToAdd],
            activeTabId: paneToAdd,
          }
        const treeWithoutDragging = removePane(prev, paneToAdd)
        return splitPane(treeWithoutDragging, targetPane.id, direction, splitType, draggedPaneNode)
      },
    ),
    [wrapMutation],
  )

  const handleUpdateSplitPercentage = useCallback(
    wrapMutation((prev, currentNode: SplitNode, percentage: number) =>
      updateSplitPercentage(prev, currentNode, percentage),
    ),
    [wrapMutation],
  )

  const handleUpdateMetadata = useCallback(
    wrapMutation(
      (
        prev,
        id: string,
        updater: (
          current: Record<string, unknown> | undefined,
        ) => Record<string, unknown> | undefined,
      ) => updateMetadata(prev, id, updater),
    ),
    [wrapMutation],
  )

  const handleUpdatePaneLock = useCallback(
    wrapMutation((prev, paneId: string, isLocked: boolean) => {
      const targetPane = findPaneById(prev, paneId) ?? findPaneContainingTab(prev, paneId)
      if (!targetPane) return prev
      return updatePaneLock(prev, targetPane.id, isLocked)
    }),
    [wrapMutation],
  )

  const handleSelectTab = useCallback(
    wrapMutation((prev, paneId: string, tabId: string) => {
      const targetPane = findPaneById(prev, paneId) ?? findPaneContainingTab(prev, paneId)
      if (!targetPane) return prev
      return selectTab(prev, targetPane.id, tabId)
    }),
    [wrapMutation],
  )

  const handleMergeTab = useCallback(
    wrapMutation((prev, draggedTabId: string, targetPaneId: string) => {
      const targetPane =
        findPaneById(prev, targetPaneId) ?? findPaneContainingTab(prev, targetPaneId)
      if (!targetPane) return prev
      return mergeTab(prev, draggedTabId, targetPane.id)
    }),
    [wrapMutation],
  )

  const handleMoveTab = useCallback(
    wrapMutation((prev, draggedTabId: string, targetTabId: string, position?: 'before' | 'after') =>
      moveTab(prev, draggedTabId, targetTabId, position),
    ),
    [wrapMutation],
  )

  const handleRemoveTab = useCallback(
    wrapMutation((prev, tabId: string) => removeTab(prev, tabId)),
    [wrapMutation],
  )

  const handleFindPaneById = useCallback((paneId: string) => {
    let pane = findPaneById(layoutRef.current, paneId)
    if (!pane && layoutBeforeDragRef.current) {
      pane = findPaneById(layoutBeforeDragRef.current, paneId)
    }
    return pane
  }, [])

  const handleFindPaneContainingTab = useCallback((tabId: string) => {
    let pane = findPaneContainingTab(layoutRef.current, tabId)
    if (!pane && layoutBeforeDragRef.current) {
      pane = findPaneContainingTab(layoutBeforeDragRef.current, tabId)
    }
    return pane
  }, [])

  const handleFindTabById = useCallback((tabId: string) => {
    let tab = findTabById(layoutRef.current, tabId)
    if (!tab && layoutBeforeDragRef.current) {
      tab = findTabById(layoutBeforeDragRef.current, tabId)
    }
    return tab
  }, [])

  const handleGetTabMetadata = useCallback((tabId: string) => {
    let metadata = getTabMetadata(layoutRef.current, tabId)
    if (!metadata && layoutBeforeDragRef.current) {
      metadata = getTabMetadata(layoutBeforeDragRef.current, tabId)
    }
    return metadata
  }, [])

  const handleGetActiveTabMetadata = useCallback((paneId: string) => {
    let metadata = getActiveTabMetadata(layoutRef.current, paneId)
    if (!metadata && layoutBeforeDragRef.current) {
      metadata = getActiveTabMetadata(layoutBeforeDragRef.current, paneId)
    }
    return metadata
  }, [])

  const controller: ZeugmaControllerInternal = {
    layout,
    setLayout,
    _internalSetLayout,
    layoutBeforeDrag,
    setLayoutBeforeDrag,
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

    // Actions
    removePane: handleRemovePane,
    addTab: handleAddTab,
    updateMetadata: handleUpdateMetadata,
    updatePaneLock: handleUpdatePaneLock,
    selectTab: handleSelectTab,
    mergeTab: handleMergeTab,
    moveTab: handleMoveTab,
    removeTab: handleRemoveTab,
    splitPane: handleSplitPane,
    updateSplitPercentage: handleUpdateSplitPercentage,

    // Queries
    findPaneById: handleFindPaneById,
    findPaneContainingTab: handleFindPaneContainingTab,
    findTabById: handleFindTabById,
    getTabMetadata: handleGetTabMetadata,
    getActiveTabMetadata: handleGetActiveTabMetadata,
  }

  return controller
}
