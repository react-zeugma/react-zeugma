import React, { useRef, useMemo, useState } from 'react'
import { useZeugmaState } from '../../../entities/zeugma'
import { useResizer } from '../../../features/resize-pane'
import { TreeNode, SplitNode, SplitDirection, PaneNode } from '../../../shared/model'

export interface PaneTreeProps {
  /** The layout subtree node to render. If not specified, defaults to the root layout tree from the Zeugma context. */
  tree?: TreeNode | null
  /** Size/thickness of the split handle resizer bars in pixels (default 4). */
  resizerSize?: number
  /** Threshold distance in pixels to snap layout resizers to adjacent edges (default 8). */
  snapThreshold?: number
}

interface ComputedPane {
  paneId: string
  left: number
  top: number
  width: number
  height: number
  node: PaneNode
}

interface ComputedSplitter {
  id: string
  currentNode: SplitNode
  direction: SplitDirection
  left: number
  top: number
  width: number
  height: number
  parentLeft: number
  parentTop: number
  parentWidth: number
  parentHeight: number
}

function computeLayout(
  node: TreeNode,
  left = 0,
  top = 0,
  width = 100,
  height = 100,
  path = 'root',
): { panes: ComputedPane[]; splitters: ComputedSplitter[] } {
  if (node.type === 'pane') {
    return {
      panes: [{ paneId: node.paneId, left, top, width, height, node }],
      splitters: [],
    }
  }

  const { direction, splitPercentage, first, second } = node
  const splitterId = `splitter-${path}-${direction}`

  const currentSplitter: ComputedSplitter = {
    id: splitterId,
    currentNode: node,
    direction,
    left: direction === 'row' ? left + width * (splitPercentage / 100) : left,
    top: direction === 'column' ? top + height * (splitPercentage / 100) : top,
    width: direction === 'row' ? 0 : width,
    height: direction === 'column' ? 0 : height,
    parentLeft: left,
    parentTop: top,
    parentWidth: width,
    parentHeight: height,
  }

  let firstLayout = { panes: [] as ComputedPane[], splitters: [] as ComputedSplitter[] }
  let secondLayout = { panes: [] as ComputedPane[], splitters: [] as ComputedSplitter[] }

  if (direction === 'row') {
    const firstWidth = width * (splitPercentage / 100)
    firstLayout = computeLayout(first, left, top, firstWidth, height, `${path}-L`)
    secondLayout = computeLayout(
      second,
      left + firstWidth,
      top,
      width - firstWidth,
      height,
      `${path}-R`,
    )
  } else {
    const firstHeight = height * (splitPercentage / 100)
    firstLayout = computeLayout(first, left, top, width, firstHeight, `${path}-T`)
    secondLayout = computeLayout(
      second,
      left,
      top + firstHeight,
      width,
      height - firstHeight,
      `${path}-B`,
    )
  }

  return {
    panes: [...firstLayout.panes, ...secondLayout.panes],
    splitters: [currentSplitter, ...firstLayout.splitters, ...secondLayout.splitters],
  }
}

interface FlatSplitterProps {
  splitter: ComputedSplitter
  resizerSize: number
  snapThreshold: number
  containerRef: React.RefObject<HTMLDivElement | null>
}

const FlatSplitter: React.FC<FlatSplitterProps> = ({
  splitter,
  resizerSize,
  snapThreshold,
  containerRef,
}) => {
  const { layout, onLayoutChange, classNames } = useZeugmaState()
  const [isResizing, setIsResizing] = useState(false)

  const {
    currentNode,
    direction,
    left,
    top,
    width,
    height,
    parentLeft,
    parentTop,
    parentWidth,
    parentHeight,
  } = splitter

  const isRow = direction === 'row'

  const handlePointerDown = useResizer({
    containerRef,
    isRow,
    direction,
    splitPercentage: currentNode.splitPercentage,
    resizerSize,
    snapThreshold,
    layout,
    currentNode,
    onLayoutChange,
    onResizeStart: () => setIsResizing(true),
    onResizeEnd: () => setIsResizing(false),
    parentLeft,
    parentTop,
    parentWidth,
    parentHeight,
  })

  const style: React.CSSProperties = isRow
    ? {
        position: 'absolute',
        left: `calc(${left}% - ${resizerSize / 2}px)`,
        top: `${top}%`,
        width: `${resizerSize}px`,
        height: `${height}%`,
        cursor: 'col-resize',
        zIndex: 10,
        userSelect: 'none',
        touchAction: 'none',
        boxSizing: 'border-box',
      }
    : {
        position: 'absolute',
        left: `${left}%`,
        top: `calc(${top}% - ${resizerSize / 2}px)`,
        width: `${width}%`,
        height: `${resizerSize}px`,
        cursor: 'row-resize',
        zIndex: 10,
        userSelect: 'none',
        touchAction: 'none',
        boxSizing: 'border-box',
      }

  return (
    <div
      className={`zeugma-resizer ${classNames.resizer || ''}`.trim()}
      data-direction={direction}
      data-resizing={isResizing || undefined}
      style={style}
      onPointerDown={handlePointerDown}
      role="separator"
      aria-valuenow={currentNode.splitPercentage}
      aria-valuemin={5}
      aria-valuemax={95}
    />
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
    activeId,
    dismissIntentId,
    setContainerRef,
    fullscreenPaneId,
    snapThreshold: contextSnapThreshold,
  } = useZeugmaState()

  const snapThreshold =
    propSnapThreshold !== undefined ? propSnapThreshold : (contextSnapThreshold ?? 8)

  const currentNode = tree !== undefined ? tree : layout

  const containerRef = useRef<HTMLDivElement>(null)

  const { panes, splitters } = useMemo(() => {
    if (!currentNode) return { panes: [], splitters: [] }
    return computeLayout(currentNode)
  }, [currentNode])

  if (!currentNode) return null

  const renderContent = () => {
    return (
      <>
        {panes.map((pane) => {
          const isFullscreen = fullscreenPaneId === pane.paneId
          return (
            <div
              key={pane.paneId}
              style={{
                position: 'absolute',
                left: isFullscreen ? '0%' : `${pane.left}%`,
                top: isFullscreen ? '0%' : `${pane.top}%`,
                width: isFullscreen ? '100%' : `${pane.width}%`,
                height: isFullscreen ? '100%' : `${pane.height}%`,
                overflow: 'hidden',
                zIndex: isFullscreen ? 20 : 1,
                display: fullscreenPaneId && !isFullscreen ? 'none' : 'block',
                padding: isFullscreen ? '0px' : `${resizerSize / 2}px`,
                boxSizing: 'border-box',
              }}
            >
              {renderPane(pane.paneId)}
            </div>
          )
        })}

        {!fullscreenPaneId &&
          splitters.map((splitter) => (
            <FlatSplitter
              key={splitter.id}
              splitter={splitter}
              resizerSize={resizerSize}
              snapThreshold={snapThreshold}
              containerRef={containerRef}
            />
          ))}
      </>
    )
  }

  // Only render RootDropZones at the top-level PaneTree (where tree is undefined)
  if (tree === undefined) {
    const isDismissActive = activeId !== null && activeId === dismissIntentId

    // Merge container refs
    const handleRef = (el: HTMLDivElement | null) => {
      setContainerRef(el)
      ;(containerRef as React.RefObject<HTMLDivElement | null>).current = el
    }

    return (
      <div
        ref={handleRef}
        className={`zeugma-dashboard-root ${isDismissActive ? 'zeugma-dashboard-dismiss-active' : ''}`.trim()}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {renderContent()}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {renderContent()}
    </div>
  )
}
