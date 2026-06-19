/**
 * Utility to copy stylesheets from source document to destination document.
 */
export function copyStyles(srcDoc: Document, destDoc: Document) {
  // 1. Copy all attributes of <html> (e.g. class="dark", dataset, color-scheme, etc.)
  const srcHtml = srcDoc.documentElement
  const destHtml = destDoc.documentElement
  Array.from(destHtml.attributes).forEach((attr) => {
    destHtml.removeAttribute(attr.name)
  })
  Array.from(srcHtml.attributes).forEach((attr) => {
    destHtml.setAttribute(attr.name, attr.value)
  })

  // 2. Copy all attributes of <body> (e.g. background styles, class lists, etc.)
  const srcBody = srcDoc.body
  const destBody = destDoc.body
  Array.from(destBody.attributes).forEach((attr) => {
    destBody.removeAttribute(attr.name)
  })
  Array.from(srcBody.attributes).forEach((attr) => {
    destBody.setAttribute(attr.name, attr.value)
  })

  // 3. Copy all style/link elements from head
  Array.from(srcDoc.querySelectorAll('link[rel="stylesheet"], style')).forEach((el) => {
    try {
      const cloned = el.cloneNode(true) as HTMLElement

      // If it's a style element, check if rules were inserted dynamically via CSSOM
      if (el.tagName.toLowerCase() === 'style') {
        const styleEl = el as HTMLStyleElement
        if (styleEl.sheet && styleEl.sheet.cssRules && styleEl.sheet.cssRules.length > 0) {
          cloned.textContent = Array.from(styleEl.sheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n')
        }
      }

      destDoc.head.appendChild(cloned)
    } catch {
      // Fallback: just clone the node as is
      try {
        destDoc.head.appendChild(el.cloneNode(true))
      } catch (err) {
        console.error('Failed to copy style element:', err)
      }
    }
  })
}

/**
 * Utility to get or create a hidden container element on the document body.
 */
export function getOrCreateHiddenContainer(id: string): HTMLElement {
  let container = document.getElementById(id)
  if (!container) {
    container = document.createElement('div')
    container.id = id
    container.style.display = 'none'
    document.body.appendChild(container)
  }
  return container
}
