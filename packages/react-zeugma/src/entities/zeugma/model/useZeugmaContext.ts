import { useZeugmaState, useZeugmaActions } from './hooks'
import { ZeugmaContextValue } from './types'

export const useZeugmaContext = (): ZeugmaContextValue => {
  const state = useZeugmaState()
  const actions = useZeugmaActions()
  return { ...state, ...actions }
}
