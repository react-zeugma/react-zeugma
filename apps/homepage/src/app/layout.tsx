import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'
import { globalMetadata } from '@/config/seo'
import './globals.css'

export const metadata: Metadata = globalMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning />
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
