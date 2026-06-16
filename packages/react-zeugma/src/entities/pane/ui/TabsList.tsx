import React, { useContext } from 'react'
import { PaneContext } from '../model/context'
import { Tab, TabRenderProps } from './Tab'

export interface TabsListRenderProps extends TabRenderProps {
  /** The unique ID of the individual tab. */
  tabId: string
  /** Whether the tab is currently active. */
  isActive: boolean
  /** The index position of the tab in the array. */
  index: number
  /** Whether this is the last tab in the list. */
  isLast: boolean
  /** Pre-bound action to select this specific tab. */
  select: () => void
  /** Pre-bound action to remove/close this specific tab. */
  remove: () => void
  /** The custom metadata associated with this tab. */
  metadata: Record<string, unknown> | undefined
}

export interface TabsListProps {
  /** Render prop function to render each tab's visual content. */
  children: (props: TabsListRenderProps) => React.ReactNode
  /** Custom CSS class applied to the individual tab wrappers. */
  className?: string
  /** Custom inline CSS style applied to the individual tab wrappers. */
  style?: React.CSSProperties
}

export const TabsList: React.FC<TabsListProps> = ({ children, className, style }) => {
  const paneProps = useContext(PaneContext)

  if (!paneProps) {
    throw new Error('<TabsList> must be rendered inside a <Pane> component.')
  }

  const { tabs, activeTabId, selectTab, removeTab, tabsMetadata, locked } = paneProps

  return (
    <>
      {tabs.map((tabId, index) => {
        const isActive = tabId === activeTabId
        const isLast = index === tabs.length - 1
        const metadata = tabsMetadata?.[tabId]

        return (
          <Tab key={tabId} id={tabId} locked={locked} className={className} style={style}>
            {(tabProps) =>
              children({
                ...tabProps,
                tabId,
                isActive,
                index,
                isLast,
                select: () => selectTab(tabId),
                remove: () => removeTab(tabId),
                metadata,
              })
            }
          </Tab>
        )
      })}
    </>
  )
}
