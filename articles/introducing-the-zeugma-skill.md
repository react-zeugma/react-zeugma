# How to Use the react-zeugma SKILL.md File

AI coding agents need clear context to write correct code. To help them work with `react-zeugma` without API hallucinations, you can provide a structured `SKILL.md` file in your workspace.

### How to add it:

1. Create a `SKILL.md` file in your project root or config directory.
2. Copy and paste the code block below into it.

---

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

## Links

- [GitHub Repository](https://github.com/react-zeugma/react-zeugma)
- [npm Package](https://www.npmjs.com/package/react-zeugma)
- [Contributing Guide](https://github.com/react-zeugma/react-zeugma/blob/master/CONTRIBUTING.md)
````
