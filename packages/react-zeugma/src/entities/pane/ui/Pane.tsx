import React, { useMemo, useCallback, useEffect, useContext, useRef, createContext } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useZeugmaState, useZeugmaActions, PortalRegistryContext, PaneNode } from '../../../shared'
import { DragListenersCtx } from '../model/context'
import { PaneRenderProps } from '../model/types'
import { findPaneById } from '../../../shared/lib/tree'
import { DropZone } from './DropZone'

export interface PaneContextValue extends PaneRenderProps {
  id: string
}

export const PaneContext = createContext<PaneContextValue | undefined>(undefined)

export const usePaneContext = () => {
  const context = useContext(PaneContext)
  if (!context) {
    throw new Error('usePaneContext must be used within a Pane component')
  }
  return context
}

export interface PaneContentProps {
  children: (tabId: string, metadata: Record<string, unknown> | undefined) => React.ReactNode
}

export const PaneContent: React.FC<PaneContentProps> = ({ children }) => {
  const { activeTabId } = usePaneContext()
  const { classNames } = useZeugmaState()
  const targetRef = useRef<HTMLDivElement | null>(null)
  const portalRegistry = useContext(PortalRegistryContext)
  if (!portalRegistry) {
    throw new Error('PaneContent must be used within a Zeugma provider')
  }
  const { registerPortalTarget } = portalRegistry

  useEffect(() => {
    const el = targetRef.current
    registerPortalTarget(activeTabId, el, children)
    return () => {
      registerPortalTarget(activeTabId, null)
    }
  }, [activeTabId, registerPortalTarget, children])

  return (
    <div
      ref={targetRef}
      id={`zeugma-tab-target-${activeTabId}`}
      className={classNames.tabContentWrapper || ''}
      style={{
        height: '100%',
        width: '100%',
      }}
    />
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

export const Pane: React.FC<PaneProps> & {
  Content: typeof PaneContent
} = ({ id, children, style, locked: propLocked = false }) => {
  const {
    layout,
    activeId,
    classNames,
    fullscreenPaneId,
    onFullscreenChange,
    locked: globalLocked,
  } = useZeugmaState()
  const { removePane, updateMetadata, selectTab, removeTab } = useZeugmaActions()

  const paneNode = useMemo(() => findPaneById(layout, id) as PaneNode | null, [layout, id])
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

  const renderActiveTab = useCallback(
    (render: (tabId: string, metadata: Record<string, unknown> | undefined) => React.ReactNode) => {
      return <PaneContent children={render} />
    },
    [],
  )

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
        updateMetadata(id, updater)
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
        updateMetadata(tabId, updater)
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
      updateMetadata,
      isDraggableDisabled,
      tabs,
      activeTabId,
      selectTab,
      paneContainerId,
      tabsMetadata,
      renderActiveTab,
    ],
  )

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
    <PaneContext.Provider value={{ id, ...renderProps }}>
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
    </PaneContext.Provider>
  )
}

Pane.Content = PaneContent
