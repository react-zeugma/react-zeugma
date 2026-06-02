import { useEffect } from 'react';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'installation', label: 'Installation' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'core-concepts', label: 'Core Concepts' },
  { id: 'api-reference', label: 'API Reference' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'llms', label: 'LLMs & AI Agents' },
];

const SKILL_MARKDOWN = `---
name: use-react-zeugma
description: Instructions for AI agents to integrate, configure, style, and programmatically manipulate dashboard layouts using the react-zeugma package.
---

# Skill: Using react-zeugma

This skill guide provides direct instructions for AI agents working with \`react-zeugma\` layouts and contributing to the demo website.

## 1. How to Define Layout States (TreeNode)

Layouts are defined as serializable, recursive trees:
- **PaneNode (Leaf):** \`{ type: 'pane', paneId: 'unique-id' }\`
- **SplitNode (Branch):** \`{ type: 'split', direction: 'row' | 'column', splitPercentage: number, first: TreeNode, second: TreeNode }\`

### Example State Setup
\`\`\`tsx
const initialLayout = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: { type: 'pane', paneId: 'pane-1' },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'pane-2' },
    second: { type: 'pane', paneId: 'pane-3' }
  }
};
\`\`\`

---

## 2. Core Components

### <DashboardProvider>
The root context coordinator. Handles coordinates and resizing callbacks.
- \`layout\`: \`TreeNode | null\`
- \`onChange\`: \`(layout: TreeNode | null) => void\`
- \`renderPane\`: \`(id: string) => ReactNode\` (must return a \`<Pane id={id}>\` element)
- \`fullscreenPaneId\`: \`string | null\` (optional)
- \`onFullscreenChange\`: \`(id: string | null) => void\` (optional)
- \`onRemove\`: \`(id: string) => void\` (optional)
- \`classNames\`: \`ZeugmaClassNames\` (optional)

### <Pane>
Wraps individual content panels. Sets up draggable and droppable zones.
- \`id\`: \`string\`
- Child must be a render function:
  \`\`\`tsx
  <Pane id={id}>
    {({ isDragging, isFullscreen, toggleFullscreen, remove }) => (
      <div className={isDragging ? 'dragging' : ''}>
        <DragHandle><header>Pane Title</header></DragHandle>
        <div>Pane Body Content</div>
      </div>
    )}
  </Pane>
  \`\`\`

### <PaneTree>
Recursively draws the grid. Must reside inside \`<DashboardProvider>\`.
- \`resizerSize\` (optional: number): Split resizer bar thickness in pixels (defaults to \`4\`).

---

## 3. Programmatic Utilities

Import these stateless helpers from \`react-zeugma\` to update layouts programmatically:
- \`addPane(tree, paneId)\`: Appends a pane to the layout tree by splitting the rightmost leaf.
- \`removePane(tree, paneId)\`: Removes a pane from the tree, collapsing its parent split.
- \`splitPane(tree, targetId, direction, newId)\`: Splits a target pane ID in the specified direction.
- \`swapPanes(tree, idA, idB)\`: Swaps the positions of two panes.

---

## 4. Demo Coding Conventions

When editing components inside the \`demo/\` subdirectory:
- **File Names:** Use \`kebab-case\` for components under \`demo/src/components/\` (e.g. \`home-tab.tsx\`, \`docs-tab.tsx\`, \`dashboard-widgets.tsx\`).
- **Routing:** Driven by \`window.location.hash\` changes. Map routes:
  - \`#/\` ➔ Home Tab
  - \`#/demo\` ➔ Demo Tab
  - \`#/docs\` ➔ Docs Tab Index
  - \`#/docs/:section\` ➔ Docs Tab deep-link section (e.g., \`/#/docs/api-reference\` or \`/#/docs/llms\`)
- **Theme Variables:** Premium light theme styled via CSS variables in \`index.css\`.
- **Custom Widgets:** Build custom, responsive SVG/HTML components (e.g., line charts, bar charts, gauges) rather than importing heavy charting packages.
`;

interface DocsTabProps {
  activeSectionId?: string;
}

export default function DocsTab({ activeSectionId }: DocsTabProps) {
  const currentActive = activeSectionId || 'getting-started';

  const scrollToSection = (id: string) => {
    window.location.hash = `#/docs/${id}`;
  };

  useEffect(() => {
    if (activeSectionId) {
      const element = document.getElementById(activeSectionId);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [activeSectionId]);

  const copySkillMarkdown = () => {
    navigator.clipboard
      .writeText(SKILL_MARKDOWN)
      .then(() => {
        alert('SKILL.md copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy to clipboard.');
      });
  };

  return (
    <div className="docs-container">
      {/* Sidebar navigation */}
      <aside className="docs-sidebar">
        <div className="docs-sidebar-title">Documentation</div>
        <nav className="docs-nav">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`docs-nav-link ${currentActive === section.id ? 'active' : ''}`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Docs content */}
      <main className="docs-content-wrapper">
        <article className="docs-content">
          <section id="getting-started" className="docs-section">
            <h1>Getting Started</h1>
            <p>
              <code>react-zeugma</code> is a powerful layout manager for building complex, tiling
              multi-panel dashboard interfaces. It allows users to dynamically arrange widgets,
              resize panes, swap places, split views, and expand individual blocks into fullscreen.
            </p>
            <p>
              It provides a tree-structured layout that can be easily persisted to your databases or
              client-side storage, since state is kept in a plain JSON tree.
            </p>
          </section>

          <hr />

          <section id="installation" className="docs-section">
            <h2>Installation</h2>
            <p>Install the library via npm along with its peer dependencies:</p>
            <div className="code-block-wrapper">
              <pre className="docs-code-block">
                <code>{`npm install react-zeugma`}</code>
              </pre>
            </div>
            <div className="docs-alert docs-alert-info">
              <strong>Peer Dependencies:</strong> Make sure you have <code>react</code> and{' '}
              <code>react-dom</code> (v18.0.0+ or v19.0.0+) installed in your project.
            </div>
          </section>

          <hr />

          <section id="quick-start" className="docs-section">
            <h2>Quick Start</h2>
            <p>
              Here is a basic template to get up and running. Set up your layout state and wrap your
              application in the provider:
            </p>
            <div className="code-block-wrapper">
              <pre className="docs-code-block">
                <code>
                  {`import React, { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma';

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: { type: 'pane', paneId: 'left-panel' },
  second: { type: 'pane', paneId: 'right-panel' },
};

export default function Dashboard() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout);

  return (
    <DashboardProvider
      layout={layout}
      onChange={setLayout}
      renderPane={(id) => (
        <Pane id={id}>
          {({ isDragging, remove }) => (
            <div style={{ height: '100%', background: '#fff', border: '1px solid #ddd' }}>
              <DragHandle>
                <div style={{ cursor: 'grab', background: '#f5f5f5', padding: 8 }}>
                  Header: {id}
                </div>
              </DragHandle>
              <div style={{ padding: 12 }}>
                Panel Content
              </div>
            </div>
          )}
        </Pane>
      )}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <PaneTree />
      </div>
    </DashboardProvider>
  );
}`}
                </code>
              </pre>
            </div>
          </section>

          <hr />

          <section id="core-concepts" className="docs-section">
            <h2>Core Concepts</h2>

            <h3>TreeNode Structure</h3>
            <p>
              The layout is represented as a recursive tree data structure. Each node is either a{' '}
              <strong>PaneNode</strong> (a leaf node representing a layout content pane) or a{' '}
              <strong>SplitNode</strong> (an internal node splitting its two child tree nodes
              horizontally or vertically).
            </p>
            <div className="code-block-wrapper">
              <pre className="docs-code-block">
                <code>
                  {`type TreeNode = PaneNode | SplitNode;

interface PaneNode {
  type: 'pane';
  paneId: string;
}

interface SplitNode {
  type: 'split';
  direction: 'row' | 'column'; // row = horizontal split, column = vertical split
  splitPercentage: number;     // 0 to 100 representing the size of the first child
  first: TreeNode;
  second: TreeNode;
}`}
                </code>
              </pre>
            </div>

            <h3>5-Zone Drag & Drop</h3>
            <p>
              When a user drags a pane by its <code>DragHandle</code>, they can hover over any other
              pane to reveal five drop zones:
            </p>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Visual Action</th>
                  <th>Behavior Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Top</strong>
                  </td>
                  <td>Upper 20% overlay</td>
                  <td>Splits the target pane vertically, placing dragged pane on the top.</td>
                </tr>
                <tr>
                  <td>
                    <strong>Bottom</strong>
                  </td>
                  <td>Lower 20% overlay</td>
                  <td>Splits the target pane vertically, placing dragged pane on the bottom.</td>
                </tr>
                <tr>
                  <td>
                    <strong>Left</strong>
                  </td>
                  <td>Left 20% overlay</td>
                  <td>Splits the target pane horizontally, placing dragged pane on the left.</td>
                </tr>
                <tr>
                  <td>
                    <strong>Right</strong>
                  </td>
                  <td>Right 20% overlay</td>
                  <td>Splits the target pane horizontally, placing dragged pane on the right.</td>
                </tr>
                <tr>
                  <td>
                    <strong>Center</strong>
                  </td>
                  <td>Middle overlay</td>
                  <td>Swaps the positions of the dragged pane and the target pane.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <hr />

          <section id="api-reference" className="docs-section">
            <h2>API Reference</h2>

            <h3>&lt;DashboardProvider /&gt;</h3>
            <p>
              The core context provider managing the drag-and-drop coordinates and node layout
              registry.
            </p>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>layout</code>
                  </td>
                  <td>
                    <code>TreeNode | null</code>
                  </td>
                  <td>Current state of the mosaic layout tree.</td>
                </tr>
                <tr>
                  <td>
                    <code>onChange</code>
                  </td>
                  <td>
                    <code>(layout: TreeNode | null) =&gt; void</code>
                  </td>
                  <td>Callback triggered when layout is split, swapped, or resized.</td>
                </tr>
                <tr>
                  <td>
                    <code>renderPane</code>
                  </td>
                  <td>
                    <code>(paneId: string) =&gt; React.ReactNode</code>
                  </td>
                  <td>
                    Function returning the content of the pane. Should return a{' '}
                    <code>&lt;Pane /&gt;</code> wrapper.
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>classNames</code>
                  </td>
                  <td>
                    <code>ZeugmaClassNames</code>
                  </td>
                  <td>
                    Optional CSS classes to style resizers, drag overlays, and split drop outlines.
                  </td>
                </tr>
              </tbody>
            </table>

            <h3>&lt;Pane /&gt;</h3>
            <p>
              Wraps a specific pane's contents. Accepts a render function as its child, providing
              current states.
            </p>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>State Parameter</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>isDragging</code>
                  </td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>True if the current pane is being dragged.</td>
                </tr>
                <tr>
                  <td>
                    <code>isFullscreen</code>
                  </td>
                  <td>
                    <code>boolean</code>
                  </td>
                  <td>True if this pane has been expanded to full screen.</td>
                </tr>
                <tr>
                  <td>
                    <code>toggleFullscreen</code>
                  </td>
                  <td>
                    <code>() =&gt; void</code>
                  </td>
                  <td>Callback function to toggle the fullscreen state of this pane.</td>
                </tr>
                <tr>
                  <td>
                    <code>remove</code>
                  </td>
                  <td>
                    <code>() =&gt; void</code>
                  </td>
                  <td>Callback function to remove this pane from the layout tree.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <hr />

          <section id="utilities" className="docs-section">
            <h2>Utilities</h2>
            <p>
              <code>react-zeugma</code> exports several stateless helper functions to
              programmatically manipulate the layout tree:
            </p>

            <div className="utility-methods">
              <div className="utility-method">
                <h4>
                  <code>addPane(tree: TreeNode | null, paneId: string): TreeNode</code>
                </h4>
                <p>Appends a new pane to the layout tree by splitting the active rightmost pane.</p>
              </div>

              <div className="utility-method">
                <h4>
                  <code>removePane(tree: TreeNode | null, paneId: string): TreeNode | null</code>
                </h4>
                <p>
                  Removes a pane from the tree, collapsing its parent split node back into the
                  remaining sibling.
                </p>
              </div>

              <div className="utility-method">
                <h4>
                  <code>
                    splitPane(tree: TreeNode, targetId: string, direction: 'row' | 'column', newId:
                    string): TreeNode
                  </code>
                </h4>
                <p>
                  Programmatically splits a target pane by ID, introducing a new pane in the
                  specified direction.
                </p>
              </div>

              <div className="utility-method">
                <h4>
                  <code>
                    swapPanes(tree: TreeNode, sourceId: string, targetId: string): TreeNode
                  </code>
                </h4>
                <p>Swaps two panes in the tree by their pane IDs.</p>
              </div>
            </div>
          </section>

          <hr />

          <section id="llms" className="docs-section">
            <h2>LLMs & AI Agents</h2>
            <p>
              This section contains direct guidelines for AI coding agents working on the{' '}
              <code>react-zeugma</code> codebase. You can copy or download the official{' '}
              <code>SKILL.md</code> instructions file below.
            </p>

            <div
              className="agent-skill-actions"
              style={{ display: 'flex', gap: 10, marginBottom: 12 }}
            >
              <button className="btn btn-add" onClick={copySkillMarkdown}>
                Copy SKILL.md
              </button>
              <a
                className="btn"
                href={`data:text/markdown;charset=utf-8,${encodeURIComponent(SKILL_MARKDOWN)}`}
                download="SKILL.md"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Download SKILL.md
              </a>
            </div>

            <div className="code-block-wrapper" style={{ maxHeight: '500px', overflow: 'auto' }}>
              <pre
                className="docs-code-block"
                style={{ whiteSpace: 'pre-wrap', fontStyle: 'normal' }}
              >
                <code>{SKILL_MARKDOWN}</code>
              </pre>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
