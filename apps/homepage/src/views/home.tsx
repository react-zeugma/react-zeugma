'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Boxes, MousePointer2, Focus, Layout, ArrowRight, Copy, Check } from 'lucide-react'
import { useScrollAnchor } from '../lib/use-scroll-anchor'
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

const FEATURES = [
  {
    icon: <Boxes className="w-5 h-5 text-indigo-400" />,
    title: 'Arbitrary Splits',
    desc: 'Split horizontally or vertically without constraints. Create complex bento grids or simple side-by-side layouts instantly.',
  },
  {
    icon: <MousePointer2 className="w-5 h-5 text-emerald-400" />,
    title: 'Smooth Resizing',
    desc: 'Fluid, non-blocking resize handles with snap-to-edge capabilities. Feels completely native to the browser.',
  },
  {
    icon: <Focus className="w-5 h-5 text-amber-400" />,
    title: 'Flexible & Unopinionated',
    desc: 'Save and load layout trees via simple JSON serialization. Complete control over state management and persistence flows.',
  },
  {
    icon: <Layout className="w-5 h-5 text-rose-400" />,
    title: 'Headless Design',
    desc: 'We handle the complex math, drop zones, and tree states. You bring your own CSS and components.',
  },
]

export function Home() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('npm i react-zeugma')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { scrollToSection } = useScrollAnchor({
    sectionIds: ['designed-for-workspace-builders', 'zeugma-demo-ide'],
    offset: 80,
  })

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
          A modern building block for complex{' '}
          <span className="italic text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400 px-2 box-decoration-clone">
            workspace layouts
          </span>
          .
        </h1>

        <p className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed relative">
          Headless, draggable, and resizable layout manager for React. Build IDEs, dashboards, and
          advanced interfaces in minutes, not days.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 relative">
          <Link
            href="/demo"
            className="w-full sm:w-auto px-8 py-3.5 bg-text-primary hover:bg-text-primary/90 text-bg-app rounded-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            Open Live Demo <ArrowRight className="w-4 h-4" />
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

      {/* Features Showcase Section */}
      <section className="py-24 px-6 border-t border-border-primary bg-bg-app relative z-20">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="w-full text-center">
            <h2
              id="designed-for-workspace-builders"
              className="group flex items-center justify-center gap-2 text-3xl font-bold text-text-primary mb-6 scroll-mt-20"
            >
              <span>Designed for Workspace Builders</span>
              <a
                href="#designed-for-workspace-builders"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('designed-for-workspace-builders')
                }}
                className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
              >
                #
              </a>
            </h2>
            <p className="text-text-secondary text-base leading-relaxed mb-12 max-w-2xl mx-auto">
              Stop fighting with CSS Grid or wrestling absolute positioning math.{' '}
              <strong className="text-text-primary">react-zeugma</strong> manages the complexities
              of arbitrary window splitting, dragging, and resizing so you can focus on building
              your app.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {FEATURES.map((item, i) => (
                <div
                  key={i}
                  className="bg-bg-sidebar border border-border-primary hover:border-border-secondary p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 group text-left"
                >
                  <div className="w-10 h-10 bg-bg-pane border border-border-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-all">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-text-primary mb-1.5">{item.title}</h4>
                  <p className="text-xs text-text-secondary m-0 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Composable nested workspace / IDE Demo */}
      <section className="py-24 px-6 border-t border-border-primary bg-bg-app relative overflow-hidden z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/2 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2
            id="zeugma-demo-ide"
            className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4 tracking-tight"
          >
            Build Next-Generation IDEs & Layouts
          </h2>
          <p className="text-text-secondary text-sm max-w-2xl mx-auto mb-12">
            <strong className="text-text-primary">react-zeugma</strong> is completely headless,
            context-isolated, and serialized to JSON. Below is a live interactive IDE built with
            react-zeugma, running an app preview that also implements its own independent
            react-zeugma workspace.
          </p>
          <ZeugmaDemoIDE />
        </div>
      </section>

      <Footer />
    </div>
  )
}
