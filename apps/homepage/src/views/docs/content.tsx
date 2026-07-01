'use client'

import { FileSearch } from 'lucide-react'
import { DocSection } from '../../config/docs-data'

interface DocsContentProps {
  filteredSections: DocSection[]
  scrollToSection: (id: string) => void
  onClearSearch?: () => void
  highlightedId?: string | null
}

export function DocsContent({
  filteredSections,
  scrollToSection,
  onClearSearch,
  highlightedId,
}: DocsContentProps) {
  if (filteredSections.length === 0) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[50vh] py-12">
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border-primary rounded-2xl bg-bg-pane/10 backdrop-blur-3xs animate-fade-in w-full max-w-md">
          <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-500 mb-4 ring-8 ring-indigo-500/5">
            <FileSearch className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">No results found</h3>
          <p className="text-xs text-text-secondary max-w-xs leading-relaxed mb-6">
            We couldn't find any documentation matching your query. Try checking your spelling or
            using different keywords.
          </p>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 w-full max-w-full min-w-0 pb-[35vh] space-y-16">
      {filteredSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={`scroll-mt-24 space-y-6 p-2 -m-2 transition-all duration-300 ${
            highlightedId === section.id ? 'search-highlight-fade' : ''
          }`}
        >
          <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary pb-2 border-b border-border-primary transition-colors duration-200">
            <span>{section.title}</span>
            <a
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(section.id)
              }}
              className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
            >
              #
            </a>
          </h2>

          {section.content && (
            <div className="prose prose-zinc max-w-none text-text-secondary text-sm">
              {section.content}
            </div>
          )}

          {section.subsections && section.subsections.length > 0 && (
            <div className="space-y-12 mt-8 pl-4 border-l border-border-primary/60 transition-colors duration-200">
              {section.subsections.map((sub) => (
                <div
                  key={sub.id}
                  id={sub.id}
                  className={`scroll-mt-24 space-y-4 p-2 -m-2 transition-all duration-300 ${
                    highlightedId === sub.id ? 'search-highlight-fade' : ''
                  }`}
                >
                  <h3 className="group flex items-center gap-2 text-base font-bold text-text-primary">
                    <span>{sub.title}</span>
                    <a
                      href={`#${sub.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToSection(sub.id)
                      }}
                      className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-base select-none"
                    >
                      #
                    </a>
                  </h3>
                  {sub.content && (
                    <div className="prose prose-zinc max-w-none text-text-secondary text-sm">
                      {sub.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  )
}
