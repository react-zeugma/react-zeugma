import { createContext } from 'react'

export interface PortalRegistryValue {
  registerPortalTarget: (tabId: string, el: HTMLDivElement | null) => void
}

export const PortalRegistryContext = createContext<PortalRegistryValue | undefined>(undefined)
