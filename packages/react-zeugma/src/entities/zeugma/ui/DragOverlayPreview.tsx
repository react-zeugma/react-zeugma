import React from 'react'
import { ZeugmaClassNames } from '../../../shared'

interface DragOverlayPreviewProps {
  activeId: string
  activeType: 'pane' | 'tab'
  dismissIntentId: string | null
  draggedSize: { width: number; height: number } | null
  renderDragOverlay?: (active: {
    type: 'tab' | 'pane'
    id: string
    isDismissing: boolean
  }) => React.ReactNode
  renderPaneRef: React.RefObject<((paneId: string) => React.ReactNode) | null>
  renderPane?: (paneId: string) => React.ReactNode
  tabHeadersRef: React.RefObject<
    Record<string, (props: { isDragging: boolean; isOver: boolean }) => React.ReactNode>
  >
  classNames: ZeugmaClassNames
}

export const DragOverlayPreview: React.FC<DragOverlayPreviewProps> = ({
  activeId,
  activeType,
  dismissIntentId,
  draggedSize,
  renderDragOverlay,
  renderPaneRef,
  renderPane,
  tabHeadersRef,
  classNames,
}) => {
  if (renderDragOverlay) {
    return (
      <>
        {renderDragOverlay({
          type: activeType,
          id: activeId,
          isDismissing: activeId === dismissIntentId,
        })}
      </>
    )
  }

  if (activeType === 'pane') {
    const paneRender = renderPaneRef.current || renderPane
    if (paneRender) {
      return (
        <div
          style={{
            pointerEvents: 'none',
            width: draggedSize ? `${draggedSize.width}px` : 'auto',
            height: draggedSize ? `${draggedSize.height}px` : 'auto',
            overflow: 'hidden',
          }}
        >
          {paneRender(activeId)}
        </div>
      )
    }
  } else if (activeType === 'tab') {
    const paneRender = renderPaneRef.current || renderPane
    if (paneRender) {
      return (
        <div
          style={{
            pointerEvents: 'none',
            width: draggedSize ? `${draggedSize.width}px` : 'auto',
            height: draggedSize ? `${draggedSize.height}px` : 'auto',
            overflow: 'hidden',
          }}
        >
          {paneRender(activeId)}
        </div>
      )
    }
    const tabHeaderRender = tabHeadersRef.current[activeId]
    if (tabHeaderRender) {
      return (
        <div
          className={
            classNames.tab
              ? typeof classNames.tab === 'function'
                ? classNames.tab(activeId)
                : classNames.tab
              : ''
          }
          style={{
            display: 'inline-flex',
            position: 'relative',
            pointerEvents: 'none',
            overflow: 'hidden',
            width: draggedSize ? `${draggedSize.width}px` : 'auto',
            height: draggedSize ? `${draggedSize.height}px` : 'auto',
          }}
        >
          {tabHeaderRender({ isDragging: true, isOver: false })}
        </div>
      )
    }
  }

  return (
    <div
      style={{
        pointerEvents: 'none',
        overflow: 'hidden',
        minWidth: '200px',
        minHeight: '120px',
        width: '100%',
        height: '100%',
      }}
    />
  )
}
