import React, { createContext } from 'react'
import { PaneRenderProps } from './types'

export interface DragListenersCtxValue extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
}

export const DragListenersCtx = createContext<DragListenersCtxValue | null>(null)
export const PaneContext = createContext<PaneRenderProps | null>(null)
