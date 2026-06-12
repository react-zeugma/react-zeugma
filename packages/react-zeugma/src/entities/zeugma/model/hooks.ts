import { useContext, useEffect, useRef } from 'react'
import { ZeugmaStateContext, ZeugmaActionsContext } from './context'
import { ZeugmaStateValue, ZeugmaActionsValue } from './types'

export const useZeugmaState = (): ZeugmaStateValue => {
  const state = useContext(ZeugmaStateContext)
  if (!state) {
    throw new Error('useZeugmaState must be used within a Zeugma provider')
  }
  return state
}

export const useZeugmaActions = (): ZeugmaActionsValue => {
  const actions = useContext(ZeugmaActionsContext)
  if (!actions) {
    throw new Error('useZeugmaActions must be used within a Zeugma provider')
  }
  return actions
}

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
