import React from 'react'
import { Tab } from './Tab'

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
  /** Custom CSS classes for Tabs container. */
  className?: string
  /** Custom inline CSS styles for Tabs container. */
  style?: React.CSSProperties
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  locked = false,
  tabsMetadata,
  selectTab,
  removeTab,
  renderTab,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        ...style,
      }}
    >
      {tabs.map((tabId) => {
        const metadata = tabsMetadata?.[tabId]

        return (
          <Tab key={tabId} id={tabId} locked={locked}>
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
  )
}
