import React from 'react'
import { RenderCounterFooter } from 'react-zeugma/devtools'

interface TabContentWrapperProps {
  tabId: string
  children: React.ReactNode
}

export function TabContentWrapper({ tabId, children }: TabContentWrapperProps) {
  return (
    <RenderCounterFooter id={`content-${tabId}`} label={`View: ${tabId}`}>
      {children}
    </RenderCounterFooter>
  )
}
