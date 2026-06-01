<div align="center">

# react-zeugma

**Recursive drag-and-drop dashboard layout engine for React**

Combines the tree-based, arbitrary splitting of [react-mosaic](https://github.com/nomcopter/react-mosaic) with the declarative, state-driven API of [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout).

[![npm version](https://img.shields.io/npm/v/react-zeugma?color=brightgreen&style=flat-square)](https://www.npmjs.com/package/react-zeugma)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-zeugma?color=blue&style=flat-square)](https://bundlephobia.com/package/react-zeugma)
[![license](https://img.shields.io/npm/l/react-zeugma?color=yellow&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## Features

- **Recursive Tree Structure** — Nest split rows and columns to any depth with a clean `TreeNode` data model.
- **5-Zone Drag & Drop** — Drag panes onto top / bottom / left / right edges to split, or onto the center to swap.
- **Flexbox Resizing** — Drag split bars to resize panes dynamically without heavyweight layout libraries.
- **Declarative API** — State is stored in a serializable `TreeNode` object, making persistence and programmatic updates trivial.
- **Built with dnd-kit** — Leverages the modern, accessible, and performant `@dnd-kit` drag-and-drop toolkit.
- **Fullscreen Mode** — Any pane can expand to fill the entire viewport and collapse back seamlessly.
- **Tree-shakeable & Tiny** — ESM-first with zero runtime CSS. Bring your own styles.

---

## Installation

```bash
npm install react-zeugma @dnd-kit/core @dnd-kit/utilities @dnd-kit/sortable
```

> **Peer dependencies:** React 18+ or 19+

---

## Quick Start

```tsx
import { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma';

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: { type: 'pane', paneId: 'editor' },
  second: {
    type: 'split',
    direction: 'column',
    splitPercentage: 60,
    first: { type: 'pane', paneId: 'preview' },
    second: { type: 'pane', paneId: 'console' },
  },
};

function MyPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {({ isDragging }) => (
        <div style={{ opacity: isDragging ? 0.5 : 1, height: '100%' }}>
          <DragHandle>
            <div style={{ padding: 8, cursor: 'grab', background: '#1e1e2e', color: '#cdd6f4' }}>
              {id}
            </div>
          </DragHandle>
          <div style={{ padding: 16 }}>Content for {id}</div>
        </div>
      )}
    </Pane>
  );
}

export default function Dashboard() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout);

  return (
    <DashboardProvider layout={layout} onChange={setLayout} renderPane={(id) => <MyPane id={id} />}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <PaneTree />
      </div>
    </DashboardProvider>
  );
}
```

---

## API

| Component             | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `<DashboardProvider>` | Root context provider. Accepts `layout`, `onChange`, `renderPane`, and optional class overrides.  |
| `<PaneTree />`        | Recursively renders the tree layout. Place inside `DashboardProvider`.                            |
| `<Pane id>`           | Wraps individual pane content. Provides render props like `isDragging`, `isFullscreen`, `remove`. |
| `<DragHandle>`        | Designates the draggable area within a pane (typically the header/title bar).                     |

### Utilities

| Function                   | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `removePane(tree, paneId)` | Returns a new tree with the specified pane removed.  |
| `splitPane(tree, ...)`     | Programmatically splits a pane in a given direction. |
| `swapPanes(tree, ...)`     | Swaps two panes by their IDs.                        |

### Types

| Type               | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `TreeNode`         | Union of `SplitNode \| PaneNode`. The core layout data structure.  |
| `SplitNode`        | `{ type: 'split', direction, splitPercentage, first, second }`     |
| `PaneNode`         | `{ type: 'pane', paneId }`                                         |
| `ZeugmaClassNames` | Optional CSS class overrides for pane, resizer, drop preview, etc. |

---

## Documentation

📖 **[Interactive Docs & Examples →](https://yusufarsln98.github.io/react-zeugma)**

---

## Local Development

```bash
# Clone & install
git clone https://github.com/yusufarsln98/react-zeugma.git
cd react-zeugma
npm install

# Run the interactive demo
npm run demo

# Run Storybook docs
npm run storybook

# Build the library
npm run build
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get started.

---

## License

[MIT](./LICENSE) © yusufarsln98

---

<div align="center">

_Zeugma_ is an ancient Greco-Roman city on the Euphrates in Gaziantep, Turkey — world-renowned for its breathtaking mosaic panels unearthed during excavations.  
This library draws its name from those mosaics: **many tiles, one masterpiece.**

</div>
