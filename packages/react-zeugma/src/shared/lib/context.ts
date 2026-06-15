import { createContext, useContext } from 'react'
import {
  ZeugmaStateValue,
  ZeugmaInternalStateValue,
  ZeugmaActionsValue,
  PortalRegistryValue,
} from '../model/types'

export const ZeugmaStateContext = createContext<ZeugmaInternalStateValue | undefined>(undefined)
export const ZeugmaActionsContext = createContext<ZeugmaActionsValue | undefined>(undefined)
export const PortalRegistryContext = createContext<PortalRegistryValue | undefined>(undefined)

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
