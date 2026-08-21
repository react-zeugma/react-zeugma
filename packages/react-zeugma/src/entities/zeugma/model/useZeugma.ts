import { useState, useRef, useEffect, useCallback, SetStateAction } from 'react'
import {
  TreeNode,
  SplitDirection,
  SplitNode,
  UseZeugmaOptions,
  ZeugmaController,
  ZeugmaControllerInternal,
  MetadataStore,
} from '../../../shared'
import {
  removePane,
  addTab,
  splitPane,
  updateSplitPercentage,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  removeTab,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  areLayoutsEqual,
} from '../../../shared/lib/tree'
import { createMetadataStore } from './metadata-store'

export function useZeugma(options: UseZeugmaOptions): ZeugmaController {
  const {
    initialLayout,
    layout: controlledLayout,
    onChange,
    initialMetadata,
    metadata: controlledMetadata,
    onMetadataChange,
    fullscreenPaneId: controlledFullscreenPaneId,
    onFullscreenChange,
    locked: initialLocked = false,
  } = options

  const [layout, setLocalLayout] = useState<TreeNode | null>(() => {
    return controlledLayout !== undefined ? controlledLayout : (initialLayout ?? null)
  })
  const [renderingLayout, setRenderingLayout] = useState<TreeNode | null>(() => {
    return controlledLayout !== undefined ? controlledLayout : (initialLayout ?? null)
  })
  const prevControlledLayoutRef = useRef<TreeNode | null | undefined>(controlledLayout)
  const [fullscreenPaneId, setLocalFullscreenPaneId] = useState<string | null>(
    controlledFullscreenPaneId || null,
  )
  const [locked, setLocked] = useState(initialLocked)
  const [poppedOutTabIds, setPoppedOutTabIds] = useState<string[]>([])

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

  const fullscreenPaneIdRef = useRef<string | null>(fullscreenPaneId)
  fullscreenPaneIdRef.current = fullscreenPaneId

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const onFullscreenChangeRef = useRef(onFullscreenChange)
  onFullscreenChangeRef.current = onFullscreenChange

  const onMetadataChangeRef = useRef(onMetadataChange)
  onMetadataChangeRef.current = onMetadataChange

  // Dedicated Metadata Store (decoupled from layout tree)
  const metadataStoreRef = useRef<MetadataStore | null>(null)
  if (!metadataStoreRef.current) {
    metadataStoreRef.current = createMetadataStore(
      controlledMetadata !== undefined ? controlledMetadata : initialMetadata,
      (newMeta) => onMetadataChangeRef.current?.(newMeta),
    )
  }
  const metadataStore = metadataStoreRef.current

  const prevControlledMetadataRef = useRef<Record<string, Record<string, unknown>> | undefined>(
    controlledMetadata,
  )

  useEffect(() => {
    if (
      controlledMetadata !== undefined &&
      controlledMetadata !== prevControlledMetadataRef.current
    ) {
      prevControlledMetadataRef.current = controlledMetadata
      metadataStore.setAll(controlledMetadata)
    }
  }, [controlledMetadata, metadataStore])

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
    if (!areLayoutsEqual(controlledLayout, prevControlledLayoutRef.current ?? null)) {
      prevControlledLayoutRef.current = controlledLayout
      setLocalLayout(controlledLayout)
      setRenderingLayout(controlledLayout)
      setPoppedOutTabIds((prevPopped) => {
        if (prevPopped.length === 0) return prevPopped
        const filtered = prevPopped.filter((id) => findTabById(controlledLayout, id) !== null)
        return filtered.length === prevPopped.length ? prevPopped : filtered
      })
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

        if (!areLayoutsEqual(prev, next)) {
          layoutRef.current = next
          setLocalLayout(next)
          setRenderingLayout(next)

          setPoppedOutTabIds((prevPopped) => {
            if (prevPopped.length === 0) return prevPopped
            const filtered = prevPopped.filter((id) => findTabById(next, id) !== null)
            return filtered.length === prevPopped.length ? prevPopped : filtered
          })

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

  // Internal setter used by DnD — does NOT trigger onChange or reset transient states
  const _internalSetLayout = useCallback((nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
    if (fullscreenPaneIdRef.current !== null) return
    setRenderingLayout((prev) => {
      const next =
        typeof nextLayoutOrUpdater === 'function'
          ? (nextLayoutOrUpdater as (prev: TreeNode | null) => TreeNode | null)(prev)
          : nextLayoutOrUpdater
      return next
    })
  }, [])

  // Public setter — resets transient states when layout is replaced programmatically
  const setLayout = useCallback(
    (nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
      setLocalFullscreenPaneId(null)
      onFullscreenChangeRef.current?.(null)
      setActiveId(null)
      setActiveType(null)
      setDismissIntentId(null)
      handleSetLayout(nextLayoutOrUpdater)
      // Force sync renderingLayout to clear any transient drag removals
      setRenderingLayout(() => {
        const next =
          typeof nextLayoutOrUpdater === 'function'
            ? (nextLayoutOrUpdater as (prev: TreeNode | null) => TreeNode | null)(layoutRef.current)
            : nextLayoutOrUpdater
        return next
      })
    },
    [handleSetLayout],
  )

  // Layout Modification Actions using wrapped mutation functions
  const handleRemovePane = useCallback(
    (paneId: string) => {
      if (fullscreenPaneIdRef.current !== null) return
      const targetPane = findPaneById(layoutRef.current, paneId)
      if (targetPane) {
        targetPane.tabIds.forEach((tId) => metadataStore.remove(tId))
      }
      wrapMutation((prev) => removePane(prev, paneId))()
    },
    [metadataStore, wrapMutation],
  )

  const handleAddTab = useCallback(
    (tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => {
      if (fullscreenPaneIdRef.current !== null) return
      if (metadata !== undefined) {
        metadataStore.set(tabId, metadata)
      }
      wrapMutation((prev) => {
        const cleanedPrev = removeTab(prev, tabId) ?? prev
        return addTab(cleanedPrev, targetPaneId, tabId)
      })()
    },
    [metadataStore, wrapMutation],
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
        if (fullscreenPaneIdRef.current !== null) return prev
        const targetPane = findPaneById(prev, targetId) ?? findPaneContainingTab(prev, targetId)
        if (!targetPane) return prev

        const draggedPaneNode = findPaneById(prev, paneToAdd) ??
          findPaneContainingTab(prev, paneToAdd) ?? {
            type: 'pane',
            id: paneToAdd,
            tabIds: [paneToAdd],
            activeTabId: paneToAdd,
          }
        const treeWithoutDragging = removePane(prev, draggedPaneNode.id)
        return splitPane(treeWithoutDragging, targetPane.id, direction, splitType, draggedPaneNode)
      },
    ),
    [wrapMutation],
  )

  const handleUpdateSplitPercentage = useCallback(
    wrapMutation((prev, currentNode: SplitNode, percentage: number) => {
      if (fullscreenPaneIdRef.current !== null) return prev
      return updateSplitPercentage(prev, currentNode, percentage)
    }),
    [wrapMutation],
  )

  // Isolated Metadata Update — does NOT invalidate layout or trigger onChange(layout)
  const handleUpdateMetadata = useCallback(
    (
      id: string,
      updater: (
        current: Record<string, unknown> | undefined,
      ) => Record<string, unknown> | undefined,
    ) => {
      metadataStore.update(id, updater)
    },
    [metadataStore],
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
      if (fullscreenPaneIdRef.current !== null) return prev
      const targetPane =
        findPaneById(prev, targetPaneId) ?? findPaneContainingTab(prev, targetPaneId)
      if (!targetPane) return prev
      return mergeTab(prev, draggedTabId, targetPane.id)
    }),
    [wrapMutation],
  )

  const handleMoveTab = useCallback(
    wrapMutation(
      (
        prev,
        draggedTabId: string,
        targetTabId: string,
        position?: 'before' | 'after' | 'center',
      ) => {
        if (fullscreenPaneIdRef.current !== null) return prev
        return moveTab(prev, draggedTabId, targetTabId, position)
      },
    ),
    [wrapMutation],
  )

  const handleRemoveTab = useCallback(
    (tabId: string) => {
      if (fullscreenPaneIdRef.current !== null) return
      metadataStore.remove(tabId)
      wrapMutation((prev) => removeTab(prev, tabId))()
    },
    [metadataStore, wrapMutation],
  )

  const handleFindPaneById = useCallback((paneId: string) => {
    return findPaneById(layoutRef.current, paneId)
  }, [])

  const handleFindPaneContainingTab = useCallback((tabId: string) => {
    return findPaneContainingTab(layoutRef.current, tabId)
  }, [])

  const handleFindTabById = useCallback(
    (tabId: string) => {
      const tab = findTabById(layoutRef.current, tabId)
      if (!tab) return null
      return {
        ...tab,
        metadata: metadataStore.get(tabId),
      }
    },
    [metadataStore],
  )

  const handleGetTabMetadata = useCallback(
    (tabId: string) => {
      return metadataStore.get(tabId)
    },
    [metadataStore],
  )

  const handleGetActiveTabMetadata = useCallback(
    (paneId: string) => {
      const pane = findPaneById(layoutRef.current, paneId)
      if (!pane) return undefined
      return metadataStore.get(pane.activeTabId)
    },
    [metadataStore],
  )

  const handlePopoutTab = useCallback((tabId: string) => {
    if (fullscreenPaneIdRef.current !== null) return
    setPoppedOutTabIds((prev) => {
      if (prev.includes(tabId)) return prev
      return [...prev, tabId]
    })
  }, [])

  const handleDockTab = useCallback((tabId: string) => {
    if (fullscreenPaneIdRef.current !== null) return
    setPoppedOutTabIds((prev) => {
      if (!prev.includes(tabId)) return prev
      return prev.filter((id) => id !== tabId)
    })
  }, [])

  const controller: ZeugmaControllerInternal = {
    metadataStore,
    layout,
    setLayout,
    _internalSetLayout,
    renderingLayout,
    fullscreenPaneId,
    setFullscreenPaneId,
    locked,
    setLocked,
    poppedOutTabIds,
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
    popoutTab: handlePopoutTab,
    dockTab: handleDockTab,

    // Queries
    findPaneById: handleFindPaneById,
    findPaneContainingTab: handleFindPaneContainingTab,
    findTabById: handleFindTabById,
    getTabMetadata: handleGetTabMetadata,
    getActiveTabMetadata: handleGetActiveTabMetadata,
  }

  return controller
}
