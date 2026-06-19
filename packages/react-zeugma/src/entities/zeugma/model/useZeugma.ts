import { useState, useRef, useEffect, useCallback, SetStateAction } from 'react'
import {
  TreeNode,
  SplitDirection,
  SplitNode,
  UseZeugmaOptions,
  ZeugmaController,
} from '../../../shared'
import { DEFAULT_DRAG_ACTIVATION_DISTANCE, DEFAULT_SNAP_THRESHOLD } from '../../../shared/config'
import {
  removePane,
  addPane,
  addTab,
  splitPane,
  updateSplitPercentage,
  updateTabMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  removeTab,
  findPaneById,
  findPaneContainingTab,
  findTabById,
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

  const handleAddPane = useCallback(
    wrapMutation((prev, paneId: string, metadata?: Record<string, unknown>) =>
      addPane(prev, paneId, metadata),
    ),
    [wrapMutation],
  )

  const handleAddTab = useCallback(
    wrapMutation(
      (prev, targetPaneId: string, tabId: string, metadata?: Record<string, unknown>) => {
        const targetPane =
          findPaneById(prev, targetPaneId) ?? findPaneContainingTab(prev, targetPaneId)
        if (!targetPane) return prev

        const sourcePane = findPaneContainingTab(prev, tabId)
        const isAlreadyInTarget = sourcePane && sourcePane.id === targetPane.id

        const cleanedPrev = isAlreadyInTarget ? prev : (removeTab(prev, tabId) ?? prev)
        return addTab(cleanedPrev, targetPane.id, tabId, metadata)
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

  const handleUpdateTabMetadata = useCallback(
    wrapMutation(
      (
        prev,
        tabId: string,
        updater: (
          current: Record<string, unknown> | undefined,
        ) => Record<string, unknown> | undefined,
      ) => updateTabMetadata(prev, tabId, updater),
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

  const handleFindPaneById = useCallback(
    (paneId: string) => findPaneById(layoutRef.current, paneId),
    [],
  )

  const handleFindPaneContainingTab = useCallback(
    (tabId: string) => findPaneContainingTab(layoutRef.current, tabId),
    [],
  )

  const handleFindTabById = useCallback(
    (tabId: string) => findTabById(layoutRef.current, tabId),
    [],
  )

  return {
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
    addTab: handleAddTab,
    splitPane: handleSplitPane,
    updateSplitPercentage: handleUpdateSplitPercentage,
    updateTabMetadata: handleUpdateTabMetadata,
    updatePaneLock: handleUpdatePaneLock,
    selectTab: handleSelectTab,
    mergeTab: handleMergeTab,
    moveTab: handleMoveTab,
    removeTab: handleRemoveTab,

    // Queries
    findPaneById: handleFindPaneById,
    findPaneContainingTab: handleFindPaneContainingTab,
    findTabById: handleFindTabById,
  } as ZeugmaController
}
