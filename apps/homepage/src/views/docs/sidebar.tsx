'use client'

import { ChevronRight } from 'lucide-react'
import { SidebarItemData } from './use-docs'

interface SidebarItemProps {
  item: SidebarItemData
  activeSection: string
  scrollToSection: (id: string) => void
  expanded: boolean
  onToggleExpand: () => void
}

function SidebarItem({
  item,
  activeSection,
  scrollToSection,
  expanded,
  onToggleExpand,
}: SidebarItemProps) {
  const hasSubsections = item.subsections && item.subsections.length > 0
  const isActive = activeSection === item.id

  return (
    <div className="space-y-0.5 select-none">
      <div className="flex items-center justify-between gap-1.5 group/item">
        <button
          onClick={() => scrollToSection(item.id)}
          className={`flex-1 py-1.5 px-2 text-left text-xs font-medium rounded-md transition-all cursor-pointer truncate ${
            isActive
              ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-3xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-sidebar/50'
          }`}
        >
          {item.title}
        </button>
        {hasSubsections && (
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-bg-sidebar rounded text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
      </div>

      {hasSubsections && expanded && (
        <div className="pl-3 border-l border-border-primary/60 ml-2.5 mt-0.5 space-y-0.5">
          {item.subsections?.map((sub) => {
            const isSubActive = activeSection === sub.id
            return (
              <button
                key={sub.id}
                onClick={() => scrollToSection(sub.id)}
                className={`flex items-center justify-between py-1 px-2.5 rounded-md text-left transition-all duration-150 cursor-pointer w-full text-[11px] font-medium ${
                  isSubActive
                    ? 'text-indigo-600 dark:text-indigo-450 font-semibold bg-indigo-500/5'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-sidebar/30'
                }`}
              >
                <span className="truncate">{sub.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface DocsSidebarProps {
  sidebarGroups: { title: string; items: SidebarItemData[] }[]
  activeSection: string
  scrollToSection: (id: string) => void
  isSectionExpanded: (item: SidebarItemData) => boolean
  toggleExpand: (itemId: string) => void
}

export function DocsSidebar({
  sidebarGroups,
  activeSection,
  scrollToSection,
  isSectionExpanded,
  toggleExpand,
}: DocsSidebarProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <nav className="flex-1 space-y-6">
        {sidebarGroups.length === 0 ? (
          <div className="px-3 py-4 text-xs text-text-muted text-center italic">
            No matches found
          </div>
        ) : (
          sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 select-none">
                {group.title}
              </span>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    activeSection={activeSection}
                    scrollToSection={scrollToSection}
                    expanded={isSectionExpanded(item)}
                    onToggleExpand={() => toggleExpand(item.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </nav>
    </div>
  )
}
