/**
 * Modern Web Guidance: Top-layer animations & dialog utilities
 * Implements fallback for exit transitions when `overlay` or discrete `display` transitions
 * are not fully supported natively, plus click-outside (light-dismiss) fallback for `<dialog>`.
 */

let supportsDisplayTransition: boolean | undefined

export function canTransitionDisplay(): boolean {
  if (typeof window === 'undefined') return false
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition
  if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
    return false
  }
  const probe = document.createElement('div')
  probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;'
  document.body.appendChild(probe)
  // Force computed style
  window.getComputedStyle(probe).display
  probe.style.display = 'none'
  supportsDisplayTransition = window.getComputedStyle(probe).display === 'block'
  probe.remove()
  return supportsDisplayTransition
}

export function supportsTopLayerExit(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay())
}

/**
 * Closes a `<dialog>` with exit animations. If the browser lacks full top-layer exit
 * transition support, sets `data-closing` and waits for animations to settle before calling `dialog.close()`.
 */
export async function closeDialogWithAnimation(dialog: HTMLDialogElement | null): Promise<void> {
  if (!dialog || !dialog.open) return

  if (!supportsTopLayerExit()) {
    dialog.setAttribute('data-closing', '')
    const animations = dialog.getAnimations({ subtree: true })
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((resolve) => setTimeout(resolve, 300)),
      ])
    }
    if (!dialog.hasAttribute('data-closing')) return
    dialog.removeAttribute('data-closing')
  }

  try {
    dialog.close()
  } catch {
    // Dialog might already be closed
  }
}

/**
 * Fallback for light-dismiss on `<dialog closedby="any">` in browsers without native closedBy support.
 * Closes the dialog if clicked outside the content rect.
 */
export function handleDialogLightDismiss(event: React.MouseEvent<HTMLDialogElement>): void {
  const dialog = event.currentTarget
  if (!dialog) return

  // Only handle clicks directly on the dialog backdrop
  if (event.target !== dialog) return

  const rect = dialog.getBoundingClientRect()
  const isInside =
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width

  if (!isInside) {
    closeDialogWithAnimation(dialog)
  }
}
