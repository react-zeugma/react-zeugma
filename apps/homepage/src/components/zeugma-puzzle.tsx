'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  RefreshCw,
  Trophy,
  Crown,
  Sparkles,
  BookOpen,
  Hammer,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import {
  Zeugma,
  PaneTree,
  Pane,
  DragHandle,
  TreeNode,
  PaneRenderProps,
  Tabs,
  useZeugma,
} from 'react-zeugma'
import { Fireworks } from './fireworks'

// Animation definitions
const ANIMATION_STYLES = `
  @keyframes gold-shine {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .gold-shimmer-text {
    background: linear-gradient(90deg, #C29B47 0%, #F3D289 50%, #C29B47 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gold-shine 4s linear infinite;
  }
`

interface MosaicData {
  id: string
  title: string
  turkishTitle: string
  imageSrc: string
  period: string
  villa: string
  details: string
  archeologicalContext: string
}

const MOSAICS: MosaicData[] = [
  {
    id: 'gypsy-girl',
    title: 'The Gypsy Girl',
    turkishTitle: 'Çingene Kızı',
    imageSrc: '/images/zeugma-1.png',
    period: '2nd Century AD',
    villa: 'Maenad Villa',
    details:
      'The iconic face of Zeugma. Her wild curls, prominent cheekbones, and piercing gaze are rendered with three-dimensional depth using tiny colorful river stones. Her eyes use a special technique that makes her gaze follow you from any angle.',
    archeologicalContext:
      'Excavated in 1998 during emergency rescue operations before the Birecik Dam reservoir flooded the lower parts of the ancient city. She was found under piles of soil and columns, which protected this small fragment from 1960s looters.',
  },
  {
    id: 'oceanus',
    title: 'Oceanus & Tethys',
    turkishTitle: 'Okyanos ve Tetis',
    imageSrc: '/images/zeugma-2.png',
    period: '2nd - 3rd Century AD',
    villa: 'Poseidon Villa',
    details:
      'This gorgeous mosaic adorned the bottom of a shallow pool in a Roman dining room. It depicts Oceanus, the ancient Greek god of the oceans, and Tethys, his sister and wife, representing the fertile waters.',
    archeologicalContext:
      'The pool was filled with running river water from the nearby Euphrates, which made the mosaic look alive as ripples passed over the stone sea creatures.',
  },
  {
    id: 'ancient-ruins',
    title: 'Zeugma Ancient Ruins',
    turkishTitle: 'Belkıs Zeugma',
    imageSrc: '/images/zeugma-3.png',
    period: 'Founded 300 BC',
    villa: 'Euphrates River Bridge',
    details:
      "An ancient Hellenistic and Roman city situated on the Euphrates river. Founded by Alexander the Great's general, Seleucus I Nicator, it served as a vital military and commercial crossing bridge.",
    archeologicalContext:
      'When the Birecik Dam was built, a massive international archaeological rescue mission succeeded in salvaging these priceless mosaics. Today, they are housed in the Zeugma Mosaic Museum in Gaziantep, the largest mosaic museum in the world.',
  },
]

// Target layout check function
function checkBentoLayoutMatch(node: TreeNode | null): boolean {
  if (!node) return false

  // Target: split node with row direction
  if (node.type !== 'split' || node.direction !== 'row') return false

  const first = node.first
  const second = node.second

  // First side: pane containing the 'frag-left' tab
  if (first.type !== 'pane' || !first.tabs.includes('frag-left')) return false

  // Second side: split node with column direction
  if (second.type !== 'split' || second.direction !== 'column') return false

  const secFirst = second.first
  const secSecond = second.second

  // Top of second split: pane containing 'frag-top-right' tab
  if (secFirst.type !== 'pane' || !secFirst.tabs.includes('frag-top-right')) return false

  // Bottom of second split: pane containing 'frag-bottom-right' tab
  if (secSecond.type !== 'pane' || !secSecond.tabs.includes('frag-bottom-right')) return false

  return true
}

const defaultBentoLayout: TreeNode = {
  type: 'pane',
  id: 'pane-root',
  tabs: ['frag-left', 'frag-top-right', 'frag-bottom-right'],
  activeTabId: 'frag-left',
}

interface ZeugmaPuzzleProps {
  onSuccess?: () => void
}

export function ZeugmaPuzzle({ onSuccess }: ZeugmaPuzzleProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [activeMosaicIndex, setActiveMosaicIndex] = useState(0)

  const activeMosaic = useMemo(() => MOSAICS[activeMosaicIndex], [activeMosaicIndex])

  const zeugma = useZeugma({
    initialLayout: defaultBentoLayout,
    dragActivationDistance: 6,
    onChange: (newLayout) => {
      const matched = checkBentoLayoutMatch(newLayout)
      if (matched && !isSuccess) {
        setIsSuccess(true)
        setShowFireworks(true)
        onSuccess?.()
      }
    },
  })

  const handleReset = () => {
    zeugma.setLayout(defaultBentoLayout)
    setIsSuccess(false)
    setShowFireworks(false)
  }

  const handleSelectMosaic = (index: number) => {
    setActiveMosaicIndex(index)
    zeugma.setLayout(defaultBentoLayout)
    setIsSuccess(false)
    setShowFireworks(false)
  }

  // Fragment widget renderer
  const renderWidget = useCallback(
    (tabId: string) => {
      const imageSrc = activeMosaic.imageSrc

      if (tabId === 'frag-left') {
        return (
          <div className="h-full w-full relative overflow-hidden select-none bg-bg-pane">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: '200% 100%',
                backgroundPosition: 'left center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="absolute bottom-2 left-3 bg-bg-pane/90 border border-border-primary px-2 py-0.5 rounded text-[8px] font-bold text-text-primary pointer-events-none uppercase tracking-wide z-25 shadow-xs">
              Fragment A (Left Guard)
            </div>
          </div>
        )
      }

      if (tabId === 'frag-top-right') {
        return (
          <div className="h-full w-full relative overflow-hidden select-none bg-bg-pane">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: '200% 200%',
                backgroundPosition: 'right top',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="absolute bottom-2 left-3 bg-bg-pane/90 border border-border-primary px-2 py-0.5 rounded text-[8px] font-bold text-text-primary pointer-events-none uppercase tracking-wide z-25 shadow-xs">
              Fragment B (Top Right)
            </div>
          </div>
        )
      }

      if (tabId === 'frag-bottom-right') {
        return (
          <div className="h-full w-full relative overflow-hidden select-none bg-bg-pane">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: '200% 200%',
                backgroundPosition: 'right bottom',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="absolute bottom-2 left-3 bg-bg-pane/90 border border-border-primary px-2 py-0.5 rounded text-[8px] font-bold text-text-primary pointer-events-none uppercase tracking-wide z-25 shadow-xs">
              Fragment C (Bottom Right)
            </div>
          </div>
        )
      }

      return (
        <div className="h-full w-full bg-bg-pane flex items-center justify-center text-text-muted font-mono text-xs">
          Missing Fragment ({tabId})
        </div>
      )
    },
    [activeMosaic],
  )

  // Custom Pane renderer (hides headers/borders when restored for seamless view)
  const renderPane = useCallback(
    (paneId: string) => {
      return (
        <Pane id={paneId}>
          {(paneProps: PaneRenderProps) => (
            <div
              className={`h-full w-full flex flex-col relative overflow-hidden transition-all duration-300 ${
                isSuccess
                  ? 'border-none bg-transparent'
                  : 'bg-bg-pane border border-border-primary/60'
              }`}
            >
              {/* Custom Header Bar: hidden when mosaic is fully restored */}
              {!isSuccess && (
                <div className="flex items-center bg-bg-sidebar border-b border-border-primary h-8 select-none">
                  <Tabs
                    tabs={paneProps.tabs}
                    activeTabId={paneProps.activeTabId}
                    locked={isSuccess}
                    selectTab={(id) => paneProps.selectTab(id)}
                    removeTab={(id) => paneProps.removeTab(id)}
                    classNames={{
                      container: 'overflow-x-auto scrollbar-none min-w-0 h-full shrink',
                      tab: 'h-full flex',
                    }}
                    styles={{ tab: { display: 'flex' } }}
                  >
                    {({ tabId, activeTabId, isDragging, isOver }) => {
                      const isActive = activeTabId === tabId
                      let title = 'Shard'
                      let icon = <Hammer className="w-3 h-3 text-text-muted" />

                      if (tabId === 'frag-left') {
                        title = 'Fragment A'
                        icon = <Hammer className="w-3 h-3 text-[#C29B47]" />
                      } else if (tabId === 'frag-top-right') {
                        title = 'Fragment B'
                        icon = <Sparkles className="w-3 h-3 text-yellow-500" />
                      } else if (tabId === 'frag-bottom-right') {
                        title = 'Fragment C'
                        icon = <Crown className="w-3 h-3 text-orange-500" />
                      }

                      return (
                        <div
                          onClick={() => paneProps.selectTab(tabId)}
                          className={`px-3.5 flex items-center gap-1.5 border-b-2 font-medium text-[9px] transition-all relative cursor-pointer select-none h-full truncate ${
                            isActive
                              ? 'bg-bg-pane text-text-primary border-b-[#C29B47]'
                              : 'bg-bg-sidebar/50 text-text-muted hover:text-text-secondary hover:bg-bg-sidebar/80 border-b-transparent'
                          } ${isOver ? 'bg-[#C29B47]/10 border-l border-l-[#C29B47]/40 animate-pulse' : ''} ${
                            isDragging ? 'opacity-40' : ''
                          }`}
                        >
                          {icon}
                          <span className="truncate uppercase font-extrabold tracking-widest font-sans">
                            {title}
                          </span>
                        </div>
                      )
                    }}
                  </Tabs>
                  <DragHandle className="flex-1 h-full cursor-grab active:cursor-grabbing self-stretch min-w-[20px]" />
                </div>
              )}

              {/* Fragment Image content */}
              <div className="flex-1 overflow-hidden bg-bg-pane">{paneProps.renderActiveTab()}</div>
            </div>
          )}
        </Pane>
      )
    },
    [isSuccess],
  )

  // Drag overlay visuals
  const renderDragOverlay = useCallback((id: string) => {
    let title = 'Shard'
    let icon = <Hammer className="w-4 h-4" />

    if (id === 'frag-left') {
      title = 'Fragment A (Left)'
      icon = <Hammer className="w-4 h-4 text-[#C29B47]" />
    } else if (id === 'frag-top-right') {
      title = 'Fragment B (Top Right)'
      icon = <Sparkles className="w-4 h-4 text-yellow-500" />
    } else if (id === 'frag-bottom-right') {
      title = 'Fragment C (Bottom Right)'
      icon = <Crown className="w-4 h-4 text-orange-500" />
    }

    return (
      <div className="px-4 py-2.5 border border-[#C29B47]/40 rounded-xl shadow-md flex items-center gap-2.5 bg-bg-pane text-text-primary">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-bg-sidebar border border-border-primary">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-widest font-extrabold font-sans">
          {title}
        </span>
      </div>
    )
  }, [])

  return (
    <div className="w-full flex flex-col gap-8 lg:flex-row items-stretch select-none">
      <style dangerouslySetInnerHTML={{ __html: ANIMATION_STYLES }} />

      {zeugma.layout && (
        <Zeugma
          {...zeugma}
          renderPane={renderPane}
          renderWidget={renderWidget}
          renderDragOverlay={renderDragOverlay}
          classNames={{
            dropPreview:
              'bg-[#C29B47]/20 border-2 border-dashed border-[#C29B47]/80 shadow-[0_0_40px_rgba(194,155,71,0.3)] rounded-xl transition-all duration-200',
            resizer: `zeugma-mosaic-resizer bg-transparent transition-all duration-300 z-50 ${
              isSuccess
                ? 'pointer-events-none opacity-0 w-0 h-0 m-0'
                : 'hover:bg-[#C29B47]/10 active:bg-[#C29B47]/20'
            }`,
          }}
        >
          {/* Theme-Aware Archaeology Workbench Sidebar */}
          <div className="w-full lg:w-[360px] bg-bg-sidebar border border-border-primary rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500 shadow-sm text-text-secondary">
            {/* Soft decorative glow */}
            <div className="absolute -left-12 -top-12 w-36 h-36 bg-[#C29B47]/5 blur-3xl rounded-full" />

            <div>
              {/* Header */}
              <h3 className="text-2xl font-black text-text-primary tracking-tight mb-5">
                Mosaic Restoration
              </h3>

              {!isSuccess ? (
                <>
                  {/* Selector list */}
                  <div className="flex flex-col gap-2 mb-6">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      Select Artifact to Restore
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {MOSAICS.map((m, idx) => {
                        const isSelected = activeMosaic.id === m.id
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleSelectMosaic(idx)}
                            className={`flex items-center gap-3.5 p-2.5 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-[#C29B47]/10 border-[#C29B47] text-text-primary shadow-xs'
                                : 'bg-bg-pane border-border-primary text-text-muted hover:border-border-secondary hover:text-text-secondary'
                            } cursor-pointer group`}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-primary shrink-0 group-hover:scale-105 transition-transform">
                              <img
                                src={m.imageSrc}
                                alt={m.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`text-xs font-bold ${isSelected ? 'text-[#C29B47]' : 'text-text-primary'}`}
                              >
                                {m.title}
                              </div>
                              <div className="text-[9px] text-text-muted mt-0.5">
                                {m.period} • {m.villa}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Target Blueprint Miniature */}
                  <div className="mb-6 bg-bg-pane border border-border-primary rounded-xl p-3.5">
                    <div className="text-[9px] font-extrabold uppercase tracking-widest text-text-muted mb-2.5 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" />
                      Target Fragment Blueprint
                    </div>

                    <div className="w-full aspect-4/3 bg-bg-sidebar border border-border-primary rounded-lg p-2 flex gap-2">
                      {/* Left Side */}
                      <div className="flex-1 bg-bg-pane border border-border-primary/40 rounded flex flex-col items-center justify-center p-1 text-center">
                        <Hammer className="w-5 h-5 text-text-muted mb-1" />
                        <span className="text-[7px] text-text-muted uppercase font-extrabold tracking-wider">
                          Fragment A
                        </span>
                      </div>
                      {/* Right Side splits */}
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex-1 bg-bg-pane border border-border-primary/40 rounded flex flex-col items-center justify-center p-1 text-center">
                          <Sparkles className="w-4 h-4 text-text-muted mb-0.5" />
                          <span className="text-[7px] text-text-muted uppercase font-extrabold tracking-wider">
                            Fragment B
                          </span>
                        </div>
                        <div className="flex-1 bg-bg-pane border border-border-primary/40 rounded flex flex-col items-center justify-center p-1 text-center">
                          <Crown className="w-4 h-4 text-text-muted mb-0.5" />
                          <span className="text-[7px] text-text-muted uppercase font-extrabold tracking-wider">
                            Fragment C
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Help tip */}
                  <div className="p-3 bg-bg-pane border border-border-primary rounded-xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#C29B47] shrink-0 mt-0.5" />
                    <p className="text-[10px] text-text-secondary leading-normal m-0 text-left">
                      <strong>How to restore:</strong> Select a fragment tab, drag it to the edge of
                      the panel to split. Arrange them to match the target blueprint layout.
                    </p>
                  </div>
                </>
              ) : (
                /* Success description card */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> Restoration Successful!
                  </div>

                  <div className="bg-bg-pane border border-border-primary rounded-xl p-4 text-left">
                    <h4 className="text-sm font-extrabold text-[#C29B47] tracking-tight">
                      {activeMosaic.title}
                    </h4>
                    <span className="text-[9px] text-text-muted font-mono block mb-3">
                      {activeMosaic.turkishTitle} • {activeMosaic.period}
                    </span>

                    <p className="text-[11px] text-text-secondary leading-relaxed mb-3">
                      {activeMosaic.details}
                    </p>

                    <div className="border-t border-border-primary pt-3 mt-3">
                      <span className="text-[9px] font-extrabold text-text-muted uppercase block mb-1">
                        Excavation & History
                      </span>
                      <p className="text-[10px] text-text-secondary leading-relaxed">
                        {activeMosaic.archeologicalContext}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar bottom action control */}
            <div className="mt-8">
              {!isSuccess ? (
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-bg-pane border border-border-primary hover:border-border-secondary text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Restoration
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-bg-pane border border-border-primary hover:border-border-secondary text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Restore Again
                  </button>
                  {activeMosaicIndex < MOSAICS.length - 1 && (
                    <button
                      onClick={() => handleSelectMosaic(activeMosaicIndex + 1)}
                      className="flex-1 py-3 bg-[#C29B47] hover:bg-[#d8ba8e] text-bg-app rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      Next Mosaic <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Restoration Workshop Workspace */}
          <div className="flex-1 flex flex-col min-h-[460px] relative">
            {isSuccess && (
              <div className="absolute inset-x-0 top-0 h-12 bg-linear-to-b from-bg-pane/40 to-transparent pointer-events-none z-10 flex items-center justify-center">
                <span className="text-xs font-extrabold uppercase tracking-[0.3em] gold-shimmer-text">
                  SALVAGED HISTORY • RESTORED SECURELY
                </span>
              </div>
            )}

            <div
              className={`flex-1 w-full aspect-4/3 min-h-[460px] rounded-2xl border transition-all duration-700 relative overflow-hidden flex flex-col ${
                isSuccess
                  ? 'border-[#C29B47] shadow-[0_0_30px_rgba(194,155,71,0.2)]'
                  : 'border-border-primary bg-bg-pane shadow-sm'
              }`}
            >
              {/* Seamless restored mosaic full overlay */}
              {isSuccess && (
                <div className="absolute inset-0 bg-bg-pane rounded-2xl overflow-hidden animate-in fade-in duration-1000 z-10">
                  <div
                    className="w-full h-full bg-cover bg-no-repeat"
                    style={{
                      backgroundImage: `url(${activeMosaic.imageSrc})`,
                      backgroundPosition: 'center',
                    }}
                  />
                </div>
              )}

              <div className="flex-1 flex relative z-0">
                <PaneTree />
              </div>
            </div>
          </div>
        </Zeugma>
      )}

      <Fireworks
        active={showFireworks}
        duration={6000}
        onComplete={() => setShowFireworks(false)}
      />
    </div>
  )
}
