import { ReactNode, Dispatch, SetStateAction, RefObject } from 'react'

export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number
}

export interface PaneNode {
  type: 'pane'
  id: string
  tabs: string[]
  activeTabId: string
  locked?: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
}

export type TreeNode = SplitNode | PaneNode

export interface TabDetails {
  id: string
  paneId: string
  isActive: boolean
  index: number
  metadata: Record<string, unknown> | undefined
}

export interface UseZeugmaOptions {
  /** Initial layout tree model defining pane organization for uncontrolled mode. Only used on initial mount. */
  initialLayout?: TreeNode | null
  /** Controlled layout tree model. If provided, the hook will run in controlled mode and sync with this value. */
  layout?: TreeNode | null
  /** Callback triggered when the layout changes via drag-and-drop actions, splits, moves, or resizes. */
  onChange?: (newLayout: TreeNode | null) => void
  /** The ID of the pane that is currently taking up the full dashboard area. Null if no pane is fullscreen. */
  fullscreenPaneId?: string | null
  /** Callback triggered when a pane is toggled to/from fullscreen mode. Passes the active fullscreen paneId or null. */
  onFullscreenChange?: (paneId: string | null) => void
  /** Whether the layout is locked. When locked, resizing, dragging, and dropping are disabled. */
  locked?: boolean

  /** Minimum pixel distance that a user must drag a pane handle before dragging triggers. Defaults to 8. */
  dragActivationDistance?: number
  /** Threshold value in pixels for snapping layout resizing handles to adjacent edges. Defaults to 8. */
  snapThreshold?: number
  /** Minimum split percentage allowed when resizing split panes. Defaults to 5. */
  minSplitPercentage?: number
  /** Maximum split percentage allowed when resizing split panes. Defaults to 95. */
  maxSplitPercentage?: number
  /** Whether dragging a pane far enough outside the container triggers a drag-out/dismiss action. Defaults to false. */
  enableDragToDismiss?: boolean
  /** The threshold in pixels beyond the container boundaries required to activate the drag-out/dismiss action. Defaults to 60. */
  dismissThreshold?: number

  /** Callback triggered when a pane is removed from the dashboard layout tree. */
  onRemove?: (paneId: string) => void
  /** Callback triggered when dragging starts for a pane. */
  onDragStart?: (activeId: string) => void
  /** Callback triggered when dragging ends, providing details on target pane and drop action (split or move). */
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'move'
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
  /** Callback triggered when the drag-out/dismiss intent changes. */
  onDismissIntentChange?: (paneId: string | null) => void
}

export interface ZeugmaController {
  // State
  /** The current active layout tree structure, or null if empty. */
  layout: TreeNode | null
  /** Updates the layout tree. */
  setLayout: Dispatch<SetStateAction<TreeNode | null>>
  /** The ID of the pane currently zoomed to fullscreen, or null. */
  fullscreenPaneId: string | null
  /** Programmatically sets the fullscreen pane ID. */
  setFullscreenPaneId: (paneId: string | null) => void
  /** Whether the layout is globally locked. */
  locked: boolean
  /** Programmatically updates the global locked status. */
  setLocked: Dispatch<SetStateAction<boolean>>

  // Public Actions
  /** Removes the specified pane from the layout tree and collapses its parent split. */
  removePane: (paneId: string) => void
  /** Appends/inserts a pane at the bottom-rightmost leaf of the layout tree. */
  addPane: (paneId: string, metadata?: Record<string, unknown>) => void
  /** Appends a tab into a target pane node. */
  addTab: (paneId: string, tabId: string, metadata?: Record<string, unknown>) => void
  /** Stable callback to update metadata for a specific tab. */
  updateTabMetadata: (
    tabId: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  /** Stable callback to update the locked status of a specific pane in the layout tree. */
  updatePaneLock: (paneId: string, locked: boolean) => void
  /** Stable callback to activate a tab within a pane. */
  selectTab: (paneId: string, tabId: string) => void
  /** Stable callback to merge a dragged tab/pane into another pane's tab list. */
  mergeTab: (draggedTabId: string, targetPaneId: string) => void
  /** Stable callback to remove/close a specific tab from the layout. */
  removeTab: (tabId: string) => void

  // Public Queries
  /** Find a PaneNode by its ID in the layout tree. */
  findPaneById: (paneId: string) => PaneNode | null
  /** Find the PaneNode containing the given tab ID in the layout tree. */
  findPaneContainingTab: (tabId: string) => PaneNode | null
  /** Find the details of a tab by its ID in the layout tree. */
  findTabById: (tabId: string) => TabDetails | null
}

/** @internal */
export interface ZeugmaInternalController extends ZeugmaController {
  // Internal State
  activeId: string | null
  setActiveId: Dispatch<SetStateAction<string | null>>
  activeType: 'pane' | 'tab' | null
  setActiveType: Dispatch<SetStateAction<'pane' | 'tab' | null>>
  dismissIntentId: string | null
  setDismissIntentId: Dispatch<SetStateAction<string | null>>
  containerRef: RefObject<HTMLElement | null>
  setContainerRef: (element: HTMLElement | null) => void

  // Configuration settings (resolved/defaulted)
  dragActivationDistance: number
  snapThreshold: number
  minSplitPercentage: number
  maxSplitPercentage: number
  enableDragToDismiss: boolean
  dismissThreshold: number

  // Callbacks
  onRemove?: (paneId: string) => void
  onDragStart?: (activeId: string) => void
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'move'
      direction?: SplitDirection
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
  onResizeStart?: (currentNode: SplitNode) => void
  onResize?: (currentNode: SplitNode, percentage: number) => void
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  onDismissIntentChange?: (paneId: string | null) => void

  // Internal Actions
  splitPane: (
    targetId: string,
    direction: SplitDirection,
    splitType: 'left' | 'right' | 'top' | 'bottom',
    paneToAdd: string,
  ) => void
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void
  moveTab: (draggedTabId: string, targetTabId: string, position?: 'before' | 'after') => void
}

export interface ZeugmaClassNames {
  /** CSS class applied to the root dashboard container. */
  dashboard?: string
  /** CSS class applied to the root dashboard container when a drag-out dismiss is active. */
  dashboardDismissActive?: string
  /** CSS class applied to the outer container div of each `<Pane>`. */
  pane?: string
  /** CSS class applied to the pane container when locked. */
  paneLocked?: string
  /** CSS class applied to drop zone indicators when hovering over layout edges to split a pane. */
  dropPreview?: string
  /** CSS class applied to the custom cursor-following drag preview portal wrapper. */
  dragOverlay?: string
  /** CSS class applied to the drag-to-resize split bar handles. */
  resizer?: string
  /** CSS class applied to the background dismiss zone indicator during a drag-out dismiss gesture. */
  dismissPreview?: string
  /** CSS class applied to root container when dashboard is globally locked. */
  dashboardLocked?: string
  /** CSS class applied to drop zone indicator when hovering over a locked pane. */
  lockedPreview?: string
  /** CSS class applied to tab container when dragging a tab over it. */
  tabDropPreview?: string
}

export interface ZeugmaProps extends ZeugmaController {
  /** Render function mapping unique pane IDs to React elements. Usually renders a <Pane> wrapper. */
  renderPane: (paneId: string) => ReactNode
  /** Custom overlay renderer function used to customize the cursor-following drag preview for an active pane or tab. */
  renderDragOverlay?: (activeId: string, type: 'pane' | 'tab') => ReactNode
  /** Optional CSS class name mapping overrides for custom styles of components like panes, drop previews, overlays, etc. */
  classNames?: ZeugmaClassNames
  /** Render function mapping tab IDs to React elements. Used to render tab widgets inside portals. */
  renderWidget?: (tabId: string) => ReactNode
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
  setLayout: Dispatch<SetStateAction<TreeNode | null>>
  /** Renders the inner content of a pane given its unique ID. */
  renderPane: (paneId: string) => ReactNode
  /** The ID of the pane currently zoomed to fullscreen, or null. */
  fullscreenPaneId: string | null
  /** Normalized or overridden CSS classes for custom layout styling. */
  classNames: ZeugmaClassNames
  /** Whether the layout is globally locked. */
  locked: boolean
  /** Programmatically updates the global locked status. */
  setLocked: Dispatch<SetStateAction<boolean>>
  /** Find a PaneNode by its ID in the layout tree. */
  findPaneById: (paneId: string) => PaneNode | null
  /** Find the PaneNode containing the given tab ID in the layout tree. */
  findPaneContainingTab: (tabId: string) => PaneNode | null
  /** Find the details of a tab by its ID in the layout tree. */
  findTabById: (tabId: string) => TabDetails | null
}

/** @internal */
export interface ZeugmaInternalStateValue extends ZeugmaStateValue {
  /** The ID of the tab currently hovered over during a tab drag, or null. */
  overTabId: string | null
  /** The position of the tab drop preview relative to the hovered tab ('before' | 'after'). */
  overTabPosition: 'before' | 'after' | null

  // Drag-and-drop orchestration state
  activeId: string | null
  dismissIntentId: string | null
  setContainerRef: (element: HTMLElement | null) => void
  onRemove?: (paneId: string) => void
  onFullscreenChange?: (paneId: string | null) => void
  snapThreshold?: number
  onResizeStart?: (currentNode: SplitNode) => void
  onResize?: (currentNode: SplitNode, percentage: number) => void
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  minSplitPercentage?: number
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
  addPane: (paneId: string, metadata?: Record<string, unknown>) => void
  /** Appends a tab into a target pane node. */
  addTab: (paneId: string, tabId: string, metadata?: Record<string, unknown>) => void
  /** Stable callback to update metadata for a specific tab. */
  updateTabMetadata: (
    tabId: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  /** Stable callback to update the locked status of a specific pane in the layout tree. */
  updatePaneLock: (paneId: string, locked: boolean) => void
  /** Stable callback to activate a tab within a pane. */
  selectTab: (paneId: string, tabId: string) => void
  /** Stable callback to merge a dragged tab/pane into another pane's tab list. */
  mergeTab: (draggedTabId: string, targetPaneId: string) => void
  /** Stable callback to remove/close a specific tab from the layout. */
  removeTab: (tabId: string) => void
}

export interface ZeugmaContextValue extends ZeugmaStateValue, ZeugmaActionsValue {}

export interface PortalRegistryValue {
  registerPortalTarget: (tabId: string, el: HTMLDivElement | null) => void
}
