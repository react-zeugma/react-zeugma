import React from 'react'
import { RenderCounterFooter } from 'react-zeugma/devtools'

interface TabContentWrapperProps {
  tabId: string
  children: React.ReactNode
}

export function TabContentWrapper({ tabId, children }: TabContentWrapperProps) {
  return (
    <RenderCounterFooter
      id={`content-${tabId}`}
      label={`View: ${tabId}`}
      className="h-full w-full flex flex-col overflow-hidden min-h-0"
      footerClassName="grafana-widget-footer"
    >
      {children}
    </RenderCounterFooter>
  )
}
