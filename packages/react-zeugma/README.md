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
- **4-Zone Docking Previews**: Drag panels on the top, bottom, left, or right edges of another pane to split it.
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

Import the core components and configure the layout state inside your React application using the `useZeugma` hook.

```tsx
import { useZeugma, Zeugma, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma'

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 20,
  first: { type: 'pane', id: 'explorer', tabs: ['explorer'], activeTabId: 'explorer' },
  second: {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: { type: 'pane', id: 'editor', tabs: ['editor'], activeTabId: 'editor' },
    second: { type: 'pane', id: 'preview', tabs: ['preview'], activeTabId: 'preview' },
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
  const zeugma = useZeugma({ initialLayout })

  return (
    <Zeugma {...zeugma} renderPane={(id) => <MyPane id={id} />}>
      <div className="w-screen h-screen">
        <PaneTree />
      </div>
    </Zeugma>
  )
}
```

---

## API Reference

### `<Zeugma>`

The context provider that sets up the drag-and-drop state machine, monitors active drags, and registers layout change notifications. It extends `ZeugmaController` directly; you typically spread the controller object returned by `useZeugma` onto it.

| Prop                 | Type                                                     | Required | Description                                                                                                               |
| -------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `...controllerProps` | `ZeugmaController`                                       | Yes      | All properties returned by `useZeugma(options)`. Usually passed by spreading the controller object (e.g., `{...zeugma}`). |
| `renderPane`         | `(paneId: string) => ReactNode`                          | Yes      | Renderer function lookup that returns a `<Pane>` structure.                                                               |
| `classNames`         | `ZeugmaClassNames`                                       | No       | Custom classes for overriding pane, resizer, and drop preview overlays.                                                   |
| `renderDragOverlay`  | `(activeId: string, type: 'pane' \| 'tab') => ReactNode` | No       | Renders a custom cursor-following drag preview overlay.                                                                   |
| `renderWidget`       | `(tabId: string) => ReactNode`                           | No       | Render function mapping tab IDs to React elements. Used to render tab widgets inside portals.                             |

### `useZeugma(options)`

A custom state hook that initializes and manages the recursive layout tree and handles drag-and-drop actions.

| Option                   | Type                                                                  | Default | Description                                                                |
| ------------------------ | --------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| `initialLayout`          | `TreeNode \| null`                                                    | Yes     | Initial layout tree structure.                                             |
| `locked`                 | `boolean`                                                             | `false` | If true, layout resizes and drags are disabled.                            |
| `dragActivationDistance` | `number`                                                              | `8`     | Minimum pointer drag distance (in pixels) required to activate dragging.   |
| `snapThreshold`          | `number`                                                              | `8`     | Threshold in pixels to snap layout resizers to adjacent edges.             |
| `minSplitPercentage`     | `number`                                                              | `5`     | Minimum resizing limit percentage.                                         |
| `maxSplitPercentage`     | `number`                                                              | `95`    | Maximum resizing limit percentage.                                         |
| `enableDragToDismiss`    | `boolean`                                                             | `false` | If true, enables the drag-out-to-dismiss gesture to close widgets.         |
| `dismissThreshold`       | `number`                                                              | `60`    | Distance in pixels outside container bounds required to trigger dismissal. |
| `onRemove`               | `(paneId: string) => void`                                            | —       | Callback triggered when a pane is removed.                                 |
| `onDragStart`            | `(activeId: string) => void`                                          | —       | Callback triggered when dragging starts.                                   |
| `onDragEnd`              | `(activeId: string, overId: string \| null, dropAction: any) => void` | —       | Callback triggered when dragging ends.                                     |
| `onResizeStart`          | `(currentNode: SplitNode) => void`                                    | —       | Callback triggered when resizing starts.                                   |
| `onResize`               | `(currentNode: SplitNode, percentage: number) => void`                | —       | Callback triggered during resizing.                                        |
| `onResizeEnd`            | `(currentNode: SplitNode, percentage: number) => void`                | —       | Callback triggered when resizing ends.                                     |
| `onDismissIntentChange`  | `(paneId: string \| null) => void`                                    | —       | Callback triggered when drag-out intent changes.                           |

### `useZeugmaContext()`

A custom React context hook that returns the unified layout controller properties and state actions. Must be used within a `<Zeugma>` provider component.

Provides direct access to the current layout state (e.g., `layout`, `locked`) and mutation actions (e.g., `addPane`, `removePane`, `splitPane`, `updateTabMetadata`, etc.).

```ts
const { layout, locked, addPane, removeTab } = useZeugmaContext()
```

### `<PaneTree>`

Recursively renders the split nodes and pane nodes. Must be placed inside `<Zeugma>`.

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

| Parameter          | Type              | Description                                                                      |
| ------------------ | ----------------- | -------------------------------------------------------------------------------- |
| `isDragging`       | `boolean`         | Returns `true` if the node wrapper is actively being dragged.                    |
| `isFullscreen`     | `boolean`         | Returns `true` if the pane is zoomed/fullscreen.                                 |
| `toggleFullscreen` | `() => void`      | Callback to toggle fullscreen viewport coverage.                                 |
| `remove`           | `() => void`      | Triggers removal of this pane from the layout tree.                              |
| `renderActiveTab`  | `() => ReactNode` | Renders the target placeholder element for the currently active tab in the pane. |

### `<DragHandle>`

Defines the interactive drag region inside a `<Pane>`. **Must be placed inside a `<Pane>` component.**

| Prop        | Type                  | Required | Description                                                      |
| ----------- | --------------------- | -------- | ---------------------------------------------------------------- |
| `children`  | `ReactNode`           | Yes      | Element(s) that function as the drag handle (e.g., pane header). |
| `className` | `string`              | No       | Custom CSS class for the drag handle wrapper.                    |
| `style`     | `React.CSSProperties` | No       | Inline styles for the drag handle wrapper.                       |

### `<ResizableContainer>`

A vertical-resize container wrapper that wraps any node (typically `<PaneTree />` or a dashboard component) and allows the user to resize its height by dragging a handle at the bottom edge. Includes smooth scroll parent propagation and drag-to-scroll infinite scrolling behavior.

| Prop               | Type                       | Required | Default          | Description                                                      |
| :----------------- | :------------------------- | :------- | :--------------- | :--------------------------------------------------------------- |
| `height`           | `number`                   | No       | `400`            | Controlled height in pixels (or initial height if uncontrolled). |
| `onHeightChange`   | `(height: number) => void` | No       | —                | Callback function triggered during or after dragging to resize.  |
| `minHeight`        | `number`                   | No       | `100`            | Minimum allowed height in pixels.                                |
| `maxHeight`        | `number`                   | No       | `Infinity`       | Maximum allowed height in pixels.                                |
| `persist`          | `boolean`                  | No       | —                | Whether to persist height changes in localStorage.               |
| `localStorageKey`  | `string`                   | No       | `'default-pane'` | Custom localStorage key name (prefixed by `zeugma-height:`).     |
| `resizerHeight`    | `number`                   | No       | `6`              | Height of the resizer drag handle in pixels.                     |
| `className`        | `string`                   | No       | —                | Custom CSS class applied to the outer container.                 |
| `resizerClassName` | `string`                   | No       | —                | Custom CSS class applied to the drag handle.                     |

---

## Tree Utilities

react-zeugma exposes serializable tree utility functions for programmatically mutating layout schemas.

#### `removePane(tree: TreeNode | null, id: string): TreeNode | null`

Recursively scans the layout tree, removes the targeted pane node, and collapses redundant split boundaries.

#### `addPane(tree: TreeNode | null, paneToAdd: string): TreeNode`

Recursively matches the bottommost/rightmost pane leaf in the tree, splits it, and inserts the target `paneToAdd`.

#### `splitPane(tree, targetId, direction, splitType, paneToAdd)`

Splits the targeted `targetId` pane inside the tree with `direction` (_row_ / _column_) and type (_left_, _right_, _top_, _bottom_) to insert `paneToAdd`.

#### `findPane(tree: TreeNode | null, paneId: string): PaneNode | null`

Recursively searches the layout tree and returns the target `PaneNode` if found, or `null` otherwise.

---

## Custom Styling

Use custom CSS or styling rules to style resizers, dragging states, drop previews, or active nodes by overriding `classNames` in the provider.

```tsx
<Zeugma
  {...zeugma}
  classNames={{
    // resizer handles
    resizer:
      'bg-transparent hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors duration-150',
    // split previews
    dropPreview: 'bg-indigo-500/10 border-2 border-dashed border-indigo-500/50 backdrop-blur-xs',
  }}
>
  <PaneTree />
</Zeugma>
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
  metadata?: Record<string, unknown>
}

export type TreeNode = SplitNode | PaneNode
```

---

## SKILL.md

Below is the comprehensive developer skill configuration for integrations, tree manipulation, and styling patterns within `react-zeugma`. Copy or download it for AI agents or reference.

````markdown
---
name: react-zeugma
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
  metadata?: Record<string, unknown>
}

export type TreeNode = SplitNode | PaneNode
```

- **`PaneNode` (Leaf):** Represents a single content pane. It must have a unique `paneId`.
- **`SplitNode` (Branch):** Splits its area horizontally (`column`) or vertically (`row`) into two child `TreeNode` nodes (`first` and `second`), based on `splitPercentage`.

---

## 2. Core Components

### `<Zeugma>`

The root context provider. It handles the drag-and-drop event loop and coordinates the layout state.

#### Props

- `...controllerProps: ZeugmaController` — The controller properties returned by the `useZeugma` hook (typically passed via `{...zeugma}`).
- `renderPane: (paneId: string) => ReactNode` — Callback to render the contents of a pane given its ID.
- `renderDragOverlay?: (activeId: string, type: 'pane' | 'tab') => ReactNode` — (Optional) Renders a custom cursor-following drag preview.
- `classNames?: ZeugmaClassNames` — (Optional) CSS class overrides for styling various layout elements.
- `renderWidget?: (tabId: string) => ReactNode` — (Optional) Render function mapping tab IDs to React elements. Used to render tab widgets inside portals.

### `useZeugma(options)`

A custom hook to manage the dashboard layout state.

#### Options

- `initialLayout: TreeNode | null` — Initial layout tree.
- `locked?: boolean` — Whether the layout is globally locked.
- `dragActivationDistance?: number` — Minimum pointer drag distance (in pixels) required to activate dragging (defaults to `8`).
- `snapThreshold?: number` — Threshold in pixels to snap layout resizers to adjacent edges (defaults to `8`).
- `minSplitPercentage?: number` — Minimum resizing limit percentage (defaults to `5`).
- `maxSplitPercentage?: number` — Maximum resizing limit percentage (defaults to `95`).
- `enableDragToDismiss?: boolean` — Whether to enable drag-out-to-dismiss (defaults to `false`).
- `dismissThreshold?: number` — Distance in pixels outside container bounds required to trigger dismissal (defaults to `60`).
- `onRemove?: (paneId: string) => void` — Callback when a pane is removed.
- `onDragStart?: (activeId: string) => void` — Callback when dragging starts.
- `onDragEnd?: (activeId: string, overId: string | null, dropAction: any) => void` — Callback when dragging ends.
- `onResizeStart?: (currentNode: SplitNode) => void` — Callback when resizing starts.
- `onResize?: (currentNode: SplitNode, percentage: number) => void` — Callback during resizing.
- `onResizeEnd?: (currentNode: SplitNode, percentage: number) => void` — Callback when resizing ends.
- `onDismissIntentChange?: (paneId: string | null) => void` — Callback when drag-out intent changes.

### `useZeugmaContext()`

A context consumer hook that retrieves the parent `<Zeugma>` controller state and actions.

```ts
const { layout, addPane, removeTab } = useZeugmaContext()
```

### `<PaneTree>`

Recursively renders the split nodes and pane nodes. Must be placed inside `<Zeugma>`.

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
  metadata: Record<string, unknown> | undefined
  updateMetadata: (
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  tabs: string[]
  activeTabId: string
  selectTab: (tabId: string) => void
  removeTab: (tabId: string) => void
  tabsMetadata: Record<string, Record<string, unknown>> | undefined
  updateTabMetadata: (
    tabId: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  renderActiveTab: () => ReactNode
}
```

### `<DragHandle>`

Defines the interactive drag region inside a `<Pane>`. **Must be placed inside a `<Pane>` component.**

#### Props

- `children: React.ReactNode` — Element(s) that function as the drag handle (e.g., pane header).
- `className?: string`
- `style?: React.CSSProperties`

---

### `<ResizableContainer>`

A vertical-resize container wrapper that wraps any node (typically `<PaneTree />` or a dashboard component) and allows the user to resize its height by dragging a handle at the bottom edge. Includes smooth scroll parent propagation and drag-to-scroll infinite scrolling behavior.

#### Props

- `height?: number` — Controlled height in pixels (or initial height if uncontrolled). Defaults to `400`.
- `onHeightChange?: (height: number) => void` — Callback function triggered during or after dragging to resize.
- `minHeight?: number` — Minimum allowed height in pixels (defaults to `100`).
- `maxHeight?: number` — Maximum allowed height in pixels (defaults to `Infinity`).
- `persist?: boolean` — Whether to persist height changes in localStorage.
- `localStorageKey?: string` — Custom localStorage key name (defaults to `'default-pane'`).
- `resizerHeight?: number` — Height of the resizer drag handle in pixels (defaults to `6`).
- `className?: string` — Custom CSS class applied to the outer container.
- `resizerClassName?: string` — Custom CSS class applied to the drag handle.

## 3. Programmatic State Utilities

Import these helpers from `react-zeugma` to manipulate the tree layout programmatically in your state handlers:

- **`removePane(tree: TreeNode | null, idToRemove: string): TreeNode | null`**
  Removes a pane from the tree and collapses the leftover sibling split node.
- **`splitPane(tree: TreeNode | null, targetId: string, direction: SplitDirection, splitType: 'left' | 'right' | 'top' | 'bottom', paneToAdd: string): TreeNode | null`**
  Splits a specific target pane by nesting it under a new `SplitNode` along with a new pane.
- **`updateTabMetadata(tree: TreeNode | null, tabId: string, updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined): TreeNode | null`**
  Updates the metadata of a specific tab.
- **`findPane(tree: TreeNode | null, paneId: string): PaneNode | null`**
  Recursively searches the layout tree and returns the target `PaneNode` if found, or `null` otherwise.

---

## 4. Basic Integration Recipe

```tsx
import { useZeugma, Zeugma, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma'

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: { type: 'pane', id: 'sidebar', tabs: ['sidebar'], activeTabId: 'sidebar' },
  second: { type: 'pane', id: 'main', tabs: ['main'], activeTabId: 'main' },
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
  const zeugma = useZeugma({
    initialLayout,
  })

  return (
    <Zeugma {...zeugma} renderPane={(id) => <CustomPane id={id} />}>
      <div style={{ width: '100vw', height: '100vh' }}>
        <PaneTree />
      </div>
    </Zeugma>
  )
}
```

---

## 5. Styling Customization

`react-zeugma` is style-agnostic and relies on class name configuration for visual states. Define classes in your styling framework and pass them via the `classNames` prop on `<Zeugma>`:

```ts
interface ZeugmaClassNames {
  pane?: string // Applied to the outer wrapper of <Pane>
  dropPreview?: string // Applied to the preview box when hovering over edge dropzones
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
```
````

---

## The Story of Zeugma

_Zeugma_ is an ancient city of Commagene, located in modern-day **Gaziantep, Turkey**. Positioned along a critical crossing point of the Euphrates river, Zeugma became a central hub of trade and cultural exchanges.

During modern excavation efforts, archeologists discovered some of the most breathtaking Greco-Roman mosaic panels in history, now housed inside the **Zeugma Mosaic Museum** in Gaziantep. The famous _"Gypsy Girl" (Çingene Kızı)_ mosaic, with her hauntingly detailed eyes, has become a global icon of the city.

> _"We chose the name Zeugma because of this ancient craftsmanship. Mosaics are assembled from hundreds of tiny, individual tesserae tiles to form a magnificent, cohesive picture. In the same spirit, react-zeugma lets you build beautiful, customized application workspaces from simple, individual components. Many tiles, one masterpiece."_

---

## Links

- [GitHub Repository](https://github.com/react-zeugma/react-zeugma)
- [npm Package](https://www.npmjs.com/package/react-zeugma)
- [Contributing Guide](https://github.com/react-zeugma/react-zeugma/blob/master/CONTRIBUTING.md)
