'use client'

import { Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { BrandIcon } from './brand-icon'
import { useTheme } from './theme-provider'

const LOGO_URL = '/logo.png'

const NAV_ITEMS: { label: string; to: '/' | '/demo' | '/docs' }[] = [
  { label: 'Home', to: '/' },
  { label: 'Demo', to: '/demo' },
  { label: 'Docs', to: '/docs' },
]

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const prefetched = useRef<Set<string>>(new Set())

  const prefetch = useCallback(
    (href: string) => {
      if (prefetched.current.has(href)) return
      prefetched.current.add(href)
      router.prefetch(href)
    },
    [router],
  )

  return (
    <nav className="sticky top-0 z-50 bg-bg-app/80 backdrop-blur-md border-b border-border-primary px-6 flex items-center justify-between h-14 transition-colors duration-200 select-none">
      <Link href="/" className="flex items-center gap-2 group">
        <img src={LOGO_URL} alt="react-zeugma logo" className="w-6 h-6 object-contain" />
        <span className="font-extrabold text-lg tracking-tight text-text-primary">
          react-zeugma
        </span>
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                href={item.to}
                onMouseEnter={() => prefetch(item.to)}
                className={`text-sm font-medium transition-colors hover:text-text-primary ${
                  isActive ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-bg-sidebar border border-transparent hover:border-border-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <a
            href="https://www.npmjs.com/package/react-zeugma"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 bg-[#cb3837]/10 hover:bg-[#cb3837]/20 text-[#cb3837] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
          >
            <BrandIcon name="npm" size={22} title="NPM" />
            NPM
          </a>
          <a
            href="https://github.com/yusufarsln98/react-zeugma"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 bg-text-primary hover:bg-text-primary/90 text-bg-app px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
          >
            <BrandIcon name="github" size={22} title="GitHub" />
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
