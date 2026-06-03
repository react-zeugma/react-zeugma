import { createContext, ReactNode } from 'react'
import { TreeNode, SplitDirection, SplitNode } from '../../../shared/model'

export interface ZeugmaClassNames {
  pane?: string
  dropPreview?: string
  swapPreview?: string
  dragOverlay?: string
  resizer?: string
}

export interface ResizerRenderProps {
  direction: SplitDirection
  splitPercentage: number
  resizerSize: number
  isResizing: boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
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
  onResizeStart?: (currentNode: SplitNode) => void
  onResize?: (currentNode: SplitNode, percentage: number) => void
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  renderResizer?: (props: ResizerRenderProps) => ReactNode
  minSplitPercentage?: number
  maxSplitPercentage?: number
  removePane: (paneId: string) => void
  addPane: (paneId: string) => void
  swapPanes: (paneIdA: string, paneIdB: string) => void
  splitPane: (
    targetId: string,
    direction: SplitDirection,
    splitType: 'left' | 'right' | 'top' | 'bottom',
    paneToAdd: string,
  ) => void
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void
}

export const DashboardContext = createContext<DashboardContextValue | undefined>(undefined)
