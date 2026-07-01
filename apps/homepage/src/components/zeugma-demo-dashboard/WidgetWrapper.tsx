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
        <span className="truncate max-w-[120px] text-[#ccccdc] font-semibold">
          {tabId.startsWith('empty-widget') ? 'empty-panel' : tabId}
        </span>
        <div className="flex items-center gap-3">
          <span>
            Mounts: <span className="text-[#ccccdc] font-semibold">{mounts}</span>
          </span>
          <span className="opacity-20">|</span>
          <span>
            Renders: <span className="text-[#ccccdc] font-semibold">{renders}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
