import React, { createContext, useContext, useMemo } from 'react'
import { Tab } from './Tab'

export interface TabsContextValue {
  tabs: string[]
  activeTabId: string
  locked: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
  selectTab: (id: string) => void
  removeTab: (id: string) => void
}

export const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabsContext must be used within a Tabs component')
  }
  return context
}

export interface TabsProps {
  /** The list of tab IDs in this pane. */
  tabs: string[]
  /** The currently active tab ID. */
  activeTabId: string
  /** Whether dragging is locked on these tabs. */
  locked?: boolean
  /** Metadata for the tabs. */
  tabsMetadata?: Record<string, Record<string, unknown>>
  /** Callback when a tab is selected. */
  selectTab: (id: string) => void
  /** Callback when a tab is closed/removed. */
  removeTab: (id: string) => void
  /** Render function for each individual tab content. */
  renderTab: (props: {
    tabId: string
    activeTabId: string
    isDragging: boolean
    isOver: boolean
    metadata?: Record<string, unknown>
    selectTab: (id: string) => void
    removeTab: (id: string) => void
  }) => React.ReactNode
  /** Custom CSS classes for Tabs container and tab wrappers. */
  classNames?: {
    container?: string
    tab?: string | ((tabId: string) => string)
  }
  /** Custom inline CSS styles for Tabs container and tab wrappers. */
  styles?: {
    container?: React.CSSProperties
    tab?: React.CSSProperties | ((tabId: string) => React.CSSProperties)
  }
}

const resolveDynamicProp = <T,>(
  value: T | ((id: string) => T) | undefined,
  id: string,
): T | undefined => {
  return typeof value === 'function' ? (value as (id: string) => T)(id) : value
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  locked = false,
  tabsMetadata,
  selectTab,
  removeTab,
  renderTab,
  classNames,
  styles,
}) => {
  const contextValue = useMemo<TabsContextValue>(
    () => ({
      tabs,
      activeTabId,
      locked,
      tabsMetadata,
      selectTab,
      removeTab,
    }),
    [tabs, activeTabId, locked, tabsMetadata, selectTab, removeTab],
  )

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={classNames?.container}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          ...styles?.container,
        }}
      >
        {tabs.map((tabId) => {
          const metadata = tabsMetadata?.[tabId]
          const resolvedClassName = resolveDynamicProp(classNames?.tab, tabId)
          const resolvedStyle = resolveDynamicProp(styles?.tab, tabId)

          return (
            <Tab
              key={tabId}
              id={tabId}
              locked={locked}
              className={resolvedClassName}
              style={resolvedStyle}
            >
              {({ isDragging, isOver }) =>
                renderTab({
                  tabId,
                  activeTabId,
                  isDragging,
                  isOver,
                  metadata,
                  selectTab,
                  removeTab,
                })
              }
            </Tab>
          )
        })}
      </div>
    </TabsContext.Provider>
  )
}
