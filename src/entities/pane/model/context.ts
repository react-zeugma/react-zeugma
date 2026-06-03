import { createContext } from 'react'

export const DragListenersCtx = createContext<Record<string, unknown> | null>(null)
