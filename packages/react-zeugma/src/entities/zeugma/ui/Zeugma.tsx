import React, { useState, useMemo, useCallback } from 'react'
import { DndContext } from '@dnd-kit/core'
import {
  TreeNode,
  SplitNode,
  ZeugmaStateContext,
  ZeugmaActionsContext,
  PortalRegistryContext,
  ZeugmaProps,
  ZeugmaInternalController,
} from '../../../shared'
import { usePortalRegistry, useZeugmaDnd } from '../model'
import { CursorOverlay } from './CursorOverlay'
import { PortalHostItem } from './PortalHostItem'

export const Zeugma: React.FC<ZeugmaProps> = (props) => {
  const internalProps = props as unknown as ZeugmaInternalController & ZeugmaProps
  const {
    renderPane,
    renderWidget,
    renderDragOverlay,
    classNames = {},
    children,

    // Controller state
    layout,
    setLayout,
    fullscreenPaneId,
    setFullscreenPaneId,
    locked,
    setLocked,
    findPaneById,
    findPaneContainingTab,
    findTabById,
    activeId,
    activeType,
    dismissIntentId,
    setContainerRef,

    // Configuration settings
    snapThreshold,
    minSplitPercentage,
    maxSplitPercentage,

    // Callbacks
    onRemove,
    onResizeStart,
    onResize,
    onResizeEnd,

    // Actions
    removePane,
    addPane,
    addTab,
    updateTabMetadata,
    updatePaneLock,
    selectTab,
    mergeTab,
    removeTab,
  } = internalProps

  const { portalTargets, registerPortalTarget } = usePortalRegistry()

  const [overTabId, setOverTabId] = useState<string | null>(null)
  const [overTabPosition, setOverTabPosition] = useState<'before' | 'after' | null>(null)

  const dnd = useZeugmaDnd({
    ...internalProps,
    setOverTabId,
    setOverTabPosition,
  })

  // Stable renderPane wrapper — immune to consumer passing inline functions
  const stableRenderPane = useCallback((paneId: string) => renderPane(paneId), [renderPane])

  // Shallow-memoize classNames by individual fields to avoid identity busting from inline objects
  const stableClassNames = useMemo(
    () => classNames,
    [
      classNames.dashboard,
      classNames.dashboardDismissActive,
      classNames.pane,
      classNames.paneLocked,
      classNames.dropPreview,
      classNames.dragOverlay,
      classNames.resizer,
      classNames.dismissPreview,
      classNames.dashboardLocked,
      classNames.lockedPreview,
      classNames.tabDropPreview,
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
      renderPane: stableRenderPane,
      activeId,
      dismissIntentId,
      overTabId,
      overTabPosition,
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
    }),
    [
      layout,
      activeId,
      dismissIntentId,
      overTabId,
      overTabPosition,
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
      stableRenderPane,
      handleResizeEnd,
      locked,
      setLocked,
      findPaneById,
      findPaneContainingTab,
      findTabById,
    ],
  )

  // Actions context — stable dispatch functions that never change identity
  const actionsValue = useMemo(
    () => ({
      removePane,
      addPane,
      addTab,
      updateTabMetadata,
      updatePaneLock,
      selectTab,
      mergeTab,
      removeTab,
    }),
    [
      removePane,
      addPane,
      addTab,
      updateTabMetadata,
      updatePaneLock,
      selectTab,
      mergeTab,
      removeTab,
    ],
  )

  // Collect all tab IDs in the current layout tree
  const allTabIds = useMemo(() => {
    const ids: string[] = []
    function traverse(node: TreeNode | null) {
      if (!node) return
      if (node.type === 'pane') {
        ids.push(...node.tabs)
      } else {
        traverse(node.first)
        traverse(node.second)
      }
    }
    traverse(layout)
    return ids
  }, [layout])

  const portalRegistryValue = useMemo(
    () => ({
      registerPortalTarget,
    }),
    [registerPortalTarget],
  )

  return (
    <ZeugmaActionsContext.Provider value={actionsValue}>
      <ZeugmaStateContext.Provider value={stateValue}>
        <PortalRegistryContext.Provider value={portalRegistryValue}>
          <DndContext id="zeugma-dnd-context" {...dnd}>
            {children}
          </DndContext>
          {activeId && activeType && renderDragOverlay && (
            <CursorOverlay
              activeId={activeId}
              render={(id) => renderDragOverlay(id, activeType!)}
              className={`${classNames.dragOverlay || ''} ${
                activeId === dismissIntentId ? classNames.dismissPreview || '' : ''
              }`.trim()}
            />
          )}
          {/* Transparent Portal Host to preserve widget state across pane drags */}
          <div id="zeugma-portal-host" style={{ display: 'none' }}>
            {allTabIds.map((tabId) => (
              <PortalHostItem
                key={tabId}
                tabId={tabId}
                target={portalTargets[tabId] || null}
                renderWidget={renderWidget}
              />
            ))}
          </div>
        </PortalRegistryContext.Provider>
      </ZeugmaStateContext.Provider>
    </ZeugmaActionsContext.Provider>
  )
}
