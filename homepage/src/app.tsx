import React, { useState, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { Navbar } from './components/navbar'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zeugma-theme')
      return saved === 'dark' ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('zeugma-theme', theme)
  }, [theme])

  const toggleTheme = (event?: React.MouseEvent<HTMLButtonElement>) => {
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
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-app text-text-primary transition-colors duration-200">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
