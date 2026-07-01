'use client'

import { BookOpen, Menu, X, Search } from 'lucide-react'
import { useDocs } from './docs/use-docs'
import { DocsSidebar } from './docs/sidebar'
import { DocsContent } from './docs/content'
import { Footer } from '../components/footer'

interface DocsProps {
  skillMdContent: string | null
}

export function Docs({ skillMdContent }: DocsProps) {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    filteredSections,
    sidebarGroups,
    activeSection,
    scrollToSection,
    isSectionExpanded,
    toggleExpand,
    highlightedId,
  } = useDocs({ skillMdContent })

  return (
    <div
      className={`flex flex-col min-h-screen bg-bg-app transition-colors duration-200 ${
        mobileMenuOpen ? 'h-[calc(100vh-3.5rem)] overflow-hidden lg:h-auto lg:overflow-visible' : ''
      }`}
    >
      {/* Mobile Menu Header */}
      <div className="lg:hidden sticky top-14 z-30 bg-bg-sidebar/95 backdrop-blur-sm border-b border-border-primary px-4 sm:px-6 py-3 flex items-center justify-between text-sm select-none transition-colors duration-200">
        <span className="text-text-secondary font-semibold flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Documentation
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
            className="p-1.5 rounded-md bg-bg-pane border border-border-primary text-text-secondary hover:text-text-primary cursor-pointer transition-all duration-200"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-bg-pane border border-border-primary text-text-secondary hover:text-text-primary cursor-pointer transition-all duration-200"
          >
            <Menu className="w-4 h-4" />
            <span>Index</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />

        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-bg-app border-r border-border-primary shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border-primary select-none">
            <span className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Docs Index
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-md hover:bg-bg-sidebar text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <DocsSidebar
              sidebarGroups={sidebarGroups}
              activeSection={activeSection}
              scrollToSection={scrollToSection}
              isSectionExpanded={isSectionExpanded}
              toggleExpand={toggleExpand}
            />
          </div>
        </aside>
      </div>

      <div className="flex-1 w-full max-w-7xl min-w-0 mx-auto flex flex-col lg:flex-row relative items-start px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:sticky lg:top-20 z-20 shrink-0 w-64 h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-10 scrollbar-none">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-primary select-none transition-colors duration-200">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Docs Index
            </span>
          </div>

          <DocsSidebar
            sidebarGroups={sidebarGroups}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            isSectionExpanded={isSectionExpanded}
            toggleExpand={toggleExpand}
          />
        </aside>

        {/* Documentation Content */}
        <DocsContent
          filteredSections={filteredSections}
          scrollToSection={scrollToSection}
          highlightedId={highlightedId}
        />
      </div>

      <Footer />
    </div>
  )
}
