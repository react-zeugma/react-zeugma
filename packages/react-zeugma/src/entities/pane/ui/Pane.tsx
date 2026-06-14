import React, { useMemo, useCallback, useEffect, useContext } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useZeugmaState, useZeugmaActions, PortalRegistryContext } from '../../zeugma'
import { DragListenersCtx } from '../model/context'
import { PaneRenderProps } from '../model/types'
import { findPane } from '../../../shared/lib/tree'

interface DropZoneProps {
  id: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'full' | 'top-header'
  activeClassName?: string
}

const activationPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: '50%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    width: '50%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  left: {
    position: 'absolute',
    top: '25%',
    left: 0,
    width: '25%',
    height: '50%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  right: {
    position: 'absolute',
    top: '25%',
    right: 0,
    width: '25%',
    height: '50%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  center: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    pointerEvents: 'auto',
    cursor: 'not-allowed',
  },
}

const previewPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
}

const DropZone: React.FC<DropZoneProps> = ({ id, position, activeClassName }) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <>
      <div ref={setNodeRef} style={activationPositions[position]} />
      {isOver && <div className={activeClassName} style={previewPositions[position]} />}
    </>
  )
}

export interface PaneProps {
  /** The unique ID of the pane, matching a `paneId` in the layout tree schema. */
  id: string
  /** Render prop function providing pane state (isDragging, isFullscreen, etc.) and handlers. */
  children: (props: PaneRenderProps) => React.ReactNode
  /** Optional inline CSS styles applied to the pane outer container. */
  style?: React.CSSProperties
  /** Optional override to lock this specific pane. */
  locked?: boolean
}

export const Pane: React.FC<PaneProps> = ({ id, children, style, locked: propLocked = false }) => {
  const {
    layout,
    activeId,
    classNames,
    fullscreenPaneId,
    onFullscreenChange,
    locked: globalLocked,
  } = useZeugmaState()
  const { removePane, updateTabMetadata, selectTab, removeTab } = useZeugmaActions()
  const portalRegistry = useContext(PortalRegistryContext)
  if (!portalRegistry) {
    throw new Error('Pane must be used within a Zeugma provider')
  }
  const { registerPortalTarget } = portalRegistry

  const paneNode = useMemo(() => findPane(layout, id), [layout, id])
  const paneContainerId = paneNode?.id ?? id
  const tabs = paneNode?.tabs ?? [id]
  const activeTabId = paneNode?.activeTabId ?? id
  const tabsMetadata = paneNode?.tabsMetadata

  const metadata = tabsMetadata?.[id]
  const localLocked = paneNode?.locked ?? false

  const isPaneLocked = propLocked || localLocked
  const isDraggableDisabled = globalLocked || isPaneLocked
  const isDroppableDisabled = globalLocked || isPaneLocked

  const showDropZones =
    activeId !== null &&
    activeId !== id &&
    (!tabs.includes(activeId) || tabs.length > 1) &&
    !isDroppableDisabled

  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    disabled: isDraggableDisabled,
  })

  const dragging = activeId !== null && tabs.includes(activeId)
  const isFullscreen = fullscreenPaneId === id

  const renderActiveTab = useCallback(() => {
    return (
      <div
        id={`zeugma-tab-target-${activeTabId}`}
        className="zeugma-tab-content-wrapper"
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    )
  }, [activeTabId])

  // Register portal targets using selector-based useEffect to avoid ref callback loops
  useEffect(() => {
    const el = document.getElementById(`zeugma-tab-target-${activeTabId}`) as HTMLDivElement | null
    registerPortalTarget(activeTabId, el)
    return () => {
      registerPortalTarget(activeTabId, null)
    }
  }, [activeTabId, registerPortalTarget])

  const renderProps: PaneRenderProps = useMemo(
    () => ({
      isDragging: dragging,
      isFullscreen,
      toggleFullscreen: () => onFullscreenChange?.(isFullscreen ? null : id),
      remove: () => {
        if (isFullscreen) {
          onFullscreenChange?.(null)
        }
        removePane(paneContainerId)
      },
      metadata,
      updateMetadata: (updater) => {
        updateTabMetadata(id, updater)
      },
      locked: isDraggableDisabled,
      tabs,
      activeTabId,
      selectTab: (tabId) => selectTab(paneContainerId, tabId),
      removeTab: (tabId) => {
        if (isFullscreen && tabId === activeTabId) {
          onFullscreenChange?.(null)
        }
        removeTab(tabId)
      },
      tabsMetadata,
      updateTabMetadata: (tabId, updater) => {
        updateTabMetadata(tabId, updater)
      },
      renderActiveTab,
    }),
    [
      dragging,
      isFullscreen,
      onFullscreenChange,
      id,
      removeTab,
      metadata,
      updateTabMetadata,
      isDraggableDisabled,
      tabs,
      activeTabId,
      selectTab,
      paneContainerId,
      tabsMetadata,
      renderActiveTab,
    ],
  )

  // Best practice: Memoize drag context value to prevent unnecessary re-renders of the drag handle.
  const contextValue = useMemo(() => {
    if (isDraggableDisabled) {
      return { disabled: true }
    }
    return {
      ...listeners,
      ...attributes,
    }
  }, [listeners, attributes, isDraggableDisabled])

  const paneClass = `${classNames.pane || ''} ${
    isPaneLocked ? classNames.paneLocked || 'zeugma-pane-locked' : ''
  }`.trim()

  return (
    <DragListenersCtx.Provider value={contextValue}>
      <div
        ref={setNodeRef}
        className={paneClass}
        style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      >
        {children(renderProps)}

        {showDropZones && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 15,
              pointerEvents: 'none',
            }}
          >
            {(['top', 'bottom', 'left', 'right'] as const).map((pos) => (
              <DropZone
                key={pos}
                id={`drop-${pos}-${id}`}
                position={pos}
                activeClassName={classNames.dropPreview}
              />
            ))}
            {!tabs.includes(activeId) && (
              <DropZone
                id={`drop-center-${id}`}
                position="center"
                activeClassName={classNames.swapPreview}
              />
            )}
          </div>
        )}

        {activeId !== null && activeId !== id && isDroppableDisabled && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 15,
              pointerEvents: 'none',
            }}
          >
            <DropZone
              id={`drop-locked-${id}`}
              position="full"
              activeClassName={classNames.lockedPreview || 'zeugma-locked-preview'}
            />
          </div>
        )}
      </div>
    </DragListenersCtx.Provider>
  )
}
