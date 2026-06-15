import { useZeugmaState, useZeugmaActions, ZeugmaContextValue } from '../../../shared'

export const useZeugmaContext = (): ZeugmaContextValue => {
  const state = useZeugmaState()
  const actions = useZeugmaActions()
  return { ...state, ...actions }
}
