'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

const ZeugmaDemoIDE = dynamic(
  () => import('@/components/zeugma-demo-ide').then((mod) => ({ default: mod.ZeugmaDemoIDE })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#0c0c0e] border border-zinc-800 rounded-3xl animate-pulse" />
    ),
  },
)

export function DemoClientPage() {
  useEffect(() => {
    // Enforce dark mode on document element
    document.documentElement.classList.add('dark')

    // Clean up: restore light mode if it was previously set by user
    return () => {
      const savedTheme = localStorage.getItem('zeugma-theme')
      if (savedTheme !== 'dark') {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-zinc-950 p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-[1700px] flex flex-col justify-center">
        <ZeugmaDemoIDE className="h-full" />
      </div>
    </div>
  )
}
