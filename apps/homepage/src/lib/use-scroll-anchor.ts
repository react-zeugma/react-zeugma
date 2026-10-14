'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface UseScrollAnchorOptions {
  sectionIds: string[]
  offset?: number | (() => number)
  clearHashAtTop?: boolean
  onActiveSectionChange?: (id: string) => void
  initialActiveId?: string
}

export function useScrollAnchor({
  sectionIds,
  offset = 80,
  clearHashAtTop = false,
  onActiveSectionChange,
  initialActiveId = '',
}: UseScrollAnchorOptions) {
  const [activeId, setActiveId] = useState(initialActiveId)

  // Keep options in refs to prevent useEffect tear-downs on every render
  const offsetRef = useRef(offset)
  const onActiveSectionChangeRef = useRef(onActiveSectionChange)
  const sectionIdsRef = useRef(sectionIds)
  const clearHashAtTopRef = useRef(clearHashAtTop)

  // Lock scroll-spy listener during programmatic smooth scrolls
  const isProgrammaticScrollRef = useRef(false)
  const scrollLockTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hashUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    offsetRef.current = offset
  }, [offset])

  useEffect(() => {
    onActiveSectionChangeRef.current = onActiveSectionChange
  }, [onActiveSectionChange])

  useEffect(() => {
    sectionIdsRef.current = sectionIds
  }, [sectionIds])

  useEffect(() => {
    clearHashAtTopRef.current = clearHashAtTop
  }, [clearHashAtTop])

  // Synchronize initialActiveId whenever chapter changes externally
  useEffect(() => {
    if (initialActiveId) {
      setActiveId(initialActiveId)
    }
  }, [initialActiveId])

  const getOffset = useCallback(() => {
    const currentOffset = offsetRef.current
    if (typeof currentOffset === 'function') {
      return currentOffset()
    }
    return currentOffset
  }, [])

  const scrollToSection = useCallback(
    (id: string, instant = false) => {
      // Clear pending timers
      if (scrollLockTimeoutRef.current) {
        clearTimeout(scrollLockTimeoutRef.current)
      }
      if (hashUpdateTimeoutRef.current) {
        clearTimeout(hashUpdateTimeoutRef.current)
      }

      // Lock scroll-spy so it doesn't fight the animated scroll
      isProgrammaticScrollRef.current = true

      // Update state immediately
      setActiveId(id)
      if (onActiveSectionChangeRef.current) {
        onActiveSectionChangeRef.current(id)
      }

      // Sync URL hash
      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(null, '', `#${id}`)
      }

      const currentOffset = getOffset()
      const el = document.getElementById(id)

      if (el) {
        const absoluteTop = el.getBoundingClientRect().top + window.scrollY
        const targetY = Math.max(0, absoluteTop - currentOffset)
        window.scrollTo({
          top: targetY,
          behavior: instant ? 'instant' : 'smooth',
        })
      } else if (id === sectionIdsRef.current[0]) {
        // Fallback for document top / first section
        window.scrollTo({
          top: 0,
          behavior: instant ? 'instant' : 'smooth',
        })
      }

      // Release lock once scroll animation settles
      const lockDuration = instant ? 80 : 550
      scrollLockTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false
      }, lockDuration)
    },
    [getOffset],
  )

  useEffect(() => {
    const handleScroll = () => {
      // Do not run scroll-spy while programmatic navigation is animating
      if (isProgrammaticScrollRef.current) {
        return
      }

      const currentSectionIds = sectionIdsRef.current
      if (currentSectionIds.length === 0) return

      // If at the very top of document (< 60px), activate first section
      if (window.scrollY < 60) {
        const firstId = currentSectionIds[0]
        if (firstId) {
          setActiveId(firstId)
          if (onActiveSectionChangeRef.current) {
            onActiveSectionChangeRef.current(firstId)
          }
        }
        return
      }

      // If at the very bottom of the document, activate last section
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40
      if (isAtBottom && currentSectionIds.length > 0) {
        const lastSectionId = currentSectionIds[currentSectionIds.length - 1]
        setActiveId(lastSectionId)
        if (onActiveSectionChangeRef.current) {
          onActiveSectionChangeRef.current(lastSectionId)
        }
        return
      }

      // Standard in-page section tracking
      const currentOffset = getOffset()
      const scrollPosition = window.scrollY + currentOffset + 30
      let detectedSectionId = currentSectionIds[0]

      for (const id of currentSectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const absoluteTop = el.getBoundingClientRect().top + window.scrollY
          if (scrollPosition >= absoluteTop) {
            detectedSectionId = id
          }
        }
      }

      if (detectedSectionId) {
        setActiveId(detectedSectionId)
        if (onActiveSectionChangeRef.current) {
          onActiveSectionChangeRef.current(detectedSectionId)
        }

        // Debounce hash update on manual user scrolling to avoid browser history thrashing
        if (hashUpdateTimeoutRef.current) {
          clearTimeout(hashUpdateTimeoutRef.current)
        }
        hashUpdateTimeoutRef.current = setTimeout(() => {
          if (
            !isProgrammaticScrollRef.current &&
            window.location.hash !== `#${detectedSectionId}`
          ) {
            window.history.replaceState(null, '', `#${detectedSectionId}`)
          }
        }, 250)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollLockTimeoutRef.current) {
        clearTimeout(scrollLockTimeoutRef.current)
      }
      if (hashUpdateTimeoutRef.current) {
        clearTimeout(hashUpdateTimeoutRef.current)
      }
    }
  }, [getOffset])

  return { scrollToSection, activeId, setActiveId }
}
