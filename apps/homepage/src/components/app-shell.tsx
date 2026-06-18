'use client'

import { ThemeProvider } from './theme-provider'
import { FpsProvider } from '@/hooks/use-fps'
import { Navbar } from './navbar'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FpsProvider>
        <div className="min-h-screen flex flex-col bg-bg-app text-text-primary transition-colors duration-200">
          <Navbar />
          <main className="flex-1 min-w-0 w-full">{children}</main>
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
