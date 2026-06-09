'use client'

import { Suspense, useState, useCallback } from 'react'
import Link from 'next/link'
import { Boxes, MousePointer2, Focus, Layout, ArrowRight, Copy, Check } from 'lucide-react'
import dynamic from 'next/dynamic'

const MosaicDemo = dynamic(
  () => import('../components/mosaic').then((mod) => ({ default: mod.MosaicDemo })),
  {
    ssr: false,
    loading: () => (
      <div className="mosaic-demo w-[280px] h-[280px] md:w-[320px] md:h-[320px] ml-auto bg-bg-pane border border-border-primary rounded-xl animate-pulse" />
    ),
  },
)

import { CodeBlock } from '../components/code-block'
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

const CODE = `import { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle } from 'react-zeugma';

export default function App() {
  const [layout, setLayout] = useState({
    type: 'split',
    direction: 'row',
    splitPercentage: 25,
    first: { type: 'pane', paneId: 'sidebar' },
    second: {
      type: 'split',
      direction: 'column',
      splitPercentage: 70,
      first: { type: 'pane', paneId: 'editor' },
      second: { type: 'pane', paneId: 'terminal' }
    }
  });

  return (
    <DashboardProvider
      layout={layout}
      onChange={setLayout}
      renderPane={(id) => (
        <Pane id={id}>
          {({ remove }) => (
            <div className="pane">
              <DragHandle>
                <div className="title-bar">
                  <span>{id}</span>
                  <button onClick={remove}>×</button>
                </div>
              </DragHandle>
              <div className="pane-content">Content for {id}</div>
            </div>
          )}
        </Pane>
      )}
    >
      <PaneTree />
    </DashboardProvider>
  );
}`

export function Home() {
  const [copied, setCopied] = useState(false)
  const [tileOrder, setTileOrder] = useState('ZEUGMA')

  const handleCopy = () => {
    navigator.clipboard.writeText('npm i react-zeugma')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOrderChange = useCallback((order: string) => {
    setTileOrder(order)
  }, [])

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

      {/* Features & Code Showcase Section */}
      <section className="py-24 px-6 border-t border-border-primary bg-bg-app relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1 w-full text-left">
            <h2 className="text-3xl font-bold text-text-primary mb-6">
              Designed for Workspace Builders
            </h2>
            <p className="text-text-secondary text-base leading-relaxed mb-12 max-w-xl">
              Stop fighting with CSS Grid or wrestling absolute positioning math.{' '}
              <strong className="text-text-primary">react-zeugma</strong> manages the complexities
              of arbitrary window splitting, dragging, and resizing so you can focus on building
              your app.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
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

          <div className="flex-1 w-full max-w-xl shadow-2xl">
            <CodeBlock code={CODE} />
          </div>
        </div>
      </section>

      {/* Mosaic/Story — Interactive react-zeugma Demo */}
      <section className="py-16 px-6 border-t border-border-primary bg-bg-sidebar overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#D8BA8E] mb-2 select-none">
              Can You Solve It?
            </div>
            <h2 className="text-2xl font-extrabold text-text-primary mb-4 font-serif tracking-wide select-none">
              Spell{' '}
              <span className="inline-flex gap-px">
                {tileOrder.split('').map((letter, i) => {
                  const target = 'ZEUGMA'
                  const isCorrect = letter === target[i]
                  return (
                    <span
                      key={i}
                      className="inline-block transition-all duration-300"
                      style={{
                        color: isCorrect ? '#C29B47' : 'var(--text-muted)',
                        transform: isCorrect ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {letter}
                    </span>
                  )
                })}
              </span>
            </h2>
            <div className="text-text-secondary text-[13px] leading-relaxed">
              <p>
                Named after the ancient Greco-Roman city in{' '}
                <strong className="text-text-primary">Gaziantep, Turkey</strong>, world-renowned for
                its breathtaking mosaics. Just as Zeugma&apos;s ancient artisans assembled countless
                tesserae into grand masterpieces,{' '}
                <strong className="text-text-primary">react-zeugma</strong> lets you assemble
                distinct panes into one seamless workspace.
              </p>
            </div>

            <p className="text-text-muted text-[11px] mt-5 flex items-center gap-1.5 italic">
              <MousePointer2 className="w-3 h-3 shrink-0" />
              Drag the tiles into the right order.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="mosaic-demo w-[280px] h-[280px] md:w-[320px] md:h-[320px] ml-auto bg-bg-pane rounded-xl animate-pulse -rotate-12" />
            }
          >
            <MosaicDemo onOrderChange={handleOrderChange} />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  )
}
