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
    loading: () => <div className="w-full h-full bg-[#0b0c0e] animate-pulse" />,
  },
)

export function DemoView() {
  return (
    <div className="flex flex-col h-full">
      <DemoNavbar />
      <div className="flex-1 min-h-0">
        <ZeugmaDemoDashboard />
      </div>
    </div>
  )
}
