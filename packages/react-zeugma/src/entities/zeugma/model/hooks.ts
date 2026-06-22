import { useEffect, useRef, useState, useCallback } from 'react'
import { TabDetails } from '../../../shared'

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
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const registerPortalTarget = useCallback((tabId: string, el: HTMLDivElement | null) => {
    if (!isMountedRef.current) return
    setPortalTargets((prev) => {
      if (!el) {
        if (!prev[tabId]) return prev
        const next = { ...prev }
        delete next[tabId]
        return next
      }
      if (prev[tabId] === el) return prev
      return { ...prev, [tabId]: el }
    })
  }, [])

  const registerRenderCallback = useCallback(
    (tabId: string, render: (tab: TabDetails) => React.ReactNode) => {
      renderCallbacksRef.current[tabId] = render
    },
    [],
  )

  return { portalTargets, registerPortalTarget, registerRenderCallback, renderCallbacksRef }
}
