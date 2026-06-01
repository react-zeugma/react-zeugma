import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  DashboardProvider,
  PaneTree,
  Pane,
  DragHandle,
  type TreeNode,
  type ZeugmaClassNames,
} from '../src';

/**
 * A basic 2×2 grid layout demonstrating the core `react-zeugma` components.
 *
 * This example renders four panes arranged in a 2×2 grid using nested `SplitNode`s:
 * - The root splits horizontally (row) into left and right halves.
 * - Each half splits vertically (column) into top and bottom panes.
 *
 * Try dragging the pane headers to rearrange, or drag the split bars to resize.
 */

const PANE_COLORS: Record<string, string> = {
  'top-left': '#1e1e2e',
  'top-right': '#1e2030',
  'bottom-left': '#181825',
  'bottom-right': '#11111b',
};

const PANE_LABELS: Record<string, string> = {
  'top-left': 'Dashboard',
  'top-right': 'Editor',
  'bottom-left': 'Explorer',
  'bottom-right': 'Terminal',
};

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'top-left' },
    second: { type: 'pane', paneId: 'bottom-left' },
  },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'top-right' },
    second: { type: 'pane', paneId: 'bottom-right' },
  },
};

const storyStyles = `
  .story-pane {
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid #313244;
    border-radius: 6px;
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  .story-pane-header {
    padding: 8px 12px;
    background: #313244;
    color: #cdd6f4;
    font-size: 13px;
    font-weight: 600;
    cursor: grab;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid #45475a;
  }

  .story-pane-header:active {
    cursor: grabbing;
  }

  .story-pane-body {
    flex: 1;
    padding: 16px;
    color: #a6adc8;
    font-size: 13px;
    line-height: 1.6;
  }

  .story-resizer {
    background: #45475a;
    transition: background 0.15s ease;
  }

  .story-resizer:hover {
    background: #89b4fa;
  }

  .story-drop-preview {
    background: rgba(137, 180, 250, 0.15);
    border: 2px dashed #89b4fa;
    border-radius: 6px;
  }

  .story-swap-preview {
    background: rgba(166, 227, 161, 0.15);
    border: 2px dashed #a6e3a1;
    border-radius: 6px;
  }
`;

const classNames: ZeugmaClassNames = {
  pane: 'story-pane-wrapper',
  resizer: 'story-resizer',
  dropPreview: 'story-drop-preview',
  swapPreview: 'story-swap-preview',
};

function StoryPane({ id }: { id: string }) {
  const bg = PANE_COLORS[id] || '#1e1e2e';
  const label = PANE_LABELS[id] || id;

  return (
    <Pane id={id}>
      {({ isDragging }) => (
        <div className="story-pane" style={{ background: bg, opacity: isDragging ? 0.5 : 1 }}>
          <DragHandle className="story-pane-header">
            <span>{label}</span>
          </DragHandle>
          <div className="story-pane-body">
            <p>
              This is the <strong>{label}</strong> pane.
            </p>
            <p>Drag the header to reposition. Drop on edges to split.</p>
          </div>
        </div>
      )}
    </Pane>
  );
}

function BasicGrid() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout);

  return (
    <>
      <style>{storyStyles}</style>
      <div
        style={{
          width: '100%',
          height: '500px',
          background: '#11111b',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <DashboardProvider
          layout={layout}
          onChange={setLayout}
          classNames={classNames}
          renderPane={(id) => <StoryPane id={id} />}
        >
          <PaneTree />
        </DashboardProvider>
      </div>
    </>
  );
}

const meta: Meta = {
  title: 'Examples/Basic 2×2 Grid',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A hardcoded 2×2 grid layout demonstrating the core react-zeugma components. Four panes are arranged in a grid using nested SplitNodes. Drag headers to rearrange panes, and drag split bars to resize.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/**
 * The default 2×2 grid layout with four labeled panes.
 *
 * Drag the pane headers to rearrange, or drag the split bars to resize.
 */
export const Default: Story = {
  render: () => <BasicGrid />,
};
