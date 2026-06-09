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
  clearHashAtTop = true,
  onActiveSectionChange,
  initialActiveId = '',
}: UseScrollAnchorOptions) {
  const [activeId, setActiveId] = useState(initialActiveId)

  // Keep options in refs to prevent useEffect tear-downs on every render
  const offsetRef = useRef(offset)
  const onActiveSectionChangeRef = useRef(onActiveSectionChange)
  const sectionIdsRef = useRef(sectionIds)
  const clearHashAtTopRef = useRef(clearHashAtTop)

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

  const getOffset = useCallback(() => {
    const currentOffset = offsetRef.current
    if (typeof currentOffset === 'function') {
      return currentOffset()
    }
    return currentOffset
  }, [])

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (el) {
        window.history.pushState(null, '', `#${id}`)
        const currentOffset = getOffset()
        const absoluteTop = el.getBoundingClientRect().top + window.scrollY
        window.scrollTo({ top: absoluteTop - currentOffset, behavior: 'smooth' })
        setActiveId(id)
        if (onActiveSectionChangeRef.current) {
          onActiveSectionChangeRef.current(id)
        }
      }
    },
    [getOffset],
  )

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        const id = hash.replace('#', '')
        const el = document.getElementById(id)
        if (el) {
          const currentOffset = getOffset()
          const absoluteTop = el.getBoundingClientRect().top + window.scrollY
          window.scrollTo({ top: absoluteTop - currentOffset, behavior: 'smooth' })
          setActiveId(id)
          if (onActiveSectionChangeRef.current) {
            onActiveSectionChangeRef.current(id)
          }
        }
      }
    }

    const handleScroll = () => {
      const currentOffset = getOffset()
      const scrollPosition = window.scrollY + currentOffset + 40

      // If clearHashAtTop is true and we're at the top, clear hash
      if (clearHashAtTopRef.current && window.scrollY < 100) {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
        return
      }

      const currentSectionIds = sectionIdsRef.current

      // Check if at the bottom of the page
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100
      if (isAtBottom && currentSectionIds.length > 0) {
        const lastSectionId = currentSectionIds[currentSectionIds.length - 1]
        setActiveId(lastSectionId)
        if (onActiveSectionChangeRef.current) {
          onActiveSectionChangeRef.current(lastSectionId)
        }
        if (window.location.hash !== `#${lastSectionId}`) {
          window.history.replaceState(null, '', `#${lastSectionId}`)
        }
        return
      }

      let activeSectionId = ''
      for (const id of currentSectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const absoluteTop = el.getBoundingClientRect().top + window.scrollY
          if (scrollPosition >= absoluteTop) {
            activeSectionId = id
          }
        }
      }

      if (activeSectionId) {
        setActiveId(activeSectionId)
        if (onActiveSectionChangeRef.current) {
          onActiveSectionChangeRef.current(activeSectionId)
        }
        if (window.location.hash !== `#${activeSectionId}`) {
          window.history.replaceState(null, '', `#${activeSectionId}`)
        }
      } else if (clearHashAtTopRef.current) {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    window.addEventListener('scroll', handleScroll, { passive: true })

    if (window.location.hash) {
      const t = setTimeout(handleHashChange, 100)
      return () => {
        window.removeEventListener('hashchange', handleHashChange)
        window.removeEventListener('scroll', handleScroll)
        clearTimeout(t)
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [getOffset])

  return { scrollToSection, activeId, setActiveId }
}
