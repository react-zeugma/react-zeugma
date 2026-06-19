import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useZeugmaState, useZeugmaActions, getOrCreateHiddenContainer } from '../../../shared'
import { usePopupWindow } from '../model/hooks'

export interface PortalHostItemProps {
  tabId: string
  target: HTMLDivElement | null
  renderWidget?: (tabId: string) => React.ReactNode
}

export const PortalHostItem: React.FC<PortalHostItemProps> = React.memo(
  ({ tabId, target, renderWidget }) => {
    const [mounted, setMounted] = useState(false)
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    const { popoutTabs } = useZeugmaState()
    const { setTabPopout } = useZeugmaActions()

    const isOpenedInNewWindow = !!popoutTabs[tabId]

    useEffect(() => {
      setMounted(true)
    }, [])

    const handleClose = useCallback(() => {
      // Adopt wrapper back to main window immediately to prevent loss when window is closed
      if (wrapperRef.current) {
        document.adoptNode(wrapperRef.current)
        const hiddenContainer = getOrCreateHiddenContainer('zeugma-hidden-portal-container')
        hiddenContainer.appendChild(wrapperRef.current)
      }
      setTabPopout(tabId, false)
    }, [tabId, setTabPopout])

    const { popupWindow, popupContainer } = usePopupWindow({
      tabId,
      isOpenedInNewWindow,
      onClose: handleClose,
    })

    // Move the stable wrapper in the DOM when the target pane element or window state changes
    useEffect(() => {
      if (!mounted || !wrapperRef.current) return

      const wrapper = wrapperRef.current
      if (isOpenedInNewWindow) {
        if (popupContainer && popupWindow) {
          popupWindow.document.adoptNode(wrapper)
          popupContainer.appendChild(wrapper)
        }
      } else {
        document.adoptNode(wrapper)
        if (target) {
          target.appendChild(wrapper)
        } else {
          const hiddenContainer = getOrCreateHiddenContainer('zeugma-hidden-portal-container')
          hiddenContainer.appendChild(wrapper)
        }
      }
    }, [target, mounted, isOpenedInNewWindow, popupContainer, popupWindow])

    // Clean up wrapper on unmount
    useEffect(() => {
      return () => {
        if (wrapperRef.current) {
          wrapperRef.current.remove()
        }
      }
    }, [])

    if (!mounted) return null

    if (!wrapperRef.current) {
      wrapperRef.current = document.createElement('div')
      wrapperRef.current.className = `zeugma-portal-wrapper-${tabId}`
      wrapperRef.current.style.width = '100%'
      wrapperRef.current.style.height = '100%'
    }

    const wrapper = wrapperRef.current

    if (!wrapper || !renderWidget) return null

    return createPortal(renderWidget(tabId), wrapper)
  },
)
