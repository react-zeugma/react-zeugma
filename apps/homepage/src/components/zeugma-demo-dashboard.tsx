'use client'

import { useState, useCallback } from 'react'
import {
  Zeugma,
  ZeugmaProvider,
  Pane,
  useZeugma,
  TabDetails,
  DragOverlayActiveItem,
  usePaneContext,
} from 'react-zeugma'
import {
  DashboardToolbar,
  DashboardContainer,
  PanelChrome,
} from './zeugma-demo-dashboard/DashboardLayout'
import { TimeSeriesPanel, RequestsRatePanel } from './zeugma-demo-dashboard/TimeSeriesPanel'
import { BarGaugePanel } from './zeugma-demo-dashboard/BarGaugePanel'
import { StatPanel } from './zeugma-demo-dashboard/StatPanel'
import { TablePanel } from './zeugma-demo-dashboard/TablePanel'
import { LogsPanel } from './zeugma-demo-dashboard/LogsPanel'
import { CpuGaugePanel, MemGaugePanel } from './zeugma-demo-dashboard/GaugePanel'
import { WidgetWrapper } from './zeugma-demo-dashboard/WidgetWrapper'
import { LiveDataProvider } from './zeugma-demo-dashboard/LiveDataProvider'
import { FpsMonitor } from './fps-monitor'
import { Maximize2, Minimize2, X } from 'lucide-react'

import { WIDGET_META, defaultDashboardLayout } from './zeugma-demo-dashboard/constants'

// ── Custom Pane Header (Drag Handle, Fullscreen, Close) ──────────────────────

function DashboardPaneHeader() {
  const { tabs, activeTabId, toggleFullscreen, isFullscreen, remove } = usePaneContext()
  const activeWidgetMeta = WIDGET_META[activeTabId]
  const showTabs = tabs.length > 1 || activeWidgetMeta?.isTabbed !== false

  return (
    <div className="grafana-panel-header flex items-center justify-between min-h-[30px] border-b border-[#1e2127] bg-[#111317]">
      {showTabs ? (
        <div className="flex items-center flex-1 h-full min-w-0">
          <Pane.Tabs
            classNames={{
              container: 'grafana-tabs-container h-full flex items-center',
              tab: 'h-full flex items-center',
            }}
            renderTab={({ tabId, activeTabId: currentActive, onSelect }) => {
              const meta = WIDGET_META[tabId]
              const isActive = tabId === currentActive
              return (
                <button onClick={onSelect} className={`grafana-tab ${isActive ? 'active' : ''}`}>
                  {meta?.icon}
                  <span className="text-[10px] font-semibold">{meta?.title || tabId}</span>
                </button>
              )
            }}
          />
          <Pane.DragHandle className="flex-1 h-full min-w-[30px] cursor-grab" />
        </div>
      ) : (
        <Pane.DragHandle className="flex items-center gap-1.5 min-w-0 flex-1 cursor-grab h-full">
          {WIDGET_META[activeTabId]?.icon && (
            <span className="grafana-panel-icon shrink-0">{WIDGET_META[activeTabId].icon}</span>
          )}
          <span className="grafana-panel-title">
            {WIDGET_META[activeTabId]?.title || activeTabId}
          </span>
        </Pane.DragHandle>
      )}

      <div className="flex items-center gap-0.5 shrink-0 pl-2">
        <button
          onClick={toggleFullscreen}
          className="grafana-pane-btn"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        <button
          onClick={remove}
          className="grafana-pane-btn hover:text-[#F2495C]"
          title="Close Panel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Inner Dashboard Component ────────────────────────────────────────────────

function ZeugmaDemoDashboardInner() {
  const [timeRange, setTimeRange] = useState('15m')
  const controller = useZeugma({ initialLayout: defaultDashboardLayout })

  // ── Tab / Widget rendering ───────────────────────────────────────────────

  const renderWidget = useCallback((tab: TabDetails) => {
    const getContent = () => {
      switch (tab.id) {
        case 'time-series':
          return <TimeSeriesPanel />
        case 'requests-rate':
          return <RequestsRatePanel />
        case 'service-health':
          return <BarGaugePanel />
        case 'key-metrics':
          return <StatPanel />
        case 'top-endpoints':
          return <TablePanel />
        case 'live-logs':
          return <LogsPanel />
        case 'cpu-gauge':
          return <CpuGaugePanel />
        case 'mem-gauge':
          return <MemGaugePanel />
        case 'fps-monitor':
          return <FpsMonitor />
        default:
          return (
            <PanelChrome title="Unknown">
              <div className="flex items-center justify-center h-full text-[#6B6B6B] text-xs">
                Unknown widget: {tab.id}
              </div>
            </PanelChrome>
          )
      }
    }

    return <WidgetWrapper tabId={tab.id}>{getContent()}</WidgetWrapper>
  }, [])

  // ── Pane rendering ─────────────────────────────────────────────────────────

  const renderPane = useCallback(
    (paneId: string) => {
      return (
        <Pane id={paneId}>
          <div className="grafana-panel flex flex-col h-full w-full overflow-hidden">
            <DashboardPaneHeader />

            <Pane.Content className="grafana-panel-body flex-1 min-h-0 overflow-hidden">
              {renderWidget}
            </Pane.Content>
          </div>
        </Pane>
      )
    },
    [renderWidget],
  )

  // ── Drag overlay ─────────────────────────────────────────────────────────

  const renderDragOverlay = useCallback(
    (active: DragOverlayActiveItem) => {
      let id = ''
      if (active.type === 'tab') {
        id = active.id
      } else if (active.type === 'pane') {
        const pane = controller.findPaneById(active.id)
        id = pane?.activeTabId ?? ''
      }
      const meta = WIDGET_META[id]
      return (
        <div className={`grafana-drag-overlay ${active.isDismissing ? 'dismissing' : ''}`}>
          {meta?.icon}
          <span className="text-[11px] font-semibold text-[#D8D9DA]">{meta?.title || id}</span>
        </div>
      )
    },
    [controller],
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ZeugmaProvider
      controller={controller}
      resizerSize={4}
      renderPane={renderPane}
      renderDragOverlay={renderDragOverlay}
      enableDragToDismiss={true}
      classNames={{
        dropPreview:
          'bg-[#5794F2]/10 border border-[#5794F2]/30 transition-all duration-200 shadow-lg',
        rootDropPreview: 'grafana-root-drop-preview',
        resizer: 'grafana-resizer',
        tabDropPreview: 'grafana-tab-drop-preview',
      }}
    >
      <DashboardContainer>
        <DashboardToolbar timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        <div className="grafana-workspace">{controller.layout && <Zeugma />}</div>
      </DashboardContainer>
    </ZeugmaProvider>
  )
}

// ── Wrapper with LiveDataProvider ────────────────────────────────────────────

export function ZeugmaDemoDashboard() {
  return (
    <LiveDataProvider>
      <ZeugmaDemoDashboardInner />
    </LiveDataProvider>
  )
}
