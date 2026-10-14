'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'

const ZeugmaDemoDashboard = dynamic(
  () =>
    import('../../../components/zeugma-demo-dashboard').then((mod) => ({
      default: mod.ZeugmaDemoDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[760px] bg-bg-sidebar/50 border border-border-primary rounded-2xl animate-pulse flex items-center justify-center text-text-muted text-xs font-mono">
        Loading live layout engine...
      </div>
    ),
  },
)

export function ShowcaseSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border-primary bg-bg-app relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="eyebrow mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Live Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Observability Cockpit in Action
            </h2>
            <p className="text-text-secondary text-sm max-w-xl mt-2 leading-relaxed">
              Test Zeugma right here. Drag tabs to rearrange, grab resizer handles between panels,
              or configure split limits using the top toolbar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/demo"
              className="px-4 py-2 rounded-lg bg-bg-sidebar border border-border-primary hover:border-border-secondary text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Open Dedicated Demo Screen</span>
              <ExternalLink className="w-3.5 h-3.5 text-accent" />
            </Link>
          </div>
        </div>

        {/* Browser / Workbench Chrome Bezel */}
        <div className="rounded-2xl border border-border-primary bg-bg-sidebar/40 shadow-float overflow-hidden">
          {/* Top Device Bar */}
          <div className="px-4 py-2.5 border-b border-border-primary bg-bg-sidebar/70 flex items-center justify-between text-xs font-mono text-text-muted select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="ml-2 text-text-secondary font-medium">
                react-zeugma • workspace-v7.json
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
          </div>

          {/* Dashboard Component */}
          <div className="h-[760px] w-full scheme-dark">
            <ZeugmaDemoDashboard />
          </div>
        </div>
      </div>
    </section>
  )
}
