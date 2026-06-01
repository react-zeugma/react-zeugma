# react-zeugma

`react-zeugma` is a recursive, drag-and-drop dashboard layout engine for React. It combines the tree-based, arbitrary splitting capabilities of `react-mosaic` with the declarative, state-driven API model of `react-grid-layout`.

Built with React 18, TypeScript, and `@dnd-kit/core`.

## Features
- 🌲 **Recursive Tree Structure**: Nest split rows and columns to any depth.
- 🎛️ **5-Zone Drag & Drop**: Drag widgets onto top/bottom/left/right boundaries to split, or onto the center to swap.
- ↕️ **Flexbox Resizing**: Drag split bars to resize panes dynamically without heavyweight libraries.
- 🎨 **Declarative API**: State is stored in a clean `TreeNode` layout object, making customization, serialization, and programmatic dashboard updates trivial.

---

## Installation

Add the library and its peer dependencies to your React project:

```bash
npm install react-zeugma @dnd-kit/core @dnd-kit/utilities @dnd-kit/sortable
```

Ensure you have React 18+ installed:
```bash
npm install react react-dom
```

---

## Intended API Usage Example

```tsx
import React, { useState } from 'react';
import { DashboardProvider, WidgetTree, WidgetContainer, TreeNode } from 'react-zeugma';

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: {
    type: 'widget',
    widgetId: 'widget-1',
  },
  second: {
    type: 'widget',
    widgetId: 'widget-2',
  },
};

export default function Dashboard() {
  const [layout, setLayout] = useState<TreeNode>(initialLayout);

  const widgets: Record<string, React.ReactNode> = {
    'widget-1': <div>Widget 1 Content</div>,
    'widget-2': <div>Widget 2 Content</div>,
  };

  return (
    <DashboardProvider
      layout={layout}
      onChange={setLayout}
      renderWidget={(widgetId) => (
        <WidgetContainer id={widgetId} title={`Widget - ${widgetId}`}>
          {widgets[widgetId]}
        </WidgetContainer>
      )}
    >
      <div style={{ width: '100vw', height: '100vh', padding: '20px' }}>
        <WidgetTree />
      </div>
    </DashboardProvider>
  );
}
```

---

## Local Development & Demo Setup

We have set up an npm workspaces environment with a local interactive Vite demo to easily test drag-and-drop.

### 1. Install Workspace Dependencies
Installs dependencies for both the library and the demo workspace app in a single step:
```bash
npm install
```

### 2. Run the Demo Server
Starts the Vite dev server for the demo app, automatically aliasing `react-zeugma` imports directly to the local library source:
```bash
npm run demo
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

### 3. Build the Library
Compile the library into production-ready CJS and ESM formats with TypeScript declarations (`.d.ts`):
```bash
npm run build
```
The built files will reside under `dist/`.
