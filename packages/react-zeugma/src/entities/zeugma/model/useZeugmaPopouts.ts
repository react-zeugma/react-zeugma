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

interface RegisteredListener {
  target: 'window' | 'document'
  type: string
  listener: EventListenerOrEventListenerObject
  options?: boolean | AddEventListenerOptions
}

const mainListeners = new Set<RegisteredListener>()

let headObserver: MutationObserver | null = null

function startHeadObserver() {
  if (typeof window === 'undefined' || headObserver) return
  headObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node instanceof HTMLElement &&
          (node.tagName.toLowerCase() === 'style' || node.tagName.toLowerCase() === 'link')
        ) {
          activePopoutDocuments.forEach((doc) => {
            try {
              const cloned = node.cloneNode(true) as HTMLElement
              if (cloned.tagName.toLowerCase() === 'link') {
                const href = (node as HTMLLinkElement).href
                if (href) {
                  cloned.setAttribute('href', href)
                }
              }
              doc.head.appendChild(cloned)
            } catch (e) {
              console.warn('Failed to mirror style node to popout:', e)
            }
          })
        }
      })
    })
  })
  headObserver.observe(document.head, { childList: true })
}

function stopHeadObserver() {
  if (headObserver) {
    headObserver.disconnect()
    headObserver = null
  }
}

let htmlObserver: MutationObserver | null = null

function startHtmlObserver() {
  if (typeof window === 'undefined' || htmlObserver) return
  htmlObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName) {
        const val = document.documentElement.getAttribute(mutation.attributeName)
        activePopoutDocuments.forEach((doc) => {
          try {
            if (doc && doc.documentElement) {
              if (val !== null) {
                doc.documentElement.setAttribute(mutation.attributeName!, val)
              } else {
                doc.documentElement.removeAttribute(mutation.attributeName!)
              }
            }
          } catch (e) {
            console.warn('Failed to sync documentElement attribute:', e)
          }
        })
      }
    })
  })
  htmlObserver.observe(document.documentElement, { attributes: true })
}

function stopHtmlObserver() {
  if (htmlObserver) {
    htmlObserver.disconnect()
    htmlObserver = null
  }
}

const delayClose = (closeFn: () => void) => {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(closeFn)
  } else {
    setTimeout(closeFn, 0)
  }
}

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

  // Patch [Symbol.hasInstance] globally on constructors to correctly identify cross-window DOM nodes
  const isProtoOf = (instance: unknown, proto: unknown) => {
    if (!instance || !proto) return false
    try {
      let currentProto = Object.getPrototypeOf(instance)
      while (currentProto) {
        if (currentProto === proto) return true
        currentProto = Object.getPrototypeOf(currentProto)
      }
    } catch {}
    return false
  }

  const patchHasInstance = (
    Constructor: unknown,
    checkFn: (obj: Record<string, unknown>) => boolean,
  ) => {
    try {
      Object.defineProperty(Constructor as object, Symbol.hasInstance, {
        value: function (instance: unknown) {
          if (!instance) return false
          if (isProtoOf(instance, (Constructor as { prototype?: unknown }).prototype)) return true
          return checkFn(instance as Record<string, unknown>)
        },
        configurable: true,
        writable: true,
      })
    } catch (e) {
      console.warn('Failed to patch Symbol.hasInstance on', Constructor, e)
    }
  }

  if (typeof Node !== 'undefined') {
    patchHasInstance(Node, (instance) => {
      return typeof instance.nodeType === 'number' && typeof instance.nodeName === 'string'
    })
  }
  if (typeof Element !== 'undefined') {
    patchHasInstance(Element, (instance) => {
      return instance.nodeType === 1
    })
  }
  if (typeof HTMLElement !== 'undefined') {
    patchHasInstance(HTMLElement, (instance) => {
      return instance.nodeType === 1 && typeof instance.style === 'object'
    })
  }
  if (typeof HTMLBodyElement !== 'undefined') {
    patchHasInstance(HTMLBodyElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'BODY'
    })
  }
  if (typeof HTMLHtmlElement !== 'undefined') {
    patchHasInstance(HTMLHtmlElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'HTML'
    })
  }
  if (typeof HTMLInputElement !== 'undefined') {
    patchHasInstance(HTMLInputElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'INPUT'
    })
  }
  if (typeof HTMLTextAreaElement !== 'undefined') {
    patchHasInstance(HTMLTextAreaElement, (instance) => {
      return instance.nodeType === 1 && instance.tagName === 'TEXTAREA'
    })
  }
  if (typeof ShadowRoot !== 'undefined') {
    patchHasInstance(ShadowRoot, (instance) => {
      return instance.nodeType === 11 && instance.host !== undefined
    })
  }
  if (typeof SVGElement !== 'undefined') {
    patchHasInstance(SVGElement, (instance) => {
      return instance.nodeType === 1 && typeof instance.getBBox === 'function'
    })
  }
  if (typeof Document !== 'undefined') {
    patchHasInstance(Document, (instance) => {
      return instance.nodeType === 9
    })
  }
  if (typeof Window !== 'undefined') {
    patchHasInstance(Window, (instance) => {
      return (
        instance && typeof instance.document === 'object' && typeof instance.location === 'object'
      )
    })
  }

  // Proxy Document properties to active popout document when one is active
  const docProto = Document.prototype
  const originalDocBody = Object.getOwnPropertyDescriptor(docProto, 'body')
  const originalDocEl = Object.getOwnPropertyDescriptor(docProto, 'documentElement')
  const originalDocHead = Object.getOwnPropertyDescriptor(docProto, 'head')
  const originalDocActive = Object.getOwnPropertyDescriptor(docProto, 'activeElement')
  const originalDocDefaultView = Object.getOwnPropertyDescriptor(docProto, 'defaultView')
  const originalDocScrolling = Object.getOwnPropertyDescriptor(docProto, 'scrollingElement')

  Object.defineProperties(document, {
    body: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.body
        }
        return originalDocBody?.get?.call(document) || document.body
      },
      configurable: true,
    },
    documentElement: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.documentElement
        }
        return originalDocEl?.get?.call(document) || document.documentElement
      },
      configurable: true,
    },
    head: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.head
        }
        return originalDocHead?.get?.call(document) || document.head
      },
      configurable: true,
    },
    activeElement: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.activeElement
        }
        return originalDocActive?.get?.call(document) || document.activeElement
      },
      configurable: true,
    },
    defaultView: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.defaultView
        }
        return originalDocDefaultView?.get?.call(document) || document.defaultView
      },
      configurable: true,
    },
    scrollingElement: {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document) {
          return activeDoc.scrollingElement
        }
        return originalDocScrolling?.get?.call(document) || document.scrollingElement
      },
      configurable: true,
    },
  })

  // Proxy Window properties to active popout window when one is active
  const winProto = Window.prototype
  const winProperties = [
    'innerWidth',
    'innerHeight',
    'pageXOffset',
    'pageYOffset',
    'scrollX',
    'scrollY',
    'screenX',
    'screenY',
    'outerWidth',
    'outerHeight',
    'devicePixelRatio',
  ] as const

  const originalWinGetters: Record<string, (() => unknown) | undefined> = {}
  winProperties.forEach((prop) => {
    const desc =
      Object.getOwnPropertyDescriptor(winProto, prop) ||
      Object.getOwnPropertyDescriptor(window, prop)
    if (desc && desc.get) {
      originalWinGetters[prop] = desc.get
    }
  })

  winProperties.forEach((prop) => {
    Object.defineProperty(window, prop, {
      get() {
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc !== document && activeDoc.defaultView) {
          try {
            return (activeDoc.defaultView as unknown as Record<string, unknown>)[prop]
          } catch {}
        }
        const orig = originalWinGetters[prop]
        if (orig) {
          return orig.call(window)
        }
        return (window as unknown as Record<string, unknown>)[prop]
      },
      configurable: true,
    })
  })

  const originalContains = Node.prototype.contains
  Node.prototype.contains = function (this: Node, otherNode: Node | null) {
    if (!otherNode) return false
    if (originalContains.call(this, otherNode)) return true

    if (this === document || this === document.body || this === document.documentElement) {
      for (const doc of activePopoutDocuments) {
        try {
          if (doc.contains(otherNode)) {
            return true
          }
        } catch {}
      }
    }
    return false
  }

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

  const originalDocAddEventListener = document.addEventListener
  document.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    mainListeners.add({ target: 'document', type, listener, options })
    originalDocAddEventListener.call(document, type, listener, options)
    activePopoutDocuments.forEach((doc) => {
      try {
        doc.addEventListener(type, listener, options)
      } catch {}
    })
  }

  const originalDocRemoveEventListener = document.removeEventListener
  document.removeEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    for (const record of mainListeners) {
      if (record.target === 'document' && record.type === type && record.listener === listener) {
        mainListeners.delete(record)
        break
      }
    }
    originalDocRemoveEventListener.call(document, type, listener, options)
    activePopoutDocuments.forEach((doc) => {
      try {
        doc.removeEventListener(type, listener, options)
      } catch {}
    })
  }

  const originalWinAddEventListener = window.addEventListener
  window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    mainListeners.add({ target: 'window', type, listener, options })
    originalWinAddEventListener.call(window, type, listener, options)
    activePopoutDocuments.forEach((doc) => {
      try {
        if (doc.defaultView) {
          doc.defaultView.addEventListener(type, listener, options)
        }
      } catch {}
    })
  }

  const originalWinRemoveEventListener = window.removeEventListener
  window.removeEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    for (const record of mainListeners) {
      if (record.target === 'window' && record.type === type && record.listener === listener) {
        mainListeners.delete(record)
        break
      }
    }
    originalWinRemoveEventListener.call(window, type, listener, options)
    activePopoutDocuments.forEach((doc) => {
      try {
        if (doc.defaultView) {
          doc.defaultView.removeEventListener(type, listener, options)
        }
      } catch {}
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

      mainListeners.forEach((record) => {
        try {
          if (record.target === 'window') {
            popup.addEventListener(record.type, record.listener, record.options)
          } else {
            popup.document.addEventListener(record.type, record.listener, record.options)
          }
        } catch {}
      })

      startHeadObserver()
      startHtmlObserver()

      // Copy document title & styles
      popup.document.title = title
      popup.document.head.innerHTML = ''
      try {
        const baseNode = popup.document.createElement('base')
        baseNode.setAttribute('href', window.location.origin + '/')
        popup.document.head.appendChild(baseNode)
      } catch {}
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

      // Copy adopted stylesheets if supported
      if (
        typeof document.adoptedStyleSheets !== 'undefined' &&
        typeof popup.document.adoptedStyleSheets !== 'undefined'
      ) {
        try {
          const clonedSheets = Array.from(document.adoptedStyleSheets)
            .map((sheet) => {
              try {
                const newSheet = new (
                  popup as unknown as {
                    CSSStyleSheet: typeof CSSStyleSheet
                  }
                ).CSSStyleSheet()
                const cssText = Array.from(sheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join('\n')
                newSheet.replaceSync(cssText)
                return newSheet
              } catch {
                return null
              }
            })
            .filter((s): s is CSSStyleSheet => s !== null)
          popup.document.adoptedStyleSheets = clonedSheets
        } catch (e) {
          console.warn('Failed to copy adoptedStyleSheets:', e)
        }
      }

      // Synchronize classes and background styles
      popup.document.documentElement.className = document.documentElement.className
      popup.document.body.className = document.body.className
      Array.from(document.documentElement.attributes).forEach((attr) => {
        popup.document.documentElement.setAttribute(attr.name, attr.value)
      })
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

      const themeAttr = document.documentElement.getAttribute('data-theme')
      if (!themeAttr) {
        popup.document.documentElement.style.backgroundColor = finalBgColor
        popup.document.body.style.backgroundColor = finalBgColor
      }
      popup.document.body.style.color = bodyComputedStyle.color || docComputedStyle.color
      popup.document.body.style.fontFamily =
        bodyComputedStyle.fontFamily || docComputedStyle.fontFamily

      // Create container
      const container = popup.document.createElement('div')
      container.id = `zeugma-popout-container-${tabId}`
      container.className = 'zeugma-popout-container'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.overflow = 'hidden'
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
        setTimeout(() => {
          if (lastActiveEvent === e) {
            lastActiveEvent = null
            ;(
              globalThis as unknown as { __zeugmaActivePopoutDocument?: Document | null }
            ).__zeugmaActivePopoutDocument = null
          }
        }, 0)
      }
      eventsToTrack.forEach((evtName) => {
        popup.addEventListener(evtName, trackEvent, true)
      })

      // Listen for window close
      const handleUnload = () => {
        activePopoutDocuments.delete(popup.document)
        if (activePopoutDocuments.size === 0) {
          stopHeadObserver()
          stopHtmlObserver()
        }
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
          if (activePopoutDocuments.size === 0) {
            stopHeadObserver()
            stopHtmlObserver()
          }
          try {
            const popupObj = popup as unknown as { __zeugmaCleanup?: () => void; close: () => void }
            if (popupObj.__zeugmaCleanup) {
              popupObj.__zeugmaCleanup()
            }
            delayClose(() => {
              try {
                popupObj.close()
              } catch {
                // Already closed
              }
            })
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
            delayClose(() => {
              try {
                popupObj.close()
              } catch {
                // Already closed
              }
            })
          } catch {
            // Already closed
          }
        }
      })
      if (activePopoutDocuments.size === 0) {
        stopHeadObserver()
        stopHtmlObserver()
      }
    }
  }, [])
}

if (typeof window !== 'undefined') {
  setupPopoutInterception()
}
