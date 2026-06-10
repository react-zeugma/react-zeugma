import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

export function useFps(historySize = 20) {
  const [fps, setFps] = useState(60)
  const [history, setHistory] = useState<number[]>(() => Array(historySize).fill(60))

  const frameCountRef = useRef(0)
  const lastFpsUpdateRef = useRef(0)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return

    lastFpsUpdateRef.current = performance.now()
    let animId: number

    const tick = () => {
      const now = performance.now()
      frameCountRef.current++

      // Update FPS every 500ms
      const duration = now - lastFpsUpdateRef.current
      if (duration >= 500) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / duration)

        // Clamp between 0 and 240 (for high refresh rate screens)
        const normalizedFps = Math.max(0, Math.min(calculatedFps, 240))

        setFps(normalizedFps)
        setHistory((prev) => {
          const next = [...prev.slice(1), normalizedFps]
          return next
        })

        frameCountRef.current = 0
        lastFpsUpdateRef.current = now
      }

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animId)
    }
  }, [historySize])

  return { fps, history }
}

interface FpsContextType {
  fps: number
  history: number[]
}

const FpsContext = createContext<FpsContextType | null>(null)

export function FpsProvider({ children }: { children: React.ReactNode }) {
  // Use a standard 30 points of history for the shared context
  const value = useFps(30)
  return React.createElement(FpsContext.Provider, { value }, children)
}

export function useSharedFps() {
  const context = useContext(FpsContext)
  if (!context) {
    throw new Error('useSharedFps must be used within an FpsProvider')
  }
  return context
}
