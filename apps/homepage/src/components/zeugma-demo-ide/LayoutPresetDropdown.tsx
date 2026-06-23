import { useState, useRef, useEffect } from 'react'
import { LayoutGrid, ChevronDown } from 'lucide-react'
import { LAYOUT_PRESETS } from '../mock-files'

interface LayoutPresetDropdownProps {
  activePreset: string
  onSelectPreset: (presetKey: string) => void
  disabled?: boolean
}

export function LayoutPresetDropdown({
  activePreset,
  onSelectPreset,
  disabled = false,
}: LayoutPresetDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (presetKey: string) => {
    onSelectPreset(presetKey)
    setIsOpen(false)
  }

  const activeLabel = LAYOUT_PRESETS.find((p) => p.key === activePreset)?.label ?? 'Layout'

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-1 transition-colors ${
          disabled
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:text-white cursor-pointer text-white/80'
        }`}
        title={disabled ? 'Unlock layout to change preset' : 'Switch Layout Preset'}
      >
        <LayoutGrid className="w-3 h-3 text-white" />
        <span>{activeLabel}</span>
        <ChevronDown className="w-2.5 h-2.5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-1 right-0 bg-[#252526] border border-[#3a3a3a] rounded-md shadow-2xl py-1 min-w-[180px] z-50">
          {LAYOUT_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => handleSelect(preset.key)}
              className={`w-full text-left px-3 py-1.5 text-[11px] font-mono flex items-center gap-2 transition-colors ${
                activePreset === preset.key
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-zinc-400 hover:bg-[#2d2d2d] hover:text-white'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: activePreset === preset.key ? '#818cf8' : 'transparent',
                }}
              />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
