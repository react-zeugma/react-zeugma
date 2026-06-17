import { useState, useEffect } from 'react'

const renderCache: Record<string, { mounts: number; renders: number }> = {}

/**
 * A custom hook that tracks the number of times a component mounts
 * and re-renders based on a unique identifier.
 */
export function useRenderCounter(id: string) {
  if (!renderCache[id]) {
    renderCache[id] = { mounts: 0, renders: 0 }
  }

  // Increment every single time the function body executes (re-renders)
  renderCache[id].renders += 1

  const [, forceUpdate] = useState(0)

  // Run exactly once per actual DOM mount
  useEffect(() => {
    renderCache[id].mounts += 1
    forceUpdate((x) => x + 1)

    // Optional: Log it to the console for real-time debugging
    console.log(`[${id}] Mounted: ${renderCache[id].mounts} | Rendered: ${renderCache[id].renders}`)
  }, [id])

  return {
    mounts: renderCache[id].mounts,
    renders: renderCache[id].renders,
  }
}
