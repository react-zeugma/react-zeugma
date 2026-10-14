'use client'

import { ChevronRight } from 'lucide-react'
import type { SidebarItemData } from '../types'

export interface SidebarItemProps {
  item: SidebarItemData
  activeChapterId: string
  activeSubsectionId: string
  onSelectChapter: (chapterId: string, subsectionId?: string) => void
  expanded: boolean
  onToggleExpand: () => void
}

export function SidebarItem({
  item,
  activeChapterId,
  activeSubsectionId,
  onSelectChapter,
  expanded,
  onToggleExpand,
}: SidebarItemProps) {
  const hasSubsections = Boolean(item.subsections && item.subsections.length > 0)
  const isChapterActive = activeChapterId === item.id

  return (
    <div className="space-y-0.5 select-none">
      <div className="flex items-center justify-between gap-1 group/item">
        <button
          onClick={() => onSelectChapter(item.id)}
          className={`relative flex-1 flex items-center justify-between py-1.5 px-2.5 text-left text-xs font-medium rounded-lg transition-all cursor-pointer truncate ${
            isChapterActive
              ? 'bg-accent/15 text-accent font-semibold shadow-2xs border-l-2 border-accent pl-2'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-sidebar/80'
          }`}
        >
          <span className="truncate">{item.title}</span>
          {item.badge && (
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider ml-1.5 shrink-0 ${
                isChapterActive
                  ? 'bg-accent/20 text-accent'
                  : 'bg-bg-pane-inner text-text-muted border border-border-primary/60'
              }`}
            >
              {item.badge}
            </span>
          )}
        </button>

        {hasSubsections && (
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-bg-sidebar rounded-md text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
            aria-label={expanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
          >
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                expanded ? 'rotate-90 text-text-primary' : ''
              }`}
            />
          </button>
        )}
      </div>

      {hasSubsections && expanded && (
        <div className="pl-3.5 border-l border-border-primary/70 ml-3 mt-1 space-y-0.5">
          {item.subsections?.map((sub, index) => {
            const isSubActive = isChapterActive && activeSubsectionId === sub.id
            const isLast = index === (item.subsections?.length ?? 0) - 1

            return (
              <button
                key={sub.id}
                onClick={() => onSelectChapter(item.id, sub.id)}
                className={`relative flex items-center justify-between py-1 px-2 rounded-md text-left transition-all cursor-pointer w-full text-[11px] font-medium ${
                  isSubActive
                    ? 'text-accent font-semibold bg-accent/10 border-l-2 border-accent pl-1.5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-sidebar/50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-text-muted/60 font-mono text-[9px] select-none">
                    {isLast ? '└' : '├'}
                  </span>
                  <span className="truncate">{sub.title}</span>
                </div>
                {sub.badge && (
                  <span className="text-[9px] font-mono text-text-muted px-1 rounded bg-bg-pane shrink-0">
                    {sub.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
