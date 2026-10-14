import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'
import { globalMetadata } from '@/config/seo'
import './globals.css'

export const metadata: Metadata = globalMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var saved = localStorage.getItem('zeugma-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (!saved && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      var meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.content = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      var meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.content = 'light';
    }
  } catch(e){}
})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
