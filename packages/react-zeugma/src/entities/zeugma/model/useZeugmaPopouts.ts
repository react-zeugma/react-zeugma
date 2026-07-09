import { useEffect, useRef } from 'react'
import { TabDetails } from '../../../shared'

export interface UseZeugmaPopoutsProps {
  poppedOutTabIds: string[]
  registerPopoutTarget?: (tabId: string, el: HTMLDivElement | null) => void
  findTabById: (tabId: string) => TabDetails | null
  dockTab: (tabId: string) => void
}

let lastActiveEvent: Event | null = null
let interceptionInitialized = false
const activePopoutDocuments = new Set<Document>()

export function getActiveDocument(): Document {
  if (typeof window === 'undefined') return document

  if (lastActiveEvent && lastActiveEvent.target) {
    const doc = (lastActiveEvent.target as Node).ownerDocument
    if (doc && doc !== document) {
      return doc
    }
  }

  const currentEvent = (window as unknown as { event?: Event }).event
  if (currentEvent && currentEvent.target) {
    const target = currentEvent.target as Node
    const doc = target.ownerDocument
    if (doc && doc !== document) {
      return doc
    }
  }

  if (
    (window as unknown as { __zeugmaActivePopoutDocument?: Document }).__zeugmaActivePopoutDocument
  ) {
    return (window as unknown as { __zeugmaActivePopoutDocument?: Document })
      .__zeugmaActivePopoutDocument as Document
  }

  return document
}

export function setupPopoutInterception() {
  if (typeof window === 'undefined' || interceptionInitialized) return
  interceptionInitialized = true

  // Reset active document on main window events to be safe
  const resetActive = () => {
    lastActiveEvent = null
    ;(
      globalThis as unknown as { __zeugmaActivePopoutDocument?: Document | null }
    ).__zeugmaActivePopoutDocument = null
  }
  const eventsToTrack = ['pointerdown', 'mousedown', 'click', 'keydown', 'focus', 'touchstart']
  eventsToTrack.forEach((evtName) => {
    window.addEventListener(evtName, resetActive, true)
  })

  const originalCreateElement = document.createElement
  document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.createElement(tagName, options)
    }
    return originalCreateElement.call(document, tagName, options)
  }

  const originalAppendChild = document.body.appendChild
  document.body.appendChild = function <T extends Node>(node: T): T {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.body.appendChild(node) as unknown as T
    }
    return originalAppendChild.call(document.body, node) as unknown as T
  }

  const originalRemoveChild = document.body.removeChild
  document.body.removeChild = function <T extends Node>(child: T): T {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.body.removeChild(child) as unknown as T
    }
    return originalRemoveChild.call(document.body, child) as unknown as T
  }

  const originalInsertBefore = document.body.insertBefore
  document.body.insertBefore = function <T extends Node>(node: T, child: Node | null): T {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.body.insertBefore(node, child) as unknown as T
    }
    return originalInsertBefore.call(document.body, node, child) as unknown as T
  }

  const originalReplaceChild = document.body.replaceChild
  document.body.replaceChild = function <T extends Node>(node: Node, child: T): T {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.body.replaceChild(node, child) as unknown as T
    }
    return originalReplaceChild.call(document.body, node, child) as unknown as T
  }

  const originalDocAddEventListener = document.addEventListener
  document.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.addEventListener(type, listener, options)
    }
    return originalDocAddEventListener.call(document, type, listener, options)
  }

  const originalDocRemoveEventListener = document.removeEventListener
  document.removeEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    // Call on main document
    originalDocRemoveEventListener.call(document, type, listener, options)
    // Call on all open popout documents as a fallback to prevent leaks
    activePopoutDocuments.forEach((doc) => {
      try {
        doc.removeEventListener(type, listener, options)
      } catch {
        // Safe no-op
      }
    })
  }

  const originalWinAddEventListener = window.addEventListener
  window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document && activeDoc.defaultView) {
      return activeDoc.defaultView.addEventListener(type, listener, options)
    }
    return originalWinAddEventListener.call(window, type, listener, options)
  }

  const originalWinRemoveEventListener = window.removeEventListener
  window.removeEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    // Call on main window
    originalWinRemoveEventListener.call(window, type, listener, options)
    // Call on all open popout windows as a fallback to prevent leaks
    activePopoutDocuments.forEach((doc) => {
      try {
        if (doc.defaultView) {
          doc.defaultView.removeEventListener(type, listener, options)
        }
      } catch {
        // Safe no-op
      }
    })
  }

  const originalGetElementById = document.getElementById
  document.getElementById = function (id: string) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.getElementById(id)
    }
    const mainEl = originalGetElementById.call(document, id)
    if (mainEl) return mainEl

    // Fallback lookups to popout documents
    for (const doc of activePopoutDocuments) {
      try {
        const el = doc.getElementById(id)
        if (el) return el
      } catch {}
    }
    return null
  }

  const originalQuerySelector = document.querySelector
  document.querySelector = function (selector: string) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.querySelector(selector)
    }
    const mainEl = originalQuerySelector.call(document, selector)
    if (mainEl) return mainEl

    for (const doc of activePopoutDocuments) {
      try {
        const el = doc.querySelector(selector)
        if (el) return el
      } catch {}
    }
    return null
  }

  const originalQuerySelectorAll = document.querySelectorAll
  document.querySelectorAll = function (selector: string) {
    const activeDoc = getActiveDocument()
    if (activeDoc && activeDoc !== document) {
      return activeDoc.querySelectorAll(selector)
    }
    const mainResults = originalQuerySelectorAll.call(document, selector)
    if (mainResults.length > 0) return mainResults

    for (const doc of activePopoutDocuments) {
      try {
        const results = doc.querySelectorAll(selector)
        if (results.length > 0) return results
      } catch {}
    }
    return mainResults
  }
}

export function useZeugmaPopouts(props: UseZeugmaPopoutsProps) {
  const { poppedOutTabIds, registerPopoutTarget, findTabById, dockTab } = props
  const popoutWindowsRef = useRef<Record<string, Window>>({})

  // Synchronize popout windows with poppedOutTabIds state
  useEffect(() => {
    const activeWindows = popoutWindowsRef.current

    poppedOutTabIds.forEach((tabId) => {
      if (activeWindows[tabId]) {
        try {
          activeWindows[tabId].focus()
        } catch {
          // Window might have been closed/blocked
        }
        return
      }

      setupPopoutInterception()

      const tabDetails = findTabById(tabId)
      const title = (tabDetails?.metadata?.title as string) || `Tab ${tabId}`

      const popup = window.open('', `zeugma-popout-${tabId}`, 'width=800,height=600')
      if (!popup) {
        console.warn('Failed to open popout window. Check popup blocker.')
        dockTab(tabId)
        return
      }

      activeWindows[tabId] = popup
      activePopoutDocuments.add(popup.document)

      // Copy document title & styles
      popup.document.title = title
      popup.document.head.innerHTML = ''
      Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).forEach((node) => {
        const clonedNode = node.cloneNode(true) as HTMLElement
        if (node.tagName.toLowerCase() === 'link') {
          const href = (node as HTMLLinkElement).href
          if (href) {
            clonedNode.setAttribute('href', href)
          }
        } else if (node.tagName.toLowerCase() === 'style') {
          try {
            const rules = (node as HTMLStyleElement).sheet?.cssRules
            if (rules && rules.length > 0) {
              const cssText = Array.from(rules)
                .map((rule) => rule.cssText)
                .join('\n')
              clonedNode.textContent = cssText
            }
          } catch {
            // Ignore cross-origin stylesheet errors
          }
        }
        popup.document.head.appendChild(clonedNode)
      })

      // Synchronize classes and background styles
      popup.document.documentElement.className = document.documentElement.className
      popup.document.body.className = document.body.className
      popup.document.body.style.margin = '0'
      popup.document.body.style.padding = '0'
      popup.document.body.style.height = '100vh'
      popup.document.body.style.overflow = 'hidden'

      // Detect background color of original pane elements to keep layout seamless
      const originalTarget = document.getElementById(`zeugma-tab-target-${tabId}`)
      let targetBg = ''
      if (originalTarget) {
        targetBg = window.getComputedStyle(originalTarget).backgroundColor
        if (
          (!targetBg || targetBg === 'transparent' || targetBg === 'rgba(0, 0, 0, 0)') &&
          originalTarget.parentElement
        ) {
          targetBg = window.getComputedStyle(originalTarget.parentElement).backgroundColor
        }
      }

      const docComputedStyle = window.getComputedStyle(document.documentElement)
      const bodyComputedStyle = window.getComputedStyle(document.body)
      const bodyBg = bodyComputedStyle.backgroundColor
      const isBodyBgTrans = !bodyBg || bodyBg === 'transparent' || bodyBg === 'rgba(0, 0, 0, 0)'
      const activeBgColor = isBodyBgTrans ? docComputedStyle.backgroundColor : bodyBg

      const finalBgColor =
        targetBg && targetBg !== 'transparent' && targetBg !== 'rgba(0, 0, 0, 0)'
          ? targetBg
          : activeBgColor && activeBgColor !== 'transparent' && activeBgColor !== 'rgba(0, 0, 0, 0)'
            ? activeBgColor
            : '#181b1f'

      popup.document.documentElement.style.backgroundColor = finalBgColor
      popup.document.body.style.backgroundColor = finalBgColor
      popup.document.body.style.color = bodyComputedStyle.color || docComputedStyle.color
      popup.document.body.style.fontFamily =
        bodyComputedStyle.fontFamily || docComputedStyle.fontFamily

      // Create container
      const container = popup.document.createElement('div')
      container.id = `zeugma-popout-container-${tabId}`
      container.className = 'grafana-panel h-full w-full overflow-hidden'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.border = 'none' // Remove double borders in popout mode
      popup.document.body.appendChild(container)

      // Register target
      registerPopoutTarget?.(tabId, container)

      // Track events on this popout window to redirect portals correctly
      const eventsToTrack = ['pointerdown', 'mousedown', 'click', 'keydown', 'focus', 'touchstart']
      const trackEvent = (e: Event) => {
        lastActiveEvent = e
        ;(
          globalThis as unknown as { __zeugmaActivePopoutDocument?: Document }
        ).__zeugmaActivePopoutDocument = popup.document

        // Reset after event cycle finishes
        queueMicrotask(() => {
          if (lastActiveEvent === e) {
            lastActiveEvent = null
            ;(
              globalThis as unknown as { __zeugmaActivePopoutDocument?: Document | null }
            ).__zeugmaActivePopoutDocument = null
          }
        })
      }
      eventsToTrack.forEach((evtName) => {
        popup.addEventListener(evtName, trackEvent, true)
      })

      // Listen for window close
      const handleUnload = () => {
        activePopoutDocuments.delete(popup.document)
        dockTab(tabId)
      }
      popup.addEventListener('beforeunload', handleUnload)

      // Store cleanup on the window object
      ;(popup as unknown as { __zeugmaCleanup?: () => void }).__zeugmaCleanup = () => {
        eventsToTrack.forEach((evtName) => {
          popup.removeEventListener(evtName, trackEvent, true)
        })
        popup.removeEventListener('beforeunload', handleUnload)
      }
    })

    // Close windows for tabs that are no longer popped out
    Object.keys(activeWindows).forEach((tabId) => {
      if (!poppedOutTabIds.includes(tabId)) {
        const popup = activeWindows[tabId]
        delete activeWindows[tabId]
        registerPopoutTarget?.(tabId, null)
        if (popup) {
          activePopoutDocuments.delete(popup.document)
          try {
            const popupObj = popup as unknown as { __zeugmaCleanup?: () => void; close: () => void }
            if (popupObj.__zeugmaCleanup) {
              popupObj.__zeugmaCleanup()
            }
            popupObj.close()
          } catch {
            // Already closed
          }
        }
      }
    })
  }, [poppedOutTabIds, registerPopoutTarget, findTabById, dockTab])

  // Clean up all popout windows on unmount
  useEffect(() => {
    return () => {
      const activeWindows = popoutWindowsRef.current
      Object.keys(activeWindows).forEach((tabId) => {
        const popup = activeWindows[tabId]
        if (popup) {
          activePopoutDocuments.delete(popup.document)
          try {
            const popupObj = popup as unknown as { __zeugmaCleanup?: () => void; close: () => void }
            if (popupObj.__zeugmaCleanup) {
              popupObj.__zeugmaCleanup()
            }
            popupObj.close()
          } catch {
            // Already closed
          }
        }
      })
    }
  }, [])
}
