'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Download, FileText } from 'lucide-react'
import { docsData, DocSection } from '../../config/docs-data'
import { useScrollAnchor } from '../../lib/use-scroll-anchor'
import { DocCodeBlock } from '../../components/mdx-renderer'
import { SKILL_MD_CONTENT } from '../../config/docs-data/skill-md'
import type { SidebarGroupData, SidebarItemData, DocsProps } from './types'

export function useDocs({ skillMdContent }: DocsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [activeChapterId, setActiveChapterId] = useState<string>('introduction')

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

  // Build full sections list, enriching skill-md with code block & download button
  const allSections: DocSection[] = useMemo(() => {
    return docsData.map((section) => {
      if (section.id === 'skill-md') {
        return {
          ...section,
          content: (
            <div className="space-y-6">
              {section.content}
              <div className="space-y-4 pt-4 border-t border-border-primary/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-primary pb-2.5">
                  <span className="text-xs text-text-secondary font-medium">
                    Raw SKILL.md Configuration
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href="/llms.txt"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-sidebar border border-border-primary text-xs text-text-secondary hover:text-text-primary hover:border-accent/40 font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-accent" />
                      <span>View llms.txt</span>
                    </a>
                    <button
                      onClick={handleDownloadSkill}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-xs text-accent hover:bg-accent/20 font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download SKILL.md</span>
                    </button>
                  </div>
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

  // Active chapter resolution
  const currentChapterIndex = useMemo(() => {
    const idx = allSections.findIndex((s) => s.id === activeChapterId)
    return idx !== -1 ? idx : 0
  }, [allSections, activeChapterId])

  const currentChapter = allSections[currentChapterIndex] || allSections[0]
  const prevChapter = currentChapterIndex > 0 ? allSections[currentChapterIndex - 1] : null
  const nextChapter =
    currentChapterIndex < allSections.length - 1 ? allSections[currentChapterIndex + 1] : null

  // Build grouped sidebar items
  const sidebarGroups: SidebarGroupData[] = useMemo(() => {
    const groups: Record<string, SidebarGroupData> = {
      overview: { key: 'overview', title: 'Overview & Guides', items: [] },
      core: { key: 'core', title: 'Core Architecture', items: [] },
      advanced: { key: 'advanced', title: 'Advanced Capabilities', items: [] },
      api: { key: 'api', title: 'API & Reference', items: [] },
    }

    allSections.forEach((s) => {
      const item: SidebarItemData = {
        id: s.id,
        title: s.title,
        category: s.category,
        subsections: s.subsections?.map((sub) => ({ id: sub.id, title: sub.title })),
      }
      if (groups[s.category]) {
        groups[s.category].items.push(item)
      }
    })

    return Object.values(groups).filter((g) => g.items.length > 0)
  }, [allSections])

  // In-page TOC scroll tracking
  const currentChapterSectionIds = useMemo(() => {
    const ids = [currentChapter.id]
    if (currentChapter.subsections) {
      currentChapter.subsections.forEach((sub) => ids.push(sub.id))
    }
    return ids
  }, [currentChapter])

  const { activeId: inPageActiveSection, scrollToSection: baseScrollToSection } = useScrollAnchor({
    sectionIds: currentChapterSectionIds,
    offset: () => (window.innerWidth < 1024 ? 120 : 80),
    clearHashAtTop: false,
    initialActiveId: currentChapter.id,
  })

  // Navigate directly to a chapter page
  const goToChapter = useCallback(
    (chapterId: string, subsectionId?: string) => {
      setMobileMenuOpen(false)
      setManualExpanded((prev) => ({
        ...prev,
        [chapterId]: true,
      }))

      if (chapterId === activeChapterId) {
        if (subsectionId) {
          baseScrollToSection(subsectionId)
        } else {
          baseScrollToSection(chapterId)
        }
        return
      }

      // Switching to a new chapter
      setActiveChapterId(chapterId)

      if (subsectionId) {
        window.history.replaceState(null, '', `#${subsectionId}`)
        window.scrollTo({ top: 0, behavior: 'instant' })
        setTimeout(() => {
          baseScrollToSection(subsectionId)
        }, 60)
      } else {
        window.history.replaceState(null, '', `#${chapterId}`)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    },
    [activeChapterId, baseScrollToSection],
  )

  // Cross-chapter scroll / target resolution
  const scrollToSection = useCallback(
    (id: string) => {
      const directChapter = allSections.find((s) => s.id === id)
      if (directChapter) {
        goToChapter(directChapter.id)
        return
      }

      const parentChapter = allSections.find((s) => s.subsections?.some((sub) => sub.id === id))
      if (parentChapter) {
        if (parentChapter.id !== activeChapterId) {
          goToChapter(parentChapter.id, id)
        } else {
          baseScrollToSection(id)
        }
        return
      }

      baseScrollToSection(id)
    },
    [allSections, activeChapterId, goToChapter, baseScrollToSection],
  )

  const isSectionExpanded = useCallback(
    (item: SidebarItemData) => {
      if (manualExpanded[item.id] !== undefined) {
        return manualExpanded[item.id]
      }
      return item.id === activeChapterId
    },
    [manualExpanded, activeChapterId],
  )

  const toggleExpand = useCallback(
    (itemId: string) => {
      setManualExpanded((prev) => {
        const currentVal = prev[itemId] !== undefined ? prev[itemId] : itemId === activeChapterId
        return {
          ...prev,
          [itemId]: !currentVal,
        }
      })
    },
    [activeChapterId],
  )

  // Use refs for stable handlers to prevent re-binding listeners on every chapter change
  const allSectionsRef = useRef(allSections)
  allSectionsRef.current = allSections

  const scrollToSectionRef = useRef(scrollToSection)
  scrollToSectionRef.current = scrollToSection

  const goToChapterRef = useRef(goToChapter)
  goToChapterRef.current = goToChapter

  // Sync with initial URL hash or external hash changes
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

    // Run on initial mount only
    const parseInitialHash = () => {
      const raw = window.location.hash.replace('#', '')
      if (!raw) return

      const sections = allSectionsRef.current
      const direct = sections.find((s) => s.id === raw)
      if (direct) {
        setActiveChapterId(direct.id)
        handleHighlight(direct.id)
        window.scrollTo({ top: 0, behavior: 'instant' })
        return
      }

      const parent = sections.find((s) => s.subsections?.some((sub) => sub.id === raw))
      if (parent) {
        setActiveChapterId(parent.id)
        handleHighlight(raw)
        setTimeout(() => {
          scrollToSectionRef.current(raw)
        }, 120)
      }
    }

    parseInitialHash()

    // Handle browser Back / Forward history navigation
    const handleHashChange = () => {
      const raw = window.location.hash.replace('#', '')
      if (!raw) return

      const sections = allSectionsRef.current
      const direct = sections.find((s) => s.id === raw)
      if (direct) {
        goToChapterRef.current(direct.id)
        return
      }

      const parent = sections.find((s) => s.subsections?.some((sub) => sub.id === raw))
      if (parent) {
        goToChapterRef.current(parent.id, raw)
      }
    }

    const handleScrollToEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        scrollToSectionRef.current(customEvent.detail)
        handleHighlight(customEvent.detail)
      }
    }

    window.addEventListener('scroll-to-section', handleScrollToEvent)
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('scroll-to-section', handleScrollToEvent)
      window.removeEventListener('hashchange', handleHashChange)
      clearTimeout(clearTimer)
      clearTimeout(setTimer)
    }
  }, [])

  return {
    mobileMenuOpen,
    setMobileMenuOpen,
    allSections,
    currentChapter,
    prevChapter,
    nextChapter,
    activeChapterId,
    inPageActiveSection,
    goToChapter,
    sidebarGroups,
    scrollToSection,
    isSectionExpanded,
    toggleExpand,
    highlightedId,
  }
}
