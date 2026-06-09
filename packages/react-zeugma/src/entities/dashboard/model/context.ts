import { createContext, ReactNode } from 'react'
import { TreeNode, SplitDirection, SplitNode } from '../../../shared/model'

export interface ZeugmaClassNames {
  pane?: string
  dropPreview?: string
  swapPreview?: string
  dragOverlay?: string
  resizer?: string
  dismissPreview?: string
}

export interface ResizerRenderProps {
  direction: SplitDirection
  splitPercentage: number
  resizerSize: number
  isResizing: boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
}

/**
 * State context — holds reactive values that change during runtime.
 * All consumers of this context will re-render when any of these values change.
 */
export interface DashboardStateValue {
  layout: TreeNode | null
  onLayoutChange: (newLayout: TreeNode | null) => void
  renderPane: (paneId: string) => ReactNode
  activeId: string | null
  dismissIntentId: string | null
  setContainerRef: (element: HTMLElement | null) => void
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
}

/**
 * Actions context — holds stable dispatch functions with permanent identity.
 * Consumers of only this context will never re-render from layout/drag state changes.
 */
export interface DashboardActionsValue {
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
  updatePaneMetadata: (
    paneId: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
}
export const DashboardStateContext = createContext<DashboardStateValue | undefined>(undefined)
export const DashboardActionsContext = createContext<DashboardActionsValue | undefined>(undefined)
