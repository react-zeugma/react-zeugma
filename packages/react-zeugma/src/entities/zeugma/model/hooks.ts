import { useEffect, useRef, useState, useCallback, useMemo, useContext } from 'react'
import { TabDetails, TreeNode, PortalRegistryContext } from '../../../shared'

/**
 * Custom hook to track the latest pointer/touch coordinate relative to the viewport during dragging.
 * This ensures boundary checking coordinates remain accurate even when DOM elements change layout/hidden state.
 */
export function useLatestPointer(activeId: string | null) {
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!activeId) {
      latestPointerRef.current = null
      return
    }

    const handlePointerMove = (e: PointerEvent) => {
      latestPointerRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0] || e.changedTouches[0]
      if (touch) {
        latestPointerRef.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [activeId])

  return latestPointerRef
}

/**
 * Hook to override the body cursor style when drag/hover operations require a specific global cursor (e.g., not-allowed).
 */
export function useBodyCursorOverride(isOverLocked: boolean) {
  useEffect(() => {
    if (isOverLocked) {
      document.body.style.setProperty('cursor', 'not-allowed', 'important')
    } else {
      document.body.style.removeProperty('cursor')
    }
    return () => {
      document.body.style.removeProperty('cursor')
    }
  }, [isOverLocked])
}

export function usePortalRegistry() {
  const [portalTargets, setPortalTargets] = useState<Record<string, HTMLDivElement | null>>({})
  const renderCallbacksRef = useRef<Record<string, (tab: TabDetails) => React.ReactNode>>({})
  const renderPaneRef = useRef<((paneId: string) => React.ReactNode) | null>(null)
  const tabHeadersRef = useRef<
    Record<string, (props: { isDragging: boolean; isOver: boolean }) => React.ReactNode>
  >({})
  const activeIdRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const registerPortalTarget = useCallback(
    (tabId: string, el: HTMLDivElement | null, expectedEl?: HTMLDivElement | null) => {
      if (!isMountedRef.current) return
      setPortalTargets((prev) => {
        if (!el) {
          if (expectedEl && prev[tabId] !== expectedEl) {
            return prev
          }
          if (!prev[tabId]) return prev
          const next = { ...prev }
          delete next[tabId]
          return next
        }
        if (prev[tabId] === el) return prev
        return { ...prev, [tabId]: el }
      })
    },
    [],
  )

  const registerRenderCallback = useCallback(
    (tabId: string, render: (tab: TabDetails) => React.ReactNode) => {
      renderCallbacksRef.current[tabId] = render
    },
    [],
  )

  const registerRenderPane = useCallback((render: (paneId: string) => React.ReactNode) => {
    renderPaneRef.current = render
  }, [])

  const registerTabHeader = useCallback(
    (
      tabId: string,
      render: (props: { isDragging: boolean; isOver: boolean }) => React.ReactNode,
    ) => {
      tabHeadersRef.current[tabId] = render
    },
    [],
  )

  return {
    portalTargets,
    registerPortalTarget,
    registerRenderCallback,
    renderCallbacksRef,
    registerRenderPane,
    renderPaneRef,
    registerTabHeader,
    tabHeadersRef,
    activeIdRef,
  }
}

export function collectAllTabIds(layout: TreeNode | null): string[] {
  const ids = new Set<string>()
  function traverse(node: TreeNode | null) {
    if (!node) return
    if (node.type === 'pane') {
      node.tabIds.forEach((tabId) => {
        ids.add(tabId)
      })
    } else if (node.type === 'split') {
      traverse(node.first)
      traverse(node.second)
    }
  }
  traverse(layout)
  return Array.from(ids).sort()
}

export function useAllTabIds(layout: TreeNode | null): string[] {
  return useMemo(() => collectAllTabIds(layout), [layout])
}

interface UseZeugmaDragMeasurementProps {
  onDragStart?: (activeId: string) => void
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'move'
      direction?: 'row' | 'column'
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
}

export function useZeugmaDragMeasurement(props: UseZeugmaDragMeasurementProps) {
  const { onDragStart, onDragEnd } = props

  const [overTabId, setOverTabId] = useState<string | null>(null)
  const [overTabPosition, setOverTabPosition] = useState<'before' | 'after' | null>(null)

  const handleDragStartInternal = useCallback(
    (draggingId: string) => {
      if (onDragStart) {
        onDragStart(draggingId)
      }
    },
    [onDragStart],
  )

  const handleDragEndInternal = useCallback(
    (
      actId: string,
      ovId: string | null,
      dropAction: {
        type: 'split' | 'move'
        direction?: 'row' | 'column'
        position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
      } | null,
    ) => {
      if (onDragEnd) {
        onDragEnd(actId, ovId, dropAction)
      }
    },
    [onDragEnd],
  )

  return {
    overTabId,
    setOverTabId,
    overTabPosition,
    setOverTabPosition,
    handleDragStartInternal,
    handleDragEndInternal,
  }
}

export function useRegisterRenderPane(
  renderPane: ((paneId: string) => React.ReactNode) | undefined,
) {
  const portalRegistry = useContext(PortalRegistryContext)
  const registerRenderPane = portalRegistry?.registerRenderPane

  useEffect(() => {
    if (registerRenderPane && renderPane) {
      registerRenderPane(renderPane)
    }
  }, [registerRenderPane, renderPane])
}
