import React, { useCallback } from 'react'
import { TreeNode, SplitNode, SplitDirection } from '../../../shared/model'
import { updateSplitPercentage } from '../../../shared/lib/tree'
import { useDashboard } from '../../../entities/dashboard'

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
  } = useDashboard()

  return useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return

      document.body.classList.add('zeugma-resizing')

      // Inject global cursor style to keep resizing cursor active across the entire page during drag
      const styleEl = document.createElement('style')
      styleEl.id = 'zeugma-global-cursor-style'
      styleEl.textContent = `
      * {
        cursor: ${isRow ? 'col-resize' : 'row-resize'} !important;
        user-select: none !important;
      }
    `
      document.head.appendChild(styleEl)

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

      // Cache other resizers of the same direction once at drag-start to prevent layout thrashing on move
      const resizerEl = e.currentTarget
      resizerEl.setAttribute('data-resizing', 'true')

      const otherResizers = Array.from(
        document.querySelectorAll('div[role="separator"][data-direction]'),
      ).filter((el) => el !== resizerEl && el.getAttribute('data-direction') === direction)

      const otherPositions = otherResizers.map((el) => {
        const r = el.getBoundingClientRect()
        return isRow ? r.left + r.width / 2 : r.top + r.height / 2
      })

      let currentPercentage = startPercentage

      const handlePointerMove = (moveEvent: PointerEvent) => {
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
        const newLayout = updateSplitPercentage(layout, currentNode, finalPercentage)
        onLayoutChange(newLayout)
        if (globalOnResize) {
          globalOnResize(currentNode, finalPercentage)
        }
      }

      const handlePointerUp = () => {
        document.body.classList.remove('zeugma-resizing')
        resizerEl.removeAttribute('data-resizing')

        const globalStyle = document.getElementById('zeugma-global-cursor-style')
        if (globalStyle) {
          globalStyle.remove()
        }

        document.removeEventListener('pointermove', handlePointerMove)
        document.removeEventListener('pointerup', handlePointerUp)

        if (localOnResizeEnd) {
          localOnResizeEnd()
        }
        if (globalOnResizeEnd) {
          globalOnResizeEnd(currentNode, currentPercentage)
        }
      }

      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
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
