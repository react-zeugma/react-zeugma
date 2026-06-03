'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NotFoundClient() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-bg-app transition-colors duration-200">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/2 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <div className="relative mb-6 select-none">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-indigo-400 to-emerald-500">
              404
            </h1>
            <div className="absolute -inset-1 blur-lg bg-linear-to-r from-indigo-500/10 to-emerald-500/10 -z-10" />
          </div>

          <div className="inline-flex items-center gap-2 bg-bg-sidebar border border-border-primary backdrop-blur-sm rounded-full px-3 py-1 mb-6 transition-colors duration-200 select-none">
            <span className="text-[10px] font-extrabold tracking-widest text-text-secondary uppercase">
              Page Not Found
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-4">
            Lost in the{' '}
            <span className="italic text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-emerald-500 px-2 box-decoration-clone">
              layout
            </span>
          </h2>

          <p className="text-text-secondary text-base md:text-lg max-w-md mb-6 leading-relaxed">
            The page you are looking for doesn&apos;t exist, was moved, or split into another
            dimension.
          </p>

          <div className="w-full max-w-md bg-bg-pane-inner border border-border-primary rounded-xl p-4 mb-8 text-left transition-colors duration-200 shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-text-muted uppercase font-bold tracking-wider mb-2 select-none">
              <span>Requested Path</span>
              <span className="text-rose-500 dark:text-rose-400">Detached</span>
            </div>
            <code className="block font-mono text-xs text-text-primary break-all select-all">
              {pathname}
            </code>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-text-primary hover:bg-text-primary/90 text-bg-app px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
