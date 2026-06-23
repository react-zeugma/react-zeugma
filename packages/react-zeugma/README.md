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
import { useZeugma, Zeugma, PaneTree, Pane, TreeNode } from 'react-zeugma'

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
      <div className="h-full flex flex-col bg-[#18181b]">
        <Pane.DragHandle>
          <div className="px-3 py-2 bg-[#27272a] border-b border-[#3f3f46] flex items-center justify-between cursor-grab">
            <span className="text-xs uppercase text-zinc-300 font-bold">{id}</span>
          </div>
        </Pane.DragHandle>
        <Pane.Content className="flex-1 p-4 text-sm text-zinc-400">
          {(tab) => <div>Content for {tab.id}</div>}
        </Pane.Content>
      </div>
    </Pane>
  )
}

export default function Dashboard() {
  const controller = useZeugma({ initialLayout })

  return (
    <div className="w-screen h-screen">
      <Zeugma controller={controller} renderPane={(id) => <MyPane id={id} />} />
    </div>
  )
}
```

---

## API Reference

### `<Zeugma>`

The main visual dashboard grid renderer and context provider.

- **With Children (Provider Mode)**: If `<Zeugma>` is rendered with children, it acts as the context provider. You must pass the `controller` prop to it, and the children will have access to the Zeugma context functions.
- **Without Children (Renderer/Standalone Mode)**: If `<Zeugma>` is rendered without children, it acts as both the provider and the visual layout renderer. If it is nested within a parent `<Zeugma>` provider, it automatically reads the state, configuration, and callbacks directly from the parent context.

| Prop                     | Type                                                                                                                                                 | Required        | Description                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `controller`             | `ZeugmaController`                                                                                                                                   | Standalone only | The Zeugma controller object returned by `useZeugma(options)`.                                |
| `renderPane`             | `(paneId: string) => ReactNode`                                                                                                                      | Standalone only | Renderer function lookup that returns a `<Pane>` structure.                                   |
| `classNames`             | `ZeugmaClassNames`                                                                                                                                   | No              | Custom classes for overriding pane, resizer, and drop preview overlays.                       |
| `renderDragOverlay`      | `(active: DragOverlayActiveItem) => ReactNode`                                                                                                       | No              | Renders a custom cursor-following drag preview overlay.                                       |
| `resizerSize`            | `number`                                                                                                                                             | No              | Thickness of the split resizer bars in pixels. Defaults to `4`.                               |
| `dragActivationDistance` | `number`                                                                                                                                             | No              | Minimum pointer drag distance (in pixels) required to activate dragging (defaults to `8`).    |
| `snapThreshold`          | `number`                                                                                                                                             | No              | Threshold in pixels to snap layout resizers to adjacent edges (defaults to `8`).              |
| `minSplitPercentage`     | `number`                                                                                                                                             | No              | Minimum resizing limit percentage (defaults to `5`).                                          |
| `maxSplitPercentage`     | `number`                                                                                                                                             | No              | Maximum resizing limit percentage (defaults to `95`).                                         |
| `enableDragToDismiss`    | `boolean`                                                                                                                                            | No              | If true, enables the drag-out-to-dismiss gesture to close widgets (defaults to `false`).      |
| `dismissThreshold`       | `number`                                                                                                                                             | No              | Distance in pixels outside container bounds required to trigger dismissal (defaults to `60`). |
| `onRemove`               | `(paneId: string) => void`                                                                                                                           | No              | Callback triggered when a pane is removed.                                                    |
| `onDragStart`            | `(activeId: string) => void`                                                                                                                         | No              | Callback triggered when dragging starts.                                                      |
| `onDragEnd`              | `(activeId: string, overId: string \| null, dropAction: { type: 'split' \| 'move'; direction?: SplitDirection; position?: string } \| null) => void` | No              | Callback triggered when dragging ends.                                                        |
| `onResizeStart`          | `(currentNode: SplitNode) => void`                                                                                                                   | No              | Callback triggered when resizing starts.                                                      |
| `onResize`               | `(currentNode: SplitNode, percentage: number) => void`                                                                                               | No              | Callback triggered during resizing.                                                           |
| `onResizeEnd`            | `(currentNode: SplitNode, percentage: number) => void`                                                                                               | No              | Callback triggered when resizing ends.                                                        |
| `onDismissIntentChange`  | `(paneId: string \| null) => void`                                                                                                                   | No              | Callback triggered when drag-out intent changes.                                              |

### `useZeugma(options)`

A custom state hook that initializes and manages the layout tree, locked state, and fullscreen mode.

| Option               | Type                                    | Default | Description                                                                                               |
| -------------------- | --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `initialLayout`      | `TreeNode \| null`                      | —       | Initial layout tree structure for uncontrolled mode. Only used on initial mount.                          |
| `layout`             | `TreeNode \| null`                      | —       | Controlled layout tree structure. If provided, the hook runs in controlled mode and synchronizes with it. |
| `onChange`           | `(newLayout: TreeNode \| null) => void` | —       | Callback triggered when the layout changes.                                                               |
| `fullscreenPaneId`   | `string \| null`                        | —       | Controlled fullscreen pane ID. Pass `null` for no fullscreen pane.                                        |
| `onFullscreenChange` | `(paneId: string \| null) => void`      | —       | Callback triggered when a pane is toggled to/from fullscreen mode.                                        |
| `locked`             | `boolean`                               | `false` | If true, layout resizes and drags are disabled.                                                           |

### `useZeugmaContext()`

A custom React context hook that returns the unified layout controller properties and state actions. Must be used within a `<Zeugma>` provider component.

Provides direct access to the current layout state (e.g., `layout`, `locked`), state setters (e.g., `setLocked`), queries (e.g., `findTabById`, `findPaneContainingTab`, `findPaneById`), and mutation actions (e.g., `addTab`, `removePane`, `selectTab`, etc.).

```ts
const { layout, locked, findTabById, setLocked, removePane } = useZeugmaContext()
```

### `<PaneTree>`

An internal component that recursively renders the split nodes and pane nodes. It is automatically managed and rendered internally by `<Zeugma>`, so consumers do not need to import or render it manually. Configuration options like `resizerSize` and `snapThreshold` are passed directly as props to `<Zeugma>` instead.

### `<Pane id>`

Wraps the individual pane components inside the renderer. It acts as a context provider and container. Any pane state or handlers should be accessed via `usePaneContext()` or compound sub-components.

| Prop       | Type                  | Required | Description                                                             |
| ---------- | --------------------- | -------- | ----------------------------------------------------------------------- |
| `id`       | `string`              | Yes      | The unique ID corresponding to a `PaneNode`'s `paneId`.                 |
| `children` | `React.ReactNode`     | Yes      | Children components inside the pane (e.g. tabs, drag handles, content). |
| `style`    | `React.CSSProperties` | No       | Optional inline CSS styles applied to the pane outer container.         |
| `locked`   | `boolean`             | No       | Optional override to lock this specific pane (disables drag and drop).  |

#### Compound Sub-components

- **`<Pane.Content>`**: Renders the portal target for the active tab content.
  - `children` can be a callback function `(tab: TabDetails) => React.ReactNode` or static `React.ReactNode`.
  - Accepts `className` and `style` props.
- **`<Pane.DragHandle>`**: Defines the interactive drag region.
- **`<Pane.Tabs>`**: Renders the list of tab items for the pane.
- **`<Pane.Tab>`**: Renders an individual tab item.
- **`<Pane.Controls>`**: A headless wrapper for pane control buttons (fullscreen, close, etc.).

#### Hook: `usePaneContext()`

Provides direct access to the pane's state and action handlers from within any child component of `<Pane>`. Returns `PaneContextValue` which extends `PaneRenderProps`:

```ts
const { id, isDragging, isFullscreen, toggleFullscreen, remove, tabs, activeTabId } =
  usePaneContext()
```

#### Pane Context Value: `PaneRenderProps`

| Parameter           | Type                                                                                                                        | Description                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `isDragging`        | `boolean`                                                                                                                   | `true` if the pane is actively being dragged.                     |
| `isFullscreen`      | `boolean`                                                                                                                   | `true` if the pane currently occupies the fullscreen view.        |
| `toggleFullscreen`  | `() => void`                                                                                                                | Toggles the pane to and from fullscreen/zoomed mode.              |
| `remove`            | `() => void`                                                                                                                | Removes this pane (and its active tab) from the layout tree.      |
| `metadata`          | `Record<string, unknown> \| undefined`                                                                                      | The metadata values associated with the active tab.               |
| `updateMetadata`    | `(updater: (current: Record<string, unknown> \| undefined) => Record<string, unknown> \| undefined) => void`                | Updates metadata of the active tab via an updater function.       |
| `locked`            | `boolean`                                                                                                                   | `true` if this specific pane or the dashboard globally is locked. |
| `tabs`              | `string[]`                                                                                                                  | The array of tab IDs in this pane.                                |
| `activeTabId`       | `string`                                                                                                                    | The currently active tab ID.                                      |
| `selectTab`         | `(tabId: string) => void`                                                                                                   | Selects a specific tab to make it active.                         |
| `removeTab`         | `(tabId: string) => void`                                                                                                   | Removes/closes a specific tab.                                    |
| `tabsMetadata`      | `Record<string, Record<string, unknown>> \| undefined`                                                                      | Metadata values associated with all tabs in this pane.            |
| `updateTabMetadata` | `(tabId: string, updater: (current: Record<string, unknown> \| undefined) => Record<string, unknown> \| undefined) => void` | Updates the metadata of a specific tab.                           |

### `<Tabs>`

A helper component that renders a list of tab items for a pane, wrapping the internal drag-and-drop tab logic.

| Prop           | Type                                                                                                                                                                                 | Required | Description                                                          |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------- |
| `tabs`         | `string[]`                                                                                                                                                                           | Yes      | The list of tab IDs in this pane.                                    |
| `activeTabId`  | `string`                                                                                                                                                                             | Yes      | The currently active tab ID.                                         |
| `locked`       | `boolean`                                                                                                                                                                            | No       | Whether dragging/reordering tabs is disabled (defaults to `false`).  |
| `tabsMetadata` | `Record<string, Record<string, any>>`                                                                                                                                                | No       | Metadata associated with each tab.                                   |
| `selectTab`    | `(id: string) => void`                                                                                                                                                               | Yes      | Callback when a tab is selected.                                     |
| `removeTab`    | `(id: string) => void`                                                                                                                                                               | Yes      | Callback when a tab is closed/removed.                               |
| `classNames`   | `{ container?: string; tab?: string \| ((tabId: string) => string) }`                                                                                                                | No       | Custom class names for the container and individual tab items.       |
| `styles`       | `{ container?: CSSProperties; tab?: CSSProperties \| ((tabId: string) => CSSProperties) }`                                                                                           | No       | Custom inline CSS styles for the container and individual tab items. |
| `renderTab`    | `(props: { tabId: string; activeTabId: string; isDragging: boolean; isOver: boolean; metadata?: Record<string, unknown>; onSelect: () => void; onRemove: () => void }) => ReactNode` | Yes      | Render prop function called for each tab item.                       |

### `<DragHandle>`

Defines the interactive drag region inside a `<Pane>`. **Must be placed inside a `<Pane>` component.**

| Prop        | Type                  | Required | Description                                                      |
| ----------- | --------------------- | -------- | ---------------------------------------------------------------- |
| `children`  | `ReactNode`           | Yes      | Element(s) that function as the drag handle (e.g., pane header). |
| `className` | `string`              | No       | Custom CSS class for the drag handle wrapper.                    |
| `style`     | `React.CSSProperties` | No       | Inline styles for the drag handle wrapper.                       |

## Tree Utilities

Import these serializable tree utility functions from `react-zeugma/utils` for programmatically mutating or querying layout schemas.

#### `generateUniqueId(): string`

Generates a unique pane ID string (e.g., `'pane-abc123xyz'`). Useful when creating new pane nodes programmatically.

#### `removePane(tree: TreeNode | null, paneId: string): TreeNode | null`

Recursively scans the layout tree, removes the targeted pane node, and collapses redundant split boundaries.

#### `removeTab(tree: TreeNode | null, tabId: string): TreeNode | null`

Removes a single tab from its parent pane. If the pane has no remaining tabs after removal, the pane itself is collapsed out of the tree.

#### `addPane(tree: TreeNode | null, paneToAdd: string, metadata?: Record<string, unknown>): TreeNode`

Recursively matches the bottommost/rightmost pane leaf in the tree, splits it, and inserts the target `paneToAdd`. Optionally sets initial metadata for the new pane's tab.

#### `addTab(tree: TreeNode | null, targetPaneId: string, tabId: string, metadata?: Record<string, unknown>): TreeNode | null`

Appends a tab directly into a specific target pane node by its ID. Sets the new tab as the active tab. Does nothing if `targetPaneId` is not found.

#### `splitPane(tree, targetId, direction, splitType, paneToAdd)`

Splits the targeted `targetId` pane inside the tree with `direction` (_row_ / _column_) and type (_left_, _right_, _top_, _bottom_) to insert `paneToAdd`. `paneToAdd` may be a tab ID string or a full `PaneNode` object.

#### `updateSplitPercentage(tree: TreeNode | null, target: SplitNode, newPercentage: number): TreeNode | null`

Finds the target `SplitNode` by reference in the tree and updates its `splitPercentage`.

#### `selectTab(tree: TreeNode | null, paneId: string, tabId: string): TreeNode | null`

Activates the specified `tabId` within the `paneId` pane node. Returns the tree unchanged if the tab is already active or the pane is not found.

#### `mergeTab(tree: TreeNode | null, draggedTabId: string, targetPaneId: string): TreeNode | null`

Moves `draggedTabId` from its current pane into `targetPaneId`, preserving tab metadata. Collapses the source pane if it becomes empty. Sets the moved tab as the active tab in the target pane.

#### `moveTab(tree: TreeNode | null, draggedTabId: string, targetTabId: string, position?: 'before' | 'after'): TreeNode | null`

Reorders `draggedTabId` adjacent to `targetTabId` within the same pane (or moves it cross-pane). `position` defaults to `'before'`.

#### `updateTabMetadata(tree: TreeNode | null, tabId: string, updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined): TreeNode | null`

Updates the metadata of a specific tab using an updater function. Returning `undefined` from the updater removes the entry.

#### `updatePaneLock(tree: TreeNode | null, paneId: string, locked: boolean): TreeNode | null`

Sets the `locked` flag on the specified pane node. When `locked` is `false`, the field is removed from the node entirely to keep the tree clean.

#### `findPaneById(tree: TreeNode | null, paneId: string): PaneNode | null`

Recursively searches the layout tree and returns the target `PaneNode` if found, or `null` otherwise.

#### `findPaneContainingTab(tree: TreeNode | null, tabId: string): PaneNode | null`

Recursively searches the layout tree and returns the `PaneNode` containing the specified `tabId`.

#### `findTabById(tree: TreeNode | null, tabId: string): TabDetails | null`

Searches the layout tree for the given `tabId` and returns computed details (parent `paneId`, `isActive`, `index`, and custom `metadata`).

#### `computeLayout(node: TreeNode | null, left?, top?, width?, height?): { panes: ComputedPane[]; splitters: ComputedSplitter[] }`

Recursively computes the absolute position and dimensions (as percentages relative to the container) for every pane and splitter in the tree. Useful for building custom render layers or analytics on top of the layout engine.

#### `calculateTabDropIndex(tabs: string[], activeType: string | null, overTabId: string | null, overTabPosition: 'before' | 'after' | null): number`

Calculates the target insertion index for a dragged tab within a list of tabs. Returns `-1` if the drop target is not in the list.

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
    // tab separator line
    tabSeparator: 'w-px h-4 bg-zinc-700',
  }}
>
  <PaneTree />
</Zeugma>
```

### `ZeugmaClassNames` reference

| Key                      | Applied to                                                                        |
| ------------------------ | --------------------------------------------------------------------------------- |
| `dashboard`              | Root dashboard container.                                                         |
| `dashboardDismissActive` | Root container when a drag-out dismiss is active.                                 |
| `dashboardLocked`        | Root container when the dashboard is globally locked.                             |
| `pane`                   | Outer wrapper `<div>` of each `<Pane>`.                                           |
| `paneLocked`             | Pane container when locked.                                                       |
| `dropPreview`            | Drop zone preview box when hovering over a split-edge drop zone.                  |
| `dragOverlay`            | Cursor-following drag preview portal wrapper.                                     |
| `resizer`                | Drag-to-resize split bar handles.                                                 |
| `dismissPreview`         | Background dismiss zone indicator during a drag-out dismiss gesture.              |
| `lockedPreview`          | Drop zone indicator when hovering over a locked pane.                             |
| `tabDropPreview`         | Placeholder line element rendered at the target insertion point during tab drags. |
| `tabSeparator`           | Separator line rendered between non-active adjacent tabs in `<Tabs>`.             |

---

## Types Reference

Full TypeScript type definitions exported from `react-zeugma`.

### Layout Tree

```ts
export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number // 0–100
}

export interface PaneNode {
  type: 'pane'
  id: string
  tabs: string[]
  activeTabId: string
  locked?: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
}

export type TreeNode = SplitNode | PaneNode

export interface TabDetails {
  id: string
  paneId: string
  isActive: boolean
  index: number
  metadata: Record<string, unknown> | undefined
}
```

### Component Props

```ts
export interface PaneProps {
  id: string
  children: React.ReactNode
  style?: React.CSSProperties
  locked?: boolean
}

export interface DragHandleProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export interface TabsProps {
  tabs: string[]
  activeTabId: string
  locked?: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
  selectTab: (id: string) => void
  removeTab: (id: string) => void
  renderTab: (props: {
    tabId: string
    activeTabId: string
    isDragging: boolean
    isOver: boolean
    metadata?: Record<string, unknown>
    onSelect: () => void
    onRemove: () => void
  }) => React.ReactNode
  classNames?: {
    container?: string
    tab?: string | ((tabId: string) => string)
  }
  styles?: {
    container?: React.CSSProperties
    tab?: React.CSSProperties | ((tabId: string) => React.CSSProperties)
  }
}
```

### Render Props

```ts
export interface PaneRenderProps {
  isDragging: boolean
  isFullscreen: boolean
  toggleFullscreen: () => void
  remove: () => void
  metadata: Record<string, unknown> | undefined
  updateMetadata: (
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  locked: boolean
  tabs: string[]
  activeTabId: string
  selectTab: (tabId: string) => void
  removeTab: (tabId: string) => void
  tabsMetadata: Record<string, Record<string, unknown>> | undefined
  updateTabMetadata: (
    tabId: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
}

}
```

### Controller & Context

```ts
export interface ZeugmaState {
  layout: TreeNode | null
  fullscreenPaneId: string | null
  locked: boolean
}

export interface ZeugmaStateSetters {
  setLayout: Dispatch<SetStateAction<TreeNode | null>>
  setFullscreenPaneId: (paneId: string | null) => void
  setLocked: Dispatch<SetStateAction<boolean>>
}

export interface ZeugmaActions {
  removePane: (paneId: string) => void
  addTab: (tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => void
  updateMetadata: (
    id: string,
    updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined,
  ) => void
  updatePaneLock: (paneId: string, locked: boolean) => void
  selectTab: (paneId: string, tabId: string) => void
  mergeTab: (draggedTabId: string, targetPaneId: string) => void
  removeTab: (tabId: string) => void
  splitPane: (
    targetId: string,
    direction: SplitDirection,
    splitType: 'left' | 'right' | 'top' | 'bottom',
    paneToAdd: string,
  ) => void
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void
  moveTab: (draggedTabId: string, targetTabId: string, position?: 'before' | 'after') => void
}

export interface ZeugmaQueries {
  findPaneById: (paneId: string) => PaneNode | null
  findPaneContainingTab: (tabId: string) => PaneNode | null
  findTabById: (tabId: string) => TabDetails | null
  getTabMetadata: (tabId: string) => Record<string, unknown> | undefined
  getActiveTabMetadata: (paneId: string) => Record<string, unknown> | undefined
}

export interface ZeugmaController
  extends ZeugmaState, ZeugmaStateSetters, ZeugmaActions, ZeugmaQueries {}
```

### Computed Layout Types (from `react-zeugma/utils`)

```ts
export interface ComputedPane {
  paneId: string
  left: number // percentage
  top: number // percentage
  width: number // percentage
  height: number // percentage
  node: PaneNode
}

export interface ComputedSplitter {
  id: string
  currentNode: SplitNode
  direction: SplitDirection
  left: number
  top: number
  width: number
  height: number
  parentLeft: number
  parentTop: number
  parentWidth: number
  parentHeight: number
}
```
