/**
 * Utility to copy stylesheets from source document to destination document.
 */
export function copyStyles(srcDoc: Document, destDoc: Document) {
  Array.from(srcDoc.styleSheets).forEach((sheet) => {
    try {
      if (sheet.cssRules) {
        const newStyle = destDoc.createElement('style')
        Array.from(sheet.cssRules).forEach((rule) => {
          newStyle.appendChild(destDoc.createTextNode(rule.cssText))
        })
        destDoc.head.appendChild(newStyle)
      } else if (sheet.href) {
        const newLink = destDoc.createElement('link')
        newLink.rel = 'stylesheet'
        newLink.href = sheet.href
        destDoc.head.appendChild(newLink)
      }
    } catch {
      if (sheet.href) {
        const newLink = destDoc.createElement('link')
        newLink.rel = 'stylesheet'
        newLink.href = sheet.href
        destDoc.head.appendChild(newLink)
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
