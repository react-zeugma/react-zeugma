'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggleTheme: (event?: React.MouseEvent<HTMLButtonElement>) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('zeugma-theme')
    const initial = saved === 'dark' ? 'dark' : 'light'
    setTheme(initial)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('zeugma-theme', theme)
  }, [theme, mounted])

  const toggleTheme = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> }
    }
    if (!event || !doc.startViewTransition) {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const transition = doc.startViewTransition(() => {
      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
