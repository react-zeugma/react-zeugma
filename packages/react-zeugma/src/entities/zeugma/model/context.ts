import { createContext } from 'react'
import { ZeugmaStateValue, ZeugmaActionsValue } from './types'

export const ZeugmaStateContext = createContext<ZeugmaStateValue | undefined>(undefined)
export const ZeugmaActionsContext = createContext<ZeugmaActionsValue | undefined>(undefined)
