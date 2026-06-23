'use client'

import { ThemeProvider } from './theme-provider'
import { FpsProvider } from '@/hooks/use-fps'
import { Navbar } from './navbar'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { usePathname } from 'next/navigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDemo = pathname === '/demo'

  return (
    <ThemeProvider>
      <FpsProvider>
        <div
          className={`flex flex-col text-text-primary transition-colors duration-200 ${
            isDemo ? 'h-screen overflow-hidden bg-[#0b0c0e]' : 'min-h-screen bg-bg-app'
          }`}
        >
          {!isDemo && <Navbar />}
          <main className="flex-1 min-w-0 w-full min-h-0">{children}</main>
        </div>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </FpsProvider>
    </ThemeProvider>
  )
}
