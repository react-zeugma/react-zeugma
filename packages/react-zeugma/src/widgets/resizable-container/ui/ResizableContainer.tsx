import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createDragSession } from '../../../shared/lib/drag-session'

const STORAGE_PREFIX = 'zeugma-height:'
const DEFAULT_PERSIST_KEY = 'default-pane'

export interface ResizableContainerProps {
  children: React.ReactNode
  /** Whether the resizable container is active. When false, acts as a normal 100% height container. */
  active?: boolean
  /** Current height in pixels (controlled mode) or default/initial height */
  height?: number
  /** Called when the height changes during or after a drag */
  onHeightChange?: (height: number) => void
  /** Minimum height in pixels (default: 100) */
  minHeight?: number
  /** Maximum height in pixels (default: Infinity — bounded by parent) */
  maxHeight?: number
  /** Whether to persist height in localStorage */
  persist?: boolean
  /** Custom localStorage key to save the height under (default: 'default-pane') */
  localStorageKey?: string
  /** Height of the resizer handle in pixels (default: 6) */
  resizerHeight?: number
  /** CSS class applied to the outer container div */
  className?: string
  /** CSS class applied to the resizer handle */
  resizerClassName?: string
}

function readPersistedHeight(key: string): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw !== null) {
      const parsed = Number(raw)
      if (Number.isFinite(parsed) && parsed > 0) return parsed
    }
  } catch {
    // localStorage may be unavailable (SSR, private browsing, etc.)
  }
  return null
}

function writePersistedHeight(key: string, height: number): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, String(Math.round(height)))
  } catch {
    // Silently ignore storage errors
  }
}

export const ResizableContainer: React.FC<ResizableContainerProps> = ({
  children,
  active = true,
  height: heightProp,
  onHeightChange,
  minHeight = 100,
  maxHeight = Infinity,
  persist,
  localStorageKey,
  resizerHeight = 6,
  className,
  resizerClassName,
}) => {
  const storageKey = persist ? localStorageKey || DEFAULT_PERSIST_KEY : null

  const getInitialHeight = (): number => {
    const baseHeight = (storageKey ? readPersistedHeight(storageKey) : null) ?? heightProp ?? 400
    return clamp(baseHeight, minHeight, maxHeight)
  }

  const [internalHeight, setInternalHeight] = useState<number>(getInitialHeight)
  const containerRef = useRef<HTMLDivElement>(null)

  // Determine effective height: if persist is set, use internal state; otherwise use prop
  const effectiveHeight = storageKey ? internalHeight : (heightProp ?? internalHeight)

  const prevHeightPropRef = useRef<number | undefined>(heightProp)

  // Sync from controlled prop when changed
  useEffect(() => {
    if (heightProp !== undefined && heightProp !== prevHeightPropRef.current) {
      const clamped = clamp(heightProp, minHeight, maxHeight)
      setInternalHeight(clamped)
      if (storageKey) {
        writePersistedHeight(storageKey, clamped)
      }
    }
    prevHeightPropRef.current = heightProp
  }, [heightProp, minHeight, maxHeight, storageKey])

  // Resolve maxHeight
  const resolveMaxHeight = useCallback((): number => {
    return maxHeight
  }, [maxHeight])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()

      const startY = e.clientY
      const startHeight = effectiveHeight
      const resolvedMaxHeight = resolveMaxHeight()
      const resizerEl = e.currentTarget

      const scrollParent = getScrollParent(containerRef.current)
      const startScrollTop = scrollParent ? scrollParent.scrollTop : 0

      let lastClientY = startY
      let animationFrameId: number | null = null

      const updateHeight = (clientY: number, currentScrollTop: number) => {
        const scrollDelta = currentScrollTop - startScrollTop
        const mouseDelta = clientY - startY
        const totalDelta = mouseDelta + scrollDelta
        const newHeight = clamp(startHeight + totalDelta, minHeight, resolvedMaxHeight)

        if (containerRef.current) {
          containerRef.current.style.height = `${newHeight}px`
        }
        return newHeight
      }

      const scrollLoop = () => {
        if (!scrollParent) return

        const parentRect =
          scrollParent === document.documentElement || scrollParent === document.body
            ? { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth }
            : scrollParent.getBoundingClientRect()

        const threshold = 40
        const maxSpeed = 10

        let scrollDelta = 0
        if (lastClientY > parentRect.bottom - threshold) {
          const intensity = Math.min(1, (lastClientY - (parentRect.bottom - threshold)) / threshold)
          scrollDelta = intensity * maxSpeed
        } else if (lastClientY < parentRect.top + threshold) {
          const intensity = Math.min(1, (parentRect.top + threshold - lastClientY) / threshold)
          scrollDelta = -intensity * maxSpeed
        }

        if (scrollDelta !== 0) {
          scrollParent.scrollTop += scrollDelta
          updateHeight(lastClientY, scrollParent.scrollTop)
        }

        animationFrameId = requestAnimationFrame(scrollLoop)
      }

      // Start the auto-scroll animation loop
      animationFrameId = requestAnimationFrame(scrollLoop)

      createDragSession({
        cursor: 'row-resize',
        resizerEl,
        onMove: (moveEvent: PointerEvent) => {
          lastClientY = moveEvent.clientY
          if (scrollParent) {
            updateHeight(lastClientY, scrollParent.scrollTop)
          }
        },
        onEnd: () => {
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId)
          }

          // Read the final height from the DOM
          let finalHeight = startHeight
          if (containerRef.current) {
            finalHeight = containerRef.current.getBoundingClientRect().height
          }
          finalHeight = clamp(finalHeight, minHeight, resolvedMaxHeight)

          // Commit to React state
          setInternalHeight(finalHeight)

          if (onHeightChange) {
            onHeightChange(finalHeight)
          }
          if (storageKey) {
            writePersistedHeight(storageKey, finalHeight)
          }
        },
      })
    },
    [effectiveHeight, minHeight, resolveMaxHeight, onHeightChange, storageKey],
  )

  if (!active) {
    return (
      <div
        className={`zeugma-resizable-container disabled ${className || ''}`.trim()}
        style={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ height: '100%', overflow: 'hidden' }}>{children}</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`zeugma-resizable-container ${className || ''}`.trim()}
      style={{
        height: `${effectiveHeight}px`,
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Content area fills entire container minus the resizer */}
      <div
        style={{
          height: `calc(100% - ${resizerHeight}px)`,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {/* Resizer handle */}
      <div
        className={`zeugma-resizable-handle ${resizerClassName || ''}`.trim()}
        style={{
          height: `${resizerHeight}px`,
          cursor: 'row-resize',
          position: 'relative',
          zIndex: 10,
          userSelect: 'none',
          touchAction: 'none',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
        onPointerDown={handlePointerDown}
        role="separator"
        aria-orientation="horizontal"
        aria-valuenow={Math.round(effectiveHeight)}
        aria-valuemin={minHeight}
        aria-valuemax={maxHeight === Infinity ? undefined : maxHeight}
      />
    </div>
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  if (typeof window === 'undefined' || !node) {
    return null
  }

  const parent = node.parentElement
  if (!parent) {
    return document.documentElement
  }

  const style = window.getComputedStyle(parent)
  const overflowY = style.overflowY
  const isScrollable = overflowY === 'auto' || overflowY === 'scroll'

  if (isScrollable) {
    return parent
  }

  return getScrollParent(parent)
}
