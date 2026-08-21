import { useEffect, useState, SetStateAction } from 'react'
import { TreeNode, ZeugmaPersistOptions, MetadataStore } from '../../../shared'

export interface UseZeugmaPersistenceProps {
  persist?: boolean | ZeugmaPersistOptions
  layout: TreeNode | null
  setLayout: (nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => void
  metadataStore?: MetadataStore
}

export function useZeugmaPersistence({
  persist,
  layout,
  setLayout,
  metadataStore,
}: UseZeugmaPersistenceProps) {
  const isEnabled = typeof persist === 'object' ? persist.enabled !== false : !!persist
  const persistKey = (typeof persist === 'object' && persist.key) || 'zeugma-layout'
  const metadataKey =
    (typeof persist === 'object' && persist.metadataKey) || `${persistKey}-metadata`

  const [isLoaded, setIsLoaded] = useState(false)

  // Load layout and metadata from localStorage on mount if persist is enabled
  useEffect(() => {
    if (isEnabled) {
      const savedLayout = localStorage.getItem(persistKey)
      if (savedLayout) {
        try {
          const parsed = JSON.parse(savedLayout)
          if (parsed) {
            setLayout(parsed)
          }
        } catch (e) {
          console.error('Failed to parse persisted zeugma layout', e)
        }
      }

      if (metadataStore) {
        const savedMetadata = localStorage.getItem(metadataKey)
        if (savedMetadata) {
          try {
            const parsedMeta = JSON.parse(savedMetadata)
            if (parsedMeta && typeof parsedMeta === 'object') {
              metadataStore.setAll(parsedMeta)
            }
          } catch (e) {
            console.error('Failed to parse persisted zeugma metadata', e)
          }
        }
      }
    }
    setIsLoaded(true)
  }, [isEnabled, persistKey, metadataKey, setLayout, metadataStore])

  // Save layout to localStorage when layout changes if persist is enabled
  useEffect(() => {
    if (isEnabled && isLoaded) {
      if (layout) {
        localStorage.setItem(persistKey, JSON.stringify(layout))
      } else {
        localStorage.removeItem(persistKey)
      }
    }
  }, [isEnabled, persistKey, layout, isLoaded])

  // Save metadata to localStorage on metadata change if persist is enabled
  useEffect(() => {
    if (isEnabled && isLoaded && metadataStore) {
      const unsubscribe = metadataStore.subscribeAll(() => {
        const currentMeta = metadataStore.getAll()
        if (Object.keys(currentMeta).length > 0) {
          localStorage.setItem(metadataKey, JSON.stringify(currentMeta))
        } else {
          localStorage.removeItem(metadataKey)
        }
      })
      return unsubscribe
    }
  }, [isEnabled, isLoaded, metadataKey, metadataStore])
}
