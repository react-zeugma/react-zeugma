'use client'

import { Sun, Moon, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useEffect } from 'react'
import { BrandIcon } from './brand-icon'
import { useTheme } from './theme-provider'

const LOGO_URL = '/logo.png'

export const NAV_ITEMS: {
  label: string
  to: '/' | '/demo' | '/docs' | '/changelog' | '/blog'
}[] = [
  { label: 'Home', to: '/' },
  { label: 'Demo', to: '/demo' },
  { label: 'Docs', to: '/docs' },
  { label: 'Changelog', to: '/changelog' },
  { label: 'Blog', to: '/blog' },
]
export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const prefetched = useRef<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Automatically close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const prefetch = useCallback(
    (href: string) => {
      if (prefetched.current.has(href)) return
      prefetched.current.add(href)
      router.prefetch(href)
    },
    [router],
  )

  return (
    <div>
      <nav className="sticky top-0 z-50 bg-bg-app/80 backdrop-blur-md border-b border-border-primary px-4 sm:px-6 flex items-center justify-between h-14 transition-colors duration-200 select-none">
        <Link href="/" className="flex items-center gap-2 group">
          <img src={LOGO_URL} alt="react-zeugma logo" className="w-6 h-6 object-contain" />
          <span className="font-extrabold text-lg tracking-tight text-text-primary">
            react-zeugma
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
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

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-bg-sidebar border border-transparent hover:border-border-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Desktop External Links */}
          <div className="hidden sm:flex items-center gap-2">
            <a
              href="https://www.npmjs.com/package/react-zeugma"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-[#cb3837]/10 hover:bg-[#cb3837]/20 text-[#cb3837] px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            >
              <BrandIcon name="npm" size={22} title="NPM" />
              NPM
            </a>
            <a
              href="https://github.com/react-zeugma/react-zeugma"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-text-primary hover:bg-text-primary/90 text-bg-app px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
            >
              <BrandIcon name="github" size={22} title="GitHub" />
              GitHub
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md hover:bg-bg-sidebar border border-transparent hover:border-border-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-14 z-40 bg-bg-app/95 backdrop-blur-md border-b border-border-primary shadow-lg flex flex-col p-6 gap-6 transition-all duration-300 ease-in-out origin-top transform ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`text-base font-semibold transition-colors py-1 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border-primary pt-6 flex flex-col gap-3">
          <a
            href="https://www.npmjs.com/package/react-zeugma"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-[#cb3837]/10 hover:bg-[#cb3837]/20 text-[#cb3837] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <BrandIcon name="npm" size={22} title="NPM" />
            NPM Package
          </a>
          <a
            href="https://github.com/react-zeugma/react-zeugma"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-text-primary hover:bg-text-primary/90 text-bg-app px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <BrandIcon name="github" size={22} title="GitHub" />
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  )
}
