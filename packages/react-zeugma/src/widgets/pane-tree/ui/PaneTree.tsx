import React, { useRef, useMemo, useState } from 'react'
import { useZeugmaState } from '../../../shared'
import { useResizer } from '../../../features/resize-pane'
import { TreeNode } from '../../../shared'
import { ComputedSplitter, computeLayout } from '../../../shared/lib/tree'
import { RootDropZones } from '../../../entities/zeugma/ui'

export interface PaneTreeProps {
  /** The layout subtree node to render. If not specified, defaults to the root layout tree from the Zeugma context. */
  tree?: TreeNode | null
  /** Size/thickness of the split handle resizer bars in pixels (default 4). */
  resizerSize?: number
  /** Threshold distance in pixels to snap layout resizers to adjacent edges (default 8). */
  snapThreshold?: number
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
  const { layout, setLayout, classNames, locked } = useZeugmaState()
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
    onLayoutChange: setLayout,
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
        left: `calc(var(--splitter-pos-${splitter.id}, ${left}%) - ${resizerSize / 2}px)`,
        top: `calc(${top}% + ${resizerSize / 2}px)`,
        width: `${resizerSize}px`,
        height: `calc(${height}% - ${resizerSize}px)`,
        cursor: locked ? 'default' : 'col-resize',
        pointerEvents: locked ? 'none' : 'auto',
        zIndex: 10,
        userSelect: 'none',
        touchAction: 'none',
        boxSizing: 'border-box',
      }
    : {
        position: 'absolute',
        left: `calc(${left}% + ${resizerSize / 2}px)`,
        top: `calc(var(--splitter-pos-${splitter.id}, ${top}%) - ${resizerSize / 2}px)`,
        width: `calc(${width}% - ${resizerSize}px)`,
        height: `${resizerSize}px`,
        cursor: locked ? 'default' : 'row-resize',
        pointerEvents: locked ? 'none' : 'auto',
        zIndex: 10,
        userSelect: 'none',
        touchAction: 'none',
        boxSizing: 'border-box',
      }

  return (
    <div
      className={classNames.resizer || ''}
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

const MemoizedPaneContent = React.memo(
  ({ paneId, renderPane }: { paneId: string; renderPane: (id: string) => React.ReactNode }) => {
    return <>{renderPane(paneId)}</>
  },
  (prev, next) => prev.paneId === next.paneId && prev.renderPane === next.renderPane,
)

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
    locked,
    classNames,
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
                left: isFullscreen ? '0%' : `var(--pane-left-${pane.paneId}, ${pane.left}%)`,
                top: isFullscreen ? '0%' : `var(--pane-top-${pane.paneId}, ${pane.top}%)`,
                width: isFullscreen ? '100%' : `var(--pane-width-${pane.paneId}, ${pane.width}%)`,
                height: isFullscreen
                  ? '100%'
                  : `var(--pane-height-${pane.paneId}, ${pane.height}%)`,
                overflow: 'hidden',
                zIndex: isFullscreen ? 20 : 1,
                display: fullscreenPaneId && !isFullscreen ? 'none' : 'block',
                padding: isFullscreen ? '0px' : `${resizerSize / 2}px`,
                boxSizing: 'border-box',
              }}
            >
              <MemoizedPaneContent paneId={pane.paneId} renderPane={renderPane} />
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

    const dashboardClass = `${classNames.dashboard || ''} ${
      isDismissActive ? classNames.dashboardDismissActive || '' : ''
    } ${locked ? classNames.dashboardLocked || '' : ''}`.trim()

    return (
      <div
        ref={handleRef}
        className={dashboardClass}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {renderContent()}
        {activeId !== null && !locked && (
          <RootDropZones activeClassName={classNames.rootDropPreview ?? classNames.dropPreview} />
        )}
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
