import React, { useMemo, useCallback } from 'react'
import { DndContext } from '@dnd-kit/core'
import {
  SplitNode,
  ZeugmaStateContext,
  ZeugmaActionsContext,
  PortalRegistryContext,
  ZeugmaDragContext,
  ZeugmaDragStateValue,
  ZeugmaProps,
  BaseZeugmaProps,
  ZeugmaControllerInternal,
} from '../../../shared'
import {
  usePortalRegistry,
  useZeugmaDnd,
  useAllTabIds,
  useZeugmaDragMeasurement,
  useZeugmaPersistence,
} from '../model'
import { CursorOverlay } from './CursorOverlay'
import { PortalHostItem } from './PortalHostItem'
import { DragOverlayPreview } from './DragOverlayPreview'
import { PaneTree } from '../../../widgets/pane-tree'

const ZeugmaProviderInternal: React.FC<
  BaseZeugmaProps & { children?: React.ReactNode; renderPane?: (paneId: string) => React.ReactNode }
> = (props) => {
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

    // Persistence
    persist = false,
  } = props

  const internalController = controller as ZeugmaControllerInternal
  const {
    layout,
    setLayout,
    _internalSetLayout,
    renderingLayout,
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

  // Synchronize layout persistence
  useZeugmaPersistence({ persist, layout, setLayout })

  const {
    portalTargets,
    registerPortalTarget,
    registerRenderCallback,
    renderCallbacksRef,
    registerRenderPane,
    renderPaneRef,
    registerTabHeader,
    tabHeadersRef,
    activeIdRef,
  } = usePortalRegistry()

  const {
    overTabId,
    setOverTabId,
    overTabPosition,
    setOverTabPosition,
    handleDragStartInternal,
    handleDragEndInternal,
  } = useZeugmaDragMeasurement({
    onDragStart,
    onDragEnd,
  })

  const dnd = useZeugmaDnd({
    layout,
    _internalSetLayout,
    setLayout,
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
    onDragStart: handleDragStartInternal,
    onDragEnd: handleDragEndInternal,
    onDismissIntentChange,

    // Actions
    removeTab,
    removePane,
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
      classNames.paneDragPreview,
      classNames.tabDragPreview,
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
      renderingLayout,
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
      renderingLayout,
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
  const allTabIds = useAllTabIds(layout)

  const portalRegistryValue = useMemo(
    () => ({
      registerPortalTarget,
      registerRenderCallback,
      renderCallbacksRef,
      registerRenderPane,
      renderPaneRef,
      registerTabHeader,
      tabHeadersRef,
      activeIdRef,
    }),
    [
      registerPortalTarget,
      registerRenderCallback,
      renderCallbacksRef,
      registerRenderPane,
      renderPaneRef,
      registerTabHeader,
      tabHeadersRef,
      activeIdRef,
    ],
  )

  if (activeIdRef) {
    activeIdRef.current = activeId
  }

  return (
    <ZeugmaActionsContext.Provider value={actionsValue}>
      <ZeugmaStateContext.Provider value={stateValue}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <PortalRegistryContext.Provider value={portalRegistryValue}>
            <DndContext id="zeugma-dnd-context" {...dnd}>
              {children}
            </DndContext>
            {activeId && activeType && (
              <CursorOverlay
                activeId={activeId}
                render={(id) => {
                  const isDismissing = id === dismissIntentId
                  return (
                    <div
                      style={{
                        transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)',
                        transform: isDismissing ? 'scale(0.8)' : 'scale(1)',
                        transformOrigin: 'top left',
                      }}
                    >
                      <DragOverlayPreview
                        activeId={id}
                        activeType={activeType}
                        dismissIntentId={dismissIntentId}
                        renderDragOverlay={renderDragOverlay}
                        renderPaneRef={renderPaneRef}
                        renderPane={renderPane}
                        tabHeadersRef={tabHeadersRef}
                        classNames={stableClassNames}
                      />
                    </div>
                  )
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

const ZeugmaRenderer: React.FC<{
  renderPane?: (paneId: string) => React.ReactNode
  resizerSize?: number
  snapThreshold?: number
}> = ({ renderPane, resizerSize, snapThreshold }) => {
  if (!renderPane) {
    throw new Error(
      'Zeugma component requires a renderPane prop when used as a standalone renderer.',
    )
  }
  return (
    <PaneTree renderPane={renderPane} resizerSize={resizerSize} snapThreshold={snapThreshold} />
  )
}

export const Zeugma: React.FC<ZeugmaProps> = (props) => {
  const { children, ...restProps } = props as unknown as {
    children?: React.ReactNode
    renderPane?: (paneId: string) => React.ReactNode
  }

  const { controller } = props as unknown as { controller?: ZeugmaControllerInternal }
  if (!controller) {
    throw new Error('Zeugma component requires a controller.')
  }

  return (
    <ZeugmaProviderInternal
      {...(props as unknown as BaseZeugmaProps & {
        children?: React.ReactNode
        renderPane?: (paneId: string) => React.ReactNode
      })}
    >
      {children !== undefined ? children : <ZeugmaRenderer {...restProps} />}
    </ZeugmaProviderInternal>
  )
}
