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
  splitPane,
  updateSplitPercentage,
  updateTabMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  removeTab,
  findPane,
  safeJsonStringify,
} from '../../../shared/lib'

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
        const prev = layout
        const next = mutationFn(prev, ...args)

        if (safeJsonStringify(prev) !== safeJsonStringify(next)) {
          setLocalLayout(next)
          onChange?.(next)
        }
      }
    },
    [layout, onChange],
  )

  const handleSetLayout = useCallback(
    wrapMutation((prev, nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
      return typeof nextLayoutOrUpdater === 'function'
        ? (nextLayoutOrUpdater as (prev: TreeNode | null) => TreeNode | null)(prev)
        : nextLayoutOrUpdater
    }),
    [wrapMutation],
  )

  const setLayout = handleSetLayout

  // Layout Modification Actions using wrapped mutation functions
  const handleRemovePane = useCallback(
    wrapMutation((prev, paneId: string) => removePane(prev, paneId)),
    [wrapMutation],
  )

  const handleAddPane = useCallback(
    wrapMutation((prev, paneId: string) => addPane(prev, paneId)),
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
        const draggedPaneNode = findPane(prev, paneToAdd) ?? {
          type: 'pane',
          id: paneToAdd,
          tabs: [paneToAdd],
          activeTabId: paneToAdd,
        }
        const treeWithoutDragging = removePane(prev, paneToAdd)
        return splitPane(treeWithoutDragging, targetId, direction, splitType, draggedPaneNode)
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
    wrapMutation((prev, paneId: string, isLocked: boolean) =>
      updatePaneLock(prev, paneId, isLocked),
    ),
    [wrapMutation],
  )

  const handleSelectTab = useCallback(
    wrapMutation((prev, paneId: string, tabId: string) => selectTab(prev, paneId, tabId)),
    [wrapMutation],
  )

  const handleMergeTab = useCallback(
    wrapMutation((prev, draggedTabId: string, targetPaneId: string) =>
      mergeTab(prev, draggedTabId, targetPaneId),
    ),
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
  } as unknown as ZeugmaController
}
