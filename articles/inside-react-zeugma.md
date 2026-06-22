# Inside React-Zeugma: A Headless Layout Engine

Building a modern web application often means giving users control over their workspace. Whether they are building financial trading terminals, real-time operations dashboards, business intelligence (BI) systems, or complex telemetry hubs, users expect a desktop-grade experience. They want to split layouts into resizable sections, group widgets into tabbed views, drag widgets to rearrange them, and zoom individual panels to full screen.

Historically, implementing these capabilities in React has forced developers to choose between grid-based layout engines (like `react-grid-layout`) and rigid dock-based frame systems (like `DockView` or `GoldenLayout`).

`react-zeugma` was designed to pioneer a third way: a **headless, recursive binary-split layout engine** that pairs pure React state management with aggressive performance optimizations.

Let's explore the architecture of `react-zeugma`, how it achieves fluid 60fps resizing under heavy widget loads, and how it solves the notorious React component unmounting problem during layout restructuring.

---

## The Dashboard Layout Paradigm: Grid vs. Dock vs. Binary Splits

In the React ecosystem, complex screen partitioning generally follows one of two dominant paradigms:

1. **Grid-Based Layouts** (e.g., `react-grid-layout`): Panes are positioned as absolute coordinates on a fixed grid (e.g., `{x: 0, y: 0, w: 6, h: 4}`). While highly interactive and great for simple widgets, grids do not naturally support hierarchical split-pane resizing, edge-docking, or pane nesting.
2. **Dock-Based Systems** (e.g., `DockView`, `GoldenLayout`, `FlexLayout`): These engines provide rich docking, splits, and tab groups, but they are often tightly coupled to their own imperative layout lifecycle engines. They ship heavy default CSS themes and manage state internally, forcing you to interact with layout objects via direct API calls rather than declarative React state.

`react-zeugma` takes a different route, drawing inspiration from tree-structured split systems (like `react-mosaic`) but decoupling the data model entirely from the render loop.

| Architectural Feature | Grid-Based (e.g., react-grid-layout) | Dock-Based (e.g., DockView) | Binary Split (react-zeugma)       |
| :-------------------- | :----------------------------------- | :-------------------------- | :-------------------------------- |
| **Data Structure**    | Flat Coordinate Array                | Imperative Group Tree       | Serializable Binary Split Tree    |
| **State Ownership**   | Declarative (React-owned)            | Imperative (Library-owned)  | Declarative (React-owned)         |
| **Resize Model**      | Recalculate grid positions           | Native DOM resizing         | Flat calculation + CSS Var Bypass |
| **Aesthetics**        | Absolute grid positioning            | Built-in CSS themes         | Headless (Zero CSS)               |
| **Persistence**       | Reloads state                        | Custom state API            | Portal-based preservation         |

---

## The Data Model: Space Partitioning as a Binary Tree

At the core of `react-zeugma` is a clean, serializable JSON tree model. Instead of storing layout coordinates, the layout is modeled as a recursive binary split tree.

In spatial computing, this is known as a **Binary Space Partitioning (BSP) tree**. Each split divides the available space along a horizontal or vertical axis, allocating a percentage of the width or height to its children.

Here is the data structure represented in simple pseudocode:

```javascript
// A layout is either a single pane of tabs or a split containing two sub-layouts
LayoutTree = {
  type: 'split',
  direction: 'row', // or 'column'
  splitPercentage: 50,
  first: PaneNodeA, // Left/Top side
  second: PaneNodeB, // Right/Bottom side
}
```

Because the layout tree is represented as plain, nested JSON, it is the **single source of truth** for the workspace.

### Why this is a win for dashboards:

- **Trivial Serialization**: You can save the entire layout state of a user's multi-monitor dashboard to a database or `localStorage` as a single string.
- **Pure State Mutations**: Standard operations—adding a widget, splitting a pane, merging two tab groups—are pure functions. They take a tree, perform a mutation, and return a new tree, which integrates perfectly with React's state model.
- **Layout Diffing**: You can calculate layout changes, implement undo/redo stacks, and sync layout changes between different users in real-time.

---

## Flat Rendering via Layout Flattening — Eliminating Flexbox Nesting

In typical tree-based layout systems, rendering mimics the data structure. A vertical splitter maps to a wrapper `<div>` with `display: flex; flex-direction: row;`, nesting children recursively inside.

While intuitive, this approach creates **deeply nested DOM structures** as the layout complexity grows. A dashboard with 12 split panes might end up with dozens of nested flex containers. This nested DOM causes major performance bottlenecks:

- **Layout Thrashing**: Any resize event propagates calculations through multiple layout boundaries.
- **Flexbox Cascades**: Sizing changes inside one deeply nested pane can unexpectedly reflow siblings due to automatic flex sizing.

To avoid this, `react-zeugma` flattens the rendering tree entirely.

Before rendering, a utility traverses the binary tree _once_, taking the current layout boundaries (initially `0, 0, 100, 100` percent) and calculating the absolute percentage-based boundaries of every pane and splitter.

```javascript
// Flatten layout to absolute percentages (conceptual pseudocode)
function flattenLayout(node, left, top, width, height) {
  if (node is pane) {
    return [{ id: node.id, left, top, width, height }];
  }
  // Recursively calculate split dimensions for children
  return [
    ...flattenLayout(node.first, ...firstDimensions),
    ...flattenLayout(node.second, ...secondDimensions)
  ];
}
```

The resulting flat arrays of panes and splitters are then rendered as **direct siblings inside a single absolute-positioned container**.

```html
<!-- Flat DOM Output -->
<div class="zeugma-container">
  <div class="pane" style="left: 0%; width: 30%;">Pane A</div>
  <div class="splitter" style="left: 30%; width: 4px;"></div>
  <div class="pane" style="left: 30%; width: 70%;">Pane B</div>
</div>
```

This flat DOM ensures that every pane and resizer exists at the same hierarchy depth, preventing layout recalculation cascades and ensuring rapid browser rendering regardless of how deep the splitting tree goes.

---

## The Resize System: CSS Variable Render Bypass

On a dashboard, panes aren't just empty boxes—they house interactive chart libraries (e.g., canvas-based visualizations), WebGL maps, heavy data tables, and dynamic feeds.

If we recalculate the layout and trigger a React state change (and thus a full React re-render of the workspace) at 60 frames per second during a splitter drag, we will choke the main thread. Heavy widgets will unmount, re-initialize, or trigger intensive calculations mid-drag, causing severe frame drops and lag.

To solve this, `react-zeugma` uses a **CSS Custom Properties Render Bypass** during live resizes:

1. **Pointer Interaction**: When a user drags a splitter, a mouse/touch drag session is initiated.
2. **Dynamic Tree Calculation**: As the drag moves, the engine calculates the proposed percentage. It updates the split percentage on the current node in memory and runs the layout flattener.
3. **DOM Style Writing**: Instead of updating React state with the new layout, the engine writes the calculated positions of all affected panes and splitters directly to **CSS Custom Properties** on the root container element.
4. **State Commit**: Only when the user releases the pointer is the final layout tree written back to React state, which clears the inline CSS custom properties and updates the layout model permanently.

```javascript
// Bypassing React during dragging (conceptual pseudocode)
function onDragMove(dragDelta) {
  const newPositions = computeLayoutWithDelta(dragDelta)

  // Directly update DOM style variables, avoiding React re-renders entirely
  for (const pane of newPositions) {
    container.style.setProperty(`--pane-width-${pane.id}`, `${pane.width}%`)
  }
}

function onDragEnd() {
  saveFinalLayoutState() // Update React state once at the very end
  clearContainerStyles() // Clear inline CSS styles
}
```

In the CSS, each pane positions itself using these variables with fallback to the last committed React state values:

```css
.zeugma-pane-wrapper {
  position: absolute;
  left: var(--pane-left-id, var(--pane-fallback-left));
  width: var(--pane-width-id, var(--pane-fallback-width));
}
```

By bypassing React's reconciler during the drag gesture, the browser only has to update style coordinates and perform composite layer transformations, keeping the resize animation running at a smooth 60fps even with dozens of heavy charts on the screen.

---

## Drag-and-Drop Architecture: Custom Collision Detection

Dashboard layouts need to be highly fluid. If a user wants to rearrange their workspace, they should be able to:

- Drag a tab header out of one pane and dock it onto the edge of another pane (splitting it).
- Drag a tab header to reorder tabs within the same group or move it to a different tab group.
- Drag a widget to an edge of the screen to create a major split spanning the entire layout.

`react-zeugma` implements this using `@dnd-kit/core` but layers on a **custom multi-level collision detection engine**.

```
- Root edge drop zones (Split the entire workspace layout)
- Pane edge drop zones (Split a specific pane)
- Tab drop zones (Reorder tabs inside a pane)
```

When dragging a widget or tab header, the cursor flies over overlapping hot zones. To ensure intuitive behavior, the collision engine prioritizes targets sequentially:

1. **Tab Drop Hotspots**: If the dragged pointer is directly over a tab bar, tab collision takes highest priority, allowing quick reordering or stacking.
2. **Pane Edge Hotspots**: If the pointer moves toward the edges of a pane (top, bottom, left, right), the engine activates an edge-split drop zone. Dropping here splits that specific pane.
3. **Root Edge Hotspots**: If the pointer moves to the outer boundaries of the entire dashboard, root split zones activate. Dropping here splits the root layout, creating a layout-wide column or row.
4. **Locked Panes**: If a pane is marked as locked, drops onto its edge or body are filtered out, preventing unwanted splits of static widgets.

Because the system supports both **whole pane drags** and **individual tab drags**, the collision detection system differentiates draggable items by ID prefix rules and maps them to appropriate target shapes.

---

## Portal-Based Widget Persistence: Preventing Component Unmounting

In React, the virtual DOM tree determines component lifecycles. If a component's position in the DOM hierarchy changes, or if it is unmounted from one parent and mounted under another, **React destroys the component and recreates it from scratch**.

For dashboards, this default behavior is disastrous:

- If a user drags an interactive chart from the left pane to the right pane, the chart component unmounts. Its internal canvas is destroyed, its WebSocket connection closes, and its scroll offset resets.
- If a user switches between tab views, the inactive tab's components unmount, destroying form input states, filter settings, and loaded data.

`react-zeugma` solves this with a **Portal Registry pattern**.

Instead of rendering dashboard widgets directly inside the `<Pane>` component, the library renders all widgets inside a hidden parent DOM node (`<div id="zeugma-portal-host">`) using React Portals (`createPortal`).

```
React Component Tree:
<Zeugma>
  ├── <PaneTree>  (renders the visual layout, tabs, and split lines)
  │     └── <Pane id="pane-1">
  │           └── <div ref={targetRef} /> <-- Empty target container
  └── <PortalHost> (holds all active widgets using React Portals)
        ├── <PortalHostItem id="widget-1"> -> Portals to target container
        └── <PortalHostItem id="widget-2"> -> Portals to target container
```

Here is how the portal mounting lifecycle works:

1. **Instantiation**: When a tab ID is registered, `<PortalHostItem>` mounts the widget component inside a stable, off-screen DOM element using React's `createPortal`.
2. **Decoupled DOM Attachment**: When a pane mounts or switches its active tab, it exposes a DOM container `targetRef`.
3. **Native Reparenting**: A lightweight effect observes the active pane's target node. When the target changes, the item reparents its wrapper element using native DOM manipulation.
4. **Hidden Cache**: If a widget becomes inactive (e.g. its tab is deselected), the target node becomes `null`. The engine appends the wrapper to a hidden background container to keep it alive.

```javascript
// Native reparenting (conceptual pseudocode)
if (targetPane) {
  // Move the widget element into the active pane
  targetPane.appendChild(widgetDOMElement)
} else {
  // Store the widget element in a hidden cache container to keep it alive
  hiddenCacheContainer.appendChild(widgetDOMElement)
}
```

Because the React component tree inside the portals remains connected to the `<PortalHost>` root, **React never unmounts the widget**. The DOM node is simply moved elsewhere in the page tree. As a result:

- Chart instances, canvas states, and WebGL contexts remain intact.
- Open WebSocket connections, local state hooks, and scroll states are preserved.
- Iframe widgets do not reload during dragging.

---

## Context Architecture: Minimizing Re-renders

A common pitfall with React context is that any change to the context value forces all consumers to re-render. If a layout engine provides state (the layout tree) and actions (like `removePane`) in a single context, every resize action will trigger re-renders on components that only need static actions.

To prevent this, `react-zeugma` segments its React contexts into four dedicated providers:

1. **`ZeugmaStateContext`**: Provides reactive layout properties (`layout`, active pane, etc.).
2. **`ZeugmaActionsContext`**: Provides stable, non-changing reference callbacks (`addPane`, `removePane`, `selectTab`, `splitPane`).
3. **`ZeugmaDragContext`**: Contains ephemeral, high-frequency drag state.
4. **`PortalRegistryContext`**: Manages portal target registration.

Because state and actions are separated, components like close buttons, tab headers, and sidebar toggles only consume the `ActionsContext`. When a user resizes or drags panes, these static components do not undergo virtual DOM diffing or re-rendering, leaving the CPU free to handle the drag calculations.

---

## Headless Design: Style Agnosticism for Enterprise Dashboards

Design consistency is vital for enterprise dashboards. Some dashboards require a sleek dark theme for trading rooms, others need standard light mode for office reports, and some require styling via Tailwind CSS or CSS Modules.

By keeping its core layout engine **headless**, `react-zeugma` ships zero CSS styles. Instead, it delegates styling to the developer through a `classNames` configuration mapping:

```javascript
// Example of styling with tailwind classnames
const classNames = {
  container: 'w-full h-full relative overflow-hidden bg-slate-900',
  pane: 'flex flex-col bg-slate-800 border border-slate-700',
  resizer: 'bg-slate-700 hover:bg-blue-500 transition-colors',
}
```

This complete freedom lets you use standard Tailwind utility classes, custom styled-components, or standard CSS sheets without fighting built-in rules, overrides, or layout engine hacks.

---

## Functional Tree Utilities: Predictability and Testability

All spatial calculations and mutations in `react-zeugma` are built as pure, functional utilities. Key actions like `removePane`, `splitPane`, and `moveTab` do not modify the tree state directly. They are simple pure functions matching:

```javascript
// Pure functional utility pattern
const nextLayout = removePane(currentLayout, 'terminal-pane')
```

Because these helpers are pure, you can run complete layouts, simulate splits, and assert mutations inside headless Node.js tests without mounting any React components or relying on browser DOM APIs.

---

## Summary: Choosing the Right Tool for Your Application

Understanding the structural differences between layout engines helps you select the correct architecture for your system constraints:

| Feature Dimension | react-zeugma              | DockView                  | react-grid-layout         | react-mosaic-component     |
| :---------------- | :------------------------ | :------------------------ | :------------------------ | :------------------------- |
| **Primary Focus** | Customizable Dashboards   | IDE Workspace Frames      | Simple Widget Grids       | Basic Pane Splitting       |
| **Layout Tree**   | Recursive Binary Tree     | Flex/Dock Stack Group     | Flat Coordinate List      | Binary Tree                |
| **DOM Depth**     | Flat (Sibling items)      | Nested (Flex groups)      | Flat (Absolute grid)      | Nested (Flex DOM wrappers) |
| **Widget State**  | Portaled (Never unmounts) | Managed (Custom registry) | None (Unmounts on change) | None (Unmounts on change)  |
| **Resize Method** | CSS Custom Properties     | Native DOM / Flex         | Transform coordinates     | React state updates        |
| **Styling Model** | Headless (Zero CSS files) | Default CSS Themes        | Layout-critical CSS       | Blueprint.js theme         |

If your application needs standard dashboard grid editing (e.g. arranging card widgets on a grid), `react-grid-layout` remains a natural choice. If you are building a full, IDE-style application with dockable windows, `DockView` provides a robust, developer-ready shell.

However, if you are designing a **custom, state-heavy dashboard** (such as operational consoles, trading desks, or BI tools) where widgets must retain their interactive state, resize at a fluid 60fps, and conform strictly to your design system, `react-zeugma`'s flat rendering and portal-based architecture offers a modern, high-performance solution.
