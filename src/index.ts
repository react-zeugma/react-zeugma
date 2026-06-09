export { DashboardProvider } from './entities/dashboard'
export type {
  ZeugmaClassNames,
  ResizerRenderProps,
  DashboardStateValue,
  DashboardActionsValue,
} from './entities/dashboard'
export { useDashboardState, useDashboardActions } from './entities/dashboard'
export { useResizer } from './features/resize-pane'
export { PaneTree } from './widgets/pane-tree'
export { Pane, DragHandle } from './entities/pane'
export type { PaneRenderProps } from './entities/pane'
export * from './shared'
