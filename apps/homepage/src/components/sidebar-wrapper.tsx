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
  layoutLocked: boolean
  onLayoutLockedChange: (val: boolean) => void
  resizableHeight: boolean
  onResizableHeightChange: (val: boolean) => void
  logs: LogEntry[]
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
  layoutLocked,
  onLayoutLockedChange,
  resizableHeight,
  onResizableHeightChange,
  logs,
  contentRef,
}: SidebarWrapperProps) {
  const { layout, setLayout, addPane } = useZeugmaContext()
  const [activePreset, setActivePreset] = useState<string>('default')

  const handleApplyPreset = (presetKey: string) => {
    setActivePreset(presetKey)
    setLayout(PRESETS[presetKey].layout)
  }

  const handleReset = () => {
    const targetPreset = PRESETS[activePreset] ? activePreset : 'default'
    setLayout(PRESETS[targetPreset].layout)
  }

  const handleAddRandomWidget = () => {
    const randomNum = Math.floor(100 + Math.random() * 900)
    const randomId = `random-${randomNum}`
    const colors = ['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    addPane(randomId, {
      title: `Widget #${randomNum}`,
      color: randomColor,
      notes: 'Dynamically added pane.',
    })
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
