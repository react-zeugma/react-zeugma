'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NotFoundClient() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-bg-app transition-colors duration-200">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 relative overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[130px] rounded-full pointer-events-none mask-radial" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <div className="relative mb-6 select-none">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-text-primary via-accent to-accent/60">
              404
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 eyebrow px-3 py-1 rounded-full border border-border-primary bg-bg-sidebar/80 mb-6 select-none">
            <span>Unresolved Mosaic Tile</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-4">
            Lost in the{' '}
            <span className="font-display italic font-normal text-accent px-1">layout</span>
          </h2>

          <p className="text-text-secondary text-base md:text-lg max-w-md mb-6 leading-relaxed">
            The page you are looking for doesn&apos;t exist, was moved, or split into another
            dimension.
          </p>

          <div className="w-full max-w-md bg-bg-pane-inner border border-border-primary rounded-xl p-4 mb-8 text-left transition-colors duration-200 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] text-text-muted uppercase font-bold tracking-wider mb-2 select-none">
              <span>Requested Path</span>
              <span className="text-rose-500 font-mono text-[10px]">Detached</span>
            </div>
            <code className="block font-mono text-xs text-text-primary break-all select-all">
              {pathname}
            </code>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-text-primary hover:opacity-90 text-bg-app px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
