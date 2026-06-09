'use client'

import { MdxRenderer } from '../components/mdx-renderer'
import { Footer } from '../components/footer'
import type { RootContent } from '../lib/parse-mdx'

interface ChangelogProps {
  contentNodes: RootContent[]
}

export function Changelog({ contentNodes }: ChangelogProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      window.history.pushState(null, '', `#${id}`)
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="border-b border-border-primary pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
            Changelog
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Stay up to date with the latest releases, features, and fixes in react-zeugma.
          </p>
        </header>

        <main className="prose prose-zinc max-w-none pb-24 space-y-8">
          <MdxRenderer
            sectionId="changelog"
            scrollToSection={scrollToSection}
            children={contentNodes}
          />
        </main>
      </div>
      <Footer />
    </div>
  )
}
