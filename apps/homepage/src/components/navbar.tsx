'use client'

import { Sun, Moon, Menu, X, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useEffect } from 'react'
import { BrandIcon } from './brand-icon'
import { useTheme } from './theme-provider'
import { SearchModal } from '../views/docs/search-modal'
import { docsData } from '../config/docs-data'

const LOGO_URL = '/logo.png'

export const NAV_ITEMS: {
  label: string
  to: '/' | '/demo' | '/docs' | '/changelog'
}[] = [
  { label: 'Home', to: '/' },
  { label: 'Demo', to: '/demo' },
  { label: 'Docs', to: '/docs' },
  { label: 'Changelog', to: '/changelog' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const prefetched = useRef<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  // Automatically close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Keyboard shortcut listener for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        e.key === '/' &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !target.isContentEditable
      ) {
        e.preventDefault()
        setSearchModalOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Listen for global open-search event (e.g., from mobile docs search button)
  useEffect(() => {
    const handleOpen = () => setSearchModalOpen(true)
    window.addEventListener('open-search', handleOpen)
    return () => window.removeEventListener('open-search', handleOpen)
  }, [])

  const prefetch = useCallback(
    (href: string) => {
      if (prefetched.current.has(href)) return
      prefetched.current.add(href)
      router.prefetch(href)
    },
    [router],
  )

  const handleSearchClick = () => {
    setSearchModalOpen(true)
  }

  const handleSelectResult = (id: string) => {
    if (pathname === '/docs') {
      window.dispatchEvent(new CustomEvent('scroll-to-section', { detail: id }))
    } else {
      router.push(`/docs#${id}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="relative bg-bg-app/80 backdrop-blur-md border-b border-border-primary px-4 sm:px-6 flex items-center justify-between h-14 transition-colors duration-200 select-none">
        <Link href="/" className="flex items-center gap-2 group z-10">
          <img src={LOGO_URL} alt="react-zeugma logo" className="w-6 h-6 object-contain" />
          <span className="font-extrabold text-lg tracking-tight text-text-primary">
            react-zeugma
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
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
        <div className="flex items-center gap-2 sm:gap-3 z-10">
          {/* Desktop Search Button */}
          <button
            onClick={handleSearchClick}
            className="hidden md:flex items-center justify-between gap-2 px-4 py-2 bg-bg-pane-inner border border-border-primary rounded-lg text-xs text-text-muted hover:text-text-primary transition-all duration-200 cursor-pointer select-none font-medium w-44 lg:w-56"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-text-muted" />
              <span>Search docs...</span>
            </div>
            <kbd className="inline-flex items-center justify-center h-5 select-none rounded border border-border-primary bg-bg-sidebar px-2 font-mono text-[10px] font-medium text-text-muted">
              /
            </kbd>
          </button>

          {/* Mobile Search Button */}
          <button
            onClick={handleSearchClick}
            className="md:hidden p-1.5 rounded-md hover:bg-bg-sidebar border border-transparent hover:border-border-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            title="Search documentation"
          >
            <Search className="w-4 h-4" />
          </button>

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
              className="flex items-center gap-2 bg-text-primary hover:bg-text-primary/95 text-bg-app px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
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
            className="flex items-center justify-center gap-2 bg-text-primary hover:bg-text-primary/95 text-bg-app px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <BrandIcon name="github" size={22} title="GitHub" />
            GitHub Repository
          </a>
        </div>
      </div>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        sections={docsData}
        onSelectResult={handleSelectResult}
      />
    </header>
  )
}
