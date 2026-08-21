import { useSyncExternalStore, useContext } from 'react'
import type { MetadataStore } from '../../../shared'
import { ZeugmaMetadataStoreContext } from './metadata-context'

const EMPTY_OBJECT: Record<string, Record<string, unknown>> = {}

export function createMetadataStore(
  initialMetadata?: Record<string, Record<string, unknown>>,
  onMetadataChange?: (metadata: Record<string, Record<string, unknown>>) => void,
): MetadataStore {
  let metadataMap: Record<string, Record<string, unknown>> = initialMetadata
    ? { ...initialMetadata }
    : {}
  const tabListeners = new Map<string, Set<() => void>>()
  const globalListeners = new Set<() => void>()

  const notify = (tabId: string) => {
    const listeners = tabListeners.get(tabId)
    if (listeners) {
      listeners.forEach((listener) => listener())
    }
    globalListeners.forEach((listener) => listener())
    onMetadataChange?.(metadataMap)
  }

  const store: MetadataStore = {
    get: (tabId: string) => {
      return metadataMap[tabId]
    },

    getAll: () => {
      return metadataMap
    },

    set: (tabId: string, metadata: Record<string, unknown> | undefined) => {
      if (metadata === undefined) {
        if (!(tabId in metadataMap)) return
        const next = { ...metadataMap }
        delete next[tabId]
        metadataMap = next
      } else {
        if (metadataMap[tabId] === metadata) return
        metadataMap = {
          ...metadataMap,
          [tabId]: metadata,
        }
      }
      notify(tabId)
    },

    update: (
      tabId: string,
      updater: (
        current: Record<string, unknown> | undefined,
      ) => Record<string, unknown> | undefined,
    ) => {
      const current = metadataMap[tabId]
      const next = updater(current)
      if (next === current) return

      if (next === undefined) {
        if (!(tabId in metadataMap)) return
        const updated = { ...metadataMap }
        delete updated[tabId]
        metadataMap = updated
      } else {
        metadataMap = {
          ...metadataMap,
          [tabId]: next,
        }
      }
      notify(tabId)
    },

    remove: (tabId: string) => {
      if (!(tabId in metadataMap)) return
      const next = { ...metadataMap }
      delete next[tabId]
      metadataMap = next
      notify(tabId)
    },

    setAll: (newMap: Record<string, Record<string, unknown>> | undefined) => {
      const normalized = newMap ? { ...newMap } : {}
      const prevKeys = Object.keys(metadataMap)
      const nextKeys = Object.keys(normalized)

      let changed = prevKeys.length !== nextKeys.length
      const changedTabIds = new Set<string>()

      if (!changed) {
        for (const key of prevKeys) {
          if (metadataMap[key] !== normalized[key]) {
            changed = true
            changedTabIds.add(key)
          }
        }
      } else {
        for (const key of prevKeys) {
          if (metadataMap[key] !== normalized[key]) {
            changedTabIds.add(key)
          }
        }
        for (const key of nextKeys) {
          if (metadataMap[key] !== normalized[key]) {
            changedTabIds.add(key)
          }
        }
      }

      if (!changed) return

      metadataMap = normalized

      changedTabIds.forEach((tabId) => {
        const listeners = tabListeners.get(tabId)
        if (listeners) {
          listeners.forEach((listener) => listener())
        }
      })
      globalListeners.forEach((listener) => listener())
      onMetadataChange?.(metadataMap)
    },

    subscribe: (tabId: string, listener: () => void) => {
      let listeners = tabListeners.get(tabId)
      if (!listeners) {
        listeners = new Set()
        tabListeners.set(tabId, listeners)
      }
      listeners.add(listener)
      return () => {
        listeners?.delete(listener)
        if (listeners?.size === 0) {
          tabListeners.delete(tabId)
        }
      }
    },

    subscribeAll: (listener: () => void) => {
      globalListeners.add(listener)
      return () => {
        globalListeners.delete(listener)
      }
    },
  }

  return store
}

export function useTabMetadata(
  tabId: string,
  customStore?: MetadataStore,
): Record<string, unknown> | undefined {
  const contextStore = useContext(ZeugmaMetadataStoreContext)
  const store = customStore ?? contextStore

  return useSyncExternalStore(
    (onStoreChange) => (store ? store.subscribe(tabId, onStoreChange) : () => {}),
    () => (store ? store.get(tabId) : undefined),
    () => (store ? store.get(tabId) : undefined),
  )
}

export function useAllMetadata(
  customStore?: MetadataStore,
): Record<string, Record<string, unknown>> {
  const contextStore = useContext(ZeugmaMetadataStoreContext)
  const store = customStore ?? contextStore

  return useSyncExternalStore(
    (onStoreChange) => (store ? store.subscribeAll(onStoreChange) : () => {}),
    () => (store ? store.getAll() : EMPTY_OBJECT),
    () => (store ? store.getAll() : EMPTY_OBJECT),
  )
}
