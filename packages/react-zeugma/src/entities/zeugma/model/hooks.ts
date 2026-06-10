import { useContext } from 'react'
import { ZeugmaStateContext, ZeugmaActionsContext } from './context'
import { ZeugmaStateValue, ZeugmaActionsValue } from './types'

export const useZeugmaState = (): ZeugmaStateValue => {
  const state = useContext(ZeugmaStateContext)
  if (!state) {
    throw new Error('useZeugmaState must be used within a Zeugma provider')
  }
  return state
}

export const useZeugmaActions = (): ZeugmaActionsValue => {
  const actions = useContext(ZeugmaActionsContext)
  if (!actions) {
    throw new Error('useZeugmaActions must be used within a Zeugma provider')
  }
  return actions
}
