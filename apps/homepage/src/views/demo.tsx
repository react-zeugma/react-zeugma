'use client'

import dynamic from 'next/dynamic'
import { DemoNavbar } from '../components/zeugma-demo-dashboard/DemoNavbar'

const ZeugmaDemoDashboard = dynamic(
  () =>
    import('../components/zeugma-demo-dashboard').then((mod) => ({
      default: mod.ZeugmaDemoDashboard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[var(--demo-canvas)] animate-pulse flex items-center justify-center text-[var(--demo-muted)] text-xs font-mono">
        Loading cockpit telemetry...
      </div>
    ),
  },
)

export function DemoView() {
  return (
    <div className="flex flex-col h-full bg-[var(--demo-canvas)] scheme-dark">
      <DemoNavbar />
      <div className="flex-1 min-h-0">
        <ZeugmaDemoDashboard />
      </div>
    </div>
  )
}
