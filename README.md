{/_ @meta title="Introduction" _/}

# react-zeugma

**A recursive, drag-and-drop dashboard layout engine for React.**

`react-zeugma` combines the tree-based, arbitrary splitting capabilities of `react-mosaic` with the declarative, state-driven API model of `react-grid-layout`. Built with React 18+, TypeScript, and [`@dnd-kit`](https://dndkit.com).

[![npm version](https://img.shields.io/npm/v/react-zeugma?color=brightgreen&style=flat-square)](https://www.npmjs.com/package/react-zeugma)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-zeugma?color=blue&style=flat-square)](https://bundlephobia.com/package/react-zeugma)
[![license](https://img.shields.io/npm/l/react-zeugma?color=yellow&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

> [!TIP]
> **Headless Design System** — react-zeugma is entirely style-agnostic and relies on your class name configurations for styling visual states. You bring your own CSS/Tailwind rules, and we handle the complex drag-and-drop mechanics, resize handle math, and layout tree calculations.

### Core Features

- **Recursive Split Trees**: Nest rows and columns to any depth using a simple serialized JSON node structure.
- **5-Zone Docking Previews**: Drag panels on the top, bottom, left, or right edges of another pane to split it, or onto the center to swap their positions.
- **Native Flexbox Resizers**: Fluid, non-blocking split handles built on pointer events.
- **Accessible Drag-and-Drop**: Built on top of the performant and accessible [`@dnd-kit`](https://dndkit.com) toolkit.
- **Fullscreen Zoom Toggle**: Programmatically expand any pane to cover the entire viewport and snap it back instantly.

---

## Installation

Install the package into your React project using your preferred package manager.

```bash
npm install react-zeugma
```

> [!NOTE]
> **Peer Dependencies** — react-zeugma is compatible with both **React 18** and **React 19** (along with matching `react-dom`).

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

| Prop                     | Type                                                                  | Required | Description                                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layout`                 | `TreeNode \| null`                                                    | Yes      | The serializable tree layout schema.                                                                                                                                         |
| `onChange`               | `(layout: TreeNode \| null) => void`                                  | Yes      | Fires when resizes, splits, swaps, or removes modify the tree.                                                                                                               |
| `renderPane`             | `(paneId: string) => ReactNode`                                       | Yes      | Renderer function lookup that returns a `<Pane>` structure.                                                                                                                  |
| `classNames`             | `ZeugmaClassNames`                                                    | No       | Custom classes for overriding pane, resizer, and drop preview overlays.                                                                                                      |
| `fullscreenPaneId`       | `string \| null`                                                      | No       | Active ID of the pane taking full viewport coverage.                                                                                                                         |
| `renderDragOverlay`      | `(activeId: string) => ReactNode`                                     | No       | Renders a custom cursor-following drag preview overlay.                                                                                                                      |
| `onFullscreenChange`     | `(paneId: string \| null) => void`                                    | No       | Callback triggered when a pane enters or leaves fullscreen.                                                                                                                  |
| `onRemove`               | `(paneId: string) => void`                                            | No       | Callback triggered when a pane is closed/removed from the layout tree.                                                                                                       |
| `dragActivationDistance` | `number`                                                              | No       | Minimum pointer drag distance (in pixels) required to activate dragging. Defaults to `8`.                                                                                    |
| `onDragStart`            | `(activeId: string) => void`                                          | No       | Callback triggered when dragging starts on a pane.                                                                                                                           |
| `onDragEnd`              | `(activeId: string, overId: string \| null, dropAction: any) => void` | No       | Callback triggered when dragging ends, providing swap or split details. The `overId` is set to `'root'` if dropped onto outer boundaries to split the entire dashboard root. |
| `onResizeStart`          | `(currentNode: SplitNode) => void`                                    | No       | Callback triggered when resizing starts on a split node.                                                                                                                     |
| `onResize`               | `(currentNode: SplitNode, percentage: number) => void`                | No       | Callback triggered continuously while resizing a split node.                                                                                                                 |
| `onResizeEnd`            | `(currentNode: SplitNode, percentage: number) => void`                | No       | Callback triggered when resizing ends on a split node.                                                                                                                       |
| `renderResizer`          | `(props: ResizerRenderProps) => ReactNode`                            | No       | Custom renderer function for rendering custom-styled resizer bars.                                                                                                           |
| `minSplitPercentage`     | `number`                                                              | No       | Minimum resizing limit percentage. Defaults to `5`.                                                                                                                          |
| `maxSplitPercentage`     | `number`                                                              | No       | Maximum resizing limit percentage. Defaults to `95`.                                                                                                                         |

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
| `children`  | `ReactNode`           | Yes      | Element(s) that function as the drag handle (e.g., pane header). |
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

#### `splitRoot(tree, draggingId, splitType)`

Splits the entire dashboard tree at the root, placing the dragged `draggingId` pane on one half and the rest of the layout tree on the other.

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

export interface ResizerRenderProps {
  direction: SplitDirection
  splitPercentage: number
  resizerSize: number
  isResizing: boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
}

export interface DashboardContextValue {
  layout: TreeNode | null
  onLayoutChange: (newLayout: TreeNode | null) => void
  renderPane: (paneId: string) => ReactNode
  activeId: string | null
  fullscreenPaneId: string | null
  classNames: ZeugmaClassNames
  onRemove?: (paneId: string) => void
  onFullscreenChange?: (paneId: string | null) => void
  snapThreshold?: number
  onResizeStart?: (currentNode: SplitNode) => void
  onResize?: (currentNode: SplitNode, percentage: number) => void
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  renderResizer?: (props: ResizerRenderProps) => ReactNode
  minSplitPercentage?: number
  maxSplitPercentage?: number
  removePane: (paneId: string) => void
  addPane: (paneId: string) => void
  swapPanes: (paneIdA: string, paneIdB: string) => void
  splitPane: (
    targetId: string,
    direction: SplitDirection,
    splitType: 'left' | 'right' | 'top' | 'bottom',
    paneToAdd: string,
  ) => void
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void
}
```

---

## SKILL.md

Below is the comprehensive developer skill configuration for integrations, tree manipulation, and styling patterns within `react-zeugma`. Copy or download it for AI agents or reference.

````markdown
---
name: use-react-zeugma
description: Integrate, configure, style, and programmatically manipulate dashboard layouts using the react-zeugma package.
---

# Skill: Using react-zeugma

`react-zeugma` is a recursive drag-and-drop dashboard layout engine for React. It combines tree-based pane splitting (similar to `react-mosaic`) with a declarative, state-driven API (similar to `react-grid-layout`), built using `@dnd-kit/core`.

---

## 1. Data Model (Tree Nodes)

The entire dashboard layout is represented as a serializable recursive tree structure.

### Types & Interface

```ts
export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number // 0 to 100
}

export interface PaneNode {
  type: 'pane'
  paneId: string
}

export type TreeNode = SplitNode | PaneNode
```

- **`PaneNode` (Leaf):** Represents a single content pane. It must have a unique `paneId`.
- **`SplitNode` (Branch):** Splits its area horizontally (`column`) or vertically (`row`) into two child `TreeNode` nodes (`first` and `second`), based on `splitPercentage`.

---

## 2. Core Components

### `<DashboardProvider>`

The root context provider. It handles the drag-and-drop event loop and coordinates the layout state.

#### Props

- `layout: TreeNode | null` — The current dashboard layout tree.
- `onChange: (newLayout: TreeNode | null) => void` — Callback triggered when the layout tree changes (resizing, dragging to split, dragging to swap).
- `renderPane: (paneId: string) => ReactNode` — Callback to render the contents of a pane given its ID.
- `renderDragOverlay?: (activeId: string) => ReactNode` — (Optional) Renders a custom cursor-following drag preview.
- `classNames?: ZeugmaClassNames` — (Optional) CSS class overrides for styling various layout elements.
- `fullscreenPaneId?: string | null` — (Optional) ID of the pane currently in fullscreen mode.
- `onFullscreenChange?: (paneId: string | null) => void` — (Optional) Callback triggered when a pane enters/leaves fullscreen.
- `onRemove?: (paneId: string) => void` — (Optional) Callback triggered when a pane is closed/removed.
- `dragActivationDistance?: number` — (Optional) Minimum pointer drag distance (in pixels) required to activate dragging. Defaults to `8`.
- `onDragStart?: (activeId: string) => void` — (Optional) Callback triggered when dragging starts on a pane.
- `onDragEnd?: (activeId: string, overId: string | null, dropAction: any) => void` — (Optional) Callback triggered when dragging ends. The `overId` will be `'root'` if the pane was dropped onto the outer dashboard boundaries to split the root layout.
- `onResizeStart?: (currentNode: SplitNode) => void` — (Optional) Callback triggered when resizing starts.
- `onResize?: (currentNode: SplitNode, percentage: number) => void` — (Optional) Callback triggered during resizing.
- `onResizeEnd?: (currentNode: SplitNode, percentage: number) => void` — (Optional) Callback triggered when resizing ends.
- `renderResizer?: (props: ResizerRenderProps) => ReactNode` — (Optional) Custom resizer bar component renderer.
- `minSplitPercentage?: number` — (Optional) Minimum resizing limit percentage (defaults to `5`).
- `maxSplitPercentage?: number` — (Optional) Maximum resizing limit percentage (defaults to `95`).

### `<PaneTree>`

Recursively renders the split nodes and pane nodes. Must be placed inside `<DashboardProvider>`.

#### Props

- `tree?: TreeNode | null` — (Optional) Custom subtree to render. Defaults to the provider's root `layout`.
- `resizerSize?: number` — (Optional) Thickness of the split resizer bars in pixels. Defaults to `4`.

### `<Pane>`

Wraps the contents of an individual pane. It sets up draggable and droppable zones.

#### Props

- `id: string` — The unique ID corresponding to a `PaneNode`'s `paneId`.
- `children: (props: PaneRenderProps) => ReactNode` — Render prop function.

#### `PaneRenderProps`

```ts
interface PaneRenderProps {
  isDragging: boolean
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
}
```

### `<DragHandle>`

Defines the interactive drag region inside a `<Pane>`. **Must be placed inside a `<Pane>` component.**

#### Props

- `children: React.ReactNode` — Element(s) that function as the drag handle (e.g., pane header).
- `className?: string`
- `style?: React.CSSProperties`

---

## 3. Programmatic State Utilities

Import these helpers from `react-zeugma` to manipulate the tree layout programmatically in your state handlers:

- **`removePane(tree: TreeNode | null, idToRemove: string): TreeNode | null`**
  Removes a pane from the tree and collapses the leftover sibling split node.
- **`splitPane(tree: TreeNode | null, targetId: string, direction: SplitDirection, splitType: 'left' | 'right' | 'top' | 'bottom', paneToAdd: string): TreeNode | null`**
  Splits a specific target pane by nesting it under a new `SplitNode` along with a new pane.
- **`splitRoot(tree: TreeNode | null, draggingId: string, splitType: 'left' | 'right' | 'top' | 'bottom'): TreeNode | null`**
  Splits the entire dashboard tree at the root, placing the dragged pane on one half and the remaining layout tree on the other.
- **`swapPanes(tree: TreeNode | null, idA: string, idB: string): TreeNode | null`**
  Swaps the positions of two panes in the tree.

Alternatively, you can consume the convenient mutation helpers directly from the **`useDashboard()`** context hook inside pane components without importing utilities:

- **`removePane(paneId: string) => void`**
- **`addPane(paneId: string) => void`**
- **`swapPanes(paneIdA: string, paneIdB: string) => void`**
- **`splitPane(targetId: string, direction: SplitDirection, splitType: string, paneToAdd: string) => void`**
- **`updateSplitPercentage(currentNode: SplitNode, percentage: number) => void`**

---

## 4. Basic Integration Recipe

```tsx
import { useState } from 'react'
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma'

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: { type: 'pane', paneId: 'sidebar' },
  second: { type: 'pane', paneId: 'main' },
}

function CustomPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      {({ isDragging, isFullscreen, toggleFullscreen, remove }) => (
        <div style={{ height: '100%', border: '1px solid #ccc', opacity: isDragging ? 0.5 : 1 }}>
          <div style={{ display: 'flex', background: '#eee', padding: 8 }}>
            <DragHandle style={{ flex: 1 }}>
              <strong>Header: {id}</strong>
            </DragHandle>
            <button onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <button onClick={remove}>Close</button>
          </div>
          <div style={{ padding: 16 }}>Content for {id}</div>
        </div>
      )}
    </Pane>
  )
}

export default function App() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout)
  const [fullscreenId, setFullscreenId] = useState<string | null>(null)

  const handleRemove = (paneId: string) => {
    // Remove the pane and update layout
    setLayout((prev) => removePane(prev, paneId))
  }

  return (
    <DashboardProvider
      layout={layout}
      onChange={setLayout}
      renderPane={(id) => <CustomPane id={id} />}
      fullscreenPaneId={fullscreenId}
      onFullscreenChange={setFullscreenId}
      onRemove={handleRemove}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <PaneTree />
      </div>
    </DashboardProvider>
  )
}
```

---

## 5. Styling Customization

`react-zeugma` is style-agnostic and relies on class name configuration for visual states. Define classes in your styling framework and pass them via the `classNames` prop on `<DashboardProvider>`:

```ts
interface ZeugmaClassNames {
  pane?: string // Applied to the outer wrapper of <Pane>
  dropPreview?: string // Applied to the preview box when hovering over edge dropzones
  swapPreview?: string // Applied to the preview box when hovering over center dropzone
  dragOverlay?: string // Applied to the cursor-following drag preview portal
  resizer?: string // Applied to the drag-to-resize split bar
}
```

### CSS Example:

```css
/* Custom resizer style */
.my-resizer {
  background-color: #e2e8f0;
  transition: background-color 0.2s;
}
.my-resizer:hover {
  background-color: #3b82f6;
}

/* Edge drop previews */
.my-drop-preview {
  background-color: rgba(59, 130, 246, 0.2);
  border: 2px dashed #3b82f6;
}

/* Center swap preview */
.my-swap-preview {
  background-color: rgba(16, 185, 129, 0.25);
  border: 2px solid #10b981;
}
```
````

---

## The Story of Zeugma

_Zeugma_ is an ancient city of Commagene, located in modern-day **Gaziantep, Turkey**. Positioned along a critical crossing point of the Euphrates river, Zeugma became a central hub of trade and cultural exchanges.

During modern excavation efforts, archeologists discovered some of the most breathtaking Greco-Roman mosaic panels in history, now housed inside the **Zeugma Mosaic Museum** in Gaziantep. The famous _"Gypsy Girl" (Çingene Kızı)_ mosaic, with her hauntingly detailed eyes, has become a global icon of the city.

> _"We chose the name Zeugma because of this ancient craftsmanship. Mosaics are assembled from hundreds of tiny, individual tesserae tiles to form a magnificent, cohesive picture. In the same spirit, react-zeugma lets you build beautiful, customized application workspaces from simple, individual components. Many tiles, one masterpiece."_

---

## Links

- [GitHub Repository](https://github.com/yusufarsln98/react-zeugma)
- [npm Package](https://www.npmjs.com/package/react-zeugma)
- [Contributing Guide](https://github.com/yusufarsln98/react-zeugma/blob/master/CONTRIBUTING.md)
