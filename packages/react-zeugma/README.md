# react-zeugma

A recursive, drag-and-drop dashboard layout engine for React. It combines the tree-based, arbitrary splitting capabilities of `react-mosaic` with the declarative, state-driven API model of `react-grid-layout`, powered by `@dnd-kit/core`.

[![npm version](https://img.shields.io/npm/v/react-zeugma?color=brightgreen&style=flat-square)](https://www.npmjs.com/package/react-zeugma)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-zeugma?color=blue&style=flat-square)](https://bundlephobia.com/package/react-zeugma)
[![license](https://img.shields.io/npm/l/react-zeugma?color=yellow&style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

It is completely style-agnostic (headless), meaning you style all container states, resizers, and drop previews with your own class names.

## Installation

```bash
npm install react-zeugma
```

## Quick Start

Initialize your layout tree with `useZeugma` and render the dashboard using `<Zeugma>`.

```tsx
import { useZeugma, Zeugma, Pane, TreeNode } from 'react-zeugma'

// 1. Define the initial layout tree structure
const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 30,
  first: { type: 'pane', id: 'left-panel', tabIds: ['left-panel'], activeTabId: 'left-panel' },
  second: { type: 'pane', id: 'right-panel', tabIds: ['right-panel'], activeTabId: 'right-panel' },
}

// 2. Build your custom pane wrapper
function DashboardPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      <div className="flex flex-col h-full bg-zinc-900 border border-zinc-700">
        <Pane.DragHandle className="p-2 bg-zinc-800 cursor-grab text-zinc-300 font-semibold">
          {id}
        </Pane.DragHandle>
        <Pane.Content className="flex-1 p-4 text-zinc-400">
          {(tab) => <div>Active Tab Content: {tab.id}</div>}
        </Pane.Content>
      </div>
    </Pane>
  )
}

// 3. Mount the layout controller and dashboard renderer
export default function DashboardApp() {
  const controller = useZeugma({ initialLayout })

  return (
    <div className="w-screen h-screen">
      <Zeugma controller={controller} renderPane={(paneId) => <DashboardPane id={paneId} />} />
    </div>
  )
}
```

---

## API Reference

### Components

#### `<Zeugma>`

The root provider and layout renderer. It configures the drag-and-drop context, calculates panel positions, and renders resize splitters.

##### Usage

```tsx
import { Zeugma } from 'react-zeugma'
;<Zeugma
  controller={controller}
  renderPane={(paneId) => <MyPane id={paneId} />}
  resizerSize={4}
  dragActivationDistance={8}
  snapThreshold={8}
  minSplitPercentage={5}
  maxSplitPercentage={95}
  enableDragToDismiss={false}
  dismissThreshold={60}
  classNames={{
    dashboard: 'bg-zinc-950',
    pane: 'rounded-lg overflow-hidden',
    resizer: 'bg-zinc-800 hover:bg-indigo-500 transition-colors',
    dropPreview: 'bg-indigo-500/20 border border-indigo-500',
  }}
  onRemove={(paneId) => console.log(`Pane ${paneId} closed`)}
  onResizeEnd={(currentNode, percentage) => console.log('Resized to', percentage)}
/>
```

##### Props

| Property                 | Description                                                                                                                                                 | Type                                                                                                                                                                                             | Default |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `controller`             | The layout state controller returned by `useZeugma(options)`.                                                                                               | `ZeugmaController`                                                                                                                                                                               | -       |
| `children`               | Children components rendered inside the context provider.                                                                                                   | `ReactNode`                                                                                                                                                                                      | -       |
| `renderPane`             | Callback function to map active pane IDs to custom pane structures. Required in standalone mode (without children) and must not be passed in provider mode. | `(paneId: string) => ReactNode`                                                                                                                                                                  | -       |
| `renderDragOverlay`      | Custom overlay renderer function for the drag-under-cursor preview.                                                                                         | `(active: DragOverlayActiveItem) => ReactNode`                                                                                                                                                   | -       |
| `classNames`             | CSS class name mapping overrides for custom dashboard and overlay styling.                                                                                  | `ZeugmaClassNames`                                                                                                                                                                               | -       |
| `resizerSize`            | Thickness of the split resizer bars in pixels.                                                                                                              | `number`                                                                                                                                                                                         | `4`     |
| `dragActivationDistance` | Minimum pointer drag distance (in pixels) required to activate dragging.                                                                                    | `number`                                                                                                                                                                                         | `8`     |
| `snapThreshold`          | Threshold in pixels to snap layout resizers to adjacent edges.                                                                                              | `number`                                                                                                                                                                                         | `8`     |
| `minSplitPercentage`     | Minimum split limit percentage allowed for resized panes.                                                                                                   | `number`                                                                                                                                                                                         | `5`     |
| `maxSplitPercentage`     | Maximum split limit percentage allowed for resized panes.                                                                                                   | `number`                                                                                                                                                                                         | `95`    |
| `enableDragToDismiss`    | Enables drag-out-to-dismiss gesture for widgets.                                                                                                            | `boolean`                                                                                                                                                                                        | `false` |
| `dismissThreshold`       | Distance in pixels outside container bounds required to trigger dismissal.                                                                                  | `number`                                                                                                                                                                                         | `60`    |
| `onRemove`               | Callback triggered when a pane is removed.                                                                                                                  | `(paneId: string) => void`                                                                                                                                                                       | -       |
| `onDragStart`            | Callback triggered when a drag gesture begins.                                                                                                              | `(activeId: string) => void`                                                                                                                                                                     | -       |
| `onDragEnd`              | Callback triggered when a drag gesture ends, containing active pane, target pane, and action metadata.                                                      | `(activeId: string, overId: string \| null, dropAction: { type: 'split' \| 'move'; direction?: SplitDirection; position?: 'top' \| 'bottom' \| 'left' \| 'right' \| 'center' } \| null) => void` | -       |
| `onResizeStart`          | Callback triggered when resizing begins.                                                                                                                    | `(currentNode: SplitNode) => void`                                                                                                                                                               | -       |
| `onResize`               | Callback triggered during pane resizing.                                                                                                                    | `(currentNode: SplitNode, percentage: number) => void`                                                                                                                                           | -       |
| `onResizeEnd`            | Callback triggered when pane resizing completes.                                                                                                            | `(currentNode: SplitNode, percentage: number) => void`                                                                                                                                           | -       |
| `onDismissIntentChange`  | Callback triggered when drag-out dismiss intent changes.                                                                                                    | `(paneId: string \| null) => void`                                                                                                                                                               | -       |
| `persist`                | Layout persistence configuration in localStorage. If true, uses default options.                                                                            | `boolean \| ZeugmaPersistOptions`                                                                                                                                                                | `false` |

##### `ZeugmaPersistOptions`

```ts
interface ZeugmaPersistOptions {
  /** Whether layout persistence is enabled. Defaults to true if this configuration object is provided. */
  enabled?: boolean
  /** The key used for localStorage persistence. Defaults to 'zeugma-layout'. */
  key?: string
}
```

---

#### `<PaneTree>`

Recursively renders the dashboard grid hierarchy (resizers, split panels, and active pane contents). **Must be rendered when using `<Zeugma>` as a context provider.**

##### Usage

```tsx
import { Zeugma, PaneTree } from 'react-zeugma'
;<Zeugma controller={controller}>
  <div className="workspace">
    <PaneTree renderPane={(paneId) => <MyPane id={paneId} />} />
  </div>
</Zeugma>
```

##### Props

| Property        | Description                                                                               | Type                            | Default |
| --------------- | ----------------------------------------------------------------------------------------- | ------------------------------- | ------- |
| `renderPane`    | **Required**. Callback function mapping unique pane IDs to custom `<Pane>` components.    | `(paneId: string) => ReactNode` | -       |
| `tree`          | Optional layout subtree to render (defaults to the root layout tree from the controller). | `TreeNode \| null`              | -       |
| `resizerSize`   | Optional override for the thickness of split resizer handles in pixels.                   | `number`                        | `4`     |
| `snapThreshold` | Optional override for the snapping threshold of resizer handles in pixels.                | `number`                        | `8`     |

---

#### `<Pane>`

Wraps each individual pane/widget within the dashboard, establishing drag-and-drop boundaries.

- **`<Pane.DragHandle>`**: Defines the interactive header or area used to drag the pane.
- **`<Pane.Content>`**: Renders the active tab's content. Accepts a child render function `(tab) => React.ReactNode` or static ReactNode.
- **`<Pane.Controls>`**: Renders standard control buttons for closing or maximizing the pane.

##### Usage

```tsx
import { Pane } from 'react-zeugma'
;<Pane id="pane-1" locked={false}>
  <Pane.DragHandle className="p-2 cursor-grab bg-zinc-800">
    <span>Pane Title</span>
  </Pane.DragHandle>
  <Pane.Controls />
  <Pane.Content className="p-4">
    {(tab) => <div>Rendered content for tab: {tab.id}</div>}
  </Pane.Content>
</Pane>
```

##### Props

| Property   | Description                                                        | Type                  | Default |
| ---------- | ------------------------------------------------------------------ | --------------------- | ------- |
| `id`       | The unique ID corresponding to the layout node.                    | `string`              | -       |
| `children` | Children components rendered inside the pane.                      | `React.ReactNode`     | -       |
| `style`    | Optional inline CSS styles applied to the outer pane container.    | `React.CSSProperties` | -       |
| `locked`   | Optional override to lock this specific pane and disable dragging. | `boolean`             | `false` |

---

#### `<Tabs>`

A helper component to render and reorder a list of tabs inside a pane.

##### Usage

```tsx
import { Tabs } from 'react-zeugma'
;<Tabs
  tabIds={['tab1', 'tab2']}
  activeTabId="tab1"
  selectTab={(tabId) => console.log('Select tab:', tabId)}
  removeTab={(tabId) => console.log('Close tab:', tabId)}
  renderTab={({ tabId, activeTabId, onSelect, onRemove }) => (
    <button
      onClick={onSelect}
      className={`px-3 py-1 ${tabId === activeTabId ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
    >
      {tabId}
      <span
        className="ml-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        ×
      </span>
    </button>
  )}
/>
```

##### Props

| Property       | Description                                            | Type                                                                                                                                                                                 | Default |
| -------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `tabIds`       | Array of tab IDs.                                      | `string[]`                                                                                                                                                                           | -       |
| `activeTabId`  | The currently active tab ID.                           | `string`                                                                                                                                                                             | -       |
| `locked`       | Whether tab dragging/reordering is disabled.           | `boolean`                                                                                                                                                                            | `false` |
| `tabsMetadata` | Metadata mapping associated with each tab in the pane. | `Record<string, Record<string, unknown>>`                                                                                                                                            | -       |
| `selectTab`    | Callback when a tab is selected.                       | `(id: string) => void`                                                                                                                                                               | -       |
| `removeTab`    | Callback when a tab is closed.                         | `(id: string) => void`                                                                                                                                                               | -       |
| `classNames`   | Custom class names for the container and tabs.         | `{ container?: string; tab?: string \| ((tabId: string) => string) }`                                                                                                                | -       |
| `styles`       | Custom CSS style overrides for the container and tabs. | `{ container?: CSSProperties; tab?: CSSProperties \| ((tabId: string) => CSSProperties) }`                                                                                           | -       |
| `renderTab`    | Render prop function called for each tab item.         | `(props: { tabId: string; activeTabId: string; isDragging: boolean; isOver: boolean; metadata?: Record<string, unknown>; onSelect: () => void; onRemove: () => void }) => ReactNode` | -       |

---

### Hooks

#### `useZeugma(options)`

A custom state hook that instantiates the dashboard layout engine and returns the controller.

##### Usage

```tsx
import { useZeugma } from 'react-zeugma'

const controller = useZeugma({
  initialLayout: myInitialLayoutTree, // used on mount
  layout: myControlledLayout, // used for controlled mode
  onChange: (nextLayout) => {}, // layout update callback
  locked: false, // lock all dragging and resizing
  fullscreenPaneId: null, // ID of pane to zoom fullscreen
  onFullscreenChange: (paneId) => {}, // callback when pane zoom toggled
})
```

##### Options

| Parameter            | Description                                                                 | Type                                    | Default |
| -------------------- | --------------------------------------------------------------------------- | --------------------------------------- | ------- |
| `initialLayout`      | Initial layout tree structure. Only used on mount.                          | `TreeNode \| null`                      | `null`  |
| `layout`             | Controlled layout tree structure. Hook runs in controlled mode if provided. | `TreeNode \| null`                      | `null`  |
| `onChange`           | Callback triggered when the layout tree updates.                            | `(newLayout: TreeNode \| null) => void` | -       |
| `fullscreenPaneId`   | Controlled fullscreen pane ID.                                              | `string \| null`                        | `null`  |
| `onFullscreenChange` | Callback triggered when fullscreen state toggles.                           | `(paneId: string \| null) => void`      | -       |
| `locked`             | Global lock status to disable resizing and drag-and-drop operations.        | `boolean`                               | `false` |

---

#### `useZeugmaContext()`

Context hook to retrieve layout state, queries, and mutation actions from anywhere under the `<Zeugma>` tree.

##### Usage

```tsx
import { useZeugmaContext } from 'react-zeugma'

const { layout, locked, setLocked, addTab, removePane, selectTab, findPaneById } =
  useZeugmaContext()
```

##### Context Values

| Property / Method       | Description                                                       | Type                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `layout`                | The current active layout tree structure.                         | `TreeNode \| null`                                                                                                            |
| `fullscreenPaneId`      | The ID of the maximized fullscreen pane.                          | `string \| null`                                                                                                              |
| `locked`                | Whether the dashboard layout is globally locked.                  | `boolean`                                                                                                                     |
| `setLayout`             | React state setter to update the layout tree.                     | `Dispatch<SetStateAction<TreeNode \| null>>`                                                                                  |
| `setFullscreenPaneId`   | Updates the active fullscreen pane ID.                            | `(paneId: string \| null) => void`                                                                                            |
| `setLocked`             | Updates the global layout lock state.                             | `Dispatch<SetStateAction<boolean>>`                                                                                           |
| `removePane`            | Removes a pane and collapses the split.                           | `(paneId: string) => void`                                                                                                    |
| `addTab`                | Adds a tab to a pane, or splits/creates one if target is omitted. | `(tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => void`                                          |
| `updateMetadata`        | Mutates a specific tab's metadata.                                | `(id: string, updater: (current: Record<string, unknown> \| undefined) => Record<string, unknown> \| undefined) => void`      |
| `updatePaneLock`        | Toggles the lock status of a specific pane.                       | `(paneId: string, locked: boolean) => void`                                                                                   |
| `selectTab`             | Focuses/activates a tab within a pane.                            | `(paneId: string, tabId: string) => void`                                                                                     |
| `mergeTab`              | Programmatically drags and drops a tab from one pane to another.  | `(draggedTabId: string, targetPaneId: string) => void`                                                                        |
| `removeTab`             | Programmatically closes a tab.                                    | `(tabId: string) => void`                                                                                                     |
| `splitPane`             | Programmatically splits a pane node and adds a new one.           | `(targetId: string, direction: SplitDirection, splitType: 'left' \| 'right' \| 'top' \| 'bottom', paneToAdd: string) => void` |
| `updateSplitPercentage` | Updates a SplitNode percentage.                                   | `(currentNode: SplitNode, percentage: number) => void`                                                                        |
| `moveTab`               | Reorders a tab next to another.                                   | `(draggedTabId: string, targetTabId: string, position?: 'before' \| 'after') => void`                                         |
| `findPaneById`          | Queries a PaneNode by its unique ID.                              | `(paneId: string) => PaneNode \| null`                                                                                        |
| `findPaneContainingTab` | Queries the parent PaneNode of a tab ID.                          | `(tabId: string) => PaneNode \| null`                                                                                         |
| `findTabById`           | Queries detailed tab location and state metadata.                 | `(tabId: string) => TabDetails \| null`                                                                                       |
| `getTabMetadata`        | Gets metadata for a tab ID.                                       | `(tabId: string) => Record<string, unknown> \| undefined`                                                                     |
| `getActiveTabMetadata`  | Gets metadata for the active tab in a pane.                       | `(paneId: string) => Record<string, unknown> \| undefined`                                                                    |

---

#### `usePaneContext()`

Context hook to access the state and actions of a specific pane. Must be used inside a `<Pane>` component.

##### Usage

```tsx
import { usePaneContext } from 'react-zeugma'

const {
  id,
  tabIds,
  activeTabId,
  isDragging,
  isFullscreen,
  toggleFullscreen,
  remove,
  selectTab,
  removeTab,
  updateMetadata,
} = usePaneContext()
```

##### Context Values

| Property / Method   | Description                                         | Type                                                                                                                        |
| ------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `id`                | The ID of the current pane.                         | `string`                                                                                                                    |
| `tabIds`            | List of tab IDs inside the pane.                    | `string[]`                                                                                                                  |
| `activeTabId`       | Currently active tab ID.                            | `string`                                                                                                                    |
| `isDragging`        | `true` if this pane is being dragged.               | `boolean`                                                                                                                   |
| `isFullscreen`      | `true` if this pane is maximized.                   | `boolean`                                                                                                                   |
| `toggleFullscreen`  | Toggles maximized state for this pane.              | `() => void`                                                                                                                |
| `remove`            | Removes this pane from the layout tree.             | `() => void`                                                                                                                |
| `selectTab`         | Activates a tab within this pane.                   | `(tabId: string) => void`                                                                                                   |
| `removeTab`         | Closes a tab from this pane.                        | `(tabId: string) => void`                                                                                                   |
| `metadata`          | Active tab's custom metadata.                       | `Record<string, unknown> \| undefined`                                                                                      |
| `updateMetadata`    | Updates active tab's metadata.                      | `(updater: (current: Record<string, unknown> \| undefined) => Record<string, unknown> \| undefined) => void`                |
| `locked`            | Whether the pane or the dashboard is locked.        | `boolean`                                                                                                                   |
| `tabsMetadata`      | Tab metadata mapping for all tabs inside this pane. | `Record<string, Record<string, unknown>> \| undefined`                                                                      |
| `updateTabMetadata` | Updates metadata for a specific tab in the pane.    | `(tabId: string, updater: (current: Record<string, unknown> \| undefined) => Record<string, unknown> \| undefined) => void` |

---

#### `useResizer(props)`

Low-level hook for implementing custom pane resizing handles.

##### Usage

```tsx
import { useResizer } from 'react-zeugma'

const handlePointerDown = useResizer({
  containerRef,
  isRow,
  direction,
  splitPercentage,
  resizerSize,
  snapThreshold,
  layout,
  currentNode,
  onLayoutChange: (nextTree) => {},
})
```

---

## Layout Utilities

Import utility functions from `react-zeugma/utils` to programmatically query or update the serialized layout tree.

##### Usage

```ts
import {
  generateUniqueId,
  splitPane,
  removePane,
  addTab,
  removeTab,
  selectTab,
  mergeTab,
  moveTab,
  movePaneTabs,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  computeLayout,
} from 'react-zeugma/utils'

// 1. Generate a random unique pane ID
const newPaneId = generateUniqueId()

// 2. Programmatically split a target pane in the tree
const updatedTree = splitPane(currentTree, 'explorer', 'row', 'right', 'terminal')

// 3. Programmatically add a tab to a pane
const updatedTree = addTab(currentTree, 'editor', 'new-file.js', { status: 'unsaved' })

// 4. Find which pane contains a specific tab
const parentPane = findPaneContainingTab(currentTree, 'new-file.js')
```

---

## Styling & Class Names

`react-zeugma` is 100% headless. You must style resizers, previews, and containers by providing custom class names.

##### Usage

```tsx
<Zeugma
  controller={controller}
  classNames={{
    dashboard: 'dashboard-root',
    pane: 'pane-wrapper',
    resizer: 'custom-resizer-line',
    dropPreview: 'drop-preview-box',
    tabDropPreview: 'tab-line-preview',
  }}
/>
```

##### Class Names Mapping

| Class Key                | Description                                                         |
| ------------------------ | ------------------------------------------------------------------- |
| `dashboard`              | Root dashboard grid container.                                      |
| `dashboardDismissActive` | Dashboard container when active item is dragged outside to dismiss. |
| `dashboardLocked`        | Dashboard container when layout is globally locked.                 |
| `pane`                   | Outer container div of each `<Pane>`.                               |
| `paneLocked`             | Pane container wrapper when locked.                                 |
| `paneContainer`          | Pane inner content container wrapper.                               |
| `paneHeader`             | Drag header wrapper inside the pane.                                |
| `paneControls`           | Controls wrapper container (maximizing, close, lock).               |
| `paneButton`             | Maximize/Close control buttons.                                     |
| `dropPreview`            | Preview indicator box for edge layout splits.                       |
| `rootDropPreview`        | Preview indicator for full layout splits.                           |
| `dragOverlay`            | Absolute portal wrapper following the dragging cursor.              |
| `paneDragPreview`        | Outer wrapper container of a pane drag preview node.                |
| `tabDragPreview`         | Outer wrapper container of a tab drag preview node.                 |
| `resizer`                | Pointer-drag splitter handle bars.                                  |
| `dismissPreview`         | Background indicator showing visual drag-to-dismiss zones.          |
| `lockedPreview`          | Hover visual feedback indicator for locked pane zones.              |
| `tabDropPreview`         | Tab list insertion indicator line.                                  |
| `tabSeparator`           | Line separator between static tabs.                                 |
| `tabContentWrapper`      | Custom tab content element wrapper.                                 |
| `tabsContainer`          | Layout tabs container header bar.                                   |
| `tab`                    | Individual tab list items.                                          |
| `tabCloseButton`         | Close button inside a tab item.                                     |
| `dragHandle`             | Drag target region.                                                 |
