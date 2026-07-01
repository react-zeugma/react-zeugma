'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Download } from 'lucide-react'
import { docsData, DocSection } from '../../config/docs-data'
import { useScrollAnchor } from '../../lib/use-scroll-anchor'
import { DocCodeBlock } from '../../components/mdx-renderer'
import { SKILL_MD_CONTENT } from '../../config/docs-data/skill-md'

export interface SidebarItemData {
  id: string
  title: string
  subsections?: { id: string; title: string }[]
}

export interface UseDocsProps {
  skillMdContent: string | null
}

export function useDocs({ skillMdContent }: UseDocsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const skillContent = skillMdContent || SKILL_MD_CONTENT

  const handleDownloadSkill = useCallback(() => {
    const element = document.createElement('a')
    const file = new Blob([skillContent], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = 'SKILL.md'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [skillContent])

  // Build full sections list, always enriching skill-md with the code block
  const allSections: DocSection[] = useMemo(() => {
    return docsData.map((section) => {
      if (section.id === 'skill-md') {
        return {
          ...section,
          content: (
            <div className="space-y-6">
              {section.content}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border-primary pb-2">
                  <span className="text-xs text-text-secondary font-medium">
                    SKILL.md Configuration File
                  </span>
                  <button
                    onClick={handleDownloadSkill}
                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400 font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SKILL.md</span>
                  </button>
                </div>
                <DocCodeBlock code={skillContent} language="markdown" />
              </div>
            </div>
          ),
        }
      }
      return section
    })
  }, [skillContent, handleDownloadSkill])

  // In standard doc sites (like Algolia), the main page remains unfiltered
  const filteredSections = allSections

  // Build grouped sidebar items and flat list of IDs for scroll anchoring
  const { sidebarGroups, sectionIds } = useMemo(() => {
    const groups = {
      overview: { title: 'Overview', items: [] as SidebarItemData[] },
      core: { title: 'Core Concepts', items: [] as SidebarItemData[] },
      advanced: { title: 'Advanced Features', items: [] as SidebarItemData[] },
      api: { title: 'API Reference', items: [] as SidebarItemData[] },
    }

    const ids: string[] = []

    filteredSections.forEach((s) => {
      const item: SidebarItemData = {
        id: s.id,
        title: s.title,
        subsections: s.subsections?.map((sub) => ({ id: sub.id, title: sub.title })),
      }
      groups[s.category].items.push(item)
      ids.push(s.id)

      if (s.subsections) {
        s.subsections.forEach((sub) => {
          ids.push(sub.id)
        })
      }
    })

    return {
      sidebarGroups: Object.values(groups).filter((g) => g.items.length > 0),
      sectionIds: ids,
    }
  }, [filteredSections])

  const { scrollToSection: baseScrollToSection, activeId: activeSection } = useScrollAnchor({
    sectionIds,
    offset: () => (window.innerWidth < 1024 ? 120 : 80),
    clearHashAtTop: false,
    initialActiveId: 'introduction',
  })

  const scrollToSection = useCallback(
    (id: string) => {
      baseScrollToSection(id)
      setMobileMenuOpen(false)
    },
    [baseScrollToSection],
  )

  // Determine if a section should be expanded
  const isSectionExpanded = useCallback(
    (item: SidebarItemData) => {
      if (manualExpanded[item.id] !== undefined) {
        return manualExpanded[item.id]
      }
      return true
    },
    [manualExpanded],
  )

  const toggleExpand = useCallback((itemId: string) => {
    setManualExpanded((prev) => {
      const currentVal = prev[itemId] !== undefined ? prev[itemId] : true
      return {
        ...prev,
        [itemId]: !currentVal,
      }
    })
  }, [])

  // Listen for global scroll-to-section event from the main navbar header,
  // URL hash changes, and handle initial load hashes to highlight searched items.
  useEffect(() => {
    let clearTimer: NodeJS.Timeout
    let setTimer: NodeJS.Timeout

    const handleHighlight = (id: string) => {
      clearTimeout(clearTimer)
      clearTimeout(setTimer)
      setHighlightedId(null)
      setTimer = setTimeout(() => {
        setHighlightedId(id)
        clearTimer = setTimeout(() => {
          setHighlightedId(null)
        }, 3500)
      }, 50)
    }

    const handleScrollTo = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        scrollToSection(customEvent.detail)
        handleHighlight(customEvent.detail)
      }
    }

    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        handleHighlight(hash.replace('#', ''))
      }
    }

    window.addEventListener('scroll-to-section', handleScrollTo)
    window.addEventListener('hashchange', handleHashChange)

    if (window.location.hash) {
      setTimer = setTimeout(() => {
        handleHighlight(window.location.hash.replace('#', ''))
      }, 150)
    }

    return () => {
      window.removeEventListener('scroll-to-section', handleScrollTo)
      window.removeEventListener('hashchange', handleHashChange)
      clearTimeout(clearTimer)
      clearTimeout(setTimer)
    }
  }, [scrollToSection])

  return {
    mobileMenuOpen,
    setMobileMenuOpen,
    allSections,
    filteredSections,
    sidebarGroups,
    activeSection,
    scrollToSection,
    isSectionExpanded,
    toggleExpand,
    highlightedId,
  }
}
