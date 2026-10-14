'use client'

import { useState, useMemo, ReactNode } from 'react'
import { Search, X } from 'lucide-react'

export interface DocTableProps {
  headers: string[]
  rows: (ReactNode | string)[][]
  searchable?: boolean
  searchPlaceholder?: string
  caption?: string
  className?: string
}

function renderCellContent(cell: ReactNode | string, cIndex: number) {
  if (typeof cell !== 'string') {
    return cell
  }

  // Auto-badge common status markers
  if (cell === 'Required') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
        Required
      </span>
    )
  }
  if (cell.startsWith('Required (')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
        {cell}
      </span>
    )
  }
  if (cell === 'Optional') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-bg-sidebar text-text-muted border border-border-primary">
        Optional
      </span>
    )
  }
  if (cell.startsWith('[Experimental]')) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mr-1.5">
          Experimental
        </span>
        <span>{cell.replace('[Experimental]', '').trim()}</span>
      </span>
    )
  }

  // First column: parameter/method name in bold accent mono
  if (cIndex === 0) {
    return <span className="font-mono text-xs font-semibold text-accent">{cell}</span>
  }

  // Second column: TypeScript type signature
  if (
    cIndex === 1 &&
    (cell.includes('=>') || cell.includes('|') || cell.includes('<') || cell.length < 50)
  ) {
    return (
      <code className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-bg-pane-inner border border-border-primary/60 text-text-primary">
        {cell}
      </code>
    )
  }

  return cell
}

export function DocTable({
  headers,
  rows,
  searchable = false,
  searchPlaceholder = 'Filter parameters...',
  caption,
  className = '',
}: DocTableProps) {
  const [filterText, setFilterText] = useState('')

  // Enable search automatically if table has 6+ rows, or if explicitly requested
  const shouldSearch = searchable || rows.length >= 7

  const filteredRows = useMemo(() => {
    if (!filterText.trim()) return rows
    const query = filterText.toLowerCase()
    return rows.filter((row) =>
      row.some((cell) => {
        if (typeof cell === 'string') {
          return cell.toLowerCase().includes(query)
        }
        return false
      }),
    )
  }, [rows, filterText])

  return (
    <div className={`space-y-2.5 my-6 ${className}`}>
      {/* Optional Search / Filter Header */}
      {shouldSearch && (
        <div className="flex items-center justify-between gap-3 px-1">
          {caption && <span className="text-xs text-text-muted font-medium">{caption}</span>}
          <div className="relative w-full max-w-xs ml-auto">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1 bg-bg-pane border border-border-primary rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent focus:ring-1 focus:ring-accent"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="w-full max-w-full overflow-x-auto border border-border-primary rounded-xl overflow-hidden shadow-2xs bg-bg-pane transition-colors">
        <table className="min-w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-primary bg-bg-sidebar/90 text-text-muted eyebrow select-none">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary/50 text-text-primary">
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-text-muted text-xs italic"
                >
                  No parameters match &quot;{filterText}&quot;
                </td>
              </tr>
            ) : (
              filteredRows.map((row, rIndex) => (
                <tr key={rIndex} className="hover:bg-bg-sidebar/40 transition-colors group">
                  {row.map((cell, cIndex) => (
                    <td
                      key={cIndex}
                      className={`px-4 py-3 align-top leading-relaxed ${
                        cIndex === 0 ? 'whitespace-nowrap' : ''
                      }`}
                    >
                      {renderCellContent(cell, cIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filteredRows.length > 0 && filterText && (
        <div className="text-[11px] text-text-muted px-1">
          Showing {filteredRows.length} of {rows.length} rows
        </div>
      )}
    </div>
  )
}
