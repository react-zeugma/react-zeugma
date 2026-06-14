import React, { useCallback } from 'react'
import { TreeNode, SplitNode, SplitDirection } from '../../../shared/model'
import { updateSplitPercentage } from '../../../shared/lib/tree'
import { createDragSession } from '../../../shared/lib/drag-session'
import { useZeugmaState } from '../../../entities/zeugma'

interface UseResizerProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  isRow: boolean
  direction: SplitDirection
  splitPercentage: number
  resizerSize: number
  snapThreshold: number
  layout: TreeNode | null
  currentNode: SplitNode
  onLayoutChange: (newLayout: TreeNode | null, localOnly?: boolean) => void
  onResizeStart?: () => void
  onResizeEnd?: () => void
  parentLeft: number
  parentTop: number
  parentWidth: number
  parentHeight: number
}

export function useResizer({
  containerRef,
  isRow,
  direction,
  splitPercentage,
  resizerSize,
  snapThreshold,
  layout,
  currentNode,
  onLayoutChange,
  onResizeStart: localOnResizeStart,
  onResizeEnd: localOnResizeEnd,
  parentLeft,
  parentTop,
  parentWidth,
  parentHeight,
}: UseResizerProps) {
  const {
    onResizeStart: globalOnResizeStart,
    onResize: globalOnResize,
    onResizeEnd: globalOnResizeEnd,
    minSplitPercentage = 5,
    maxSplitPercentage = 95,
    locked = false,
  } = useZeugmaState()

  return useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (locked) return
      e.preventDefault()
      const container = containerRef.current
      if (!container) return

      if (localOnResizeStart) {
        localOnResizeStart()
      }
      if (globalOnResizeStart) {
        globalOnResizeStart(currentNode)
      }

      const rect = container.getBoundingClientRect()
      const startX = e.clientX
      const startY = e.clientY
      const startPercentage = splitPercentage
      const resizerEl = e.currentTarget

      // Compute the absolute bounds of the parent split area in pixels
      const splitAreaLeft = rect.left + rect.width * (parentLeft / 100)
      const splitAreaTop = rect.top + rect.height * (parentTop / 100)
      const splitAreaWidth = rect.width * (parentWidth / 100)
      const splitAreaHeight = rect.height * (parentHeight / 100)

      // Cache other resizers of the same direction once at drag-start to prevent layout thrashing on move
      const otherResizers = Array.from(
        document.querySelectorAll('div[role="separator"][data-direction]'),
      ).filter((el) => el !== resizerEl && el.getAttribute('data-direction') === direction)

      const otherPositions = otherResizers.map((el) => {
        const r = el.getBoundingClientRect()
        return isRow ? r.left + r.width / 2 : r.top + r.height / 2
      })

      let currentPercentage = startPercentage

      createDragSession({
        cursor: isRow ? 'col-resize' : 'row-resize',
        resizerEl,
        onMove: (moveEvent: PointerEvent) => {
          const delta = isRow
            ? ((moveEvent.clientX - startX) / splitAreaWidth) * 100
            : ((moveEvent.clientY - startY) / splitAreaHeight) * 100
          const proposedPercentage = startPercentage + delta

          // Find physical position corresponding to proposed percentage
          const proposedPos = isRow
            ? splitAreaLeft +
              (splitAreaWidth - resizerSize) * (proposedPercentage / 100) +
              resizerSize / 2
            : splitAreaTop +
              (splitAreaHeight - resizerSize) * (proposedPercentage / 100) +
              resizerSize / 2

          let closestDistance = Infinity
          let bestTarget: number | null = null

          for (const pos of otherPositions) {
            const dist = Math.abs(proposedPos - pos)
            if (dist < snapThreshold && dist < closestDistance) {
              closestDistance = dist
              bestTarget = pos
            }
          }

          let snappedPercentage = proposedPercentage
          if (bestTarget !== null) {
            snappedPercentage = isRow
              ? ((bestTarget - resizerSize / 2 - splitAreaLeft) / (splitAreaWidth - resizerSize)) *
                100
              : ((bestTarget - resizerSize / 2 - splitAreaTop) / (splitAreaHeight - resizerSize)) *
                100
          }

          const finalPercentage = Math.max(
            minSplitPercentage,
            Math.min(maxSplitPercentage, snappedPercentage),
          )
          currentPercentage = finalPercentage

          // Update React layout state live on every move event
          const newLayout = updateSplitPercentage(layout, currentNode, finalPercentage)
          onLayoutChange(newLayout, true)

          if (globalOnResize) {
            globalOnResize(currentNode, finalPercentage)
          }
        },
        onEnd: () => {
          const finalLayout = updateSplitPercentage(layout, currentNode, currentPercentage)
          onLayoutChange(finalLayout)

          if (localOnResizeEnd) {
            localOnResizeEnd()
          }
          if (globalOnResizeEnd) {
            globalOnResizeEnd(currentNode, currentPercentage)
          }
        },
      })
    },
    [
      containerRef,
      isRow,
      direction,
      splitPercentage,
      resizerSize,
      snapThreshold,
      layout,
      currentNode,
      onLayoutChange,
      localOnResizeStart,
      localOnResizeEnd,
      globalOnResizeStart,
      globalOnResize,
      globalOnResizeEnd,
      minSplitPercentage,
      maxSplitPercentage,
      parentLeft,
      parentTop,
      parentWidth,
      parentHeight,
    ],
  )
}
