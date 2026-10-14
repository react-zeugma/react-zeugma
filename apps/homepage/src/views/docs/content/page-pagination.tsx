'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { DocSection } from '../../../config/docs-data'

export interface PagePaginationProps {
  prevSection: DocSection | null
  nextSection: DocSection | null
  onNavigateChapter: (chapterId: string) => void
}

const CATEGORY_NAMES: Record<string, string> = {
  overview: 'Overview',
  core: 'Core Architecture',
  advanced: 'Advanced Capabilities',
  api: 'API Reference',
}

export function PagePagination({
  prevSection,
  nextSection,
  onNavigateChapter,
}: PagePaginationProps) {
  return (
    <nav
      aria-label="Chapter pagination"
      className="pt-8 border-t border-border-primary/80 grid sm:grid-cols-2 gap-4"
    >
      {prevSection ? (
        <button
          onClick={() => onNavigateChapter(prevSection.id)}
          className="flex flex-col items-start p-4 rounded-xl border border-border-primary bg-bg-pane/50 hover:bg-bg-pane hover:border-accent/50 hover:shadow-2xs transition-all text-left group cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted group-hover:text-accent transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Previous Chapter</span>
          </span>
          <span className="text-sm font-bold text-text-primary mt-1.5 group-hover:text-accent transition-colors line-clamp-1">
            {prevSection.title}
          </span>
          <span className="text-[10px] text-text-muted font-mono mt-0.5">
            {CATEGORY_NAMES[prevSection.category] || prevSection.category}
          </span>
        </button>
      ) : (
        <div />
      )}

      {nextSection ? (
        <button
          onClick={() => onNavigateChapter(nextSection.id)}
          className="flex flex-col items-end p-4 rounded-xl border border-border-primary bg-bg-pane/50 hover:bg-bg-pane hover:border-accent/50 hover:shadow-2xs transition-all text-right group cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted group-hover:text-accent transition-colors">
            <span>Next Chapter</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-sm font-bold text-text-primary mt-1.5 group-hover:text-accent transition-colors line-clamp-1">
            {nextSection.title}
          </span>
          <span className="text-[10px] text-text-muted font-mono mt-0.5">
            {CATEGORY_NAMES[nextSection.category] || nextSection.category}
          </span>
        </button>
      ) : (
        <div />
      )}
    </nav>
  )
}
