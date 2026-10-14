'use client'

import React, { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { PageHeader } from './page-header'
import { PagePagination } from './page-pagination'
import { PageFeedback } from './page-feedback'
import { DocsFooter } from './docs-footer'
import type { DocSection } from '../../../config/docs-data'

export interface DocsContentProps {
  currentSection: DocSection
  prevSection: DocSection | null
  nextSection: DocSection | null
  onNavigateChapter: (chapterId: string) => void
  scrollToSection: (id: string) => void
  highlightedId?: string | null
}

export function DocsContent({
  currentSection,
  prevSection,
  nextSection,
  onNavigateChapter,
  scrollToSection,
  highlightedId,
}: DocsContentProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    scrollToSection(id)
  }

  return (
    <main className="flex-1 w-full max-w-4xl min-w-0 pb-16 space-y-10">
      <article
        key={currentSection.id}
        id={currentSection.id}
        className={`scroll-mt-24 space-y-8 p-4 sm:p-6 -m-4 sm:-m-6 transition-all duration-300 rounded-2xl ${
          highlightedId === currentSection.id ? 'search-highlight-fade ring-1 ring-accent/30' : ''
        }`}
      >
        {/* Confluence/GitHub style Page Header */}
        <PageHeader section={currentSection} onCopyPermalink={handleCopyLink} copiedId={copiedId} />

        {/* Section Main Content */}
        {currentSection.content && (
          <div className="text-text-secondary text-sm leading-relaxed space-y-6">
            {currentSection.content}
          </div>
        )}

        {/* Subsections with copy anchor links */}
        {currentSection.subsections && currentSection.subsections.length > 0 && (
          <div className="space-y-12 mt-12 pt-6 pl-4 sm:pl-6 border-l-2 border-border-primary/60">
            {currentSection.subsections.map((sub) => {
              const isSubCopied = copiedId === sub.id

              return (
                <section
                  key={sub.id}
                  id={sub.id}
                  className={`scroll-mt-24 space-y-4 p-3 -m-3 transition-all duration-300 rounded-xl ${
                    highlightedId === sub.id ? 'search-highlight-fade ring-1 ring-accent/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-border-primary/40">
                    <h2 className="group flex items-center gap-2 text-xl font-bold text-text-primary tracking-tight">
                      <span>{sub.title}</span>
                      <button
                        onClick={(e) => handleCopyLink(sub.id, e)}
                        className="text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md cursor-pointer"
                        title="Copy direct permalink"
                        aria-label={`Copy permalink to ${sub.title}`}
                      >
                        {isSubCopied ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                      </button>
                    </h2>
                  </div>

                  {sub.content && (
                    <div className="text-text-secondary text-sm leading-relaxed space-y-4">
                      {sub.content}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}

        {/* Was this page helpful? Interactive feedback */}
        <PageFeedback pageTitle={currentSection.title} />

        {/* Previous / Next Chapter Page Switching Cards */}
        <PagePagination
          prevSection={prevSection}
          nextSection={nextSection}
          onNavigateChapter={onNavigateChapter}
        />

        {/* In-canvas Documentation Footer */}
        <DocsFooter />
      </article>
    </main>
  )
}
