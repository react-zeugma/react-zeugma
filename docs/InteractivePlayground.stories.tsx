import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  DashboardProvider,
  PaneTree,
  Pane,
  DragHandle,
  addPane,
  removePane,
  type TreeNode,
  type ZeugmaClassNames,
} from '../src'

const storyStyles = `
  .playground-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #cdd6f4;
    background: #11111b;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 600px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    user-select: none;
  }

  .playground-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #181825;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #313244;
  }

  .playground-btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    outline: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-primary {
    background: #89b4fa;
    color: #11111b;
  }
  .btn-primary:hover {
    background: #b4befe;
    box-shadow: 0 0 12px rgba(137, 180, 250, 0.4);
  }

  .btn-secondary {
    background: #313244;
    color: #cdd6f4;
    border: 1px solid #45475a;
  }
  .btn-secondary:hover {
    background: #45475a;
  }

  .btn-danger {
    background: #f38ba8;
    color: #11111b;
  }
  .btn-danger:hover {
    background: #f2cdcd;
    box-shadow: 0 0 12px rgba(243, 139, 168, 0.4);
  }

  .playground-dashboard {
    flex: 1;
    background: #11111b;
    border-radius: 8px;
    border: 1px solid #313244;
    overflow: hidden;
    position: relative;
  }

  .story-pane {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #1e1e2e;
    border: 1px solid #313244;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: border-color 0.2s ease;
  }
  .story-pane:hover {
    border-color: #45475a;
  }

  .story-pane-header {
    padding: 10px 14px;
    background: #181825;
    color: #cdd6f4;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    cursor: grab;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #313244;
  }

  .story-pane-header:active {
    cursor: grabbing;
  }

  .pane-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pane-btn {
    background: transparent;
    border: none;
    color: #a6adc8;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pane-btn:hover {
    background: #313244;
    color: #f38ba8;
  }

  .story-pane-body {
    flex: 1;
    padding: 16px;
    color: #a6adc8;
    font-size: 13px;
    line-height: 1.6;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: radial-gradient(circle at center, #1e1e2e 0%, #181825 100%);
  }

  .pane-subtitle {
    font-size: 11px;
    color: #585b70;
    margin-top: 6px;
  }

  .story-resizer {
    background: #313244;
    transition: background 0.2s ease, box-shadow 0.2s ease;
    z-index: 40;
  }
  .story-resizer:hover,
  .story-resizer[data-resizing="true"] {
    background: #89b4fa;
    box-shadow: 0 0 8px rgba(137, 180, 250, 0.6);
  }

  .story-drop-preview {
    background: rgba(137, 180, 250, 0.1);
    border: 2px dashed #89b4fa;
    border-radius: 8px;
    box-shadow: inset 0 0 20px rgba(137, 180, 250, 0.15);
  }

  .story-swap-preview {
    background: rgba(166, 227, 161, 0.1);
    border: 2px dashed #a6e3a1;
    border-radius: 8px;
    box-shadow: inset 0 0 20px rgba(166, 227, 161, 0.15);
  }
`

const classNames: ZeugmaClassNames = {
  pane: 'story-pane-wrapper',
  resizer: 'story-resizer',
  dropPreview: 'story-drop-preview',
  swapPreview: 'story-swap-preview',
}

const defaultLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 30,
  first: { type: 'pane', paneId: 'Pane #1' },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'Pane #2' },
    second: { type: 'pane', paneId: 'Pane #3' },
  },
}

function InteractivePlayground() {
  const [layout, setLayout] = useState<TreeNode | null>(defaultLayout)
  const [paneCounter, setPaneCounter] = useState(4)

  const handleAddPane = () => {
    const newId = `Pane #${paneCounter}`
    setPaneCounter((prev) => prev + 1)
    const newLayout = addPane(layout, newId)
    setLayout(newLayout)
  }

  const handleRemovePane = (id: string) => {
    const newLayout = removePane(layout, id)
    setLayout(newLayout)
  }

  const handleReset = () => {
    setLayout(defaultLayout)
    setPaneCounter(4)
  }

  const handleClear = () => {
    setLayout(null)
  }

  return (
    <>
      <style>{storyStyles}</style>
      <div className="playground-container">
        <div className="playground-toolbar">
          <button className="playground-btn btn-primary" onClick={handleAddPane}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Pane
          </button>
          <button className="playground-btn btn-secondary" onClick={handleReset}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            Reset Layout
          </button>
          <button className="playground-btn btn-danger" onClick={handleClear}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Clear All
          </button>
        </div>

        <div className="playground-dashboard">
          {layout ? (
            <DashboardProvider
              layout={layout}
              onChange={setLayout}
              classNames={classNames}
              renderPane={(id) => (
                <Pane id={id}>
                  {({ isDragging }) => (
                    <div className="story-pane" style={{ opacity: isDragging ? 0.4 : 1 }}>
                      <DragHandle className="story-pane-header">
                        <span>{id}</span>
                        <div
                          className="pane-header-actions"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <button
                            className="pane-btn"
                            onClick={() => handleRemovePane(id)}
                            title="Close Pane"
                          >
                            ✕
                          </button>
                        </div>
                      </DragHandle>
                      <div className="story-pane-body">
                        <div>Drag header to reposition / split</div>
                        <div className="pane-subtitle">Drag borders to resize with magnet snap</div>
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
                color: '#6c7086',
              }}
            >
              <p>No panes active. Click "Add Pane" to start.</p>
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
    layout: 'padded',
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
  render: () => <InteractivePlayground />,
}
