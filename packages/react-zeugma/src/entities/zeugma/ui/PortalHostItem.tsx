import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TabDetails } from '../../../shared'

export interface PortalHostItemProps {
  tabDetails: TabDetails
  target: HTMLDivElement | null
  renderWidget?: (tab: TabDetails) => React.ReactNode
}

export const PopoutRenderWrapper: React.FC<{ popoutDoc: Document; children: React.ReactNode }> = ({
  popoutDoc,
  children,
}) => {
  const originalUseEffect = React.useEffect
  const originalUseLayoutEffect = React.useLayoutEffect
  const originalUseInsertionEffect = (
    React as unknown as {
      useInsertionEffect?: (effect: () => void | (() => void), deps?: React.DependencyList) => void
    }
  ).useInsertionEffect

  React.useEffect = (effect, deps) => {
    return originalUseEffect(() => {
      window.__zeugmaActivePopoutDocument = popoutDoc
      try {
        const cleanup = effect()
        if (typeof cleanup === 'function') {
          return () => {
            window.__zeugmaActivePopoutDocument = popoutDoc
            try {
              return cleanup()
            } finally {
              window.__zeugmaActivePopoutDocument = null
            }
          }
        }
        return cleanup
      } finally {
        window.__zeugmaActivePopoutDocument = null
      }
    }, deps)
  }

  React.useLayoutEffect = (effect, deps) => {
    return originalUseLayoutEffect(() => {
      window.__zeugmaActivePopoutDocument = popoutDoc
      try {
        const cleanup = effect()
        if (typeof cleanup === 'function') {
          return () => {
            window.__zeugmaActivePopoutDocument = popoutDoc
            try {
              return cleanup()
            } finally {
              window.__zeugmaActivePopoutDocument = null
            }
          }
        }
        return cleanup
      } finally {
        window.__zeugmaActivePopoutDocument = null
      }
    }, deps)
  }

  if (originalUseInsertionEffect) {
    ;(
      React as unknown as {
        useInsertionEffect?: (
          effect: () => void | (() => void),
          deps?: React.DependencyList,
        ) => void
      }
    ).useInsertionEffect = (effect, deps) => {
      return originalUseInsertionEffect(() => {
        window.__zeugmaActivePopoutDocument = popoutDoc
        try {
          const cleanup = effect()
          if (typeof cleanup === 'function') {
            return () => {
              window.__zeugmaActivePopoutDocument = popoutDoc
              try {
                return cleanup()
              } finally {
                window.__zeugmaActivePopoutDocument = null
              }
            }
          }
          return cleanup
        } finally {
          window.__zeugmaActivePopoutDocument = null
        }
      }, deps)
    }
  }

  window.__zeugmaActivePopoutDocument = popoutDoc
  try {
    return <>{children}</>
  } finally {
    window.__zeugmaActivePopoutDocument = null
    React.useEffect = originalUseEffect
    React.useLayoutEffect = originalUseLayoutEffect
    if (originalUseInsertionEffect) {
      ;(
        React as unknown as {
          useInsertionEffect?: (
            effect: () => void | (() => void),
            deps?: React.DependencyList,
          ) => void
        }
      ).useInsertionEffect = originalUseInsertionEffect
    }
  }
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
        target.ownerDocument.adoptNode(wrapper)
        target.appendChild(wrapper)
      } else {
        let hiddenContainer = document.getElementById('zeugma-hidden-portal-container')
        if (!hiddenContainer) {
          hiddenContainer = document.createElement('div')
          hiddenContainer.id = 'zeugma-hidden-portal-container'
          hiddenContainer.style.display = 'none'
          document.body.appendChild(hiddenContainer)
        }
        document.adoptNode(wrapper)
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

    const widget = renderWidget(tabDetails)

    if (target && target.ownerDocument && target.ownerDocument !== document) {
      return createPortal(
        <PopoutRenderWrapper popoutDoc={target.ownerDocument}>{widget}</PopoutRenderWrapper>,
        wrapper,
      )
    }

    return createPortal(widget, wrapper)
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
