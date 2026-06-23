'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Copy, Check } from 'lucide-react'
import dynamic from 'next/dynamic'

const ZeugmaDemoIDE = dynamic(
  () => import('../components/zeugma-demo-ide').then((mod) => ({ default: mod.ZeugmaDemoIDE })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[500px] bg-[#0c0c0e] border border-border-primary rounded-3xl animate-pulse" />
    ),
  },
)

import { Footer } from '../components/footer'

interface HomeProps {
  articles?: { slug: string; title: string; description: string }[]
}

export function Home({ articles = [] }: HomeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('npm i react-zeugma')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-app">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden min-h-[80vh]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 bg-bg-sidebar border border-border-primary backdrop-blur-sm rounded-full px-3 py-1 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-wide text-text-secondary uppercase">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
            {' \u2022 '}React 18 & 19 Ready
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-text-primary mb-6 max-w-4xl relative">
          Modern layouts for complex{' '}
          <span className="italic text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400 px-2 box-decoration-clone">
            dashboards
          </span>
          .
        </h1>

        <p className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed relative">
          Headless, draggable, and resizable layout manager for React. Build dynamic dashboards,
          workspace layouts, and advanced interfaces in minutes, not days.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 relative">
          <Link
            href="/demo"
            className="w-full sm:w-auto px-8 py-3.5 bg-text-primary hover:bg-text-primary/90 text-bg-app rounded-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer text-center"
          >
            Try Interactive Demo <ArrowRight className="w-4 h-4" />
          </Link>

          <code
            className="w-full sm:w-auto px-6 py-3.5 bg-bg-pane border border-border-primary hover:border-border-secondary rounded-lg text-sm font-mono text-text-primary flex items-center gap-3 transition-colors cursor-pointer group"
            onClick={handleCopy}
          >
            <span className="text-emerald-500">$</span> npm i react-zeugma
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 transition-colors" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary transition-colors" />
            )}
          </code>
        </div>
      </section>

      {/* Composable nested workspace / Dashboard Demo */}
      <section className="py-24 px-6 border-t border-border-primary bg-bg-app relative overflow-hidden z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/2 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2
            id="zeugma-demo-dashboard"
            className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight"
          >
            Build Next-Generation Dashboards & Layouts
          </h2>
          <p className="text-text-secondary text-sm max-w-2xl mx-auto mb-12">
            <strong className="text-text-primary">react-zeugma</strong> is completely headless,
            context-isolated, and serialized to JSON. Below is a live interactive dashboard built
            with react-zeugma, running an app preview that also implements its own independent
            react-zeugma workspace.
          </p>
          <div className="block text-left rounded-2xl transition-all duration-500 shadow-[0_50px_120px_-20px_rgba(99,102,241,0.15),0_30px_100px_-10px_rgba(0,0,0,0.95)] hover:shadow-[0_60px_150px_-10px_rgba(99,102,241,0.25),0_40px_120px_-5px_rgba(0,0,0,0.98)] overflow-hidden">
            <ZeugmaDemoIDE />
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors group cursor-pointer"
            >
              <span>Explore the documentation to build your own</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      {articles.length > 0 && (
        <section className="py-24 px-6 border-t border-border-primary bg-bg-app relative z-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
                Latest Insights & Deep Dives
              </h2>
              <p className="text-text-secondary text-sm max-w-2xl mx-auto">
                Explore technical articles and engineering deep dives written by the creators of{' '}
                <strong className="text-text-primary">react-zeugma</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group block bg-bg-sidebar border border-border-primary hover:border-border-secondary p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-3 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                        Engineering
                      </span>
                      <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed mb-4">
                        {article.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 transition-colors mt-auto">
                      <span>Read article</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
