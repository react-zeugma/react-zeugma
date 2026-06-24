# Introducing the react-zeugma SKILL.md for AI Coding Assistants

`react-zeugma` is a recursive, drag-and-drop dashboard layout engine for React. It combines the tree-based, arbitrary splitting capabilities of `react-mosaic` with the declarative, state-driven API model of `react-grid-layout`, built on top of `@dnd-kit/core`.

To build flexible layouts, developers use three core concepts:

1. **The Layout Tree (`TreeNode`)**: A recursive binary tree structure where branches are splits (`SplitNode`) and leaves are panels (`PaneNode`).
2. **The Layout Controller (`useZeugma`)**: A React hook that manages the active layout state, resizing, fullscreen zoom toggling, and locking mechanism.
3. **Compound Components (`<Zeugma>`, `<Pane>`)**: Render layers that translate the layout state into physical DOM elements, resizer drag handles, and drag-and-drop drop zones.

Because `react-zeugma` relies on complex recursive layout modifications and is completely style-agnostic (headless), AI coding agents (such as Gemini, Cursor, or Copilot) can sometimes hallucinate API parameters or struggle with state mutation rules.

To solve this, you can add a `SKILL.md` file to your project workspace. This file acts as a structured prompt/knowledge resource that guides AI coding assistants to write bug-free code with `react-zeugma`.

### How to use this file:

1. Create a `SKILL.md` file in your `.agents/skills/react-zeugma/` directory.
2. Copy the contents of the code block below and paste them into it.

---

````markdown
---
name: react-zeugma
description: Rules, types, component composition, and programmatic manipulation guidelines for integrating and using the react-zeugma dashboard layout engine.
---

# Skill: Using react-zeugma

`react-zeugma` is a recursive drag-and-drop dashboard layout engine for React. It manages tree-based pane splitting (similar to `react-mosaic`) and provides a declarative state-driven API (similar to `react-grid-layout`) built on `@dnd-kit/core`.

---

## 1. Core AI Rules & Constraints

- **Immutable State Rule**: Never mutate layout `TreeNode` objects directly in-place. You must treat them as immutable. Always use the pure utility functions exported by `react-zeugma/utils` to perform mutations and return fresh tree references.
- **Headless Styling Rule**: `react-zeugma` is 100% style-agnostic and applies no default CSS. You MUST specify class names in the `classNames` configuration on `<Zeugma>` (specifically for `resizer`, `dropPreview`, `tabDropPreview`, `paneDragPreview`, and `tabDragPreview`) or the layout features will be invisible/non-functional.
- **renderPane Placement Rule**: If using `<Zeugma>` with `children` (Context Provider Mode), you MUST pass the `renderPane` prop directly to `<PaneTree renderPane={renderPane} />`, and `renderPane` is forbidden on `<Zeugma>`. If using `<Zeugma>` in standalone mode (without `children`), you MUST pass `renderPane` directly to `<Zeugma renderPane={renderPane} />`.
- **DragHandle Placement**: Draggable panes require a child `<Pane.DragHandle>` component to define the interactive drag region.

---

## 2. Layout Data Model (JSON Schema)

The dashboard layout is serialized as a recursive binary tree of `TreeNode` elements:

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
````

- **`PaneNode` (Leaf)**: Holds active tabs and the selected tab ID.
- **`SplitNode` (Branch)**: Divides space into `first` and `second` sub-trees based on `splitPercentage` (percentage of the first child's size relative to the parent boundary).

---

## 3. Component Composition Rules

### Standalone Renderer

```tsx
import { useZeugma, Zeugma, Pane } from 'react-zeugma'

function Dashboard() {
  const controller = useZeugma({ initialLayout })
  return (
    <Zeugma
      controller={controller}
      renderPane={(id) => (
        <Pane id={id}>
          <Pane.DragHandle className="drag">Header</Pane.DragHandle>
          <Pane.Content>{(tab) => <div>{tab.id}</div>}</Pane.Content>
        </Pane>
      )}
    />
  )
}
```

### Context Provider Mode

If `<Zeugma>` wraps child components, it serves as a Context Provider. Use `<PaneTree>` (imported from `react-zeugma`) inside it to render the visual panels and pass the `renderPane` function directly to `<PaneTree>`:

```tsx
import { useZeugma, Zeugma, PaneTree, Pane } from 'react-zeugma'

function Dashboard() {
  const controller = useZeugma({ initialLayout })
  const renderPane = (id: string) => (
    <Pane id={id}>
      <Pane.DragHandle className="drag">Header</Pane.DragHandle>
      <Pane.Content>{(tab) => <div>{tab.id}</div>}</Pane.Content>
    </Pane>
  )
  return (
    <Zeugma controller={controller}>
      <div className="custom-wrapper">
        <PaneTree renderPane={renderPane} />
      </div>
    </Zeugma>
  )
}
```

---

## 4. API Reference for hooks

### `useZeugma(options)`

Instantiates the dashboard state engine.

- `initialLayout?: TreeNode | null` (Initial uncontrolled tree)
- `layout?: TreeNode | null` (Controlled layout tree)
- `onChange?: (newLayout: TreeNode | null) => void` (Layout updates handler)
- `locked?: boolean` (Disable all resize/drag-and-drop operations)
- `fullscreenPaneId?: string | null` (Maximize target pane ID)
- `onFullscreenChange?: (paneId: string | null) => void` (Maximize toggle handler)

### `useZeugmaContext()`

Access actions and queries from parent `<Zeugma>` context:

```ts
const {
  layout,
  locked,
  setLocked,
  setLayout,
  removePane,
  addTab,
  selectTab,
  splitPane,
  findPaneById,
  findPaneContainingTab,
  findTabById,
} = useZeugmaContext()
```

### `usePaneContext()`

Access details inside a child component of `<Pane>`:

```ts
const {
  id,
  tabs,
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

---

## 5. Pure Tree Manipulation Utilities

Import these layout mutators/queries from `react-zeugma/utils`:

- **`splitPane(tree, targetId, direction, splitType, paneToAdd)`**: Splits `targetId` pane in a direction (`'row'` / `'column'`) and split type (`'left'` | `'right'` | `'top'` | `'bottom'`). `paneToAdd` can be a tab ID string or a full `PaneNode`. Returns the updated tree.
- **`removePane(tree, paneId)`**: Removes a pane and collapses the parent split. Returns the updated tree.
- **`addTab(tree, targetPaneId, tabId, metadata?)`**: Appends a tab to a target pane and sets it active. Returns the updated tree.
- **`removeTab(tree, tabId)`**: Removes a tab from its pane; collapses empty panes. Returns the updated tree.
- **`selectTab(tree, paneId, tabId)`**: Activates a tab inside a pane. Returns the updated tree.
- **`mergeTab(tree, draggedTabId, targetPaneId)`**: Moves a tab from its source pane to target pane. Returns the updated tree.
- **`moveTab(tree, draggedTabId, targetTabId, position?)`**: Moves a tab before/after target tab. Returns the updated tree.
- **`findPaneById(tree, paneId)`**: Returns matching `PaneNode` or `null`.
- **`findPaneContainingTab(tree, tabId)`**: Returns parent `PaneNode` containing the tab, or `null`.
- **`findTabById(tree, tabId)`**: Returns `TabDetails` or `null`.
- **`computeLayout(tree)`**: Calculates absolute positions (`{ left, top, width, height }` as percentages) for all panes and splitters.

```

```
