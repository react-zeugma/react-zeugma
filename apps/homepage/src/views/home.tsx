'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Copy, Check, Split, Move, FileJson, Cpu } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Footer } from '../components/footer'

const ZeugmaDemoDashboard = dynamic(
  () =>
    import('../components/zeugma-demo-dashboard').then((mod) => ({
      default: mod.ZeugmaDemoDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[750px] bg-[#0c0c0e] border border-border-primary rounded-2xl animate-pulse" />
    ),
  },
)

interface HomeProps {}

export function Home({}: HomeProps) {
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

      {/* Live Demo Preview Section */}
      <section className="py-12 px-6 border-t border-border-primary bg-bg-app relative overflow-hidden z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[750px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
            Interactive Layout Dashboard
          </h2>
          <p className="text-text-secondary text-sm max-w-2xl mx-auto mb-12">
            Try it right here — drag tabs, resize panels, and rearrange the layout. Head to the full
            demo for presets, lock mode, and more controls.
          </p>

          <div className="rounded-2xl border border-border-primary bg-bg-sidebar/30 overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.4)] transition-shadow duration-300">
            <div className="h-[750px] w-full">
              <ZeugmaDemoDashboard />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors group cursor-pointer"
            >
              <span>Open full demo with presets &amp; configuration</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section className="py-24 px-6 border-t border-border-primary bg-bg-app relative overflow-hidden z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/2 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
              Built for Next-Generation Layouts
            </h2>
            <p className="text-text-secondary text-sm max-w-2xl mx-auto">
              <strong className="text-text-primary">react-zeugma</strong> is completely headless,
              context-isolated, and serialized to JSON. It provides everything you need to build
              desktop-grade workspace layouts and dynamic dashboards.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
            {[
              {
                title: 'Arbitrary Splits',
                description:
                  'Split horizontally or vertically without constraints. Create complex bento grids or simple side-by-side layouts instantly.',
                icon: Split,
                iconClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                hoverClass:
                  'hover:border-indigo-500/30 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.12)]',
                glowClass: 'from-indigo-500/5',
              },
              {
                title: 'Smooth Resizing',
                description:
                  'Fluid, non-blocking resize handles with snap-to-edge capabilities. Feels completely native to the browser.',
                icon: Move,
                iconClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                hoverClass:
                  'hover:border-emerald-500/30 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.12)]',
                glowClass: 'from-emerald-500/5',
              },
              {
                title: 'Flexible & Unopinionated',
                description:
                  'Save and load layout trees via simple JSON serialization. Complete control over state management and persistence flows.',
                icon: FileJson,
                iconClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                hoverClass:
                  'hover:border-amber-500/30 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.12)]',
                glowClass: 'from-amber-500/5',
              },
              {
                title: 'Headless Design',
                description:
                  'We handle the complex math, drop zones, and tree states. You bring your own CSS and components.',
                icon: Cpu,
                iconClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                hoverClass:
                  'hover:border-rose-500/30 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.12)]',
                glowClass: 'from-rose-500/5',
              },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`group relative bg-bg-sidebar border border-border-primary p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.hoverClass}`}
                >
                  {/* Subtle background glow on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none bg-linear-to-br ${feature.glowClass} to-transparent`}
                  />

                  <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
                    <div className="flex flex-col gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feature.iconClass}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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

      <Footer />
    </div>
  )
}
