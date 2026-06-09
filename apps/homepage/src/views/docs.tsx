'use client'

import { useState, useMemo } from 'react'
import { BookOpen, ChevronRight, Menu, X, Download } from 'lucide-react'
import { useScrollAnchor } from '../lib/use-scroll-anchor'
import { Footer } from '../components/footer'
import { MdxRenderer } from '../components/mdx-renderer'
import type { DocSection } from '../lib/parse-mdx'

interface DocsProps {
  sections: DocSection[]
  skillMdContent: string | null
}

interface NavLinkProps {
  section: { id: string; title: string }
  isActive: boolean
  onClick: () => void
}

function NavLink({ section, isActive, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer w-full text-sm font-medium ${
        isActive
          ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-sidebar'
      }`}
    >
      <span>{section.title}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
    </button>
  )
}

export function Docs({ sections, skillMdContent }: DocsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Build the sidebar navigation items from the parsed sections (memoized to prevent effect re-runs)
  const navSections = useMemo(() => sections.map((s) => ({ id: s.id, title: s.title })), [sections])
  const sectionIds = useMemo(() => navSections.map((s) => s.id), [navSections])

  const { scrollToSection: baseScrollToSection, activeId: activeSection } = useScrollAnchor({
    sectionIds,
    offset: () => (window.innerWidth < 1024 ? 120 : 80),
    clearHashAtTop: false,
    initialActiveId: sections[0]?.id ?? 'introduction',
  })

  const scrollToSection = (id: string) => {
    baseScrollToSection(id)
    setMobileMenuOpen(false)
  }

  const handleDownloadSkill = () => {
    if (!skillMdContent) return
    const element = document.createElement('a')
    const file = new Blob([skillMdContent], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = 'SKILL.md'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div
      className={`flex flex-col min-h-screen bg-bg-app transition-colors duration-200 ${
        mobileMenuOpen ? 'h-[calc(100vh-3.5rem)] overflow-hidden lg:h-auto lg:overflow-visible' : ''
      }`}
    >
      {/* Mobile Menu Button */}
      <div className="lg:hidden sticky top-14 z-30 bg-bg-sidebar/95 backdrop-blur-sm border-b border-border-primary px-4 sm:px-6 py-3 flex items-center justify-between text-sm select-none transition-colors duration-200">
        <span className="text-text-secondary font-semibold flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Documentation
        </span>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-bg-pane border border-border-primary text-text-secondary hover:text-text-primary cursor-pointer transition-all duration-200"
        >
          <Menu className="w-4 h-4" />
          <span>Index</span>
        </button>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer container */}
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-bg-app border-r border-border-primary shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-primary select-none">
            <span className="font-bold text-xs uppercase tracking-wider text-text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Docs Index
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-md hover:bg-bg-sidebar text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Navigation List */}
          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            {navSections.map((section) => (
              <NavLink
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => scrollToSection(section.id)}
              />
            ))}
          </nav>
        </aside>
      </div>

      <div className="flex-1 w-full max-w-7xl min-w-0 mx-auto flex flex-col lg:flex-row relative items-start px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Navigation Sidebar Index (Desktop) */}
        <aside className="hidden lg:block lg:sticky lg:top-20 z-20 shrink-0 w-64">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-primary select-none transition-colors duration-200">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-text-primary">
              Docs Index
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {navSections.map((section) => (
              <NavLink
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => scrollToSection(section.id)}
              />
            ))}
          </nav>
        </aside>

        {/* Documentation Content */}
        <main className="flex-1 w-full max-w-full min-w-0 prose prose-zinc pb-[35vh] space-y-16">
          {sections.map((section) => {
            const isSkillSection = section.id === 'skill-md'

            return (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                {isSkillSection && skillMdContent ? (
                  <>
                    {/* SKILL.md section with download button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-primary pb-2 gap-4 transition-colors duration-200">
                      <h2 className="group flex items-center gap-2 text-2xl font-bold text-text-primary m-0">
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
                      <button
                        onClick={handleDownloadSkill}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer select-none"
                      >
                        <Download className="w-3.5 h-3.5" /> Download SKILL.md
                      </button>
                    </div>
                    {/* Render non-heading children (description paragraph + code block) */}
                    <MdxRenderer
                      sectionId={section.id}
                      scrollToSection={scrollToSection}
                      children={section.children.filter((n) => n.type !== 'heading')}
                    />
                  </>
                ) : (
                  <MdxRenderer
                    sectionId={section.id}
                    scrollToSection={scrollToSection}
                    children={section.children}
                  />
                )}
              </section>
            )
          })}
        </main>
      </div>

      <Footer />
    </div>
  )
}
