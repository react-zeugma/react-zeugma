import React, { useMemo, useCallback, useEffect, useContext, useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import {
  useZeugmaState,
  useZeugmaActions,
  PortalRegistryContext,
  LeafNode,
  TreeNode,
} from '../../../shared'
import { DragListenersCtx } from '../model/context'
import { WidgetRenderProps } from '../model/types'
import { DropZone } from './DropZone'

export interface WidgetProps {
  /** The unique ID of the widget, matching a `id` in the layout tree schema. */
  id: string
  /** Render prop function providing widget state (isDragging, isFullscreen, etc.) and handlers. */
  children: (props: WidgetRenderProps) => React.ReactNode
  /** Optional inline CSS styles applied to the widget outer container. */
  style?: React.CSSProperties
  /** Optional override to lock this specific widget. */
  locked?: boolean
}

export const Widget: React.FC<WidgetProps> = ({
  id,
  children,
  style,
  locked: propLocked = false,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null)
  const {
    layout,
    activeId,
    classNames,
    fullscreenPaneId,
    onFullscreenChange,
    locked: globalLocked,
  } = useZeugmaState()
  const { removePane, updateMetadata } = useZeugmaActions()
  const portalRegistry = useContext(PortalRegistryContext)
  if (!portalRegistry) {
    throw new Error('Widget must be used within a Zeugma provider')
  }
  const { registerPortalTarget } = portalRegistry

  const widgetNode = useMemo(() => {
    if (!layout) return null
    if (layout.type !== 'split' && layout.id === id) return layout
    function find(n: TreeNode | null): LeafNode | null {
      if (!n) return null
      if (n.type !== 'split' && n.id === id) return n
      if (n.type === 'split') {
        return find(n.first) ?? find(n.second)
      }
      return null
    }
    return find(layout)
  }, [layout, id])

  const localLocked = widgetNode?.locked ?? false
  const isWidgetLocked = propLocked || localLocked
  const isDraggableDisabled = globalLocked || isWidgetLocked
  const isDroppableDisabled = globalLocked || isWidgetLocked

  const showDropZones = activeId !== null && activeId !== id && !isDroppableDisabled

  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    disabled: isDraggableDisabled,
  })

  const dragging = activeId === id
  const isFullscreen = fullscreenPaneId === id

  const renderActiveWidget = useCallback(() => {
    return (
      <div
        ref={targetRef}
        id={`zeugma-widget-target-${id}`}
        className="zeugma-widget-content-wrapper"
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    )
  }, [id])

  // Register portal targets using targetRef to avoid race conditions during drag & layout changes
  useEffect(() => {
    const el = targetRef.current
    registerPortalTarget(id, el)
    return () => {
      registerPortalTarget(id, null)
    }
  }, [id, registerPortalTarget])

  const metadata = widgetNode && 'metadata' in widgetNode ? widgetNode.metadata : undefined

  const renderProps: WidgetRenderProps = useMemo(
    () => ({
      isDragging: dragging,
      isFullscreen,
      toggleFullscreen: () => onFullscreenChange?.(isFullscreen ? null : id),
      remove: () => {
        if (isFullscreen) {
          onFullscreenChange?.(null)
        }
        removePane(id)
      },
      metadata,
      updateMetadata: (updater) => {
        updateMetadata(id, updater)
      },
      locked: isDraggableDisabled,
      renderActiveWidget,
    }),
    [
      dragging,
      isFullscreen,
      onFullscreenChange,
      id,
      removePane,
      metadata,
      updateMetadata,
      isDraggableDisabled,
      renderActiveWidget,
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

  const widgetClass = `${classNames.pane || ''} ${
    isWidgetLocked ? classNames.paneLocked || '' : ''
  }`.trim()

  return (
    <DragListenersCtx.Provider value={contextValue}>
      <div
        ref={setNodeRef}
        className={widgetClass}
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
