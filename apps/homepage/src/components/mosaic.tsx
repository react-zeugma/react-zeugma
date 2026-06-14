'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Zeugma, PaneTree, Pane, DragHandle } from 'react-zeugma'
import type { TreeNode } from 'react-zeugma'
import { Fireworks } from './fireworks'

const TILE_IDS = ['R', 'E1', 'A1', 'C', 'T', 'HYPHEN', 'Z', 'E2', 'U', 'G', 'M', 'A2']

const TILE_MAP: Record<string, { letter: string; color: string }> = {
  R: { letter: 'R', color: '#2A4259' }, // Euphrates Blue
  E1: { letter: 'E', color: '#C29B47' }, // Ancient Gold
  A1: { letter: 'A', color: '#8B5A44' }, // Brown Clay
  C: { letter: 'C', color: '#B5543C' }, // Terracotta
  T: { letter: 'T', color: '#596643' }, // Olive Green
  HYPHEN: { letter: '-', color: '#7E8B99' }, // Slate Gray
  Z: { letter: 'Z', color: '#2A4259' }, // Euphrates Blue
  E2: { letter: 'E', color: '#C29B47' }, // Ancient Gold
  U: { letter: 'U', color: '#8B5A44' }, // Brown Clay
  G: { letter: 'G', color: '#B5543C' }, // Terracotta
  M: { letter: 'M', color: '#596643' }, // Olive Green
  A2: { letter: 'A', color: '#D8BA8E' }, // Sandstone
}

const LIGHT_COLORS = new Set(['#D8BA8E', '#C29B47'])

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Extracts pane IDs from the tree in visual reading order
 * (left-to-right, top-to-bottom). For row splits, first comes before second
 * (left before right). For column splits, first comes before second
 * (top before bottom).
 */
function extractReadingOrder(node: TreeNode): string[] {
  if (node.type === 'pane') {
    return [node.activeTabId]
  }
  const firstIds = extractReadingOrder(node.first)
  const secondIds = extractReadingOrder(node.second)
  return [...firstIds, ...secondIds]
}

function buildLayout(tiles: string[]): TreeNode {
  // Asymmetric bento grid for 12 tiles
  return {
    type: 'split',
    direction: 'row',
    splitPercentage: 40,
    first: {
      // Left column (40% width): split vertically into top half (2 rows) and bottom half (3 rows)
      type: 'split',
      direction: 'column',
      splitPercentage: 40,
      first: {
        // Top half: split horizontally (2 side-by-side)
        type: 'split',
        direction: 'row',
        splitPercentage: 50,
        first: { type: 'pane', id: tiles[0], tabs: [tiles[0]], activeTabId: tiles[0] },
        second: { type: 'pane', id: tiles[1], tabs: [tiles[1]], activeTabId: tiles[1] },
      },
      second: {
        // Bottom half: split vertically (3 stacked)
        type: 'split',
        direction: 'column',
        splitPercentage: 33.3,
        first: { type: 'pane', id: tiles[2], tabs: [tiles[2]], activeTabId: tiles[2] },
        second: {
          type: 'split',
          direction: 'column',
          splitPercentage: 50,
          first: { type: 'pane', id: tiles[3], tabs: [tiles[3]], activeTabId: tiles[3] },
          second: { type: 'pane', id: tiles[4], tabs: [tiles[4]], activeTabId: tiles[4] },
        },
      },
    },
    second: {
      // Right column (60% width): split horizontally into middle column (45% width) and right column (55% width)
      type: 'split',
      direction: 'row',
      splitPercentage: 45,
      first: {
        // Middle column of right side: split vertically (3 stacked)
        type: 'split',
        direction: 'column',
        splitPercentage: 33.3,
        first: { type: 'pane', id: tiles[5], tabs: [tiles[5]], activeTabId: tiles[5] },
        second: {
          type: 'split',
          direction: 'column',
          splitPercentage: 50,
          first: { type: 'pane', id: tiles[6], tabs: [tiles[6]], activeTabId: tiles[6] },
          second: { type: 'pane', id: tiles[7], tabs: [tiles[7]], activeTabId: tiles[7] },
        },
      },
      second: {
        // Right column of right side: split vertically (4 stacked)
        type: 'split',
        direction: 'column',
        splitPercentage: 50,
        first: {
          type: 'split',
          direction: 'column',
          splitPercentage: 50,
          first: { type: 'pane', id: tiles[8], tabs: [tiles[8]], activeTabId: tiles[8] },
          second: { type: 'pane', id: tiles[9], tabs: [tiles[9]], activeTabId: tiles[9] },
        },
        second: {
          type: 'split',
          direction: 'column',
          splitPercentage: 50,
          first: { type: 'pane', id: tiles[10], tabs: [tiles[10]], activeTabId: tiles[10] },
          second: { type: 'pane', id: tiles[11], tabs: [tiles[11]], activeTabId: tiles[11] },
        },
      },
    },
  }
}

interface MosaicDemoProps {
  onOrderChange?: (order: string) => void
}

export function MosaicDemo({ onOrderChange }: MosaicDemoProps) {
  const [mosaicVisible, setMosaicVisible] = useState(false)
  const [mosaicAnimated, setMosaicAnimated] = useState(false)
  const [entranceDone, setEntranceDone] = useState(false)
  const mosaicRef = useRef<HTMLDivElement | null>(null)
  const [shuffledLetters] = useState(() => shuffle(TILE_IDS))
  const onOrderChangeRef = useRef(onOrderChange)
  onOrderChangeRef.current = onOrderChange
  const [mosaicLayout, setMosaicLayout] = useState<TreeNode | null>(() =>
    buildLayout(shuffledLetters),
  )
  const [showFireworks, setShowFireworks] = useState(false)
  const wasZeugmaRef = useRef(false)

  const handleLayoutChange = useCallback((newLayout: TreeNode | null) => {
    setMosaicLayout(newLayout)
    if (newLayout) {
      const order = extractReadingOrder(newLayout)
      const joined = order.map((id) => TILE_MAP[id]?.letter || '').join('')
      onOrderChangeRef.current?.(joined)
      const isNowZeugma = joined === 'REACT-ZEUGMA'
      if (isNowZeugma && !wasZeugmaRef.current) {
        setShowFireworks(true)
      }
      wasZeugmaRef.current = isNowZeugma
    }
  }, [])

  // Report initial order on mount
  useEffect(() => {
    const joined = shuffledLetters.map((id) => TILE_MAP[id]?.letter || '').join('')
    onOrderChangeRef.current?.(joined)
  }, [shuffledLetters])

  const handleFireworksComplete = useCallback(() => {
    setShowFireworks(false)
  }, [])

  const renderMosaicPane = (id: string) => {
    const tile = TILE_MAP[id]
    const color = tile?.color || '#2A4259'
    const isLight = LIGHT_COLORS.has(color)
    const animIndex = shuffledLetters.indexOf(id)

    return (
      <Pane id={id}>
        {({ isDragging }) => (
          <div
            className={`h-full w-full p-1 transition-all duration-200 ${
              isDragging ? 'opacity-30 scale-95' : ''
            }`}
          >
            <DragHandle style={{ width: '100%', height: '100%' }}>
              <div
                className="mosaic-tile"
                style={{
                  background: color,
                  color: isLight ? '#1A2A3A' : '#E6D3A7',
                  opacity: entranceDone ? 1 : mosaicAnimated ? 1 : 0,
                  transform: entranceDone
                    ? undefined
                    : mosaicAnimated
                      ? 'translateY(0) scale(1) rotate(0deg)'
                      : 'translateY(8px) scale(0.9) rotate(-5deg)',
                  transition: entranceDone
                    ? undefined
                    : 'opacity 500ms cubic-bezier(0.2,0.8,0.2,1), transform 500ms cubic-bezier(0.2,0.8,0.2,1)',
                  transitionDelay: entranceDone
                    ? undefined
                    : mosaicAnimated
                      ? `${animIndex * 120}ms`
                      : '0ms',
                }}
              >
                {tile?.letter || id}
              </div>
            </DragHandle>
          </div>
        )}
      </Pane>
    )
  }

  // Mount Zeugma when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMosaicVisible(true)
      },
      { threshold: 0.3 },
    )
    if (mosaicRef.current) observer.observe(mosaicRef.current)
    return () => observer.disconnect()
  }, [])

  // Trigger entrance animation one frame after mount so tiles can transition
  useEffect(() => {
    if (mosaicVisible) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setMosaicAnimated(true)
        })
      })
    }
  }, [mosaicVisible])

  // Clear transition delay/stagger once entrance is fully completed
  useEffect(() => {
    if (mosaicAnimated) {
      const timer = setTimeout(() => {
        setEntranceDone(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [mosaicAnimated])

  return (
    <div
      ref={mosaicRef}
      className={`mosaic-demo w-[280px] h-[360px] md:w-[320px] md:h-[420px] mx-auto md:mr-0 md:ml-auto transition-all duration-700 ease-out relative ${
        mosaicVisible ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-6 rotate-0'
      }`}
    >
      {mosaicVisible && mosaicLayout && (
        <Zeugma
          layout={mosaicLayout}
          onChange={handleLayoutChange}
          renderPane={renderMosaicPane}
          dragActivationDistance={0}
          classNames={{
            dropPreview:
              'bg-[#C29B47]/20 border-2 border-[#C29B47]/40 rounded-lg shadow-[0_0_12px_rgba(194,155,71,0.25)] transition-all duration-200',
            swapPreview:
              'bg-[#D8BA8E]/25 border-2 border-[#D8BA8E]/50 rounded-lg shadow-[0_0_12px_rgba(216,186,142,0.3)] transition-all duration-200',
            resizer:
              'zeugma-mosaic-resizer bg-transparent hover:bg-[#C29B47]/15 active:bg-[#C29B47]/25 transition-colors duration-150 z-50',
          }}
        >
          <div className="h-full w-full">
            <PaneTree />
          </div>
        </Zeugma>
      )}
      <Fireworks active={showFireworks} duration={4000} onComplete={handleFireworksComplete} />
    </div>
  )
}
