import React from 'react'
import { useRenderCounter } from '../zeugma-demo-ide/hooks'

interface WidgetWrapperProps {
  tabId: string
  children: React.ReactNode
}

export function WidgetWrapper({ tabId, children }: WidgetWrapperProps) {
  const { mounts, renders } = useRenderCounter(`dashboard-${tabId}`)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 overflow-hidden relative min-h-0">{children}</div>
      <div className="grafana-widget-footer">
        <span className="truncate max-w-[120px] text-[#5794F2] font-medium">{tabId}</span>
        <div className="flex items-center gap-3">
          <span>
            Mounts: <span className="text-[#73BF69] font-bold">{mounts}</span>
          </span>
          <span className="opacity-20">|</span>
          <span>
            Renders: <span className="text-[#5794F2] font-bold">{renders}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
