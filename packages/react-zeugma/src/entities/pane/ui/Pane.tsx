import React, { useMemo, useCallback, useEffect, useContext, useRef } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useZeugmaState, useZeugmaActions, PortalRegistryContext } from '../../../shared'
import { DragListenersCtx } from '../model/context'
import { PaneRenderProps } from '../model/types'
import { findPaneById } from '../../../shared/lib/tree'

interface DropZoneProps {
  id: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'full' | 'top-header'
  activeClassName?: string
}

const activationPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  left: {
    position: 'absolute',
    top: '25%',
    left: 0,
    width: '50%',
    height: '50%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  right: {
    position: 'absolute',
    top: '25%',
    right: 0,
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
  const targetRef = useRef<HTMLDivElement | null>(null)
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

  const paneNode = useMemo(() => findPaneById(layout, id), [layout, id])
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
        ref={targetRef}
        id={`zeugma-tab-target-${activeTabId}`}
        className="zeugma-tab-content-wrapper"
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    )
  }, [activeTabId])

  // Register portal targets using targetRef to avoid race conditions during drag & layout changes
  useEffect(() => {
    const el = targetRef.current
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
    isPaneLocked ? classNames.paneLocked || '' : ''
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
              activeClassName={classNames.lockedPreview || ''}
            />
          </div>
        )}
      </div>
    </DragListenersCtx.Provider>
  )
}
