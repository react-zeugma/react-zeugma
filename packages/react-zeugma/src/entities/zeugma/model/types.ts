import { ReactNode } from 'react'
import { TreeNode, SplitDirection, SplitNode } from '../../../shared/model'

export interface ZeugmaClassNames {
  /** CSS class applied to the outer container div of each `<Pane>`. */
  pane?: string
  /** CSS class applied to drop zone indicators when hovering over layout edges to split a pane. */
  dropPreview?: string
  /** CSS class applied to the drop zone indicator when hovering over the center of a pane to swap. */
  swapPreview?: string
  /** CSS class applied to the custom cursor-following drag preview portal wrapper. */
  dragOverlay?: string
  /** CSS class applied to the drag-to-resize split bar handles. */
  resizer?: string
  /** CSS class applied to the background dismiss zone indicator during a drag-out dismiss gesture. */
  dismissPreview?: string
}

export interface ZeugmaProps {
  /** The layout tree model (TreeNode) defining pane organization and split percentages. Set to null for empty layout. */
  layout: TreeNode | null
  /** Callback triggered when the layout changes via drag-and-drop actions, splits, swaps, or resizes. */
  onChange: (newLayout: TreeNode | null) => void
  /** Render function mapping unique pane IDs to React elements. Usually renders a <Pane> wrapper. */
  renderPane: (paneId: string) => ReactNode
  /** Custom overlay renderer function used to customize the cursor-following drag preview for an active pane. */
  renderDragOverlay?: (activeId: string) => ReactNode
  /** Optional CSS class name mapping overrides for custom styles of components like panes, drop/swap previews, overlays, etc. */
  classNames?: ZeugmaClassNames
  /** The ID of the pane that is currently taking up the full dashboard area. Null if no pane is fullscreen. */
  fullscreenPaneId?: string | null
  /** Callback triggered when a pane is toggled to/from fullscreen mode. Passes the active fullscreen paneId or null. */
  onFullscreenChange?: (paneId: string | null) => void
  /** Callback triggered when a pane is removed from the dashboard layout tree. */
  onRemove?: (paneId: string) => void
  /** Minimum pixel distance that a user must drag a pane handle before dragging triggers. Defaults to 8. */
  dragActivationDistance?: number
  /** Threshold value in pixels for snapping layout resizing handles to adjacent edges. Defaults to 8. */
  snapThreshold?: number
  /** Callback triggered when dragging starts for a pane. */
  onDragStart?: (activeId: string) => void
  /** Callback triggered when dragging ends, providing details on target pane and drop action (split or swap). */
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'swap'
      direction?: SplitDirection
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
  /** Callback triggered when the user starts dragging a resizing handle between split panes. */
  onResizeStart?: (currentNode: SplitNode) => void
  /** Callback triggered continuously while the user is dragging a resizing handle. Passes the new split percentage. */
  onResize?: (currentNode: SplitNode, percentage: number) => void
  /** Callback triggered when the user stops dragging a resizing handle. Passes the final split percentage. */
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  /** Minimum split percentage allowed when resizing split panes. Defaults to 5. */
  minSplitPercentage?: number
  /** Maximum split percentage allowed when resizing split panes. Defaults to 95. */
  maxSplitPercentage?: number
  /** Whether dragging a pane far enough outside the container triggers a drag-out/dismiss action. Defaults to false. */
  enableDragToDismiss?: boolean
  /** The threshold in pixels beyond the container boundaries required to activate the drag-out/dismiss action. */
  dismissThreshold?: number
  /** Callback triggered when the drag-out/dismiss intent changes (active pane ID or null when drag returns inside bounds). */
  onDismissIntentChange?: (paneId: string | null) => void
  /** Child nodes nested inside the Zeugma context, usually containing a <PaneTree> or similar layout viewer. */
  children: ReactNode
}

/**
 * State context — holds reactive values that change during runtime.
 * All consumers of this context will re-render when any of these values change.
 */
export interface ZeugmaStateValue {
  /** The current active layout tree structure, or null if empty. */
  layout: TreeNode | null
  /** Callback to update the layout tree. */
  onLayoutChange: (newLayout: TreeNode | null, localOnly?: boolean) => void
  /** Renders the inner content of a pane given its unique ID. */
  renderPane: (paneId: string) => ReactNode
  /** The ID of the pane currently being dragged, or null. */
  activeId: string | null
  /** The ID of the pane currently targeted for dismiss/drag-out, or null. */
  dismissIntentId: string | null
  /** Ref setter to measure and track the dashboard root container element. */
  setContainerRef: (element: HTMLElement | null) => void
  /** The ID of the pane currently zoomed to fullscreen, or null. */
  fullscreenPaneId: string | null
  /** Normalized or overridden CSS classes for custom layout styling. */
  classNames: ZeugmaClassNames
  /** Callback triggered when a pane is closed/removed from the dashboard. */
  onRemove?: (paneId: string) => void
  /** Callback triggered to toggle fullscreen status for a pane. */
  onFullscreenChange?: (paneId: string | null) => void
  /** Threshold in pixels to snap layout resizers to adjacent edges. */
  snapThreshold?: number
  /** Callback triggered when a split pane starts being resized. */
  onResizeStart?: (currentNode: SplitNode) => void
  /** Callback triggered continuously during a split pane resize. */
  onResize?: (currentNode: SplitNode, percentage: number) => void
  /** Callback triggered when a split pane resize action is completed. */
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  /** Minimum split percentage allowed when resizing. */
  minSplitPercentage?: number
  /** Maximum split percentage allowed when resizing. */
  maxSplitPercentage?: number
}

/**
 * Actions context — holds stable dispatch functions with permanent identity.
 * Consumers of only this context will never re-render from layout/drag state changes.
 */
export interface ZeugmaActionsValue {
  /** Removes the specified pane from the layout tree and collapses its parent split. */
  removePane: (paneId: string) => void
  /** Appends/inserts a pane at the bottom-rightmost leaf of the layout tree. */
  addPane: (paneId: string) => void
  /** Swaps the positions of two panes in the layout tree. */
  swapPanes: (paneIdA: string, paneIdB: string) => void
  /** Splits a target pane with a new pane in the specified direction and side. */
  splitPane: (
    targetId: string,
    direction: SplitDirection,
    splitType: 'left' | 'right' | 'top' | 'bottom',
    paneToAdd: string,
  ) => void
  /** Updates the split percentage of a specific split branch node. */
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void
  /** Stable callback to update metadata for a specific pane. */
  updatePaneMetadata: (
    paneId: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
}
