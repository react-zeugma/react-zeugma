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

> [!IMPORTANT]
> **State & Mount Preservation Rule:**
> Always render stateful components (like text editors, terminals, or any stateful views) inside the `renderWidget` callback. The `renderPane` callback is strictly for layout frame/chrome rendering and must render `paneProps.renderActiveTab()` directly. Wrapping `renderActiveTab()` with stateful components or passing active tab IDs as props inside `renderPane` will cause those wrappers to destroy and recreate their hooks/state when tabs are switched or dragged.

### `useZeugma(options)`

A custom state hook that initializes and manages the recursive layout tree and handles drag-and-drop actions.

| Option                   | Type                                                                                                                                                 | Default | Description                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `initialLayout`          | `TreeNode \| null`                                                                                                                                   | —       | Initial layout tree structure for uncontrolled mode. Only used on initial mount.                          |
| `layout`                 | `TreeNode \| null`                                                                                                                                   | —       | Controlled layout tree structure. If provided, the hook runs in controlled mode and synchronizes with it. |
| `fullscreenPaneId`       | `string \| null`                                                                                                                                     | —       | Controlled fullscreen pane ID. Pass `null` for no fullscreen pane.                                        |
| `onFullscreenChange`     | `(paneId: string \| null) => void`                                                                                                                   | —       | Callback triggered when a pane is toggled to/from fullscreen mode.                                        |
| `locked`                 | `boolean`                                                                                                                                            | `false` | If true, layout resizes and drags are disabled.                                                           |
| `dragActivationDistance` | `number`                                                                                                                                             | `8`     | Minimum pointer drag distance (in pixels) required to activate dragging.                                  |
| `snapThreshold`          | `number`                                                                                                                                             | `8`     | Threshold in pixels to snap layout resizers to adjacent edges.                                            |
| `minSplitPercentage`     | `number`                                                                                                                                             | `5`     | Minimum resizing limit percentage.                                                                        |
| `maxSplitPercentage`     | `number`                                                                                                                                             | `95`    | Maximum resizing limit percentage.                                                                        |
| `enableDragToDismiss`    | `boolean`                                                                                                                                            | `false` | If true, enables the drag-out-to-dismiss gesture to close widgets.                                        |
| `dismissThreshold`       | `number`                                                                                                                                             | `60`    | Distance in pixels outside container bounds required to trigger dismissal.                                |
| `onRemove`               | `(paneId: string) => void`                                                                                                                           | —       | Callback triggered when a pane is removed.                                                                |
| `onDragStart`            | `(activeId: string) => void`                                                                                                                         | —       | Callback triggered when dragging starts.                                                                  |
| `onDragEnd`              | `(activeId: string, overId: string \| null, dropAction: { type: 'split' \| 'move'; direction?: SplitDirection; position?: string } \| null) => void` | —       | Callback triggered when dragging ends, with drop target and action details.                               |
| `onResizeStart`          | `(currentNode: SplitNode) => void`                                                                                                                   | —       | Callback triggered when resizing starts.                                                                  |
| `onResize`               | `(currentNode: SplitNode, percentage: number) => void`                                                                                               | —       | Callback triggered during resizing.                                                                       |
| `onResizeEnd`            | `(currentNode: SplitNode, percentage: number) => void`                                                                                               | —       | Callback triggered when resizing ends.                                                                    |
| `onDismissIntentChange`  | `(paneId: string \| null) => void`                                                                                                                   | —       | Callback triggered when drag-out intent changes.                                                          |

### `useZeugmaContext()`

A custom React context hook that returns the unified layout controller properties and state actions. Must be used within a `<Zeugma>` provider component.

Provides direct access to the current layout state (e.g., `layout`, `layoutBeforeDrag`, `locked`), state setters (e.g., `setLocked`), queries (e.g., `findTabById`, `findPaneContainingTab`, `findPaneById`), and mutation actions (e.g., `addPane`, `removePane`, `updateTabMetadata`, `removeTab`, `selectTab`, etc.).

```ts
const { layout, layoutBeforeDrag, locked, findTabById, setLocked } = useZeugmaContext()
```

### `<PaneTree>`

Recursively renders the split nodes and pane nodes. Must be placed inside `<Zeugma>`.

| Prop          | Type               | Required | Description                                                         |
| ------------- | ------------------ | -------- | ------------------------------------------------------------------- |
| `tree`        | `TreeNode \| null` | No       | Custom subtree to render. Defaults to the provider's root `layout`. |
| `resizerSize` | `number`           | No       | Thickness of the split resizer bars in pixels. Defaults to `4`.     |

### `<Pane id>`

Wraps the individual pane components inside the renderer. Utilizes a render prop passing active layout attributes.

| Prop       | Type                                    | Required | Description                                                            |
| ---------- | --------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `id`       | `string`                                | Yes      | The unique ID corresponding to a `PaneNode`'s `paneId`.                |
| `children` | `(props: PaneRenderProps) => ReactNode` | Yes      | Render prop function.                                                  |
| `style`    | `React.CSSProperties`                   | No       | Optional inline CSS styles applied to the pane outer container.        |
| `locked`   | `boolean`                               | No       | Optional override to lock this specific pane (disables drag and drop). |

#### Render Props: `PaneRenderProps`

| Parameter           | Type                                                                                                                        | Description                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `isDragging`        | `boolean`                                                                                                                   | `true` if the pane is actively being dragged.                            |
| `isFullscreen`      | `boolean`                                                                                                                   | `true` if the pane currently occupies the fullscreen view.               |
| `toggleFullscreen`  | `() => void`                                                                                                                | Toggles the pane to and from fullscreen/zoomed mode.                     |
| `remove`            | `() => void`                                                                                                                | Removes this pane (and its active tab) from the layout tree.             |
| `metadata`          | `Record<string, unknown> \| undefined`                                                                                      | The metadata values associated with the active tab.                      |
| `updateMetadata`    | `(updater: (current: Record<string, unknown> \| undefined) => Record<string, unknown> \| undefined) => void`                | Updates metadata of the active tab via an updater function.              |
| `locked`            | `boolean`                                                                                                                   | `true` if this specific pane or the dashboard globally is locked.        |
| `tabs`              | `string[]`                                                                                                                  | The array of tab IDs in this pane.                                       |
| `activeTabId`       | `string`                                                                                                                    | The currently active tab ID.                                             |
| `selectTab`         | `(tabId: string) => void`                                                                                                   | Selects a specific tab to make it active.                                |
| `removeTab`         | `(tabId: string) => void`                                                                                                   | Removes/closes a specific tab.                                           |
| `tabsMetadata`      | `Record<string, Record<string, unknown>> \| undefined`                                                                      | Metadata values associated with all tabs in this pane.                   |
| `updateTabMetadata` | `(tabId: string, updater: (current: Record<string, unknown> \| undefined) => Record<string, unknown> \| undefined) => void` | Updates the metadata of a specific tab.                                  |
| `renderActiveTab`   | `() => ReactNode`                                                                                                           | Renders the portal placeholder for the currently active tab in the pane. |

### `<Tabs>`

A helper component that renders a list of tab items for a pane, wrapping the internal drag-and-drop tab logic.

| Prop           | Type                                                                                                                                                                                                       | Required | Description                                                          |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------- |
| `tabs`         | `string[]`                                                                                                                                                                                                 | Yes      | The list of tab IDs in this pane.                                    |
| `activeTabId`  | `string`                                                                                                                                                                                                   | Yes      | The currently active tab ID.                                         |
| `locked`       | `boolean`                                                                                                                                                                                                  | No       | Whether dragging/reordering tabs is disabled (defaults to `false`).  |
| `tabsMetadata` | `Record<string, Record<string, any>>`                                                                                                                                                                      | No       | Metadata associated with each tab.                                   |
| `selectTab`    | `(id: string) => void`                                                                                                                                                                                     | Yes      | Callback when a tab is selected.                                     |
| `removeTab`    | `(id: string) => void`                                                                                                                                                                                     | Yes      | Callback when a tab is closed/removed.                               |
| `classNames`   | `{ container?: string; tab?: string \| ((tabId: string) => string) }`                                                                                                                                      | No       | Custom class names for the container and individual tab items.       |
| `styles`       | `{ container?: CSSProperties; tab?: CSSProperties \| ((tabId: string) => CSSProperties) }`                                                                                                                 | No       | Custom inline CSS styles for the container and individual tab items. |
| `renderTab`    | `(props: { tabId: string; activeTabId: string; isDragging: boolean; isOver: boolean; metadata?: Record<string, unknown>; selectTab: (id: string) => void; removeTab: (id: string) => void }) => ReactNode` | Yes      | Render prop function called for each tab item.                       |

### `useTabContext()`

A context hook that provides per-tab state from within a `<Tab>` component rendered inside `<Tabs>`. Must be used within a rendered tab child.

```ts
const { tabId, isActive, isDragging, isOver, metadata, locked, selectTab, removeTab } =
  useTabContext()
```

| Property     | Type                                   | Description                                        |
| ------------ | -------------------------------------- | -------------------------------------------------- |
| `tabId`      | `string`                               | The ID of the tab this context belongs to.         |
| `isActive`   | `boolean`                              | Whether this tab is the currently active tab.      |
| `isDragging` | `boolean`                              | Whether this tab is currently being dragged.       |
| `isOver`     | `boolean`                              | Whether a dragged item is currently over this tab. |
| `metadata`   | `Record<string, unknown> \| undefined` | Custom metadata associated with this tab.          |
| `locked`     | `boolean`                              | Whether this tab (or the dashboard) is locked.     |
| `selectTab`  | `() => void`                           | Selects this tab (no argument needed).             |
| `removeTab`  | `() => void`                           | Removes/closes this tab (no argument needed).      |

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

#### `getOrCreateHiddenContainer(id: string): HTMLElement`

Retrieves or initializes a hidden container `div` appended to `document.body` for sheltering portal elements while they are inactive or popped out.

## Popping Out Tabs (Open in a New Window)

`react-zeugma` includes built-in support for popping out tab panels into separate browser windows (popouts) with **zero React component unmounting or state loss**.

### How it Works

1. **State-Driven**: The popped-out state of tabs is tracked in a dedicated `popoutTabs` state map (mapping tab IDs to booleans) on the controller.
2. **Stable Portal target**: The React portal container reference is kept stable, and `document.adoptNode` is used to migrate the DOM container directly between parent and popup documents, keeping internal component state (like inputs, terminal histories, or connections) fully intact.
3. **Style Syncing**: Active stylesheets and link tags are automatically copied from the parent workspace into the popup window on creation.
4. **Auto-Restoration**: Close actions on the popup window automatically update the state via `setTabPopout(tabId, false)` and restore the tab wrapper back to the main document layout.

### Integration Recipe

To enable popping out tabs in your dashboard:

#### 1. Add a Popout Toggle Button

Inside your pane header or controls, add a button to toggle the popout state of the active tab:

```tsx
<button
  onClick={() => {
    const activeTabId = paneProps.activeTabId
    const isPopout = !!zeugma.popoutTabs[activeTabId]
    zeugma.setTabPopout(activeTabId, !isPopout)
  }}
>
  {zeugma.popoutTabs[paneProps.activeTabId] ? 'Restore' : 'Popout'}
</button>
```

#### 2. Display a Placeholder in the Workspace Layout

When a tab is open in a separate window, render a custom placeholder inside the main workspace pane instead of rendering the tab's active content:

```tsx
<div className="pane-body">
  {zeugma.popoutTabs[paneProps.activeTabId] ? (
    <div className="popout-placeholder">
      <p>This tab is open in a separate window.</p>
      <button
        onClick={() => {
          zeugma.setTabPopout(paneProps.activeTabId, false)
        }}
      >
        Restore Tab
      </button>
    </div>
  ) : (
    paneProps.renderActiveTab()
  )}
</div>
```

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

````ts
export interface PaneProps {
  id: string
  children: (props: PaneRenderProps) => React.ReactNode
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
    selectTab: (id: string) => void
    removeTab: (id: string) => void
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
  renderActiveTab: () => ReactNode
}

export interface TabContextValue {
  tabId: string
  isActive: boolean
  isDragging: boolean
  isOver: boolean
  metadata?: Record<string, unknown>
  locked: boolean
  selectTab: () => void
  removeTab: () => void
}
````

### Controller & Context

```ts
export interface UseZeugmaOptions { /* see useZeugma() section above */ }

export interface ZeugmaController {
  // State
  layout: TreeNode | null
  setLayout: Dispatch<SetStateAction<TreeNode | null>>
  fullscreenPaneId: string | null
  setFullscreenPaneId: (paneId: string | null) => void
  locked: boolean
  setLocked: Dispatch<SetStateAction<boolean>>

  // DnD state
  activeId: string | null
  activeType: 'pane' | 'tab' | null
  dismissIntentId: string | null

  // Config
  dragActivationDistance: number
  snapThreshold: number
  minSplitPercentage: number
  maxSplitPercentage: number
  enableDragToDismiss: boolean
  dismissThreshold: number

  // Public actions
  removePane: (paneId: string) => void
  addPane: (paneId: string, metadata?: Record<string, unknown>) => void
  addTab: (paneId: string, tabId: string, metadata?: Record<string, unknown>) => void
  updateTabMetadata: (tabId: string, updater: ...) => void
  updatePaneLock: (paneId: string, locked: boolean) => void
  selectTab: (paneId: string, tabId: string) => void
  mergeTab: (draggedTabId: string, targetPaneId: string) => void
  removeTab: (tabId: string) => void
  splitPane: (targetId: string, direction: SplitDirection, splitType: 'left' | 'right' | 'top' | 'bottom', paneToAdd: string) => void
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void
  moveTab: (draggedTabId: string, targetTabId: string, position?: 'before' | 'after') => void

  // Public queries
  findPaneById: (paneId: string) => PaneNode | null
  findPaneContainingTab: (tabId: string) => PaneNode | null
  findTabById: (tabId: string) => TabDetails | null
}

// ZeugmaContextValue is the combined state + actions interface
// exposed by useZeugmaContext(). It includes all of ZeugmaController
// plus the renderPane and classNames configuration.
export interface ZeugmaContextValue extends ZeugmaStateValue, ZeugmaActionsValue {}
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

> [!IMPORTANT]
> **State & Mount Preservation Rule:**
> Stateful components must be returned by `renderWidget` to leverage the library's portal-based mount preservation. Do not wrap `paneProps.renderActiveTab()` with stateful components or pass active tab IDs as props inside `renderPane`, as this will cause those components and their hooks to unmount and remount when the pane's active tab changes.

### `useZeugma(options)`

A custom hook to manage the dashboard layout state.

#### Options

- `initialLayout: TreeNode | null` — Initial layout tree structure.
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
const { layout, layoutBeforeDrag, addPane, removeTab } = useZeugmaContext()
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

### `<Tabs>`

Renders a list of tabs inside a pane, wrapping the internal drag-and-drop mechanics.

#### Props

- `tabs: string[]` — The list of tab IDs.
- `activeTabId: string` — The currently active tab ID.
- `locked?: boolean` — Whether dragging is disabled (defaults to `false`).
- `tabsMetadata?: Record<string, Record<string, unknown>>` — Metadata for the tabs.
- `selectTab: (id: string) => void` — Callback when a tab is selected.
- `removeTab: (id: string) => void` — Callback when a tab is closed.
- `classNames?: { container?: string; tab?: string | ((tabId: string) => string) }` — Custom class names.
- `styles?: { container?: React.CSSProperties; tab?: React.CSSProperties | ((tabId: string) => React.CSSProperties) }` — Custom styles.
- `renderTab: (props: { tabId: string; activeTabId: string; isDragging: boolean; isOver: boolean; metadata?: Record<string, unknown>; selectTab: (id: string) => void; removeTab: (id: string) => void; }) => React.ReactNode` — Render prop function.

### `<DragHandle>`

Defines the interactive drag region inside a `<Pane>`. **Must be placed inside a `<Pane>` component.**

#### Props

- `children: React.ReactNode` — Element(s) that function as the drag handle (e.g., pane header).
- `className?: string`
- `style?: React.CSSProperties`

## 3. Programmatic State Utilities

Import these helpers from `react-zeugma/utils` to manipulate or query the tree layout programmatically in your state handlers:

- **`removePane(tree: TreeNode | null, idToRemove: string): TreeNode | null`**
  Removes a pane from the tree and collapses the leftover sibling split node.
- **`splitPane(tree: TreeNode | null, targetId: string, direction: SplitDirection, splitType: 'left' | 'right' | 'top' | 'bottom', paneToAdd: string): TreeNode | null`**
  Splits a specific target pane by nesting it under a new `SplitNode` along with a new pane.
- **`updateTabMetadata(tree: TreeNode | null, tabId: string, updater: (current: Record<string, unknown> | undefined) => Record<string, unknown> | undefined): TreeNode | null`**
  Updates the metadata of a specific tab.
- **`findPaneById(tree: TreeNode | null, paneId: string): PaneNode | null`**
  Recursively searches the layout tree and returns the target `PaneNode` if found, or `null` otherwise.
- **`findPaneContainingTab(tree: TreeNode | null, tabId: string): PaneNode | null`**
  Recursively searches the layout tree and returns the `PaneNode` containing the specified `tabId`.
- **`findTabById(tree: TreeNode | null, tabId: string): TabDetails | null`**
  Searches the layout tree for the given `tabId` and returns computed details (parent `paneId`, `isActive`, `index`, and custom `metadata`).
- **`calculateTabDropIndex(tabs: string[], activeType: string | null, overTabId: string | null, overTabPosition: 'before' | 'after' | null): number`**
  Calculates the target insertion index for a dragged tab within a list of tabs. Returns `-1` if the drop target is not in the list.

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

> [!IMPORTANT]
> Starting from version `4.1.2`, `react-zeugma` is 100% headless and does not apply any internal default CSS fallback classes (such as `zeugma-resizer`, `zeugma-locked-preview`, etc.). All layout visual states must be styled by providing custom class names via the `classNames` configuration object.

```ts
interface ZeugmaClassNames {
  dashboard?: string // Applied to the root dashboard container
  dashboardDismissActive?: string // Applied to root container when dismiss intent is active
  dashboardLocked?: string // Applied to root container when dashboard is globally locked
  pane?: string // Applied to the outer wrapper of <Pane>
  paneLocked?: string // Applied to the pane container when locked
  dropPreview?: string // Applied to the preview box when hovering over edge dropzones
  dragOverlay?: string // Applied to the cursor-following drag preview portal
  resizer?: string // Applied to the drag-to-resize split bar
  dismissPreview?: string // Applied to the background dismiss zone indicator during a drag-out dismiss gesture
  lockedPreview?: string // Applied to drop zone indicator when hovering over a locked pane
  tabDropPreview?: string // Applied to the drop placeholder line element during tab drags
  tabSeparator?: string // Applied to the separator line between non-active adjacent tabs
}
```

### Tab Drop Preview Customization

When dragging a tab, the library automatically calculates the target insertion index and renders a placeholder indicator line at that position within the tabs list (between adjacent tabs or at the list boundaries).

To style this indicator line, configure a custom CSS class name via `classNames.tabDropPreview`.

Use this single class name in your CSS to customize the color and size (width) of the placeholder indicator line:

```css
/* Custom tab drop placeholder styling */
.my-tab-preview {
  background-color: #6366f1 !important; /* change color */
  width: 3px !important; /* change width/size */
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
````
