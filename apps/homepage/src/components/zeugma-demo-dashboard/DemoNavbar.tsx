'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const LOGO_URL = '/logo.png'

export function DemoNavbar() {
  return (
    <nav className="grafana-demo-navbar">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#D8D9DA] transition-colors group"
          title="Back to homepage"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        </Link>

        <div className="w-px h-4 bg-[#252830]" />

        <Link href="/" className="flex items-center gap-2 group">
          <img src={LOGO_URL} alt="react-zeugma logo" className="w-5 h-5 object-contain" />
          <span className="font-extrabold text-sm tracking-tight text-[#D8D9DA]">react-zeugma</span>
        </Link>

        <div className="w-px h-4 bg-[#252830]" />

        <span className="grafana-demo-nav-active">Live Demo</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/docs"
          className="text-[10px] font-semibold text-[#6B6B6B] hover:text-[#D8D9DA] transition-colors px-2 py-1"
        >
          Docs
        </Link>
        <Link
          href="/changelog"
          className="text-[10px] font-semibold text-[#6B6B6B] hover:text-[#D8D9DA] transition-colors px-2 py-1"
        >
          Changelog
        </Link>

        <div className="w-px h-4 bg-[#252830]" />

        <a
          href="https://github.com/react-zeugma/react-zeugma"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 bg-[#D8D9DA] hover:bg-[#D8D9DA]/90 text-[#0b0c0e] px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors"
        >
          GitHub
        </a>
      </div>
    </nav>
  )
}
