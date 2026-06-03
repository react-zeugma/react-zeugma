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

## Introduction

**react-zeugma** is a recursive drag-and-drop dashboard layout engine for React. It combines the tree-based, arbitrary splitting of _react-mosaic_ with the declarative, state-driven API of _react-grid-layout_, built on top of [`@dnd-kit`](https://dndkit.com).

> **Headless Design System** — react-zeugma is entirely style-agnostic and relies on your class name configurations for styling visual states. You bring your own CSS/Tailwind rules, and we handle the complex drag-and-drop mechanics, resize handle math, and layout tree calculations.

### Core Features

- **Recursive Split Trees** — Nest rows and columns to any depth using a simple serialized JSON node structure.
- **5-Zone Docking Previews** — Drag panels on the top, bottom, left, or right edges of another pane to split it, or onto the center to swap their positions.
- **Native Flexbox Resizers** — Fluid, non-blocking split handles built on pointer events.
- **Accessible Drag-and-Drop** — Built on top of the performant and accessible [`@dnd-kit`](https://dndkit.com) toolkit.
- **Fullscreen Zoom Toggle** — Programmatically expand any pane to cover the entire viewport and snap it back instantly.
- **Tree-shakeable & Tiny** — ESM-first with zero runtime CSS. Bring your own styles.

---

## Installation

Install the package into your React project using your preferred package manager.

```bash
npm install react-zeugma
```

> **Peer Dependencies:** react-zeugma is compatible with both **React 18** and **React 19** (along with matching `react-dom`).

---

## Quick Start

Import the core components and configure the layout state inside your React application.

```tsx
import { useState } from 'react'
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma'

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 20,
  first: { type: 'pane', paneId: 'explorer' },
  second: {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: { type: 'pane', paneId: 'editor' },
    second: { type: 'pane', paneId: 'preview' },
  },
}

function MyPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {({ isDragging, remove }) => (
        <div className={`h-full flex flex-col bg-[#18181b] ${isDragging ? 'opacity-30' : ''}`}>
          <DragHandle>
            <div className="px-3 py-2 bg-[#27272a] border-b border-[#3f3f46] flex items-center justify-between cursor-grab">
              <span className="text-xs uppercase text-zinc-300 font-bold">{id}</span>
              <button onClick={remove} className="text-zinc-500 hover:text-rose-400 text-xs">
                ×
              </button>
            </div>
          </DragHandle>
          <div className="flex-1 p-4 text-sm text-zinc-400">Content for {id}</div>
        </div>
      )}
    </Pane>
  )
}

export default function Dashboard() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout)

  return (
    <DashboardProvider layout={layout} onChange={setLayout} renderPane={(id) => <MyPane id={id} />}>
      <div className="w-screen h-screen">
        <PaneTree />
      </div>
    </DashboardProvider>
  )
}
```

---

## API Reference

### `<DashboardProvider>`

The context provider that sets up the drag-and-drop state machine, monitors active drags, and registers layout change notifications.

| Prop                 | Type                                 | Required | Description                                                             |
| -------------------- | ------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `layout`             | `TreeNode \| null`                   | Yes      | The serializable tree layout schema.                                    |
| `onChange`           | `(layout: TreeNode \| null) => void` | Yes      | Fires when resizes, splits, swaps, or removes modify the tree.          |
| `renderPane`         | `(paneId: string) => ReactNode`      | Yes      | Renderer function lookup that returns a `<Pane>` structure.             |
| `renderDragOverlay`  | `(activeId: string) => ReactNode`    | No       | Renders a custom cursor-following drag preview.                         |
| `classNames`         | `ZeugmaClassNames`                   | No       | Custom classes for overriding pane, resizer, and drop preview overlays. |
| `fullscreenPaneId`   | `string \| null`                     | No       | Active ID of the pane taking full viewport coverage.                    |
| `onFullscreenChange` | `(paneId: string \| null) => void`   | No       | Callback triggered when a pane enters/leaves fullscreen.                |
| `onRemove`           | `(paneId: string) => void`           | No       | Callback triggered when a pane is closed/removed.                       |

### `<PaneTree>`

Recursively renders the split nodes and pane nodes. Must be placed inside `<DashboardProvider>`.

| Prop          | Type               | Required | Description                                                         |
| ------------- | ------------------ | -------- | ------------------------------------------------------------------- |
| `tree`        | `TreeNode \| null` | No       | Custom subtree to render. Defaults to the provider's root `layout`. |
| `resizerSize` | `number`           | No       | Thickness of the split resizer bars in pixels. Defaults to `4`.     |

### `<Pane id>`

Wraps the individual pane components inside the renderer. Utilizes a render prop passing active layout attributes.

| Prop       | Type                                    | Required | Description                                             |
| ---------- | --------------------------------------- | -------- | ------------------------------------------------------- |
| `id`       | `string`                                | Yes      | The unique ID corresponding to a `PaneNode`'s `paneId`. |
| `children` | `(props: PaneRenderProps) => ReactNode` | Yes      | Render prop function.                                   |

#### Render Props: `PaneRenderProps`

| Parameter          | Type         | Description                                                   |
| ------------------ | ------------ | ------------------------------------------------------------- |
| `isDragging`       | `boolean`    | Returns `true` if the node wrapper is actively being dragged. |
| `isFullscreen`     | `boolean`    | Returns `true` if the pane is zoomed/fullscreen.              |
| `toggleFullscreen` | `() => void` | Callback to toggle fullscreen viewport coverage.              |
| `remove`           | `() => void` | Triggers removal of this pane from the layout tree.           |

### `<DragHandle>`

Defines the interactive drag region inside a `<Pane>`. **Must be placed inside a `<Pane>` component.**

| Prop        | Type                  | Required | Description                                                      |
| ----------- | --------------------- | -------- | ---------------------------------------------------------------- |
| `children`  | `React.ReactNode`     | Yes      | Element(s) that function as the drag handle (e.g., pane header). |
| `className` | `string`              | No       | Custom CSS class for the drag handle wrapper.                    |
| `style`     | `React.CSSProperties` | No       | Inline styles for the drag handle wrapper.                       |

---

## Tree Utilities

react-zeugma exposes serializable tree utility functions for programmatically mutating layout schemas.

#### `removePane(tree: TreeNode | null, id: string): TreeNode | null`

Recursively scans the layout tree, removes the targeted pane node, and collapses redundant split boundaries.

#### `addPane(tree: TreeNode | null, paneToAdd: string): TreeNode`

Recursively matches the bottommost/rightmost pane leaf in the tree, splits it, and inserts the target `paneToAdd`.

#### `swapPanes(tree: TreeNode | null, idA: string, idB: string): TreeNode | null`

Swaps the positions of `idA` and `idB` nodes directly inside the tree structure.

#### `splitPane(tree, targetId, direction, splitType, paneToAdd)`

Splits the targeted `targetId` pane inside the tree with `direction` (_row_ / _column_) and type (_left_, _right_, _top_, _bottom_) to insert `paneToAdd`.

---

## Custom Styling

Use custom CSS or styling rules to style resizers, dragging states, drop previews, or active nodes by overriding `classNames` in the provider.

```tsx
<DashboardProvider
  layout={layout}
  onChange={setLayout}
  renderPane={renderPane}
  classNames={{
    // resizer handles
    resizer:
      'bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors duration-150',
    // split previews
    dropPreview: 'bg-indigo-500/10 border-2 border-dashed border-indigo-500/50 backdrop-blur-xs',
    // swap previews
    swapPreview: 'bg-amber-500/10 border-2 border-dashed border-amber-500/50 backdrop-blur-xs',
  }}
>
  <PaneTree />
</DashboardProvider>
```

---

## Types Reference

Full TypeScript type definitions utilized in the dashboard layout configuration.

```ts
export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number
}

export interface PaneNode {
  type: 'pane'
  paneId: string
}

export type TreeNode = SplitNode | PaneNode

export interface ZeugmaClassNames {
  pane?: string
  dropPreview?: string
  swapPreview?: string
  dragOverlay?: string
  resizer?: string
}

export interface PaneRenderProps {
  isDragging: boolean
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
}
```

---

## SKILL.md

A comprehensive developer skill configuration is published alongside the docs for AI agents and reference integrations. Download it from the [documentation site](https://react-zeugma.com/docs#skill-md).

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

## The Story of Zeugma

_Zeugma_ is an ancient city of Commagene, located in modern-day **Gaziantep, Turkey**. Positioned along a critical crossing point of the Euphrates river, Zeugma became a central hub of trade and cultural exchanges.

During modern excavation efforts, archeologists discovered some of the most breathtaking Greco-Roman mosaic panels in history, now housed inside the **Zeugma Mosaic Museum** in Gaziantep. The famous _"Gypsy Girl" (Çingene Kızı)_ mosaic, with her hauntingly detailed eyes, has become a global icon of the city.

> _"We chose the name Zeugma because of this ancient craftsmanship. Mosaics are assembled from hundreds of tiny, individual tesserae tiles to form a magnificent, cohesive picture. In the same spirit, react-zeugma lets you build beautiful, customized application workspaces from simple, individual components. Many tiles, one masterpiece."_
