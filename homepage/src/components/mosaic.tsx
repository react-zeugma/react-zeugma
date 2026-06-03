import { useEffect, useRef, useState } from 'react'
import { DashboardProvider, PaneTree, Pane, DragHandle } from 'react-zeugma'
import type { TreeNode } from 'react-zeugma'

const MOSAIC_LETTERS = ['Z', 'E', 'U', 'G', 'M', 'A']
const LETTER_COLOR_MAP: Record<string, string> = {
  Z: '#2A4259', // Euphrates Blue
  E: '#C29B47', // Ancient Gold
  U: '#8B5A44', // Brown Clay
  G: '#B5543C', // Terracotta
  M: '#596643', // Olive Green
  A: '#D8BA8E', // Sandstone
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

function buildBentoLayout(letters: string[]): TreeNode {
  // Asymmetric bento: left column (2 stacked) + right 2×2 grid
  return {
    type: 'split',
    direction: 'row',
    splitPercentage: 38,
    first: {
      type: 'split',
      direction: 'column',
      splitPercentage: 58,
      first: { type: 'pane', paneId: letters[0] },
      second: { type: 'pane', paneId: letters[1] },
    },
    second: {
      type: 'split',
      direction: 'column',
      splitPercentage: 42,
      first: {
        type: 'split',
        direction: 'row',
        splitPercentage: 55,
        first: { type: 'pane', paneId: letters[2] },
        second: { type: 'pane', paneId: letters[3] },
      },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 45,
        first: { type: 'pane', paneId: letters[4] },
        second: { type: 'pane', paneId: letters[5] },
      },
    },
  }
}

export function MosaicDemo() {
  const [mosaicVisible, setMosaicVisible] = useState(false)
  const [mosaicAnimated, setMosaicAnimated] = useState(false)
  const mosaicRef = useRef<HTMLDivElement | null>(null)
  const [shuffledLetters] = useState(() => shuffle(MOSAIC_LETTERS))
  const [mosaicLayout, setMosaicLayout] = useState<TreeNode | null>(() =>
    buildBentoLayout(shuffledLetters),
  )

  const renderMosaicPane = (id: string) => {
    const color = LETTER_COLOR_MAP[id] || '#2A4259'
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
                  opacity: mosaicAnimated ? 1 : 0,
                  transform: mosaicAnimated
                    ? 'translateY(0) scale(1) rotate(0deg)'
                    : 'translateY(8px) scale(0.9) rotate(-5deg)',
                  transition:
                    'opacity 500ms cubic-bezier(0.2,0.8,0.2,1), transform 500ms cubic-bezier(0.2,0.8,0.2,1)',
                  transitionDelay: mosaicAnimated ? `${animIndex * 120}ms` : '0ms',
                }}
              >
                {id}
              </div>
            </DragHandle>
          </div>
        )}
      </Pane>
    )
  }

  // Mount DashboardProvider when section scrolls into view
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

  return (
    <div
      ref={mosaicRef}
      className={`mosaic-demo w-[280px] h-[280px] md:w-[320px] md:h-[320px] ml-auto transition-all duration-700 ease-out ${
        mosaicVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {mosaicVisible && mosaicLayout && (
        <DashboardProvider
          layout={mosaicLayout}
          onChange={setMosaicLayout}
          renderPane={renderMosaicPane}
          dragActivationDistance={0}
          classNames={{
            dropPreview:
              'bg-[#C29B47]/20 border-2 border-[#C29B47]/40 rounded-lg shadow-[0_0_12px_rgba(194,155,71,0.25)] transition-all duration-200',
            swapPreview:
              'bg-[#D8BA8E]/25 border-2 border-[#D8BA8E]/50 rounded-lg shadow-[0_0_12px_rgba(216,186,142,0.3)] transition-all duration-200',
            resizer:
              'bg-transparent hover:bg-[#C29B47]/15 active:bg-[#C29B47]/25 transition-colors duration-150 z-50',
          }}
        >
          <div className="h-full w-full">
            <PaneTree />
          </div>
        </DashboardProvider>
      )}
    </div>
  )
}
