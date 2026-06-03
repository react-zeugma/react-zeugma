import type { Meta, StoryObj } from '@storybook/react-vite'
import React, { useState, useCallback } from 'react'
import {
  DashboardProvider,
  PaneTree,
  Pane,
  DragHandle,
  addPane,
  removePane,
  type TreeNode,
  type ZeugmaClassNames,
  type SplitNode,
  type ResizerRenderProps,
} from '../src'

// Custom styling matching homepage aesthetics
const storyStyles = `
  .demo-container {
    font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
    color: #e4e4e7;
    background: #09090b;
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
    box-sizing: border-box;
    overflow: hidden;
  }

  .demo-sidebar {
    width: 320px;
    background: #18181b;
    border-right: 1px solid #27272a;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #27272a;
    background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    letter-spacing: 0.5px;
    background: linear-gradient(to right, #a5b4fc, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sidebar-subtitle {
    font-size: 11px;
    color: #a1a1aa;
    margin-top: 4px;
  }

  .sidebar-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section-title {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #71717a;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .demo-btn {
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #27272a;
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #27272a;
    color: #f4f4f5;
  }

  .demo-btn:hover {
    background: #3f3f46;
    border-color: #52525b;
  }

  .btn-primary {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  }

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .setting-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #a1a1aa;
  }

  .setting-value {
    color: #6366f1;
    font-weight: 600;
  }

  .setting-checkbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 13px;
    color: #e4e4e7;
    margin-bottom: 12px;
    user-select: none;
  }

  .setting-checkbox input {
    accent-color: #6366f1;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .demo-slider {
    width: 100%;
    accent-color: #6366f1;
    cursor: pointer;
    background: #27272a;
    height: 4px;
    border-radius: 2px;
    border: none;
    outline: none;
  }

  .log-container {
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 10px;
    font-family: monospace;
    font-size: 11px;
    height: 120px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .log-entry {
    color: #a1a1aa;
    line-height: 1.4;
  }

  .log-time {
    color: #71717a;
    margin-right: 6px;
  }

  .log-type-drag {
    color: #f59e0b;
  }

  .log-type-resize {
    color: #10b981;
  }

  .tree-viewer {
    background: #09090b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 10px;
    font-family: monospace;
    font-size: 11px;
    max-height: 150px;
    overflow-y: auto;
    color: #38bdf8;
    white-space: pre-wrap;
  }

  .demo-workspace {
    flex: 1;
    background: #09090b;
    padding: 16px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }

  .pane-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    transition: border-color 0.2s ease;
  }

  .pane-card:hover {
    border-color: #3f3f46;
  }

  .pane-header {
    padding: 10px 14px;
    background: #27272a;
    color: #f4f4f5;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    cursor: grab;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #18181b;
  }

  .pane-header:active {
    cursor: grabbing;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-btn {
    background: transparent;
    border: none;
    color: #a1a1aa;
    cursor: pointer;
    font-size: 13px;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .header-btn:hover {
    background: #3f3f46;
    color: #ffffff;
  }

  .header-btn-danger:hover {
    background: #ef4444;
    color: #ffffff;
  }

  .pane-content {
    flex: 1;
    padding: 20px;
    color: #a1a1aa;
    font-size: 13px;
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: radial-gradient(circle at center, #18181b 0%, #09090b 100%);
  }

  .pane-badge {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    color: #818cf8;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .story-resizer-default {
    background: #27272a;
    transition: background 0.2s ease, box-shadow 0.2s ease;
    z-index: 45;
  }
  .story-resizer-default:hover,
  .story-resizer-default[data-resizing="true"] {
    background: #6366f1;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
  }

  .story-drop-preview {
    background: rgba(99, 102, 241, 0.08);
    border: 2px dashed #6366f1;
    border-radius: 10px;
    box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.15);
  }

  .story-swap-preview {
    background: rgba(245, 158, 11, 0.08);
    border: 2px dashed #f59e0b;
    border-radius: 10px;
    box-shadow: inset 0 0 20px rgba(245, 158, 11, 0.15);
  }
`

const classNames: ZeugmaClassNames = {
  pane: 'story-pane-wrapper',
  resizer: 'story-resizer-default',
  dropPreview: 'story-drop-preview',
  swapPreview: 'story-swap-preview',
}

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 25,
  first: { type: 'pane', paneId: 'Explorer' },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 60,
    first: { type: 'pane', paneId: 'Editor' },
    second: { type: 'pane', paneId: 'Preview' },
  },
}

interface LogEntry {
  id: string
  time: string
  type: 'drag' | 'resize'
  message: string
}

function CompleteDemoApplication() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout)
  const [fullscreenPaneId, setFullscreenPaneId] = useState<string | null>(null)

  // Customization states
  const [useCustomResizer, setUseCustomResizer] = useState(true)
  const [snapThreshold, setSnapThreshold] = useState(12)
  const [minSplit, setMinSplit] = useState(15)
  const [maxSplit, setMaxSplit] = useState(85)
  const [paneCounter, setPaneCounter] = useState(1)

  // Log states
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((type: 'drag' | 'resize', message: string) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const entry: LogEntry = {
      id: Math.random().toString(),
      time: timeStr,
      type,
      message,
    }
    setLogs((prev) => [entry, ...prev].slice(0, 8))
  }, [])

  // Callbacks
  const handleDragStart = useCallback(
    (activeId: string) => {
      addLog('drag', `Started dragging "${activeId}"`)
    },
    [addLog],
  )

  const handleDragEnd = useCallback(
    (
      activeId: string,
      overId: string | null,
      dropAction: {
        type: 'split' | 'swap'
        direction?: 'row' | 'column'
        position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
      } | null,
    ) => {
      if (!overId) {
        addLog('drag', `Released "${activeId}" without drop target`)
      } else if (dropAction) {
        const detail =
          dropAction.type === 'split'
            ? `split-${dropAction.position} onto "${overId}"`
            : `swapped with "${overId}"`
        addLog('drag', `Dropped "${activeId}": ${detail}`)
      }
    },
    [addLog],
  )

  const handleResizeStart = useCallback(
    (node: SplitNode) => {
      const directionLabel = node.direction === 'row' ? 'Horizontal' : 'Vertical'
      addLog('resize', `Start resizing ${directionLabel} split`)
    },
    [addLog],
  )

  const handleResize = useCallback((_node: SplitNode, _percentage: number) => {
    // Resize stream active
  }, [])

  const handleResizeEnd = useCallback(
    (node: SplitNode, percentage: number) => {
      const directionLabel = node.direction === 'row' ? 'Horizontal' : 'Vertical'
      addLog('resize', `Resized ${directionLabel} split to ${percentage.toFixed(1)}%`)
    },
    [addLog],
  )

  // Custom Resizer Component Renderer
  const renderCustomResizer = useCallback(
    ({
      direction,
      splitPercentage: _splitPercentage,
      isResizing,
      onPointerDown,
    }: ResizerRenderProps) => {
      const isRow = direction === 'row'
      return (
        <div
          role="separator"
          data-direction={direction}
          onPointerDown={onPointerDown}
          className={`transition-all duration-200 z-50 flex items-center justify-center select-none ${
            isRow ? 'w-2 h-full cursor-col-resize' : 'h-2 w-full cursor-row-resize'
          } ${
            isResizing
              ? 'bg-indigo-500 shadow-[0_0_12px_#6366f1]'
              : 'bg-zinc-800 hover:bg-indigo-500/40'
          }`}
        >
          <div
            className={`rounded-full transition-all duration-200 ${
              isResizing ? 'bg-white scale-125' : 'bg-indigo-400/60'
            } ${isRow ? 'w-1 h-5' : 'w-5 h-1'}`}
          />
        </div>
      )
    },
    [minSplit, maxSplit],
  )

  const addRandomPane = () => {
    const newId = `Widget #${paneCounter}`
    setPaneCounter((prev) => prev + 1)
    setLayout((prev) => addPane(prev, newId))
    addLog('drag', `Programmatically added "${newId}"`)
  }

  const reset = () => {
    setLayout(initialLayout)
    setFullscreenPaneId(null)
    addLog('drag', 'Reset layout to default')
  }

  const clear = () => {
    setLayout(null)
    setFullscreenPaneId(null)
    addLog('drag', 'Cleared layout tree')
  }

  const handleRemovePane = (id: string) => {
    setLayout((prev) => removePane(prev, id))
  }

  return (
    <>
      <style>{storyStyles}</style>
      <div className="demo-container">
        {/* Sidebar Controls */}
        <div className="demo-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">react-zeugma Demo</h2>
            <div className="sidebar-subtitle">Flexible split dashboard engine for React</div>
          </div>

          <div className="sidebar-content">
            {/* Actions */}
            <div>
              <div className="section-title">Layout Mutators</div>
              <div className="btn-group">
                <button className="demo-btn btn-primary" onClick={addRandomPane}>
                  Add Custom Widget
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="demo-btn" style={{ flex: 1 }} onClick={reset}>
                    Reset
                  </button>
                  <button className="demo-btn" style={{ flex: 1 }} onClick={clear}>
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Constraints Settings */}
            <div>
              <div className="section-title">Adjustable Limits & Settings</div>

              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={useCustomResizer}
                  onChange={(e) => setUseCustomResizer(e.target.checked)}
                />
                Use Custom Resizer
              </label>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Snap Threshold</span>
                  <span className="setting-value">{snapThreshold}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={snapThreshold}
                  onChange={(e) => setSnapThreshold(Number(e.target.value))}
                  className="demo-slider"
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Min Split Bounds</span>
                  <span className="setting-value">{minSplit}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={minSplit}
                  onChange={(e) => setMinSplit(Number(e.target.value))}
                  className="demo-slider"
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <span>Max Split Bounds</span>
                  <span className="setting-value">{maxSplit}%</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="95"
                  value={maxSplit}
                  onChange={(e) => setMaxSplit(Number(e.target.value))}
                  className="demo-slider"
                />
              </div>
            </div>

            {/* Event Logs */}
            <div>
              <div className="section-title">Interactive Callback Logs</div>
              <div className="log-container">
                {logs.length === 0 ? (
                  <div style={{ color: '#52525b', fontStyle: 'italic' }}>
                    Perform drag/resize actions to see logs...
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="log-entry">
                      <span className="log-time">{log.time}</span>
                      <span className={log.type === 'drag' ? 'log-type-drag' : 'log-type-resize'}>
                        [{log.type.toUpperCase()}]
                      </span>{' '}
                      {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Serializable Layout Tree */}
            <div>
              <div className="section-title">Serialized Layout Tree</div>
              <div className="tree-viewer">{JSON.stringify(layout, null, 2)}</div>
            </div>
          </div>
        </div>

        {/* Dashboard Area */}
        <div className="demo-workspace">
          {layout || fullscreenPaneId ? (
            <DashboardProvider
              layout={layout}
              onChange={setLayout}
              classNames={classNames}
              fullscreenPaneId={fullscreenPaneId}
              onFullscreenChange={setFullscreenPaneId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onResizeStart={handleResizeStart}
              onResize={handleResize}
              onResizeEnd={handleResizeEnd}
              snapThreshold={snapThreshold}
              minSplitPercentage={minSplit}
              maxSplitPercentage={maxSplit}
              renderResizer={useCustomResizer ? renderCustomResizer : undefined}
              renderPane={(id) => (
                <Pane id={id}>
                  {({ isDragging, isFullscreen, toggleFullscreen }) => (
                    <div className="pane-card" style={{ opacity: isDragging ? 0.4 : 1 }}>
                      <DragHandle className="pane-header">
                        <span>{id}</span>
                        <div className="header-actions" onPointerDown={(e) => e.stopPropagation()}>
                          <button
                            className="header-btn"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                          >
                            {isFullscreen ? '❐' : '⛶'}
                          </button>
                          <button
                            className="header-btn header-btn-danger"
                            onClick={() => handleRemovePane(id)}
                            title="Close Pane"
                          >
                            ✕
                          </button>
                        </div>
                      </DragHandle>
                      <div className="pane-content">
                        <div className="pane-badge">Component Node</div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#f4f4f5',
                            marginBottom: '4px',
                          }}
                        >
                          {id}
                        </div>
                        <div style={{ fontSize: '11px', color: '#71717a' }}>
                          Drag header to split or swap
                        </div>
                      </div>
                    </div>
                  )}
                </Pane>
              )}
            >
              <PaneTree />
            </DashboardProvider>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#71717a',
              }}
            >
              <p style={{ marginBottom: '12px' }}>No active panels in workspace.</p>
              <button
                className="demo-btn btn-primary"
                onClick={() => {
                  setLayout(initialLayout)
                  addLog('drag', 'Restored initial layout')
                }}
              >
                Restore Default Layout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const meta: Meta = {
  title: 'Examples/Interactive Playground',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive interactive dashboard builder. Add, remove, rearrange, and resize panes. Resizer edges will align and snap to each other (magnet effect) when dragged close.',
      },
    },
  },
}

export default meta

type Story = StoryObj

export const Interactive: Story = {
  render: () => <CompleteDemoApplication />,
}
