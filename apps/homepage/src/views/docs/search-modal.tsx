'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, CornerDownLeft, FileText, Compass } from 'lucide-react'
import { DocSection } from '../../config/docs-data'
import { searchDocs } from './search-utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  sections: DocSection[]
  onSelectResult: (id: string) => void
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>
  const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="bg-transparent text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  )
}

export function SearchModal({ isOpen, onClose, sections, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    return searchDocs(query, sections)
  }, [query, sections])

  // Reset selected index when query or results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) =>
          results.length > 0 ? Math.min(prev + 1, results.length - 1) : 0,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          const matched = results[selectedIndex]
          onSelectResult(matched.subsectionId || matched.sectionId)
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, onClose, onSelectResult])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!isOpen) return null

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'overview':
        return 'Overview'
      case 'core':
        return 'Core Concepts'
      case 'advanced':
        return 'Advanced Features'
      case 'api':
        return 'API Reference'
      default:
        return cat
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-bg-pane border border-border-primary rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-primary bg-bg-sidebar/30">
          <Search className="h-4 w-4 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation..."
            className="w-full bg-transparent border-none outline-hidden text-base text-text-primary placeholder-text-muted"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-bg-sidebar text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {!query ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
              <Compass className="h-8 w-8 text-indigo-500/40 mb-2 animate-pulse" />
              <p className="text-xs font-medium">Search React Zeugma Docs</p>
              <p className="text-[10px] mt-1">
                Search for concepts, props, hooks, or code examples.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
              <Search className="h-8 w-8 text-text-muted/40 mb-2" />
              <p className="text-xs font-medium">No results for "{query}"</p>
              <p className="text-[10px] mt-1">Try a different search term or check for typos.</p>
            </div>
          ) : (
            results.map((result, idx) => {
              const isActive = idx === selectedIndex
              const isContentMatch = result.type === 'content'

              return (
                <button
                  key={`${result.sectionId}-${result.subsectionId || ''}-${result.type}-${idx}`}
                  data-active={isActive}
                  onClick={() => {
                    onSelectResult(result.subsectionId || result.sectionId)
                    onClose()
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors duration-100 cursor-pointer ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/50'
                      : 'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-md mt-0.5 shrink-0 transition-colors ${
                      isActive
                        ? 'bg-bg-pane text-text-primary shadow-3xs border border-border-primary'
                        : 'bg-bg-sidebar/60 text-text-muted border border-transparent'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
                      <span>{getCategoryLabel(result.category)}</span>
                      {result.subsectionTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate">{result.sectionTitle}</span>
                        </>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-text-primary leading-snug">
                      <HighlightedText
                        text={result.subsectionTitle || result.sectionTitle}
                        highlight={query}
                      />
                    </h4>

                    {isContentMatch && result.matchedText && (
                      <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2 select-none">
                        <HighlightedText text={result.matchedText} highlight={query} />
                      </p>
                    )}
                  </div>

                  {isActive && (
                    <kbd className="self-center flex items-center shrink-0 text-text-muted font-mono text-[9px] select-none bg-bg-pane border border-border-primary rounded px-1.5 py-0.5 shadow-3xs animate-in fade-in duration-150">
                      <CornerDownLeft className="h-2.5 w-2.5" />
                    </kbd>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border-primary bg-bg-sidebar/50 text-[10px] text-text-muted flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 border border-border-primary bg-bg-pane rounded text-[9px] font-mono font-bold">
                ↑↓
              </kbd>{' '}
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 border border-border-primary bg-bg-pane rounded text-[9px] font-mono font-bold">
                Enter
              </kbd>{' '}
              to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 border border-border-primary bg-bg-pane rounded text-[9px] font-mono font-bold">
              Esc
            </kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  )
}
