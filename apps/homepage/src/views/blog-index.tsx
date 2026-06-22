'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Footer } from '../components/footer'

interface BlogArticle {
  slug: string
  title: string
  description: string
}

interface BlogIndexProps {
  articles: BlogArticle[]
}

export function BlogIndex({ articles }: BlogIndexProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="border-b border-border-primary pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
            Blog
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Technical writing, architecture breakdowns, and updates from the creators of
            react-zeugma.
          </p>
        </header>

        <main className="space-y-6 pb-24">
          {articles.length === 0 ? (
            <p className="text-text-secondary text-sm">
              No articles published yet. Check back soon!
            </p>
          ) : (
            <div className="grid gap-6">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group block bg-bg-sidebar border border-border-primary hover:border-border-secondary p-6 rounded-2xl transition-all duration-300 hover:shadow-md hover:shadow-indigo-500/5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                        Article
                      </span>
                      <h2 className="text-xl font-bold text-text-primary group-hover:text-indigo-400 transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                        {article.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors shrink-0">
                      <span>Read article</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
