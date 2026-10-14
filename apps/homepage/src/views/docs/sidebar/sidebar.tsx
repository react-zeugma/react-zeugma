'use client'

import { useState, useMemo } from 'react'
import { SidebarItem } from './sidebar-item'
import { SidebarFilter } from './sidebar-filter'
import { SidebarFooter } from './sidebar-footer'
import type { SidebarGroupData, SidebarItemData } from '../types'

export interface DocsSidebarProps {
  sidebarGroups: SidebarGroupData[]
  activeChapterId: string
  activeSubsectionId: string
  onSelectChapter: (chapterId: string, subsectionId?: string) => void
  isSectionExpanded: (item: SidebarItemData) => boolean
  toggleExpand: (itemId: string) => void
}

export function DocsSidebar({
  sidebarGroups,
  activeChapterId,
  activeSubsectionId,
  onSelectChapter,
  isSectionExpanded,
  toggleExpand,
}: DocsSidebarProps) {
  const [filterQuery, setFilterQuery] = useState('')

  // Filter items in real time
  const filteredGroups = useMemo(() => {
    if (!filterQuery.trim()) return sidebarGroups
    const q = filterQuery.toLowerCase()

    return sidebarGroups
      .map((group) => {
        const matchingItems = group.items.filter((item) => {
          const titleMatch = item.title.toLowerCase().includes(q)
          const subMatch = item.subsections?.some((sub) => sub.title.toLowerCase().includes(q))
          return titleMatch || subMatch
        })
        return {
          ...group,
          items: matchingItems,
        }
      })
      .filter((g) => g.items.length > 0)
  }, [sidebarGroups, filterQuery])

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Real-time topic filter */}
      <div className="shrink-0">
        <SidebarFilter
          value={filterQuery}
          onChange={setFilterQuery}
          placeholder="Quick filter topics..."
        />
      </div>

      <nav className="flex-1 min-h-0 space-y-6 overflow-y-auto pr-1 pb-8 overscroll-contain">
        {filteredGroups.length === 0 ? (
          <div className="px-3 py-6 text-xs text-text-muted text-center italic bg-bg-pane rounded-xl border border-border-primary/60">
            No matching topics found for &quot;{filterQuery}&quot;
          </div>
        ) : (
          filteredGroups.map((group) => {
            return (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center justify-between px-2.5 select-none">
                  <span className="eyebrow text-[10px] text-text-muted font-bold tracking-wider uppercase">
                    {group.title}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted/60">
                    {group.items.length}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      activeChapterId={activeChapterId}
                      activeSubsectionId={activeSubsectionId}
                      onSelectChapter={onSelectChapter}
                      expanded={filterQuery.length > 0 ? true : isSectionExpanded(item)}
                      onToggleExpand={() => toggleExpand(item.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}

        {/* Quick Links Footer */}
        <SidebarFooter />
      </nav>
    </div>
  )
}
