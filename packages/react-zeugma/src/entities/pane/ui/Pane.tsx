import React, { useMemo, useEffect, useContext, useRef, createContext } from 'react'
import { useDraggable } from '@dnd-kit/core'
import {
  useZeugmaState,
  useZeugmaActions,
  PortalRegistryContext,
  TabDetails,
} from '../../../shared'
import { findPaneOrContainingTab, findPaneContainingTab } from '../../../shared/lib/tree'
import { DragListenersCtx } from '../model/context'
import { PaneRenderProps } from '../model/types'
import { DropZone } from './DropZone'
import { DragHandle } from './DragHandle'
import { Tabs } from './Tabs'
import { Tab } from './Tab'
import { PaneControls } from './PaneControls'

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
  /** A render callback (tab) => ReactNode or static ReactNode content to render for the active tab. */
  children?: React.ReactNode | ((tab: TabDetails) => React.ReactNode)
  /** Custom CSS class applied to the tab content wrapper. */
  className?: string
  /** Custom inline CSS style applied to the tab content wrapper. */
  style?: React.CSSProperties
}

export const PaneContent: React.FC<PaneContentProps> = ({ children, className, style }) => {
  const { activeTabId } = usePaneContext()
  const { classNames } = useZeugmaState()
  const targetRef = useRef<HTMLDivElement | null>(null)
  const portalRegistry = useContext(PortalRegistryContext)
  if (!portalRegistry) {
    throw new Error('PaneContent must be used within a Zeugma provider')
  }
  const { registerPortalTarget, registerRenderCallback } = portalRegistry

  const renderCallback = useMemo(() => {
    if (typeof children === 'function') {
      return children as (tab: TabDetails) => React.ReactNode
    }
    return () => children
  }, [children])

  // Register render callback synchronously during the render phase
  registerRenderCallback(activeTabId, renderCallback)

  useEffect(() => {
    const el = targetRef.current
    registerPortalTarget(activeTabId, el)
    return () => {
      registerPortalTarget(activeTabId, null, el)
    }
  }, [activeTabId, registerPortalTarget])

  return (
    <div
      ref={targetRef}
      id={`zeugma-tab-target-${activeTabId}`}
      className={`${classNames.tabContentWrapper || ''} ${className || ''}`.trim()}
      style={{
        height: '100%',
        width: '100%',
        ...style,
      }}
    />
  )
}

export interface PaneProps {
  /** The unique ID of the pane, matching a `paneId` in the layout tree schema. */
  id: string
  /** The children elements inside the pane (e.g. headers, tabs, content). */
  children: React.ReactNode
  /** Optional inline CSS styles applied to the pane outer container. */
  style?: React.CSSProperties
  /** Optional override to lock this specific pane. */
  locked?: boolean
}

export const Pane: React.FC<PaneProps> & {
  Content: typeof PaneContent
  DragHandle: typeof DragHandle
  Tabs: typeof Tabs
  Tab: typeof Tab
  Controls: typeof PaneControls
} = ({ id, children, style, locked: propLocked = false }) => {
  const {
    layout,
    renderingLayout,
    activeId,
    activeType,
    classNames: globalClassNames,
    fullscreenPaneId,
    onFullscreenChange,
    locked: globalLocked,
  } = useZeugmaState()
  const { removePane, updateMetadata, selectTab, removeTab } = useZeugmaActions()

  const paneNode = useMemo(() => {
    if (activeType === 'tab' && id === activeId) {
      const originalPane = findPaneContainingTab(layout, id)
      const sourceMetadata = originalPane?.tabsMetadata?.[id]
      return {
        type: 'pane' as const,
        id,
        tabIds: [id],
        activeTabId: id,
        tabsMetadata: sourceMetadata ? { [id]: sourceMetadata } : undefined,
      }
    }
    const targetTree = id === activeId ? layout : renderingLayout
    return findPaneOrContainingTab(targetTree, id)
  }, [layout, renderingLayout, id, activeId, activeType])
  const paneContainerId = paneNode?.id ?? id
  const tabIds = paneNode?.tabIds ?? [id]
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
    (!tabIds.includes(activeId) || tabIds.length > 1) &&
    !isDroppableDisabled

  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    disabled: isDraggableDisabled,
  })

  const dragging = activeId !== null && tabIds.includes(activeId)
  const isFullscreen = fullscreenPaneId === id

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
      tabIds,
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
      tabIds,
      activeTabId,
      selectTab,
      paneContainerId,
      tabsMetadata,
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

  const paneClass = `${globalClassNames.pane || ''} ${
    isPaneLocked ? globalClassNames.paneLocked || '' : ''
  }`.trim()

  return (
    <PaneContext.Provider value={{ id, ...renderProps }}>
      <DragListenersCtx.Provider value={contextValue}>
        <div
          ref={setNodeRef}
          id={id}
          className={paneClass}
          style={{ position: 'relative', width: '100%', height: '100%', ...style }}
        >
          {children}

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
                  activeClassName={globalClassNames.dropPreview}
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
                activeClassName={globalClassNames.lockedPreview || ''}
              />
            </div>
          )}
        </div>
      </DragListenersCtx.Provider>
    </PaneContext.Provider>
  )
}

Pane.Content = PaneContent
Pane.DragHandle = DragHandle
Pane.Tabs = Tabs
Pane.Tab = Tab
Pane.Controls = PaneControls
