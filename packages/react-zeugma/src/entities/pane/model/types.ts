import { ReactNode } from 'react'

export interface PaneRenderProps {
  /** True if the pane is actively being dragged. */
  isDragging: boolean
  /** True if the pane currently occupies the fullscreen view. */
  isFullscreen: boolean
  /** Toggles the pane to and from fullscreen/zoomed mode. */
  toggleFullscreen: () => void
  /** Closes and removes the active tab from the layout tree. */
  remove: () => void
  /** The metadata values associated with the active tab, or undefined. */
  metadata: Record<string, unknown> | undefined
  /** Updates the metadata of the active tab using an updater function. */
  updateMetadata: (
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  /** True if this specific pane or the dashboard globally is locked. */
  locked: boolean

  // Tabulation extensions:
  /** The array of tab IDs in this pane. */
  tabs: string[]
  /** The currently active tab ID. */
  activeTabId: string
  /** Selects a specific tab to make it active. */
  selectTab: (tabId: string) => void
  /** Removes/closes a specific tab. */
  removeTab: (tabId: string) => void
  /** The metadata values associated with all tabs in this pane. */
  tabsMetadata: Record<string, Record<string, unknown>> | undefined
  /** Updates the metadata of a specific tab. */
  updateTabMetadata: (
    tabId: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  /** Renders the target placeholder element for the currently active tab in the pane. */
  renderActiveTab: () => ReactNode
}
