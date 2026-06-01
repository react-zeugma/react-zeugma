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
export type SplitDirection = 'row' | 'column';

export interface SplitNode {
  type: 'split';
  direction: SplitDirection;
  first: TreeNode;
  second: TreeNode;
  splitPercentage: number; // 0 to 100
}

export interface PaneNode {
  type: 'pane';
  paneId: string;
}

export type TreeNode = SplitNode | PaneNode;
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
  isDragging: boolean;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  remove: () => void;
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
- **`swapPanes(tree: TreeNode | null, idA: string, idB: string): TreeNode | null`**
  Swaps the positions of two panes in the tree.

---

## 4. Basic Integration Recipe

```tsx
import { useState } from 'react';
import { DashboardProvider, PaneTree, Pane, DragHandle, TreeNode } from 'react-zeugma';

const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 50,
  first: { type: 'pane', paneId: 'sidebar' },
  second: { type: 'pane', paneId: 'main' },
};

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
  );
}

export default function App() {
  const [layout, setLayout] = useState<TreeNode | null>(initialLayout);
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const handleRemove = (paneId: string) => {
    // Remove the pane and update layout
    setLayout((prev) => removePane(prev, paneId));
  };

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
  );
}
```

---

## 5. Styling Customization

`react-zeugma` is style-agnostic and relies on class name configuration for visual states. Define classes in your styling framework and pass them via the `classNames` prop on `<DashboardProvider>`:

```ts
interface ZeugmaClassNames {
  pane?: string; // Applied to the outer wrapper of <Pane>
  dropPreview?: string; // Applied to the preview box when hovering over edge dropzones
  swapPreview?: string; // Applied to the preview box when hovering over center dropzone
  dragOverlay?: string; // Applied to the cursor-following drag preview portal
  resizer?: string; // Applied to the drag-to-resize split bar
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
