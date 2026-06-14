export interface PaneRenderProps {
  /** True if the pane is actively being dragged. */
  isDragging: boolean
  /** True if the pane currently occupies the fullscreen view. */
  isFullscreen: boolean
  /** Toggles the pane to and from fullscreen/zoomed mode. */
  toggleFullscreen: () => void
  /** Closes and removes the pane from the layout tree. */
  remove: () => void
  /** The metadata values associated with this pane, or undefined. */
  metadata: Record<string, unknown> | undefined
  /** Updates the metadata of this pane using an updater function. */
  updateMetadata: (
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  /** True if this specific pane or the dashboard globally is locked. */
  locked: boolean
}
