'use client'

import { Search, X } from 'lucide-react'

export interface SidebarFilterProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function SidebarFilter({
  value,
  onChange,
  placeholder = 'Filter topics...',
}: SidebarFilterProps) {
  return (
    <div className="relative w-full group mb-3">
      <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-7 py-1.5 text-xs bg-bg-pane border border-border-primary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Clear filter"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
