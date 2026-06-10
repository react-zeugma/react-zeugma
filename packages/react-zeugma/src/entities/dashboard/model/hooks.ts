import { useContext } from 'react'
import {
  DashboardStateContext,
  DashboardActionsContext,
  DashboardStateValue,
  DashboardActionsValue,
} from './context'

/** Returns only reactive state. Use when you need layout, activeId, classNames, etc. */
export const useDashboardState = (): DashboardStateValue => {
  const state = useContext(DashboardStateContext)
  if (!state) {
    throw new Error('useDashboardState must be used within a Zeugma provider')
  }
  return state
}

/** Returns only stable action dispatchers. Consumers of this hook never re-render from state changes. */
export const useDashboardActions = (): DashboardActionsValue => {
  const actions = useContext(DashboardActionsContext)
  if (!actions) {
    throw new Error('useDashboardActions must be used within a Zeugma provider')
  }
  return actions
}
