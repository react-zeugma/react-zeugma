import React from 'react'
import { RenderCounterFooter } from 'react-zeugma/devtools'
import { TimeSeriesPanel, RequestsRatePanel } from './TimeSeriesPanel'
import { BarGaugePanel } from './BarGaugePanel'
import { StatPanel } from './StatPanel'
import { TablePanel } from './TablePanel'
import { LogsPanel } from './LogsPanel'
import { CpuGaugePanel, MemGaugePanel } from './GaugePanel'
import { FpsMonitor } from '../fps-monitor'
import { MapPanel } from './MapPanel'
import { PanelChrome } from './DashboardLayout'
import { EmptyWidgetPanel } from './EmptyWidgetPanel'

export interface DashboardWidgetProps {
  tabId: string
}

export const DashboardWidget = React.memo(function DashboardWidget({
  tabId,
}: DashboardWidgetProps) {
  const displayLabel = tabId.startsWith('empty-widget') ? 'empty-panel' : tabId

  const renderContent = () => {
    if (tabId.startsWith('empty-widget')) {
      return <EmptyWidgetPanel tabId={tabId} />
    }
    switch (tabId) {
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
      case 'system-map':
        return <MapPanel />
      default:
        return (
          <PanelChrome title="Unknown">
            <div className="flex items-center justify-center h-full text-[#6B6B6B] text-xs">
              Unknown widget: {tabId}
            </div>
          </PanelChrome>
        )
    }
  }

  return (
    <RenderCounterFooter
      id={`dashboard-${tabId}`}
      label={displayLabel}
      className="h-full w-full flex flex-col overflow-hidden min-h-0"
      footerClassName="grafana-widget-footer"
    >
      {renderContent()}
    </RenderCounterFooter>
  )
})

export { DashboardWidget as WidgetWrapper }
