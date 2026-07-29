import React from 'react'
import { RenderCounterFooter } from 'react-zeugma/devtools'

interface WidgetWrapperProps {
  tabId: string
  children: React.ReactNode
}

export function WidgetWrapper({ tabId, children }: WidgetWrapperProps) {
  const displayLabel = tabId.startsWith('empty-widget') ? 'empty-panel' : tabId

  return (
    <RenderCounterFooter
      id={`dashboard-${tabId}`}
      label={displayLabel}
      className="h-full w-full flex flex-col overflow-hidden min-h-0"
      footerClassName="grafana-widget-footer"
    >
      {children}
    </RenderCounterFooter>
  )
}
