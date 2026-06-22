import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TabDetails } from '../../../shared'

export interface PortalHostItemProps {
  tabDetails: TabDetails
  target: HTMLDivElement | null
  renderWidget?: (tab: TabDetails) => React.ReactNode
}

export const PortalHostItem: React.FC<PortalHostItemProps> = React.memo(
  ({ tabDetails, target, renderWidget }) => {
    const { id: tabId } = tabDetails
    const [mounted, setMounted] = useState(false)
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      setMounted(true)
    }, [])

    // Move the stable wrapper in the DOM when the target pane element changes
    useEffect(() => {
      if (!mounted || !wrapperRef.current) return

      const wrapper = wrapperRef.current
      if (target) {
        target.appendChild(wrapper)
      } else {
        let hiddenContainer = document.getElementById('zeugma-hidden-portal-container')
        if (!hiddenContainer) {
          hiddenContainer = document.createElement('div')
          hiddenContainer.id = 'zeugma-hidden-portal-container'
          hiddenContainer.style.display = 'none'
          document.body.appendChild(hiddenContainer)
        }
        hiddenContainer.appendChild(wrapper)
      }
    }, [target, mounted])

    // Clean up the DOM element on unmount
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

    return createPortal(renderWidget(tabDetails), wrapper)
  },
  (prev, next) => {
    return (
      prev.target === next.target &&
      prev.renderWidget === next.renderWidget &&
      prev.tabDetails.id === next.tabDetails.id &&
      prev.tabDetails.paneId === next.tabDetails.paneId &&
      prev.tabDetails.isActive === next.tabDetails.isActive &&
      prev.tabDetails.index === next.tabDetails.index &&
      prev.tabDetails.metadata === next.tabDetails.metadata
    )
  },
)
