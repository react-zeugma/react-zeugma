import React, { useRef } from 'react'
import { useDashboard } from '../../../entities/dashboard'
import { useResizer } from '../../../features/resize-pane'
import { TreeNode, SplitNode } from '../../../shared/model'

export interface PaneTreeProps {
  tree?: TreeNode | null
  /** Size of the resizer in pixels (default 4) */
  resizerSize?: number
  /** Threshold in pixels to snap to adjacent resizer edges (default 8) */
  snapThreshold?: number
}

interface PaneSplitProps {
  currentNode: SplitNode
  resizerSize: number
  snapThreshold?: number
}

const PaneSplit: React.FC<PaneSplitProps> = ({ currentNode, resizerSize, snapThreshold }) => {
  const { layout, onLayoutChange, classNames } = useDashboard()

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
        <PaneTree tree={first} resizerSize={resizerSize} snapThreshold={snapThreshold} />
      </div>
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
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        onPointerDown={handlePointerDown}
        role="separator"
        aria-valuenow={splitPercentage}
        aria-valuemin={5}
        aria-valuemax={95}
      />
      <div style={{ flex: `${100 - splitPercentage} 1 0%`, overflow: 'hidden' }}>
        <PaneTree tree={second} resizerSize={resizerSize} snapThreshold={snapThreshold} />
      </div>
    </div>
  )
}

export const PaneTree: React.FC<PaneTreeProps> = ({
  tree,
  resizerSize = 4,
  snapThreshold: propSnapThreshold,
}) => {
  const {
    layout,
    renderPane,
    fullscreenPaneId,
    snapThreshold: contextSnapThreshold,
  } = useDashboard()

  const snapThreshold = propSnapThreshold !== undefined ? propSnapThreshold : contextSnapThreshold

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

  if (currentNode.type === 'pane') {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {renderPane(currentNode.paneId)}
      </div>
    )
  }

  return (
    <PaneSplit currentNode={currentNode} resizerSize={resizerSize} snapThreshold={snapThreshold} />
  )
}
