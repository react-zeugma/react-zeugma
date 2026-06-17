'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { X } from 'lucide-react'

const ZeugmaDemoIDE = dynamic(
  () => import('@/components/zeugma-demo-ide').then((mod) => ({ default: mod.ZeugmaDemoIDE })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#1e1e1e] animate-pulse" />,
  },
)

export function DemoClientPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Enforce dark mode on document element
    document.documentElement.classList.add('dark')

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      const savedTheme = localStorage.getItem('zeugma-theme')
      if (savedTheme !== 'dark') {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-[#1e1e1e] overflow-hidden z-50 select-none">
      {/* VSCode-style Top Menu Bar */}
      <header className="h-9 bg-[#2d2d2d] border-b border-[#1e1e1e] flex items-center justify-between px-2 text-xs text-[#cccccc] shrink-0 relative z-50">
        {/* Left Section: Logo & Menu Navigator */}
        <div className="flex items-center gap-1 h-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center justify-center p-1.5 hover:bg-zinc-800 rounded transition-colors mr-2 shrink-0"
          >
            <img src="/logo.png" alt="react-zeugma" className="w-4 h-4 object-contain" />
          </Link>

          {/* Navigator Links */}
          <div className="flex items-center gap-0.5 h-full">
            <Link
              href="/"
              className="px-3 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px] font-sans font-medium"
            >
              Home
            </Link>
            <Link
              href="/demo"
              className="px-3 py-1 rounded hover:bg-zinc-800 text-white bg-zinc-800 transition-colors cursor-pointer text-[11px] font-sans font-medium"
            >
              Demo
            </Link>
            <Link
              href="/docs"
              className="px-3 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px] font-sans font-medium"
            >
              Docs
            </Link>
            <Link
              href="/changelog"
              className="px-3 py-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px] font-sans font-medium"
            >
              Changelog
            </Link>
          </div>
        </div>

        {/* Center Section: Title */}
        <div className="hidden md:flex bg-[#1e1e1e] hover:bg-zinc-800 border border-[#3e3e3e] rounded-md py-0.5 px-6 items-center justify-center gap-1.5 text-[11px] text-zinc-400 cursor-default transition-colors">
          <span>my-zeugma-app — react-zeugma [Demo Workspace]</span>
        </div>

        {/* Right Section: Windows Control Window Dots */}
        <div className="flex items-center gap-4 shrink-0 pl-4 pr-1">
          <div className="flex items-center h-full">
            <button
              onClick={handleToggleFullscreen}
              className="w-10 h-9 flex items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Restore Window' : 'Maximize Window'}
            >
              {isFullscreen ? (
                <div className="w-2.5 h-2.5 relative">
                  <div className="absolute top-0.5 left-0 w-2 h-2 border border-current bg-[#2d2d2d]" />
                  <div className="absolute -top-0.5 right-0 w-2 h-2 border border-current border-b-0 border-l-0" />
                </div>
              ) : (
                <span className="w-2.5 h-2.5 border border-current" />
              )}
            </button>
            <Link
              href="/"
              className="w-10 h-9 flex items-center justify-center hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
              title="Close Window (Go Home)"
            >
              <X className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 w-full min-h-0 bg-[#1e1e1e] relative">
        <ZeugmaDemoIDE className="h-full w-full" hideChrome={true} />
      </div>
    </div>
  )
}
