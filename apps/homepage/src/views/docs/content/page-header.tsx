'use client'

import React, { useState } from 'react'
import { Check, Link2, Clock, Package } from 'lucide-react'
import type { DocSection } from '../../../config/docs-data'

export interface PageHeaderProps {
  section: DocSection
  onCopyPermalink: (id: string, e: React.MouseEvent) => void
  copiedId: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  overview: 'Overview & Guides',
  core: 'Core Architecture',
  advanced: 'Advanced Capabilities',
  api: 'API Reference',
}

// Estimated reading time helper
function estimateReadingTime(section: DocSection): string {
  switch (section.id) {
    case 'introduction':
      return '4 min read'
    case 'quickstart':
      return '5 min read'
    case 'tree-layout':
      return '6 min read'
    case 'state-controller':
      return '8 min read'
    case 'pane-customization':
      return '7 min read'
    case 'advanced-features':
      return '8 min read'
    case 'api-reference':
      return '10 min read'
    case 'skill-md':
      return '3 min read'
    default:
      return '5 min read'
  }
}

export function PageHeader({ section, onCopyPermalink, copiedId }: PageHeaderProps) {
  const [quickCopied, setQuickCopied] = useState(false)
  const readingTime = estimateReadingTime(section)
  const isCopied = copiedId === section.id

  const handleCopyLink = (e: React.MouseEvent) => {
    onCopyPermalink(section.id, e)
    setQuickCopied(true)
    setTimeout(() => setQuickCopied(false), 2000)
  }

  return (
    <header className="space-y-4 pb-6 border-b border-border-primary/80">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-mono text-text-muted select-none"
      >
        <span className="hover:text-text-primary transition-colors">Documentation</span>
        <span>/</span>
        <span className="text-accent uppercase tracking-wider font-semibold">
          {CATEGORY_LABELS[section.category] || section.category}
        </span>
      </nav>

      {/* Main Page Title */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="group flex items-center gap-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          <span>{section.title}</span>
          <button
            onClick={handleCopyLink}
            className="text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-bg-sidebar cursor-pointer"
            title="Copy direct permalink"
            aria-label={`Copy permalink to ${section.title}`}
          >
            {isCopied || quickCopied ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Link2 className="w-5 h-5" />
            )}
          </button>
        </h1>
      </div>

      {/* Metadata Chips (GitHub / Confluence Style) */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted pt-1">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>{readingTime}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5 font-mono">
          <Package className="w-3.5 h-3.5 text-accent" />
          <span>react-zeugma v7.1</span>
        </div>
        <span>•</span>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-bg-pane-inner border border-border-primary text-text-muted">
          React 18 &amp; 19 Ready
        </span>
      </div>
    </header>
  )
}
