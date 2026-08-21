import { createContext } from 'react'
import type { MetadataStore } from '../../../shared'

export const ZeugmaMetadataStoreContext = createContext<MetadataStore | null>(null)
