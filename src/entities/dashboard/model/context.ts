import { createContext, ReactNode } from 'react'
import { TreeNode } from '../../../shared/model'

export interface ZeugmaClassNames {
  pane?: string
  dropPreview?: string
  swapPreview?: string
  dragOverlay?: string
  resizer?: string
}

export interface DashboardContextValue {
  layout: TreeNode | null
  onLayoutChange: (newLayout: TreeNode | null) => void
  renderPane: (paneId: string) => ReactNode
  activeId: string | null
  fullscreenPaneId: string | null
  classNames: ZeugmaClassNames
  onRemove?: (paneId: string) => void
  onFullscreenChange?: (paneId: string | null) => void
  snapThreshold?: number
}

export const DashboardContext = createContext<DashboardContextValue | undefined>(undefined)
