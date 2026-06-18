import React from 'react'
import { useRenderCounter } from './hooks'

interface TabContentWrapperProps {
  tabId: string
  children: React.ReactNode
}

export function TabContentWrapper({ tabId, children }: TabContentWrapperProps) {
  const { mounts, renders } = useRenderCounter(`content-${tabId}`)

  return (
    <div className="h-full w-full flex flex-col overflow-hidden min-h-0">
      <div className="flex-1 overflow-hidden relative min-h-0">{children}</div>
      <div className="bg-[#252526] border-t border-[#2d2d30] px-3 py-1.5 flex items-center justify-between text-[10px] text-[#858585] font-mono shrink-0 select-none">
        <span className="truncate max-w-[150px] text-zinc-400 font-medium">View: {tabId}</span>
        <div className="flex items-center gap-3">
          <span>
            Mounts: <span className="text-emerald-400 font-bold">{mounts}</span>
          </span>
          <span className="opacity-30">|</span>
          <span>
            Renders: <span className="text-indigo-400 font-bold">{renders}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
