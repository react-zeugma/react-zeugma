import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useZeugmaState, useZeugmaDrag, ZeugmaInternalStateValue } from '../../../shared'
import { TabsContext } from './Tabs'

export interface TabContextValue {
  tabId: string
  isActive: boolean
  isDragging: boolean
  isOver: boolean
  metadata?: Record<string, unknown>
  locked: boolean
  selectTab: () => void
  removeTab: () => void
}

export const TabContext = createContext<TabContextValue | undefined>(undefined)

export const useTabContext = () => {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useTabContext must be used within a Tab component')
  }
  return context
}

export interface TabRenderProps {
  isDragging: boolean
  isOver: boolean
}

export interface TabProps {
  /** The unique ID of the tab, which corresponds to the pane/widget ID. */
  id: string
  /** Whether dragging is locked on this tab. */
  locked?: boolean
  /** Render prop child function. */
  children: (props: TabRenderProps) => React.ReactNode
  /** Custom CSS class applied to the tab wrapper. */
  className?: string
  /** Custom inline CSS style applied to the tab wrapper. */
  style?: React.CSSProperties
}

export const Tab: React.FC<TabProps> = ({ id, locked = false, children, className, style }) => {
  const { locked: globalLocked, classNames = {} } = useZeugmaState() as ZeugmaInternalStateValue
  const { overTabId, overTabPosition } = useZeugmaDrag()

  const tabsContext = useContext(TabsContext)
  const isLocked = locked || globalLocked || (tabsContext?.locked ?? false)

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `tab-header-${id}`,
    disabled: isLocked,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `tab-drop-${id}`,
    disabled: isLocked,
  })

  const handleRef = (el: HTMLDivElement | null) => {
    setDragRef(el)
    setDropRef(el)
  }

  const isTargetOver = isOver && overTabId === id
  const dropPosition = isTargetOver ? overTabPosition : null

  const isActive = tabsContext ? tabsContext.activeTabId === id : false
  const metadata = tabsContext?.tabsMetadata?.[id]

  const selectThisTab = useCallback(() => {
    tabsContext?.selectTab(id)
  }, [tabsContext, id])

  const removeThisTab = useCallback(() => {
    tabsContext?.removeTab(id)
  }, [tabsContext, id])

  const tabContextValue = useMemo<TabContextValue>(
    () => ({
      tabId: id,
      isActive,
      isDragging,
      isOver: isTargetOver,
      metadata,
      locked: isLocked,
      selectTab: selectThisTab,
      removeTab: removeThisTab,
    }),
    [id, isActive, isDragging, isTargetOver, metadata, isLocked, selectThisTab, removeThisTab],
  )

  const renderedChild = children({ isDragging, isOver: isTargetOver })

  let hoistedClassName = className
  let hoistedStyle = style
  let cleanedChild = renderedChild

  if (React.isValidElement(renderedChild)) {
    const childProps = renderedChild.props as Record<string, unknown>
    if (childProps && typeof childProps === 'object') {
      if ('className' in childProps && typeof childProps.className === 'string') {
        hoistedClassName = `${className || ''} ${childProps.className}`.trim()
      }
      if ('style' in childProps && childProps.style && typeof childProps.style === 'object') {
        hoistedStyle = { ...style, ...childProps.style }
      }
    }
    cleanedChild = React.cloneElement(renderedChild, {
      className: undefined,
      style: undefined,
    } as React.Attributes)
  }

  return (
    <TabContext.Provider value={tabContextValue}>
      <div
        ref={handleRef}
        className={hoistedClassName}
        style={{
          display: 'inline-flex',
          position: 'relative',
          cursor: isLocked ? 'default' : 'grab',
          ...hoistedStyle,
        }}
        {...(isLocked ? {} : listeners)}
        {...(isLocked ? {} : attributes)}
      >
        {cleanedChild}

        {isTargetOver && dropPosition && (
          <div
            className={classNames.tabDropPreview || ''}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#6366f1',
              left: dropPosition === 'before' ? 0 : undefined,
              right: dropPosition === 'after' ? 0 : undefined,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}
      </div>
    </TabContext.Provider>
  )
}
