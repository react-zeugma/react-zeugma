'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Search,
  BookOpen,
  Terminal,
  Layers,
  Zap,
  Cpu,
  FileText,
  CornerDownLeft,
  X,
} from 'lucide-react'
import { searchDocs } from './search-utils'
import { closeDialogWithAnimation, handleDialogLightDismiss } from '@/lib/top-layer'
import { DocSection } from '@/config/docs-data'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  sections: DocSection[]
  onSelectResult: (targetId: string) => void
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
            className="bg-accent/25 text-accent rounded-xs px-1 py-0.5 font-bold underline decoration-accent/60 underline-offset-2"
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

const QUICK_LINKS = [
  {
    id: 'introduction',
    title: 'Introduction & Architecture',
    category: 'Overview',
    icon: BookOpen,
  },
  { id: 'quickstart', title: 'Quick Start & Installation', category: 'Guide', icon: Zap },
  { id: 'tree-layout', title: 'Binary Tree Topology & Splits', category: 'Core', icon: Layers },
  { id: 'state-controller', title: 'Controller & State Engine', category: 'Core', icon: Terminal },
  {
    id: 'pane-customization',
    title: 'BYO-UI & Component Architecture',
    category: 'Core',
    icon: Layers,
  },
  {
    id: 'advanced-features',
    title: 'Persistence, Tabs & Popouts',
    category: 'Advanced',
    icon: Cpu,
  },
  {
    id: 'api-reference',
    title: 'Complete API & Utility Reference',
    category: 'API',
    icon: Terminal,
  },
]

export function SearchModal({ isOpen, onClose, sections, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isRendered, setIsRendered] = useState(isOpen)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    return searchDocs(query, sections)
  }, [query, sections])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Mount/unmount lifecycle synchronized with animation
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
    }
  }, [isOpen])

  // Sync native dialog open state
  useEffect(() => {
    if (!isRendered) return
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      if (!dialog.open) {
        try {
          dialog.showModal()
        } catch {
          // Fallback if showModal throws
        }
      }
      setTimeout(() => inputRef.current?.focus(), 50)
    } else if (dialog.open) {
      closeDialogWithAnimation(dialog).then(() => {
        setIsRendered(false)
      })
    }
  }, [isOpen, isRendered])

  const handleClose = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog && dialog.open) {
      closeDialogWithAnimation(dialog).then(() => {
        setIsRendered(false)
        onClose()
      })
    } else {
      setIsRendered(false)
      onClose()
    }
  }, [onClose])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const total = query ? results.length : QUICK_LINKS.length
      setSelectedIndex((prev) => (total > 0 ? (prev + 1) % total : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const total = query ? results.length : QUICK_LINKS.length
      setSelectedIndex((prev) => (total > 0 ? (prev - 1 + total) % total : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (query && results[selectedIndex]) {
        const item = results[selectedIndex]
        onSelectResult(item.subsectionId || item.sectionId)
        handleClose()
      } else if (!query && QUICK_LINKS[selectedIndex]) {
        onSelectResult(QUICK_LINKS[selectedIndex].id)
        handleClose()
      }
    }
  }

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

  // Never render in DOM if closed to avoid any hit testing or click interception
  if (!isRendered) {
    return null
  }

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-label="Documentation Command Palette"
      onClick={handleDialogLightDismiss}
      onCancel={(e) => {
        e.preventDefault()
        handleClose()
      }}
      className="ui-dialog palette-dialog"
    >
      <div className="flex flex-col max-h-[75vh] w-full bg-bg-pane text-text-primary rounded-2xl overflow-hidden border border-border-primary shadow-float">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-primary bg-bg-sidebar/90 shrink-0">
          <Search className="h-4 w-4 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation, APIs, hooks, split topologies..."
            className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-text-primary placeholder:text-text-muted"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-sidebar transition-colors cursor-pointer"
              aria-label="Clear input"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="kbd shrink-0">ESC</kbd>
        </div>

        {/* Results or Quick Links */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 overscroll-contain bg-bg-pane"
        >
          {!query ? (
            <div className="py-2">
              <div className="px-3 py-1.5 eyebrow text-text-muted">Suggested Navigation</div>
              {QUICK_LINKS.map((link, idx) => {
                const Icon = link.icon
                const isActive = idx === selectedIndex
                return (
                  <button
                    key={link.id}
                    data-active={isActive}
                    onClick={() => {
                      onSelectResult(link.id)
                      handleClose()
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-accent/15 border border-accent/35 text-text-primary shadow-xs'
                        : 'border border-transparent text-text-secondary hover:bg-bg-sidebar hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isActive
                            ? 'bg-accent text-accent-fg'
                            : 'bg-bg-pane-inner border border-border-primary text-text-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-primary">{link.title}</div>
                        <div className="text-[10px] text-text-muted font-mono">{link.category}</div>
                      </div>
                    </div>
                    {isActive && (
                      <kbd className="kbd text-[9px] flex items-center gap-1 shrink-0">
                        <span>Jump</span>
                        <CornerDownLeft className="h-2.5 w-2.5" />
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center text-text-muted">
              <Search className="h-7 w-7 text-text-muted/40 mb-3" />
              <p className="text-xs font-semibold text-text-primary">
                No documentation found for &quot;{query}&quot;
              </p>
              <p className="text-[11px] mt-1 text-text-muted max-w-xs">
                Try searching for &quot;tree&quot;, &quot;resizer&quot;, &quot;metadata&quot;, or
                &quot;popout&quot;.
              </p>
            </div>
          ) : (
            results.map((result, idx) => {
              const isActive = idx === selectedIndex
              const isContentMatch = result.type === 'content'

              return (
                <button
                  key={`${result.sectionId}-${result.subsectionId || ''}-${idx}`}
                  data-active={isActive}
                  onClick={() => {
                    onSelectResult(result.subsectionId || result.sectionId)
                    handleClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-accent/15 border border-accent/35 shadow-xs'
                      : 'border border-border-primary/40 bg-bg-pane-inner/30 hover:bg-bg-sidebar hover:border-border-primary'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 shrink-0 transition-colors ${
                      isActive
                        ? 'bg-accent text-accent-fg'
                        : 'bg-bg-pane border border-border-primary text-text-muted'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5">
                      <span>{getCategoryLabel(result.category)}</span>
                      {result.subsectionTitle && (
                        <>
                          <span>•</span>
                          <span className="truncate">{result.sectionTitle}</span>
                        </>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-text-primary leading-snug">
                      <HighlightedText
                        text={result.subsectionTitle || result.sectionTitle}
                        highlight={query}
                      />
                    </h4>

                    {isContentMatch && result.matchedText && (
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
                        <HighlightedText text={result.matchedText} highlight={query} />
                      </p>
                    )}
                  </div>

                  {isActive && (
                    <kbd className="self-center kbd shrink-0">
                      <CornerDownLeft className="h-2.5 w-2.5" />
                    </kbd>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer controls */}
        <div className="px-4 py-2.5 border-t border-border-primary bg-bg-sidebar/90 text-[10px] text-text-muted flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="kbd">↑</kbd>
              <kbd className="kbd">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="kbd">↵</kbd>
              <span>Open</span>
            </span>
          </div>
          <span className="eyebrow lowercase">react-zeugma docs search</span>
        </div>
      </div>
    </dialog>
  )
}
