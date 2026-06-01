import { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode, ZeugmaClassNames, removePane } from 'react-zeugma';

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: {
    type: 'pane',
    paneId: 'pane-1',
  },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: {
      type: 'pane',
      paneId: 'pane-2',
    },
    second: {
      type: 'pane',
      paneId: 'pane-3',
    },
  },
};

const classNames: ZeugmaClassNames = {
  pane: 'demo-pane',
  dropPreview: 'demo-drop-preview',
  swapPreview: 'demo-swap-preview',
  dragOverlay: 'demo-drag-overlay-wrapper',
  resizer: 'demo-resizer',
};

function DemoPane({ id, label }: { id: string; label: string }) {
  return (
    <Pane id={id}>
      {({ isDragging, isFullscreen, toggleFullscreen, remove }) => (
        <div className={`demo-pane-inner ${isDragging ? 'demo-dragging' : ''}`}>
          <DragHandle className="demo-pane-header">
            <span className="demo-pane-title">{label}</span>
            <div className="demo-pane-actions">
              <button className="demo-btn" onClick={toggleFullscreen}>
                {isFullscreen ? 'Exit' : 'Full'}
              </button>
              <button className="demo-btn demo-btn-close" onClick={remove}>×</button>
            </div>
          </DragHandle>
          <div className="demo-pane-body">
            <p>Content for {label}</p>
          </div>
        </div>
      )}
    </Pane>
  );
}

const STORAGE_KEY = 'zeugma-demo-layout';
const PERSIST_KEY = 'zeugma-demo-persist';

function loadLayout(): TreeNode | null {
  try {
    if (localStorage.getItem(PERSIST_KEY) !== 'true') return initialLayout;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialLayout;
  } catch {
    return initialLayout;
  }
}

export default function App() {
  const [persist, setPersist] = useState(() => localStorage.getItem(PERSIST_KEY) === 'true');
  const [layout, setLayout] = useState<TreeNode | null>(loadLayout);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const handleLayoutChange = (newLayout: TreeNode | null) => {
    setLayout(newLayout);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout)); } catch { /* ignore */ }
    }
  };

  const togglePersist = () => {
    const next = !persist;
    setPersist(next);
    localStorage.setItem(PERSIST_KEY, String(next));
    if (next) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch { /* ignore */ }
    }
  };

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PERSIST_KEY);
    setPersist(false);
    setLayout(initialLayout);
    setFullscreenId(null);
  };

  const resetLayout = () => {
    handleLayoutChange(initialLayout);
    setFullscreenId(null);
  };

  const addPane = () => {
    const id = `pane-${Date.now().toString().slice(-4)}`;
    const newNode: TreeNode = { type: 'pane', paneId: id };

    if (!layout) {
      handleLayoutChange(newNode);
    } else {
      handleLayoutChange({
        type: 'split',
        direction: 'row',
        splitPercentage: 50,
        first: layout,
        second: newNode,
      });
    }
  };

  const handleRemove = (paneId: string) => {
    if (fullscreenId === paneId) setFullscreenId(null);
    const newLayout = removePane(layout, paneId);
    handleLayoutChange(newLayout);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title-group">
          <img src="/logo.png" alt="react-zeugma" className="app-logo" />
          <div>
            <h1>react-zeugma</h1>
            <p>Drag headers to reposition. Drop on edges to split.</p>
          </div>
        </div>
        <div className="app-actions">
          <label className="persist-toggle">
            <input type="checkbox" checked={persist} onChange={togglePersist} />
            Persist
          </label>
          {persist && <button className="btn" onClick={clearStorage}>Clear Storage</button>}
          <button className="btn" onClick={resetLayout}>Reset</button>
          <button className="btn btn-primary" onClick={addPane}>Add Pane</button>
        </div>
      </header>

      <main className="dashboard-viewport">
        <DashboardProvider
          layout={layout}
          onChange={handleLayoutChange}
          classNames={classNames}
          fullscreenPaneId={fullscreenId}
          onFullscreenChange={setFullscreenId}
          onRemove={handleRemove}
          renderPane={(id) => <DemoPane id={id} label={id.toUpperCase()} />}
          renderDragOverlay={(id) => <div className="demo-drag-overlay">{id}</div>}
        >
          <PaneTree />
        </DashboardProvider>
      </main>
    </div>
  );
}
