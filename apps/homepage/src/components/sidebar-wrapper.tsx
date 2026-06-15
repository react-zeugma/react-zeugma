'use client'

import React, { useState } from 'react'
import { useZeugmaContext } from 'react-zeugma'
import { SidebarLayout, SidebarContent, PRESETS, type LogEntry } from './demo-sidebar'

export { type LogEntry }

interface SidebarWrapperProps {
  children: React.ReactNode
  snapThreshold: number
  onSnapThresholdChange: (val: number) => void
  minSplitPercentage: number
  onMinSplitPercentageChange: (val: number) => void
  maxSplitPercentage: number
  onMaxSplitPercentageChange: (val: number) => void
  resizableHeight: boolean
  onResizableHeightChange: (val: boolean) => void
  layoutLocked: boolean
  onLayoutLockedChange: (val: boolean) => void
  logs: LogEntry[]
  onPresetChange?: (presetKey: string) => void
  contentRef?: React.RefObject<HTMLDivElement | null>
}

export function SidebarWrapper({
  children,
  snapThreshold,
  onSnapThresholdChange,
  minSplitPercentage,
  onMinSplitPercentageChange,
  maxSplitPercentage,
  onMaxSplitPercentageChange,
  resizableHeight,
  onResizableHeightChange,
  layoutLocked,
  onLayoutLockedChange,
  logs,
  onPresetChange,
  contentRef,
}: SidebarWrapperProps) {
  const { layout, onLayoutChange, addPane } = useZeugmaContext()
  const [activePreset, setActivePreset] = useState<string>('default')

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey)
    onLayoutChange(PRESETS[presetKey].layout)
    onPresetChange?.(presetKey)
    if (presetKey === 'tall-stress') {
      onResizableHeightChange(true)
    }
  }

  const handleReset = () => {
    const targetPreset = PRESETS[activePreset] ? activePreset : 'default'
    onLayoutChange(PRESETS[targetPreset].layout)
    onPresetChange?.(targetPreset)
  }

  const handleAddRandomWidget = () => {
    const randomId = `random-${Math.floor(100 + Math.random() * 900)}`
    addPane(randomId)
  }

  return (
    <SidebarLayout
      contentRef={contentRef}
      resizableHeight={resizableHeight}
      sidebar={
        <SidebarContent
          layout={layout}
          activePreset={activePreset}
          onApplyPreset={handleApplyPreset}
          onAddRandomWidget={handleAddRandomWidget}
          onReset={handleReset}
          snapThreshold={snapThreshold}
          onSnapThresholdChange={onSnapThresholdChange}
          minSplitPercentage={minSplitPercentage}
          onMinSplitPercentageChange={onMinSplitPercentageChange}
          maxSplitPercentage={maxSplitPercentage}
          onMaxSplitPercentageChange={onMaxSplitPercentageChange}
          layoutLocked={layoutLocked}
          onLayoutLockedChange={onLayoutLockedChange}
          resizableHeight={resizableHeight}
          onResizableHeightChange={onResizableHeightChange}
          logs={logs}
        />
      }
    >
      {children}
    </SidebarLayout>
  )
}
