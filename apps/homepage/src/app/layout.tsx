import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'
import { globalMetadata } from '@/config/seo'
import './globals.css'

export const metadata: Metadata = globalMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {isDev && <script src="https://unpkg.com/react-scan/dist/auto.global.js" async />}
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
