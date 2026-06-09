import React, { useRef, useState, useMemo } from 'react'
import { useDashboardState, ResizerRenderProps, RootDropZones } from '../../../entities/dashboard'
import { useResizer } from '../../../features/resize-pane'
import { TreeNode, SplitNode } from '../../../shared/model'
import { removePane } from '../../../shared'

export interface PaneTreeProps {
  tree?: TreeNode | null
  /** Size of the resizer in pixels (default 4) */
  resizerSize?: number
  /** Threshold in pixels to snap to adjacent resizer edges (default 8) */
  snapThreshold?: number
  /** Custom resizer renderer to override context-level renderResizer */
  renderResizer?: (props: ResizerRenderProps) => React.ReactNode
}

interface PaneSplitProps {
  currentNode: SplitNode
  resizerSize: number
  snapThreshold?: number
  renderResizer?: (props: ResizerRenderProps) => React.ReactNode
}

const PaneSplit: React.FC<PaneSplitProps> = ({
  currentNode,
  resizerSize,
  snapThreshold,
  renderResizer: propRenderResizer,
}) => {
  const {
    layout,
    onLayoutChange,
    classNames,
    renderResizer: contextRenderResizer,
  } = useDashboardState()
  const [isResizing, setIsResizing] = useState(false)

  const renderResizer = propRenderResizer || contextRenderResizer

  const containerRef = useRef<HTMLDivElement>(null)
  const { direction, first, second, splitPercentage } = currentNode
  const isRow = direction === 'row'

  const handlePointerDown = useResizer({
    containerRef,
    isRow,
    direction,
    splitPercentage,
    resizerSize,
    snapThreshold: snapThreshold ?? 8,
    layout,
    currentNode,
    onLayoutChange,
    onResizeStart: () => setIsResizing(true),
    onResizeEnd: () => setIsResizing(false),
  })

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: `${splitPercentage} 1 0%`, overflow: 'hidden' }}>
        <PaneTree
          tree={first}
          resizerSize={resizerSize}
          snapThreshold={snapThreshold}
          renderResizer={propRenderResizer}
        />
      </div>
      {renderResizer ? (
        renderResizer({
          direction,
          splitPercentage,
          resizerSize,
          isResizing,
          onPointerDown: handlePointerDown,
        })
      ) : (
        <div
          className={classNames.resizer}
          data-direction={direction}
          style={{
            width: isRow ? `${resizerSize}px` : '100%',
            height: isRow ? '100%' : `${resizerSize}px`,
            cursor: isRow ? 'col-resize' : 'row-resize',
            position: 'relative',
            zIndex: 10,
            userSelect: 'none',
            touchAction: 'none',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
          onPointerDown={handlePointerDown}
          role="separator"
          aria-valuenow={splitPercentage}
          aria-valuemin={5}
          aria-valuemax={95}
        />
      )}
      <div style={{ flex: `${100 - splitPercentage} 1 0%`, overflow: 'hidden' }}>
        <PaneTree
          tree={second}
          resizerSize={resizerSize}
          snapThreshold={snapThreshold}
          renderResizer={propRenderResizer}
        />
      </div>
    </div>
  )
}

export const PaneTree: React.FC<PaneTreeProps> = ({
  tree,
  resizerSize = 4,
  snapThreshold: propSnapThreshold,
  renderResizer,
}) => {
  const {
    layout,
    renderPane,
    activeId,
    draggedOutId,
    setContainerRef,
    classNames,
    fullscreenPaneId,
    snapThreshold: contextSnapThreshold,
  } = useDashboardState()

  const snapThreshold = propSnapThreshold !== undefined ? propSnapThreshold : contextSnapThreshold

  const hasOtherPanes = useMemo(() => {
    if (tree !== undefined || !activeId) return false
    return removePane(layout, activeId) !== null
  }, [tree, layout, activeId])

  // Fullscreen bypass
  if (fullscreenPaneId && !tree) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {renderPane(fullscreenPaneId)}
      </div>
    )
  }

  const currentNode = tree !== undefined ? tree : layout

  if (!currentNode) return null

  const renderContent = () => {
    if (currentNode.type === 'pane') {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {renderPane(currentNode.paneId)}
        </div>
      )
    }

    return (
      <PaneSplit
        currentNode={currentNode}
        resizerSize={resizerSize}
        snapThreshold={snapThreshold}
        renderResizer={renderResizer}
      />
    )
  }

  // Only render RootDropZones at the top-level PaneTree (where tree is undefined)
  if (tree === undefined) {
    const isDragOutActive = activeId !== null && activeId === draggedOutId
    return (
      <div
        ref={setContainerRef}
        className={`zeugma-dashboard-root ${isDragOutActive ? 'zeugma-dashboard-dragout-active' : ''}`.trim()}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {renderContent()}
        <RootDropZones
          activeId={activeId}
          hasOtherPanes={hasOtherPanes}
          dropPreviewClassName={classNames.dropPreview}
        />
      </div>
    )
  }

  return renderContent()
}
