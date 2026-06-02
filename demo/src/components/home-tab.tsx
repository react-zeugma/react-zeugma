interface HomeTabProps {
  onTabChange: (tab: 'home' | 'demo' | 'docs') => void;
}

export default function HomeTab({ onTabChange }: HomeTabProps) {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-badge">v0.1.2 • React 18 & 19 Ready</div>
        <h1 className="hero-title">
          Assemble Beautiful Dashboards like a <span className="gradient-text">Mosaic</span>
        </h1>
        <p className="hero-subtitle">
          A recursive, drag-and-drop dashboard layout engine for React. Combines tree-based
          arbitrary splitting with a simple, declarative, and serializable API.
        </p>
        <div className="hero-cta">
          <button className="btn-hero-primary" onClick={() => onTabChange('demo')}>
            Try Live Demo
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <button className="btn-hero-secondary" onClick={() => onTabChange('docs')}>
            Read the Docs
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="home-features">
        <h2 className="section-title">Built for Modern React Applications</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3>5-Zone Drag & Drop</h3>
            <p>
              Drag pane headers onto top, bottom, left, or right edges to split, or drop in the
              center to swap. Dynamic drop previews guide you.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              </svg>
            </div>
            <h3>Recursive Tree Layout</h3>
            <p>
              Split rows and columns nested to any depth. Your dashboard layout is a simple, nested
              tree structure that maps perfectly to code.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h6v6"></path>
                <path d="M9 21H3v-6"></path>
                <path d="M21 3l-7 7"></path>
                <path d="M3 21l7-7"></path>
              </svg>
            </div>
            <h3>Fluid Flexbox Resizing</h3>
            <p>
              Direct resizing of split panes using standard, responsive CSS flexbox layout. No heavy
              layout computation libraries required.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>State Serialization</h3>
            <p>
              Layouts are serializable JSON state objects. Easily save layouts in LocalStorage, sync
              with backend, or restore preset grids.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </div>
            <h3>Fullscreen Pane</h3>
            <p>
              Expand any pane to fill the entire workspace viewport with a single click, then
              collapse it back to its original layout spot seamlessly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3>Zero Runtime CSS</h3>
            <p>
              Bring your own styling framework. Complete control over theme custom class overrides
              for panes, overlays, resizers, and drop boundaries.
            </p>
          </div>
        </div>
      </section>

      {/* Code Sneak Peek */}
      <section className="home-code-sneak">
        <div className="sneak-container">
          <div className="sneak-info">
            <h2 className="section-title text-left">Simple, Declarative Usage</h2>
            <p className="section-desc text-left">
              Create a custom rendering layout with just a few lines of React. Pass the layout state
              and control variables directly to the provider.
            </p>
            <ul className="sneak-list">
              <li>
                <strong>DashboardProvider</strong> coordinates the react-dnd core layout registry.
              </li>
              <li>
                <strong>PaneTree</strong> recursively draws rows and columns dynamically.
              </li>
              <li>
                <strong>Pane</strong> component exports internal states like fullscreen and closure
                triggers.
              </li>
            </ul>
          </div>
          <div className="sneak-editor">
            <div className="editor-header">
              <div className="editor-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="editor-filename">App.tsx</span>
            </div>
            <pre className="editor-body">
              <code>
                {`import { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle } from 'react-zeugma';

export default function App() {
  const [layout, setLayout] = useState({
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'left' },
    second: { type: 'pane', paneId: 'right' }
  });

  return (
    <DashboardProvider
      layout={layout}
      onChange={setLayout}
      renderPane={(id) => (
        <Pane id={id}>
          {() => (
            <div className="my-pane">
              <DragHandle><header>Drag Me</header></DragHandle>
              <div className="body">Content for {id}</div>
            </div>
          )}
        </Pane>
      )}
    >
      <div className="workspace">
        <PaneTree />
      </div>
    </DashboardProvider>
  );
}`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Historical Naming section */}
      <section className="home-heritage">
        <div className="heritage-card">
          <div className="heritage-text">
            <h2>The Story Behind the Name</h2>
            <p>
              <strong>Zeugma</strong> is an ancient Greco-Roman city located on the banks of the
              Euphrates River in Gaziantep, Turkey. Founded around 300 BC, it became a thriving
              cultural crossroads.
            </p>
            <p>
              The city is world-renowned for the <strong>breathtaking mosaic panels</strong>{' '}
              unearthed during excavations — intricate compositions of thousands of tiny tiles (
              <em>tesserae</em>) forming stunning, cohesive scenes.
            </p>
            <blockquote>
              "Just as Zeugma's ancient artisans assembled countless small, individual tiles into
              grand, cohesive masterpieces, <strong>react-zeugma</strong> lets you assemble distinct
              content panes into one unified, responsive workspace."
            </blockquote>
          </div>
          <div className="heritage-visual">
            <div className="mosaic-illustration">
              <div className="tile active" style={{ gridArea: '1 / 1 / 3 / 2' }}>
                Z
              </div>
              <div className="tile" style={{ gridArea: '1 / 2 / 2 / 4' }}>
                E
              </div>
              <div className="tile active" style={{ gridArea: '2 / 2 / 4 / 3' }}>
                U
              </div>
              <div className="tile" style={{ gridArea: '2 / 3 / 3 / 4' }}>
                G
              </div>
              <div className="tile active" style={{ gridArea: '3 / 1 / 4 / 2' }}>
                M
              </div>
              <div className="tile" style={{ gridArea: '3 / 3 / 4 / 4' }}>
                A
              </div>
              <div className="tile active" style={{ gridArea: '4 / 1 / 5 / 4' }}>
                MOSAIC
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
