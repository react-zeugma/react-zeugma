'use client'

import { BookOpen, Search, Menu } from 'lucide-react'

export interface MobileSubHeaderProps {
  onOpenSearch: () => void
  onOpenMenu: () => void
  currentTitle: string
}

export function MobileSubHeader({ onOpenSearch, onOpenMenu, currentTitle }: MobileSubHeaderProps) {
  return (
    <div className="lg:hidden sticky top-[3.625rem] z-20 bg-bg-sidebar/95 backdrop-blur-md border-b border-border-primary px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs select-none">
      <div className="flex items-center gap-2 truncate pr-2">
        <BookOpen className="w-4 h-4 text-accent shrink-0" />
        <span className="text-text-primary font-bold truncate">{currentTitle}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenSearch}
          className="p-1.5 rounded-lg bg-bg-pane border border-border-primary text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Open documentation search"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-pane border border-border-primary text-text-primary font-semibold transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4 text-accent" />
          <span>Index</span>
        </button>
      </div>
    </div>
  )
}
