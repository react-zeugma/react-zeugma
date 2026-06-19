import { useEffect, useRef, useState, useCallback } from 'react'
import { copyStyles } from '../../../shared/lib/dom'

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
      if (prev[tabId] === el) return prev
      return { ...prev, [tabId]: el }
    })
  }, [])

  return { portalTargets, registerPortalTarget }
}

export interface UsePopupWindowOptions {
  tabId: string
  isOpenedInNewWindow: boolean
  onClose: () => void
}

export function usePopupWindow({ tabId, isOpenedInNewWindow, onClose }: UsePopupWindowOptions) {
  const popupRef = useRef<Window | null>(null)
  const [popupContainer, setPopupContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    let intervalId: ReturnType<typeof setTimeout> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    if (isOpenedInNewWindow) {
      if (!popupRef.current || popupRef.current.closed) {
        const winName = `zeugma-tab-${tabId.replace(/[^a-zA-Z0-9]/g, '_')}`
        const win = window.open(
          '',
          winName,
          'width=800,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=yes',
        )

        if (win) {
          popupRef.current = win

          // Set document title
          const title = tabId.includes('/') ? tabId.split('/').pop()! : tabId
          win.document.title = title

          win.addEventListener('beforeunload', onClose)

          // 300ms delay to let the document paint and stabilize
          timeoutId = setTimeout(() => {
            // Copy stylesheets and document attributes from main window
            copyStyles(document, win.document)

            // Setup body layout
            win.document.body.style.margin = '0'
            win.document.body.style.padding = '0'

            let container = win.document.getElementById(
              'zeugma-popup-root',
            ) as HTMLDivElement | null
            if (!container) {
              container = win.document.createElement('div')
              container.id = 'zeugma-popup-root'
              container.style.width = '100%'
              container.style.height = '100vh'
              win.document.body.appendChild(container)
            }

            setPopupContainer(container)
          }, 300)

          // Polling interval to detect close
          intervalId = setInterval(() => {
            if (win.closed) {
              onClose()
            }
          }, 300)
        } else {
          console.warn('Popup window blocked or failed to open.')
          onClose()
        }
      }
    } else {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }
      popupRef.current = null
      setPopupContainer(null)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
      if (popupRef.current) {
        popupRef.current.removeEventListener('beforeunload', onClose)
      }
    }
  }, [isOpenedInNewWindow, tabId, onClose])

  // Clean up popup on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }
    }
  }, [])

  return { popupWindow: popupRef.current, popupContainer }
}
