'use client'

import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search docs...' }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isShortcut = e.key === '/'

      if (
        isShortcut &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !target.isContentEditable
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-text-muted group-focus-within:text-indigo-500 transition-colors duration-200" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-12 py-1.5 bg-bg-pane-inner/60 hover:bg-bg-pane-inner border border-border-primary rounded-lg text-xs text-text-primary placeholder-text-muted focus:outline-hidden focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
      />
      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="p-0.5 rounded-md hover:bg-bg-sidebar text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 h-5 select-none rounded border border-border-primary bg-bg-sidebar px-1.5 font-mono text-[9px] font-medium text-text-muted transition-colors duration-200">
            <span className="text-[10px]">/</span>
          </kbd>
        )}
      </div>
    </div>
  )
}
