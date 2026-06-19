import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  useZeugmaState,
  useZeugmaActions,
  getOrCreateHiddenContainer,
  TabWindowContext,
} from '../../../shared'
import { usePopupWindow } from '../model/hooks'

interface Globals {
  __currentTabDocument?: Document | null
}

const g = globalThis as unknown as Globals

if (typeof window !== 'undefined' && typeof Document !== 'undefined') {
  const DocumentProto = Document.prototype
  const NodeProto = Node.prototype

  // Helper to get active document context (either from render-phase flag or active event target)
  const getActiveDocument = (): Document | null => {
    if (g.__currentTabDocument) return g.__currentTabDocument

    // Check active event target to handle event-driven popovers/dropdowns automatically
    const activeEvent = window.event || (typeof event !== 'undefined' ? event : null)
    if (activeEvent && activeEvent.target) {
      const target = activeEvent.target as unknown as {
        ownerDocument?: Document
        document?: Document
      }
      const targetDoc = target.ownerDocument || target.document
      if (targetDoc && targetDoc !== document) {
        return targetDoc
      }
    }
    return null
  }

  // 1. Override document.body
  const bodyDesc = Object.getOwnPropertyDescriptor(DocumentProto, 'body')
  if (
    bodyDesc &&
    bodyDesc.get &&
    !(bodyDesc.get as unknown as { __isZeugmaOverridden?: boolean }).__isZeugmaOverridden
  ) {
    const originalBodyGetter = bodyDesc.get
    const newBodyGetter = function (this: Document) {
      const activeDoc = getActiveDocument()
      if (activeDoc && this === document) {
        return activeDoc.body
      }
      return originalBodyGetter.call(this)
    }
    ;(newBodyGetter as unknown as { __isZeugmaOverridden: boolean }).__isZeugmaOverridden = true
    Object.defineProperty(DocumentProto, 'body', {
      ...bodyDesc,
      get: newBodyGetter,
    })
  }

  // 2. Override document.documentElement
  const docElemDesc = Object.getOwnPropertyDescriptor(DocumentProto, 'documentElement')
  if (
    docElemDesc &&
    docElemDesc.get &&
    !(docElemDesc.get as unknown as { __isZeugmaOverridden?: boolean }).__isZeugmaOverridden
  ) {
    const originalDocElemGetter = docElemDesc.get
    const newDocElemGetter = function (this: Document) {
      const activeDoc = getActiveDocument()
      if (activeDoc && this === document) {
        return activeDoc.documentElement
      }
      return originalDocElemGetter.call(this)
    }
    ;(newDocElemGetter as unknown as { __isZeugmaOverridden: boolean }).__isZeugmaOverridden = true
    Object.defineProperty(DocumentProto, 'documentElement', {
      ...docElemDesc,
      get: newDocElemGetter,
    })
  }

  // 3. Override document.createElement
  const originalCreateElement = DocumentProto.createElement
  if (
    originalCreateElement &&
    !(originalCreateElement as unknown as { __isZeugmaOverridden?: boolean }).__isZeugmaOverridden
  ) {
    const newCreateElement = function (
      this: Document,
      tagName: string,
      options?: ElementCreationOptions,
    ) {
      const activeDoc = getActiveDocument()
      if (activeDoc && this === document) {
        return originalCreateElement.call(activeDoc, tagName, options)
      }
      return originalCreateElement.call(this, tagName, options)
    }
    ;(newCreateElement as unknown as { __isZeugmaOverridden: boolean }).__isZeugmaOverridden = true
    DocumentProto.createElement = newCreateElement as unknown as typeof DocumentProto.createElement
  }

  // 4. Override Node.prototype.appendChild to redirect insertions based on ownerDocument
  const originalAppendChild = NodeProto.appendChild
  if (
    originalAppendChild &&
    !(originalAppendChild as unknown as { __isZeugmaOverridden?: boolean }).__isZeugmaOverridden
  ) {
    const newAppendChild = function <T extends Node>(this: Node, newChild: T): T {
      if (
        newChild &&
        newChild.ownerDocument &&
        newChild.ownerDocument !== document &&
        (this === document.body || this === document.documentElement)
      ) {
        return newChild.ownerDocument.body.appendChild(newChild) as unknown as T
      }
      return originalAppendChild.call(this, newChild) as T
    }
    ;(newAppendChild as unknown as { __isZeugmaOverridden: boolean }).__isZeugmaOverridden = true
    NodeProto.appendChild = newAppendChild as unknown as typeof NodeProto.appendChild
  }

  // 5. Override Node.prototype.insertBefore to redirect insertions based on ownerDocument
  const originalInsertBefore = NodeProto.insertBefore
  if (
    originalInsertBefore &&
    !(originalInsertBefore as unknown as { __isZeugmaOverridden?: boolean }).__isZeugmaOverridden
  ) {
    const newInsertBefore = function <T extends Node>(
      this: Node,
      newChild: T,
      refChild: Node | null,
    ): T {
      if (
        newChild &&
        newChild.ownerDocument &&
        newChild.ownerDocument !== document &&
        (this === document.body || this === document.documentElement)
      ) {
        return newChild.ownerDocument.body.insertBefore(newChild, null) as unknown as T
      }
      return originalInsertBefore.call(this, newChild, refChild) as T
    }
    ;(newInsertBefore as unknown as { __isZeugmaOverridden: boolean }).__isZeugmaOverridden = true
    NodeProto.insertBefore = newInsertBefore as unknown as typeof NodeProto.insertBefore
  }
}

const TabDocumentOverride: React.FC<{
  doc: Document | null
  children: React.ReactNode
}> = ({ doc, children }) => {
  if (doc) {
    g.__currentTabDocument = doc
  }
  try {
    return <>{children}</>
  } finally {
    g.__currentTabDocument = null
  }
}

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

    const windowValue = useMemo(() => {
      if (isOpenedInNewWindow && popupWindow) {
        return {
          window: popupWindow,
          document: popupWindow.document,
        }
      }
      return {
        window: typeof window !== 'undefined' ? window : null,
        document: typeof document !== 'undefined' ? document : null,
      }
    }, [isOpenedInNewWindow, popupWindow])

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

    return createPortal(
      <TabWindowContext.Provider value={windowValue}>
        <TabDocumentOverride doc={windowValue.document}>{renderWidget(tabId)}</TabDocumentOverride>
      </TabWindowContext.Provider>,
      wrapper,
    )
  },
)
