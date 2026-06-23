import React, { useState, useMemo, useCallback, useContext } from 'react'
import { DndContext } from '@dnd-kit/core'
import {
  TreeNode,
  SplitNode,
  ZeugmaStateContext,
  ZeugmaActionsContext,
  PortalRegistryContext,
  ZeugmaDragContext,
  ZeugmaDragStateValue,
  ZeugmaProps,
  ZeugmaProviderProps,
  ZeugmaControllerInternal,
} from '../../../shared'
import { usePortalRegistry, useZeugmaDnd } from '../model'
import { CursorOverlay } from './CursorOverlay'
import { PortalHostItem } from './PortalHostItem'
import { PaneTree } from '../../../widgets/pane-tree'

export const ZeugmaProvider: React.FC<ZeugmaProviderProps> = (props) => {
  const {
    controller,
    children,
    renderDragOverlay,
    classNames = {},
    renderPane,
    resizerSize,

    // Configuration settings
    dragActivationDistance = 8,
    snapThreshold = 8,
    minSplitPercentage = 5,
    maxSplitPercentage = 95,
    enableDragToDismiss = false,
    dismissThreshold = 60,

    // Callbacks
    onRemove,
    onDragStart,
    onDragEnd,
    onResizeStart,
    onResize,
    onResizeEnd,
    onDismissIntentChange,
  } = props

  const internalController = controller as ZeugmaControllerInternal
  const {
    layout,
    setLayout,
    _internalSetLayout,
    fullscreenPaneId,
    setFullscreenPaneId,
    locked,
    setLocked,
    findPaneById,
    findPaneContainingTab,
    findTabById,
    getTabMetadata,
    getActiveTabMetadata,
    activeId,
    setActiveId,
    activeType,
    setActiveType,
    dismissIntentId,
    setDismissIntentId,
    containerRef,
    setContainerRef,
    layoutBeforeDrag,
    setLayoutBeforeDrag,
    removePane,
    addTab,
    updateMetadata,
    updatePaneLock,
    selectTab,
    mergeTab,
    removeTab,
    splitPane,
    updateSplitPercentage,
    moveTab,
  } = internalController

  const { portalTargets, registerPortalTarget, registerRenderCallback, renderCallbacksRef } =
    usePortalRegistry()

  const [overTabId, setOverTabId] = useState<string | null>(null)
  const [overTabPosition, setOverTabPosition] = useState<'before' | 'after' | null>(null)

  const dnd = useZeugmaDnd({
    layout,
    _internalSetLayout,
    layoutBeforeDrag,
    setLayoutBeforeDrag,
    activeId,
    setActiveId,
    activeType,
    setActiveType,
    dismissIntentId,
    setDismissIntentId,
    setOverTabId,
    setOverTabPosition,
    containerRef,

    // Config
    dragActivationDistance,
    enableDragToDismiss,
    dismissThreshold,

    // Callbacks
    onRemove,
    onDragStart,
    onDragEnd,
    onDismissIntentChange,

    // Actions
    removeTab,
  })

  // Shallow-memoize classNames by individual fields to avoid identity busting from inline objects
  const stableClassNames = useMemo(
    () => classNames,
    [
      classNames.dashboard,
      classNames.dashboardDismissActive,
      classNames.pane,
      classNames.paneLocked,
      classNames.dropPreview,
      classNames.rootDropPreview,
      classNames.dragOverlay,
      classNames.resizer,
      classNames.dismissPreview,
      classNames.dashboardLocked,
      classNames.lockedPreview,
      classNames.tabDropPreview,
      classNames.tabSeparator,
      classNames.tabsContainer,
      classNames.tab,
      classNames.paneContainer,
      classNames.paneHeader,
      classNames.paneControls,
      classNames.paneButton,
      classNames.tabCloseButton,
      classNames.dragHandle,
    ],
  )

  const handleResizeEnd = useCallback(
    (currentNode: SplitNode, percentage: number) => {
      if (onResizeEnd) {
        onResizeEnd(currentNode, percentage)
      }
    },
    [onResizeEnd],
  )

  // State context — reactive values that change during runtime
  const stateValue = useMemo(
    () => ({
      layout,
      setLayout,
      activeId,
      activeType,
      dismissIntentId,
      setContainerRef,
      fullscreenPaneId,
      classNames: stableClassNames,
      onRemove,
      onFullscreenChange: setFullscreenPaneId,
      snapThreshold,
      onResizeStart,
      onResize,
      onResizeEnd: handleResizeEnd,
      minSplitPercentage,
      maxSplitPercentage,
      locked,
      setLocked,
      findPaneById,
      findPaneContainingTab,
      findTabById,
      getTabMetadata,
      getActiveTabMetadata,
      renderPane,
      resizerSize,
    }),
    [
      layout,
      activeId,
      activeType,
      dismissIntentId,
      setContainerRef,
      fullscreenPaneId,
      stableClassNames,
      onRemove,
      setFullscreenPaneId,
      snapThreshold,
      onResizeStart,
      onResize,
      minSplitPercentage,
      maxSplitPercentage,
      setLayout,
      handleResizeEnd,
      locked,
      setLocked,
      findPaneById,
      findPaneContainingTab,
      findTabById,
      getTabMetadata,
      getActiveTabMetadata,
      renderPane,
      resizerSize,
    ],
  )

  const dragValue = useMemo<ZeugmaDragStateValue>(
    () => ({
      overTabId,
      overTabPosition,
    }),
    [overTabId, overTabPosition],
  )

  // Actions context — stable dispatch functions that never change identity
  const actionsValue = useMemo(
    () => ({
      removePane,
      addTab,
      updateMetadata,
      updatePaneLock,
      selectTab,
      mergeTab,
      removeTab,
      setFullscreenPaneId,
      setLocked,
      splitPane,
      updateSplitPercentage,
      moveTab,
    }),
    [
      removePane,
      addTab,
      updateMetadata,
      updatePaneLock,
      selectTab,
      mergeTab,
      removeTab,
      setFullscreenPaneId,
      setLocked,
      splitPane,
      updateSplitPercentage,
      moveTab,
    ],
  )

  // Collect all tab IDs and widget IDs in the current layout tree
  const allTabIds = useMemo(() => {
    const ids = new Set<string>()
    function traverse(node: TreeNode | null) {
      if (!node) return
      if (node.type === 'pane') {
        node.tabs.forEach((tabId) => {
          ids.add(tabId)
        })
      } else if (node.type === 'split') {
        traverse(node.first)
        traverse(node.second)
      }
    }
    traverse(layout)
    if (layoutBeforeDrag) {
      traverse(layoutBeforeDrag)
    }
    return Array.from(ids).sort()
  }, [layout, activeId, layoutBeforeDrag])

  const portalRegistryValue = useMemo(
    () => ({
      registerPortalTarget,
      registerRenderCallback,
      renderCallbacksRef,
    }),
    [registerPortalTarget, registerRenderCallback, renderCallbacksRef],
  )

  return (
    <ZeugmaActionsContext.Provider value={actionsValue}>
      <ZeugmaStateContext.Provider value={stateValue}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <PortalRegistryContext.Provider value={portalRegistryValue}>
            <DndContext id="zeugma-dnd-context" {...dnd}>
              {children}
            </DndContext>
            {activeId && activeType && renderDragOverlay && (
              <CursorOverlay
                activeId={activeId}
                render={(id) => {
                  return renderDragOverlay({
                    type: activeType,
                    id,
                    isDismissing: activeId === dismissIntentId,
                  })
                }}
                className={`${classNames.dragOverlay || ''} ${
                  activeId === dismissIntentId ? classNames.dismissPreview || '' : ''
                }`.trim()}
              />
            )}
            {/* Transparent Portal Host to preserve widget state across pane drags */}
            <div id="zeugma-portal-host" style={{ display: 'none' }}>
              {allTabIds.map((tabId) => {
                const target = portalTargets[tabId]
                const tabDetails = findTabById(tabId)
                if (!tabDetails) return null
                return (
                  <PortalHostItem
                    key={tabId}
                    tabDetails={tabDetails}
                    target={target || null}
                    renderWidget={renderCallbacksRef.current[tabId]}
                  />
                )
              })}
            </div>
          </PortalRegistryContext.Provider>
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>
    </ZeugmaActionsContext.Provider>
  )
}

const ZeugmaRenderer: React.FC<Omit<ZeugmaProps, 'controller'>> = ({
  renderPane,
  resizerSize,
  snapThreshold,
}) => {
  return (
    <PaneTree renderPane={renderPane} resizerSize={resizerSize} snapThreshold={snapThreshold} />
  )
}

export const Zeugma: React.FC<ZeugmaProps> = (props) => {
  const context = useContext(ZeugmaStateContext)
  const isNested = context !== undefined

  if (!isNested) {
    const { controller, renderPane, ...restProps } = props
    if (!controller) {
      throw new Error('Zeugma component requires a controller when used standalone.')
    }
    return (
      <ZeugmaProvider controller={controller} renderPane={renderPane} {...restProps}>
        <ZeugmaRenderer {...restProps} />
      </ZeugmaProvider>
    )
  }

  return <ZeugmaRenderer {...props} />
}
