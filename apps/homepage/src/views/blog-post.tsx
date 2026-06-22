'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MdxRenderer } from '../components/mdx-renderer'
import { Footer } from '../components/footer'
import type { RootContent } from '../lib/parse-mdx'

interface BlogPostProps {
  title: string
  contentNodes: RootContent[]
}

export function BlogPost({ title, contentNodes }: BlogPostProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="border-b border-border-primary pb-6 space-y-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
            {title}
          </h1>
        </header>

        <main className="prose prose-zinc max-w-none pb-24 space-y-8">
          <MdxRenderer sectionId="blog-post" scrollToSection={() => {}} children={contentNodes} />
        </main>
      </div>
      <Footer />
    </div>
  )
}
