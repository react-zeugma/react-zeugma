'use client'

import { useDocs } from './use-docs'
import { DocsSidebar } from './sidebar'
import { DocsContent } from './content'
import { TableOfContents } from './toc'
import { ScrollProgressBar } from './components/scroll-progress-bar'
import { MobileSubHeader } from './components/mobile-sub-header'
import { MobileNavDrawer } from './components/mobile-nav-drawer'
import type { DocsProps } from './types'

export function Docs({ skillMdContent }: DocsProps) {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
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
  } = useDocs({ skillMdContent })

  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors">
      {/* Scroll Progress Bar at very top of documentation */}
      <ScrollProgressBar />

      {/* Mobile Sub-Header */}
      <MobileSubHeader
        onOpenSearch={() => window.dispatchEvent(new CustomEvent('open-search'))}
        onOpenMenu={() => setMobileMenuOpen(true)}
        currentTitle={currentChapter.title}
      />

      {/* Mobile Navigation Drawer Dialog */}
      <MobileNavDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sidebarGroups={sidebarGroups}
        activeChapterId={activeChapterId}
        activeSubsectionId={inPageActiveSection}
        onSelectChapter={goToChapter}
        isSectionExpanded={isSectionExpanded}
        toggleExpand={toggleExpand}
      />

      {/* Main Documentation Body (3-Column Layout: Left Sidebar, Center Content, Right TOC) */}
      <div className="flex-1 w-full max-w-[92rem] min-w-0 mx-auto flex flex-col lg:flex-row relative items-start px-4 sm:px-6 lg:px-8 gap-8 xl:gap-12 min-h-[calc(100dvh-3.5rem)]">
        {/* Navigation Sidebar (Desktop Left - Viewport Sticky & Contained Scroll) */}
        <aside
          aria-label="Documentation navigation"
          className="hidden lg:flex lg:flex-col lg:sticky lg:top-14 z-20 shrink-0 w-64 h-[calc(100dvh-3.5rem)] pt-6 pb-6 pr-3 overflow-hidden border-r border-border-primary/40"
        >
          <div className="mb-3 pb-2 border-b border-border-primary select-none flex items-center justify-between shrink-0">
            <span className="eyebrow text-text-primary text-[10px]">Navigation Index</span>
            <span className="text-[10px] font-mono text-text-muted">v7.1</span>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <DocsSidebar
              sidebarGroups={sidebarGroups}
              activeChapterId={activeChapterId}
              activeSubsectionId={inPageActiveSection}
              onSelectChapter={goToChapter}
              isSectionExpanded={isSectionExpanded}
              toggleExpand={toggleExpand}
            />
          </div>
        </aside>

        {/* Paged Documentation Reading Canvas (Center) */}
        <div className="flex-1 min-w-0 pt-6 w-full">
          <DocsContent
            currentSection={currentChapter}
            prevSection={prevChapter}
            nextSection={nextChapter}
            onNavigateChapter={goToChapter}
            scrollToSection={scrollToSection}
            highlightedId={highlightedId}
          />
        </div>

        {/* On This Page Rail (Desktop XL Right - Viewport Sticky & Contained Scroll) */}
        <div className="hidden xl:flex xl:flex-col xl:sticky xl:top-14 z-20 shrink-0 w-60 h-[calc(100dvh-3.5rem)] pt-6 pb-6 pl-4 border-l border-border-primary/60 text-xs overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-none">
            <TableOfContents
              currentChapter={currentChapter}
              inPageActiveSection={inPageActiveSection}
              scrollToSection={scrollToSection}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
