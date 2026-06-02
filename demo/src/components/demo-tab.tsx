import { useState } from 'react';
import {
  DashboardProvider,
  PaneTree,
  Pane,
  DragHandle,
  TreeNode,
  ZeugmaClassNames,
} from 'react-zeugma';
import {
  TrendChartWidget,
  BarChartWidget,
  TableWidget,
  PerformanceWidget,
  DefaultGuideWidget,
} from './dashboard-widgets';

interface DemoTabProps {
  layout: TreeNode | null;
  setLayout: (layout: TreeNode | null) => void;
  persist: boolean;
  togglePersist: () => void;
  clearStorage: () => void;
  resetLayout: () => void;
  handleAdd: () => void;
  handleRemove: (paneId: string) => void;
  fullscreenId: string | null;
  setFullscreenId: (id: string | null) => void;
  showCloseButtons: boolean;
  setShowCloseButtons: (show: boolean) => void;
  enableDragHandles: boolean;
  setEnableDragHandles: (enable: boolean) => void;
  applyPreset: (presetName: string) => void;
}

const classNames: ZeugmaClassNames = {
  pane: 'demo-pane',
  dropPreview: 'demo-drop-preview',
  swapPreview: 'demo-swap-preview',
  dragOverlay: 'demo-drag-overlay-wrapper',
  resizer: 'demo-resizer',
};

export default function DemoTab({
  layout,
  setLayout,
  persist,
  togglePersist,
  clearStorage,
  resetLayout,
  handleAdd,
  handleRemove,
  fullscreenId,
  setFullscreenId,
  showCloseButtons,
  setShowCloseButtons,
  enableDragHandles,
  setEnableDragHandles,
  applyPreset,
}: DemoTabProps) {
  // Local state to store widget configuration mapping per pane id
  const [paneWidgets, setPaneWidgets] = useState<Record<string, string>>({
    'pane-1': 'chart',
    'pane-2': 'table',
    'pane-3': 'performance',
  });

  const renderDemoPane = (id: string) => {
    const activeWidget = paneWidgets[id] || 'guide';

    const handleWidgetChange = (val: string) => {
      setPaneWidgets((prev) => ({ ...prev, [id]: val }));
    };

    const renderHeader = (
      isFullscreen: boolean,
      toggleFullscreen: () => void,
      remove: () => void,
    ) => (
      <>
        <div className="pane-header-left">
          <span className="demo-pane-title">{id.toUpperCase()}</span>
          <select
            value={activeWidget}
            onChange={(e) => handleWidgetChange(e.target.value)}
            className="demo-select-widget"
          >
            <option value="guide">💡 Guide Menu</option>
            <option value="chart">📈 Analytics Trend</option>
            <option value="bar">📊 Monthly Revenue</option>
            <option value="table">📋 User Table</option>
            <option value="performance">⚡ Performance Gauges</option>
          </select>
        </div>
        <div className="demo-pane-actions">
          <button className="demo-btn" onClick={toggleFullscreen}>
            {isFullscreen ? 'Collapse' : 'Expand'}
          </button>
          {showCloseButtons && (
            <button className="demo-btn demo-btn-close" onClick={remove}>
              ×
            </button>
          )}
        </div>
      </>
    );

    return (
      <Pane id={id}>
        {(paneProps) => {
          const headerContent = renderHeader(
            paneProps.isFullscreen,
            paneProps.toggleFullscreen,
            paneProps.remove,
          );

          return (
            <div className={`demo-pane-inner ${paneProps.isDragging ? 'demo-dragging' : ''}`}>
              {enableDragHandles ? (
                <DragHandle className="demo-pane-header">{headerContent}</DragHandle>
              ) : (
                <div className="demo-pane-header no-grab">{headerContent}</div>
              )}
              <div className="demo-pane-body">
                {activeWidget === 'chart' && <TrendChartWidget />}
                {activeWidget === 'bar' && <BarChartWidget />}
                {activeWidget === 'table' && <TableWidget />}
                {activeWidget === 'performance' && <PerformanceWidget />}
                {activeWidget === 'guide' && <DefaultGuideWidget paneId={id} />}
              </div>
            </div>
          );
        }}
      </Pane>
    );
  };

  return (
    <div className="demo-container">
      {/* Control Panel Sidebar */}
      <aside className="demo-sidebar">
        <div className="sidebar-section">
          <h3>Preset Layouts</h3>
          <div className="presets-grid">
            <button className="btn-preset" onClick={() => applyPreset('standard')}>
              Standard Grid
            </button>
            <button className="btn-preset" onClick={() => applyPreset('horizontal')}>
              Horizontal Split
            </button>
            <button className="btn-preset" onClick={() => applyPreset('vertical')}>
              Vertical Split
            </button>
            <button className="btn-preset" onClick={() => applyPreset('complex')}>
              Complex Mosaic
            </button>
            <button className="btn-preset btn-preset-danger" onClick={() => applyPreset('empty')}>
              Empty (Zero State)
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Behavior Toggles</h3>
          <div className="toggles-list">
            <label className="toggle-item">
              <input type="checkbox" checked={persist} onChange={togglePersist} />
              <span>Persist in storage</span>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={showCloseButtons}
                onChange={(e) => setShowCloseButtons(e.target.checked)}
              />
              <span>Show close buttons</span>
            </label>

            <label className="toggle-item">
              <input
                type="checkbox"
                checked={enableDragHandles}
                onChange={(e) => setEnableDragHandles(e.target.checked)}
              />
              <span>Enable drag-handles</span>
            </label>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Actions</h3>
          <div className="actions-flex">
            <button className="btn btn-add" onClick={handleAdd}>
              Add Pane
            </button>
            <button className="btn" onClick={resetLayout}>
              Reset
            </button>
            {persist && (
              <button className="btn btn-secondary" onClick={clearStorage}>
                Clear Storage
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-section json-visualizer-section">
          <h3>Serialized State (JSON)</h3>
          <div className="json-container">
            <pre>
              <code>{layout ? JSON.stringify(layout, null, 2) : 'null'}</code>
            </pre>
          </div>
        </div>
      </aside>

      {/* Tiling Mosaic Workspace */}
      <main className="demo-viewport-wrapper">
        <div className="demo-viewport">
          {layout ? (
            <DashboardProvider
              layout={layout}
              onChange={setLayout}
              classNames={classNames}
              fullscreenPaneId={fullscreenId}
              onFullscreenChange={setFullscreenId}
              onRemove={handleRemove}
              renderPane={renderDemoPane}
              renderDragOverlay={(id) => (
                <div className="demo-drag-overlay">Dragging {id.toUpperCase()}</div>
              )}
            >
              <PaneTree />
            </DashboardProvider>
          ) : (
            <div className="demo-zero-state">
              <div className="zero-state-content">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                <h3>No Panes Active</h3>
                <p>Add a new pane or apply a layout preset to begin editing.</p>
                <button className="btn btn-add" onClick={handleAdd}>
                  Add First Pane
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
