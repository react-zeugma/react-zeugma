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
  onLayoutChange: (newLayout: TreeNode | null) => void
  onResizeStart?: () => void
  onResizeEnd?: () => void
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
}: UseResizerProps) {
  const {
    onResizeStart: globalOnResizeStart,
    onResize: globalOnResize,
    onResizeEnd: globalOnResizeEnd,
    minSplitPercentage = 5,
    maxSplitPercentage = 95,
  } = useZeugmaState()

  return useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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
            ? ((moveEvent.clientX - startX) / rect.width) * 100
            : ((moveEvent.clientY - startY) / rect.height) * 100
          const proposedPercentage = startPercentage + delta

          // Find physical position corresponding to proposed percentage
          const proposedPos = isRow
            ? rect.left + (rect.width - resizerSize) * (proposedPercentage / 100) + resizerSize / 2
            : rect.top + (rect.height - resizerSize) * (proposedPercentage / 100) + resizerSize / 2

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
              ? ((bestTarget - resizerSize / 2 - rect.left) / (rect.width - resizerSize)) * 100
              : ((bestTarget - resizerSize / 2 - rect.top) / (rect.height - resizerSize)) * 100
          }

          const finalPercentage = Math.max(
            minSplitPercentage,
            Math.min(maxSplitPercentage, snappedPercentage),
          )
          currentPercentage = finalPercentage

          // Imperatively update the sibling pane container flex sizes during drag
          const firstChild = container.children[0] as HTMLElement
          const secondChild = container.children[container.children.length - 1] as HTMLElement
          if (firstChild && secondChild) {
            firstChild.style.flex = `${finalPercentage} 1 0%`
            secondChild.style.flex = `${100 - finalPercentage} 1 0%`
          }

          if (globalOnResize) {
            globalOnResize(currentNode, finalPercentage)
          }
        },
        onEnd: () => {
          // Write to React state once resizing completes
          const newLayout = updateSplitPercentage(layout, currentNode, currentPercentage)
          onLayoutChange(newLayout)

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
    ],
  )
}
