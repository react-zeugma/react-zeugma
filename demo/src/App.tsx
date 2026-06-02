import { useState, useEffect } from 'react';
import { TreeNode, addPane, removePane } from 'react-zeugma';
import HomeTab from './components/home-tab';
import DemoTab from './components/demo-tab';
import DocsTabComponent from './components/docs-tab';

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

const presets: Record<string, TreeNode | null> = {
  standard: initialLayout,
  horizontal: {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'pane-1' },
    second: { type: 'pane', paneId: 'pane-2' },
  },
  vertical: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'pane-1' },
    second: { type: 'pane', paneId: 'pane-2' },
  },
  complex: {
    type: 'split',
    direction: 'row',
    splitPercentage: 40,
    first: {
      type: 'split',
      direction: 'column',
      splitPercentage: 35,
      first: { type: 'pane', paneId: 'pane-1' },
      second: { type: 'pane', paneId: 'pane-2' },
    },
    second: {
      type: 'split',
      direction: 'column',
      splitPercentage: 50,
      first: { type: 'pane', paneId: 'pane-3' },
      second: {
        type: 'split',
        direction: 'row',
        splitPercentage: 50,
        first: { type: 'pane', paneId: 'pane-4' },
        second: { type: 'pane', paneId: 'pane-5' },
      },
    },
  },
  empty: null,
};

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

// Lightweight parser to extract current hash-based routing information
function parseLocation(): { tab: 'home' | 'demo' | 'docs'; section?: string } {
  const hash = window.location.hash; // e.g. "#/docs/api-reference" or "#/demo"
  if (hash.startsWith('#/demo')) {
    return { tab: 'demo' };
  }
  if (hash.startsWith('#/docs')) {
    const parts = hash.split('/');
    return { tab: 'docs', section: parts[2] || undefined };
  }
  return { tab: 'home' };
}

export default function App() {
  // Navigation State driven by hash location
  const [loc, setLoc] = useState(() => parseLocation());

  useEffect(() => {
    // Set default hash if none exists
    if (!window.location.hash) {
      window.location.hash = '#/';
    }

    const handleHashChange = () => {
      setLoc(parseLocation());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setTab = (newTab: 'home' | 'demo' | 'docs') => {
    if (newTab === 'home') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/${newTab}`;
    }
  };

  // Mosaic Grid State
  const [persist, setPersist] = useState(() => {
    try {
      return localStorage.getItem(PERSIST_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [layout, setLayout] = useState<TreeNode | null>(loadLayout);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  // Behavioral Toggle States
  const [showCloseButtons, setShowCloseButtons] = useState(true);
  const [enableDragHandles, setEnableDragHandles] = useState(true);

  // Layout Event Handlers
  const handleLayoutChange = (newLayout: TreeNode | null) => {
    setLayout(newLayout);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
      } catch {
        /* ignore */
      }
    }
  };

  const togglePersist = () => {
    const next = !persist;
    setPersist(next);
    try {
      localStorage.setItem(PERSIST_KEY, String(next));
      if (next) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  };

  const clearStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PERSIST_KEY);
    } catch {
      /* ignore */
    }
    setPersist(false);
    setLayout(initialLayout);
    setFullscreenId(null);
  };

  const resetLayout = () => {
    handleLayoutChange(initialLayout);
    setFullscreenId(null);
  };

  const handleAdd = () => {
    const id = `pane-${Date.now().toString().slice(-4)}`;
    const newLayout = addPane(layout, id);
    handleLayoutChange(newLayout);
  };

  const handleRemove = (paneId: string) => {
    if (fullscreenId === paneId) setFullscreenId(null);
    const newLayout = removePane(layout, paneId);
    handleLayoutChange(newLayout);
  };

  const applyPreset = (presetName: string) => {
    const nextLayout = presets[presetName] !== undefined ? presets[presetName] : initialLayout;
    handleLayoutChange(nextLayout);
    setFullscreenId(null);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-title-group" onClick={() => setTab('home')}>
            <img src="/logo.png" alt="react-zeugma" className="app-logo" />
            <div>
              <h1>react-zeugma</h1>
              <p className="app-subtitle-tag">Recursive Mosaic Layouts</p>
            </div>
          </div>
        </div>

        <nav className="app-tabs">
          <button
            className={`tab-btn ${loc.tab === 'home' ? 'active' : ''}`}
            onClick={() => setTab('home')}
          >
            Home
          </button>
          <button
            className={`tab-btn ${loc.tab === 'demo' ? 'active' : ''}`}
            onClick={() => setTab('demo')}
          >
            Demo
          </button>
          <button
            className={`tab-btn ${loc.tab === 'docs' ? 'active' : ''}`}
            onClick={() => setTab('docs')}
          >
            Docs
          </button>
        </nav>

        <div className="app-header-right">
          <a
            href="https://github.com/yusufarsln98/react-zeugma"
            target="_blank"
            rel="noreferrer"
            className="github-link"
            aria-label="GitHub Repository"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* Main Tab Area */}
      <div className="tab-viewport">
        {loc.tab === 'home' && <HomeTab onTabChange={setTab} />}

        {loc.tab === 'demo' && (
          <DemoTab
            layout={layout}
            setLayout={handleLayoutChange}
            persist={persist}
            togglePersist={togglePersist}
            clearStorage={clearStorage}
            resetLayout={resetLayout}
            handleAdd={handleAdd}
            handleRemove={handleRemove}
            fullscreenId={fullscreenId}
            setFullscreenId={setFullscreenId}
            showCloseButtons={showCloseButtons}
            setShowCloseButtons={setShowCloseButtons}
            enableDragHandles={enableDragHandles}
            setEnableDragHandles={setEnableDragHandles}
            applyPreset={applyPreset}
          />
        )}

        {loc.tab === 'docs' && <DocsTabComponent activeSectionId={loc.section} />}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2026 react-zeugma layout engine. Released under the MIT License.</p>
          <div className="footer-links">
            <span className="footer-origin-text">
              Gaziantep Zeugma Mosaics: many tiles, one masterpiece.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
