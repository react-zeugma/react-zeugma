'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  RefreshCw,
  Trophy,
  Crown,
  Compass,
  Shield,
  Waves,
  Scroll,
  MapPin,
  Sparkles,
} from 'lucide-react'
import {
  Zeugma,
  PaneTree,
  Pane,
  DragHandle,
  TreeNode,
  PaneRenderProps,
  Tab,
  useZeugma,
} from 'react-zeugma'
import { Fireworks } from './fireworks'

// Local CSS Animations to insert in a style block
const ANIMATION_STYLES = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes wave-bounce {
    0%, 100% { height: 4px; }
    50% { height: 20px; }
  }
  .bento-spin-vinyl {
    animation: spin-slow 10s linear infinite;
  }
  .bento-visualizer-bar {
    width: 3px;
    background-color: var(--color-emerald-400, #34d399);
    border-radius: 9999px;
  }
  .bento-bar-1 { animation: wave-bounce 0.8s ease-in-out infinite alternate; }
  .bento-bar-2 { animation: wave-bounce 1.1s ease-in-out infinite alternate 0.15s; }
  .bento-bar-3 { animation: wave-bounce 0.6s ease-in-out infinite alternate 0.3s; }
  .bento-bar-4 { animation: wave-bounce 0.9s ease-in-out infinite alternate 0.05s; }
  .bento-bar-5 { animation: wave-bounce 0.7s ease-in-out infinite alternate 0.2s; }
  @keyframes ancient-gold-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.15), 0 0 20px rgba(245, 158, 11, 0.05); }
    50% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.35), 0 0 35px rgba(245, 158, 11, 0.15); }
  }
  .success-glowing-border {
    animation: ancient-gold-glow 2s ease-in-out infinite;
    border-color: rgba(245, 158, 11, 0.6) !important;
  }
`

// Layout Comparator Function
function checkBentoLayoutMatch(node: TreeNode | null): boolean {
  if (!node) return false

  // Target: split node with row direction
  if (node.type !== 'split' || node.direction !== 'row') return false

  const first = node.first
  const second = node.second

  // First side: pane containing the 'gypsy-girl' tab
  if (first.type !== 'pane' || !first.tabs.includes('gypsy-girl')) return false

  // Second side: split node with column direction
  if (second.type !== 'split' || second.direction !== 'column') return false

  const secFirst = second.first
  const secSecond = second.second

  // Top of second split: pane containing 'excavation-map' tab
  if (secFirst.type !== 'pane' || !secFirst.tabs.includes('excavation-map')) return false

  // Bottom of second split: pane containing 'mars-statue' tab
  if (secSecond.type !== 'pane' || !secSecond.tabs.includes('mars-statue')) return false

  return true
}

// -----------------------------------------------------------------------------
// Drag-and-Drop Palette Card
// -----------------------------------------------------------------------------
interface PaletteCardProps {
  id: string
  title: string
  desc: string
  icon: React.ReactNode
  disabled?: boolean
  onClick?: () => void
}

function PaletteCard({ id, title, desc, icon, disabled = false, onClick }: PaletteCardProps) {
  return (
    <Tab id={id} locked={disabled} className="w-full" style={{ width: '100%' }}>
      {({ isDragging }) => (
        <div
          onClick={() => {
            if (disabled) return
            onClick?.()
          }}
          className={`p-3.5 bg-bg-pane border rounded-xl flex items-center gap-3.5 select-none transition-all duration-200 w-full ${
            disabled
              ? 'opacity-35 border-border-primary cursor-not-allowed'
              : 'border-border-primary hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.06)] cursor-pointer active:cursor-grabbing hover:-translate-y-0.5'
          } ${isDragging ? 'opacity-30 scale-95 border-amber-500 shadow-none' : ''}`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              disabled
                ? 'bg-zinc-800 text-zinc-600'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}
          >
            {icon}
          </div>
          <div className="text-left min-w-0 flex-1">
            <h4 className="text-xs font-bold text-text-primary tracking-wide uppercase truncate">
              {title}
            </h4>
            <p className="text-[10px] text-text-muted mt-0.5 truncate">{desc}</p>
          </div>
        </div>
      )}
    </Tab>
  )
}

// -----------------------------------------------------------------------------
// Interactive Zeugma Gaziantep Museum Widgets
// -----------------------------------------------------------------------------

// Gypsy Girl Mosaic (Çingene Kızı) Preservation Widget
function GypsyGirlWidget() {
  const [restorationLevel, setRestorationLevel] = useState(65)
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setRestorationLevel(98)
    }, 2000)
  }

  return (
    <div className="h-full w-full bg-linear-to-br from-[#1c1510] to-[#0e0a08] text-amber-100 p-4 flex flex-col justify-between select-none relative overflow-hidden group">
      {/* Decorative Ancient Arch Outline */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-amber-500/5 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center z-10">
        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5" />
          Gypsy Girl Room
        </span>
        <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
          RESTORED {restorationLevel}%
        </span>
      </div>

      {/* Mosaic Frame */}
      <div className="flex-1 flex flex-col items-center justify-center my-3 relative min-h-0">
        <div className="relative aspect-square h-[90%] max-h-[140px] rounded-xl overflow-hidden border border-amber-500/20 shadow-2xl bg-zinc-950">
          <img
            src="/images/zeugma-1.png"
            alt="Gypsy Girl"
            className="w-full h-full object-cover transition-all duration-700"
            style={{
              filter: `contrast(${restorationLevel}%) brightness(${85 + restorationLevel * 0.15}%)`,
            }}
          />
          {isScanning && (
            <div
              className="absolute inset-x-0 h-0.5 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-bounce top-0"
              style={{ animationDuration: '2s' }}
            />
          )}
        </div>
      </div>

      {/* Restoration Controls */}
      <div className="flex flex-col gap-2 z-10 drag-cancel">
        <div className="flex items-center justify-between text-[10px] text-amber-200/70">
          <span>Contrast Alignment</span>
          <span className="font-mono">{restorationLevel}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="150"
          value={restorationLevel}
          onChange={(e) => setRestorationLevel(Number(e.target.value))}
          className="w-full h-1 bg-amber-950 rounded-full outline-none accent-amber-500 cursor-pointer border-none"
        />
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="mt-1.5 py-1 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-955 text-stone-955 text-[10px] font-bold rounded-lg transition-colors cursor-pointer border-none"
        >
          {isScanning ? 'Restoration Laser Active...' : 'Run Laser Cleaning Scan'}
        </button>
      </div>
    </div>
  )
}

// Live Excavation Sector Map Widget
function ExcavationWidget() {
  const [activeSector, setActiveSector] = useState('Sector B')

  return (
    <div className="h-full w-full bg-linear-to-br from-[#0c0d10] to-[#06070a] text-zinc-300 p-4 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          Excavation Grid
        </span>
        <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
          LIVE TELEMETRY
        </span>
      </div>

      <div className="my-2 flex justify-between items-start">
        <div className="text-left">
          <div className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-1">
            8.42 <span className="text-[10px] font-semibold text-zinc-400 font-sans">m Depth</span>
          </div>
          <div className="text-[8px] text-zinc-500 uppercase font-semibold mt-0.5 tracking-wider flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" /> Belkıs Village, Sector B
          </div>
        </div>

        {/* Sector Selector */}
        <div className="flex gap-1 drag-cancel">
          {['Sec A', 'Sec B', 'Sec C'].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSector(sec.replace('Sec', 'Sector'))}
              className={`text-[8px] px-1.5 py-0.5 rounded font-bold border-none transition-all cursor-pointer ${
                activeSector === sec.replace('Sec', 'Sector')
                  ? 'bg-emerald-500 text-stone-955'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Scanner Mock */}
      <div className="flex-1 min-h-[40px] border border-zinc-800/80 rounded-lg p-1.5 relative overflow-hidden bg-[#07080a] flex flex-col justify-between">
        <div className="grid grid-cols-6 gap-0.5 h-full opacity-60">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xs transition-colors duration-500 ${
                i % 4 === 0 && activeSector === 'Sector B'
                  ? 'bg-emerald-500/30'
                  : i % 5 === 0 && activeSector === 'Sector A'
                    ? 'bg-amber-500/30'
                    : i % 3 === 0 && activeSector === 'Sector C'
                      ? 'bg-indigo-500/30'
                      : 'bg-zinc-900/40'
              }`}
            />
          ))}
        </div>
        <div className="absolute bottom-1 right-2 text-[8px] font-mono text-zinc-500">
          COORD: 37°03'34"N, 37°51'57"E
        </div>
      </div>

      <div className="flex justify-between items-center text-[9px] text-zinc-500 border-t border-zinc-900/60 pt-2 mt-2">
        <span>
          SOIL HUMIDITY: <span className="text-emerald-400 font-bold">14.2%</span>
        </span>
        <span>
          TEMP: <span className="text-zinc-300 font-mono">24.5°C</span>
        </span>
      </div>
    </div>
  )
}

// Statue of Mars Telemetry Widget
function MarsWidget() {
  const [showAlloys, setShowAlloys] = useState(false)

  return (
    <div className="h-full w-full bg-linear-to-br from-[#1a1210] to-[#0c0807] text-orange-100 p-4 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Statue of Mars
        </span>
        <span className="text-[8px] font-mono text-zinc-500">2nd Cent. AD</span>
      </div>

      <div className="my-2 flex gap-3 items-center">
        <div className="w-9 h-9 rounded-lg bg-orange-950/40 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-left min-w-0">
          <div className="text-xs font-bold text-white truncate">Bronze Roman Sculpture</div>
          <p className="text-[9px] text-orange-300/60 mt-0.5 uppercase tracking-wide font-medium">
            Poseidon Villa excavations
          </p>
        </div>
      </div>

      {/* Progress Alloy Gauges */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center py-1">
        <div className="flex flex-col gap-0.5 text-left">
          <div className="flex justify-between text-[8px] font-medium text-orange-200/70">
            <span>COPPER COMPOSITION</span>
            <span className="font-mono text-orange-300">82%</span>
          </div>
          <div className="h-1 w-full bg-orange-955 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 text-left">
          <div className="flex justify-between text-[8px] font-medium text-orange-200/70">
            <span>TIN / LEAD ALLOY</span>
            <span className="font-mono text-orange-300">18%</span>
          </div>
          <div className="h-1 w-full bg-orange-955 rounded-full overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full" style={{ width: '18%' }} />
          </div>
        </div>
      </div>

      <div className="text-[9px] text-zinc-500 border-t border-zinc-900/60 pt-2 mt-2 flex justify-between items-center drag-cancel">
        <span>
          WEIGHT: <span className="text-orange-400 font-bold font-mono">112kg</span>
        </span>
        <button
          onClick={() => setShowAlloys(!showAlloys)}
          className="text-[8px] text-orange-400 hover:text-orange-300 transition-colors font-bold border-none bg-transparent uppercase cursor-pointer"
        >
          {showAlloys ? 'Hide Log' : 'More Specs'}
        </button>
      </div>
    </div>
  )
}

// Euphrates River Level Hydrology Widget
function EuphratesWidget() {
  return (
    <div className="h-full w-full bg-linear-to-br from-[#0c161d] to-[#060b0f] text-cyan-100 p-4 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5" />
          Euphrates Water Level
        </span>
        <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-bold">
          STABLE
        </span>
      </div>

      <div className="my-2 text-left">
        <div className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
          324.8 <span className="text-[10px] font-semibold text-zinc-400 font-sans">m ASL</span>
        </div>
        <p className="text-[8px] text-zinc-500 uppercase mt-0.5 tracking-wider font-semibold">
          Birecik Dam Hydro-tide
        </p>
      </div>

      {/* SVG Wave chart */}
      <div className="flex-1 min-h-[40px] relative w-full flex items-end">
        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d="M 0 20 Q 20 12 40 22 T 80 15 T 100 20 L 100 30 L 0 30 Z"
            fill="rgba(6, 182, 212, 0.08)"
          />
          <path
            d="M 0 20 Q 20 12 40 22 T 80 15 T 100 20"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex justify-between items-center text-[9px] text-zinc-500 border-t border-zinc-900/60 pt-2 mt-2">
        <span>
          FLOW RATE: <span className="text-cyan-400 font-bold font-mono">245 m³/s</span>
        </span>
        <span>
          FLOOD WATCH: <span className="text-cyan-400 font-bold">NONE</span>
        </span>
      </div>
    </div>
  )
}

// Conservation Log / Scroll Widget
function ConservationWidget() {
  return (
    <div className="h-full w-full bg-linear-to-br from-[#1a1712] to-[#0d0c09] text-amber-200/80 p-4 flex flex-col justify-between select-none">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-1.5">
          <Scroll className="w-3.5 h-3.5" />
          Conservation Log
        </span>
        <span className="text-[8px] text-zinc-500">Museum Lab A</span>
      </div>

      <div className="flex-1 my-2 overflow-y-auto scrollbar-thin text-left space-y-2 max-h-[100px] pr-1">
        <div className="border-l border-amber-500/30 pl-2 text-[9px]">
          <span className="text-amber-500 font-bold block">10:14 AM</span>
          Cleaned calcareous sediment layer from the Oceanos mosaic tesserae.
        </div>
        <div className="border-l border-amber-500/30 pl-2 text-[9px]">
          <span className="text-amber-500 font-bold block">Yesterday</span>
          Laser alignment scan complete for the Savaş Tanrısı Mars Bronze statue.
        </div>
        <div className="border-l border-amber-500/30 pl-2 text-[9px]">
          <span className="text-amber-500 font-bold block">2 days ago</span>
          Began humidity stabilizer check in Hall B conservation dome.
        </div>
      </div>

      <div className="text-[8px] text-zinc-500 border-t border-zinc-900/60 pt-2 mt-1 flex justify-between items-center">
        <span>
          ACTIVE STAFF: <span className="text-amber-400 font-semibold">3 Conservators</span>
        </span>
      </div>
    </div>
  )
}
interface BentoPuzzleProps {
  onSuccess?: () => void
}

export function BentoPuzzle({ onSuccess }: BentoPuzzleProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)

  const zeugma = useZeugma({
    initialLayout: {
      type: 'pane',
      id: 'pane-gypsy',
      tabs: ['gypsy-girl'],
      activeTabId: 'gypsy-girl',
    },
    dragActivationDistance: 6,
    onChange: (newLayout) => {
      // Check if the user built the correct bento layout
      const matched = checkBentoLayoutMatch(newLayout)
      if (matched && !isSuccess) {
        setIsSuccess(true)
        setShowFireworks(true)
        onSuccess?.()
      }
    },
  })

  // Memoize present tabs to disable palette buttons
  const presentTabs = useMemo(() => {
    const tabs = new Set<string>()
    function traverse(node: TreeNode | null) {
      if (!node) return
      if (node.type === 'pane') {
        node.tabs.forEach((t) => tabs.add(t))
      } else {
        traverse(node.first)
        traverse(node.second)
      }
    }
    traverse(zeugma.layout)
    return tabs
  }, [zeugma.layout])

  const handleReset = () => {
    zeugma.setLayout({
      type: 'pane',
      id: 'pane-gypsy',
      tabs: ['gypsy-girl'],
      activeTabId: 'gypsy-girl',
    })
    setIsSuccess(false)
    setShowFireworks(false)
  }

  const handleAddWidget = useCallback(
    (tabId: string) => {
      if (presentTabs.has(tabId) || isSuccess) return

      // Find the first pane in the layout tree to merge into
      let firstPaneId = ''
      function findFirstPane(node: TreeNode | null) {
        if (!node || firstPaneId) return
        if (node.type === 'pane') {
          firstPaneId = node.id
        } else {
          findFirstPane(node.first)
          findFirstPane(node.second)
        }
      }
      findFirstPane(zeugma.layout)

      if (firstPaneId) {
        zeugma.mergeTab(tabId, firstPaneId)
      } else {
        zeugma.addPane(tabId)
      }
    },
    [zeugma, presentTabs, isSuccess],
  )

  const renderWidget = useCallback(
    (tabId: string) => {
      if (tabId === 'gypsy-girl') {
        return <GypsyGirlWidget />
      }
      if (tabId === 'excavation-map') {
        return <ExcavationWidget />
      }
      if (tabId === 'mars-statue') {
        return <MarsWidget />
      }
      if (tabId === 'euphrates-tide') {
        return <EuphratesWidget />
      }
      if (tabId === 'conservation-log') {
        return <ConservationWidget />
      }
      return (
        <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-500 font-mono text-xs">
          {tabId}
        </div>
      )
    },
    [isSuccess],
  )

  const renderPane = useCallback((paneId: string) => {
    return (
      <Pane id={paneId}>
        {(paneProps: PaneRenderProps) => (
          <div className="h-full w-full bg-bg-pane flex flex-col relative overflow-hidden group border border-border-primary rounded-xl shadow-md transition-all duration-200">
            {/* Header Drag Handle bar */}
            <div className="flex items-center bg-bg-sidebar border-b border-border-primary h-8 select-none">
              {/* Tabs list */}
              <div className="flex items-center overflow-x-auto scrollbar-none min-w-0 h-full shrink">
                {paneProps.tabs.map((tabId) => {
                  const isActive = paneProps.activeTabId === tabId
                  let title = 'Widget'
                  let icon = <Shield className="w-3 h-3 text-zinc-500" />

                  if (tabId === 'gypsy-girl') {
                    title = 'Gypsy Girl'
                    icon = <Crown className="w-3 h-3 text-amber-400" />
                  } else if (tabId === 'excavation-map') {
                    title = 'Excavation Grid'
                    icon = <Compass className="w-3 h-3 text-emerald-400" />
                  } else if (tabId === 'mars-statue') {
                    title = 'Mars Statue'
                    icon = <Shield className="w-3 h-3 text-orange-400" />
                  } else if (tabId === 'euphrates-tide') {
                    title = 'Euphrates Level'
                    icon = <Waves className="w-3 h-3 text-cyan-400" />
                  } else if (tabId === 'conservation-log') {
                    title = 'Conservation Log'
                    icon = <Scroll className="w-3 h-3 text-amber-500" />
                  }

                  return (
                    <Tab key={tabId} id={tabId} className="h-full flex" style={{ display: 'flex' }}>
                      {({ isDragging, isOver }) => (
                        <div
                          onClick={() => paneProps.selectTab(tabId)}
                          className={`px-3 flex items-center gap-1.5 border-b-2 font-medium text-[9px] transition-all relative cursor-pointer select-none h-full truncate ${
                            isActive
                              ? 'bg-bg-pane text-text-primary border-b-amber-500'
                              : 'bg-bg-sidebar/50 text-text-muted hover:text-text-secondary hover:bg-bg-sidebar/80 border-b-transparent'
                          } ${isOver ? 'bg-amber-500/10 border-l border-l-amber-500 animate-pulse' : ''} ${
                            isDragging ? 'opacity-40' : ''
                          }`}
                        >
                          {icon}
                          <span className="truncate uppercase font-bold tracking-wider">
                            {title}
                          </span>
                        </div>
                      )}
                    </Tab>
                  )
                })}
              </div>

              {/* Empty area is drag handle for the pane */}
              <DragHandle className="flex-1 h-full cursor-grab active:cursor-grabbing self-stretch min-w-[20px]" />
            </div>
            {/* Widget content */}
            <div className="flex-1 overflow-auto bg-[#0a0a0d]">{paneProps.renderActiveTab()}</div>
          </div>
        )}
      </Pane>
    )
  }, [])

  const renderDragOverlay = useCallback((id: string, _type: 'pane' | 'tab') => {
    let title = 'Widget'
    let icon = <Shield className="w-4 h-4" />
    let colorClass = 'border-amber-500/30 text-amber-400 bg-amber-500/10'

    if (id === 'gypsy-girl') {
      title = 'Gypsy Girl'
      icon = <Crown className="w-4 h-4" />
      colorClass = 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    } else if (id === 'excavation-map') {
      title = 'Excavation Grid'
      icon = <Compass className="w-4 h-4" />
      colorClass = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 animate-pulse'
    } else if (id === 'mars-statue') {
      title = 'Mars Statue'
      icon = <Shield className="w-4 h-4" />
      colorClass = 'border-orange-500/30 text-orange-400 bg-orange-500/10 animate-pulse'
    } else if (id === 'euphrates-tide') {
      title = 'Euphrates Level'
      icon = <Waves className="w-4 h-4" />
      colorClass = 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 animate-pulse'
    } else if (id === 'conservation-log') {
      title = 'Conservation Log'
      icon = <Scroll className="w-4 h-4" />
      colorClass = 'border-amber-500/30 text-amber-400 bg-amber-500/10 animate-pulse'
    }

    return (
      <div
        className={`px-3.5 py-2 border rounded-xl shadow-2xl flex items-center gap-2.5 bg-bg-sidebar/95 backdrop-blur-md pointer-events-none select-none text-text-primary ${colorClass}`}
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-wider font-bold">{title}</span>
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
              'bg-amber-500/10 border-2 border-dashed border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.15)] rounded-xl transition-all duration-200',
            resizer:
              'zeugma-mosaic-resizer bg-transparent hover:bg-amber-500/15 active:bg-amber-500/25 transition-colors duration-150 z-50',
          }}
        >
          {/* Control Sidebar / Instructions */}
          <div className="w-full lg:w-[320px] bg-bg-sidebar border border-border-primary rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Glow */}
            <div className="absolute -left-12 -top-12 w-36 h-36 bg-amber-500/5 blur-2xl rounded-full" />

            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C29B47] mb-2">
                Zeugma Gaziantep Museum
              </div>

              <h3 className="text-xl font-extrabold text-text-primary tracking-tight mb-3">
                Ancient Bento Builder
              </h3>

              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Restore the layout of the Zeugma Mosaic Museum. Click archaeological cards in the
                palette to insert them as tabs, and drag-split them to reconstruct the target
                gallery configuration.
              </p>

              {/* Target Blueprint Miniature */}
              <div className="mb-6">
                <div className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2.5">
                  Target Gallery Blueprint
                </div>

                <div className="w-full aspect-4/3 bg-bg-app border border-border-primary rounded-xl p-2.5 flex gap-2">
                  {/* Target layout structure visual: Row splits */}
                  <div className="flex-1 bg-linear-to-br from-[#1c1510] to-[#0e0a08] rounded-lg border border-amber-500/10 flex flex-col items-center justify-center p-1 text-center select-none">
                    <Crown className="w-6 h-6 text-amber-500/40 mb-1" />
                    <span className="text-[7px] text-amber-500/60 uppercase font-bold tracking-wider">
                      Gypsy Girl
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex-1 bg-linear-to-br from-[#0c0d10] to-[#06070a] rounded-lg border border-emerald-500/10 flex flex-col items-center justify-center p-1 text-center select-none">
                      <Compass className="w-4 h-4 text-emerald-500/40 mb-0.5" />
                      <span className="text-[7px] text-emerald-500/60 uppercase font-bold tracking-wider">
                        Excavation
                      </span>
                    </div>
                    <div className="flex-1 bg-linear-to-br from-[#1a1210] to-[#0c0807] rounded-lg border border-orange-500/10 flex flex-col items-center justify-center p-1 text-center select-none">
                      <Shield className="w-4 h-4 text-orange-500/40 mb-0.5" />
                      <span className="text-[7px] text-orange-500/60 uppercase font-bold tracking-wider">
                        Mars Statue
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Palette Items */}
              <div className="flex flex-col gap-3">
                <div className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-0.5">
                  Museum Artifact Palette
                </div>

                <PaletteCard
                  id="excavation-map"
                  title="Excavation Grid"
                  desc="Belkıs Sector B telemetry grid"
                  icon={<Compass className="w-4 h-4" />}
                  disabled={presentTabs.has('excavation-map') || isSuccess}
                  onClick={() => handleAddWidget('excavation-map')}
                />

                <PaletteCard
                  id="mars-statue"
                  title="Mars Statue"
                  desc="Bronze sculpture alloy analysis"
                  icon={<Shield className="w-4 h-4" />}
                  disabled={presentTabs.has('mars-statue') || isSuccess}
                  onClick={() => handleAddWidget('mars-statue')}
                />

                <PaletteCard
                  id="euphrates-tide"
                  title="Euphrates Level"
                  desc="Birecik Dam hydro level gauge"
                  icon={<Waves className="w-4 h-4" />}
                  disabled={presentTabs.has('euphrates-tide') || isSuccess}
                  onClick={() => handleAddWidget('euphrates-tide')}
                />

                <PaletteCard
                  id="conservation-log"
                  title="Conservation Log"
                  desc="Museum lab notes & records"
                  icon={<Scroll className="w-4 h-4" />}
                  disabled={presentTabs.has('conservation-log') || isSuccess}
                  onClick={() => handleAddWidget('conservation-log')}
                />
              </div>
            </div>

            {/* Action Controls */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-bg-pane border border-border-primary hover:border-border-secondary text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Board
              </button>
            </div>
          </div>

          {/* Main Workspace Frame */}
          <div className="flex-1 flex flex-col min-h-[420px] relative">
            {isSuccess && (
              <div className="absolute inset-0 bg-[#0a0a0d]/70 backdrop-blur-md rounded-2xl z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-500 border border-emerald-500/30">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    Layout Succeeded!
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    You successfully assembled the target Bento Grid dashboard split tree.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-extrabold shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            )}

            <div
              className={`flex-1 w-full aspect-4/3 min-h-[420px] rounded-2xl border border-border-primary bg-bg-pane shadow-lg p-2 transition-all duration-300 relative overflow-hidden ${
                isSuccess ? 'success-glowing-border' : ''
              }`}
            >
              <PaneTree />
            </div>
          </div>
        </Zeugma>
      )}

      <Fireworks
        active={showFireworks}
        duration={5000}
        onComplete={() => setShowFireworks(false)}
      />
    </div>
  )
}
