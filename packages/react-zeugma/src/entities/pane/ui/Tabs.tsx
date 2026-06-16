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
  children: (props: {
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

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  locked = false,
  tabsMetadata,
  selectTab,
  removeTab,
  children,
  classNames,
  styles,
}) => {
  return (
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
        const tabClassName = classNames?.tab
        const resolvedClassName =
          typeof tabClassName === 'function' ? tabClassName(tabId) : tabClassName
        const tabStyle = styles?.tab
        const resolvedStyle = typeof tabStyle === 'function' ? tabStyle(tabId) : tabStyle

        return (
          <Tab
            key={tabId}
            id={tabId}
            locked={locked}
            className={resolvedClassName}
            style={resolvedStyle}
          >
            {({ isDragging, isOver }) =>
              children({
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
