# react-zeugma

## 5.5.0

### Minor Changes

- Optimised drag-and-drop performance by splitting volatile hover states (`overTabId`, `overTabPosition`) into a dedicated `ZeugmaDragContext` (accessed via `useZeugmaDrag`), reducing layout rendering waterfalls.
- Wrapped `PortalHostItem` in `React.memo` to isolate widget rendering and prevent layout/widget thrashing during active dragging.
- Configured functional comparison updates for drag states inside `useZeugmaDnd` to avoid redundant React render scheduling.

## 5.4.1

### Patch Changes

- Fixed tabs list rendering and update logic by improving internal event handling and state updates.

## 5.4.0

### Minor Changes

- Introduced the `<Tabs>` container component to handle tab rendering and encapsulate internal drag-and-drop mechanics.
- Hidden `<Tab>` from public exports to simplify the API surface.
- Updated documentation and internal demo usages to consume the new `<Tabs>` component.

## 5.3.2

### Minor Changes

- Reverted TabsList component, PaneContext, and layout optimization changes, restoring the stable workspace demo.

## 5.2.1

### Patch Changes

- Fixed stale closures and layout state overwriting in programmatic actions by introducing ref-based layout tracking (`layoutRef`).
- Resolved context actions identity instability by memoizing all mutations and query methods with ref-based layout dependencies.
- Added programmatic tab uniqueness checks to `addTab` preventing duplicate tab IDs across panes.
- Exposed remaining helper/setter actions (`setFullscreenPaneId`, `setLocked`, `splitPane`, `updateSplitPercentage`, `moveTab`) in public context actions.

## 5.2.0

### Minor Changes

- Added the `addTab` action to `useZeugmaContext` / `ZeugmaController` actions to programmatically append a tab to a specific pane with optional custom metadata.
- Added optional `metadata` argument to the `addPane` action to initialize newly added panes with custom tab metadata.
- Updated the interactive workspace demo with an "Add Tab" button (+) inside pane control bars to easily test programmatic tab spawning with randomized titles, notes, and color metadata.

## 5.1.0

### Minor Changes

- Added the `findTabById` helper function to search for and retrieve specific tab details from the layout tree.
- Exposed tree query methods (`findPaneById`, `findPaneContainingTab`, `findTabById`) and the global lock state updater (`setLocked`) directly on the Zeugma state context for simplified consumption from child components.

## 5.0.0

### Major Changes

- **Terminated Legacy Swap Terminology**:
  - Replaced the obsolete `swap` drop action type with `move` in `onDragEnd` callbacks and types (`types.ts`, `useZeugmaDnd.ts`, and `demo.tsx`).
  - Cleaned up comments and styling documentation referring to layout swaps, aligning the vocabulary with the actual move/reorder actions.
- **Exposed API Refactoring & Context Separation**:
  - Restructured `ZeugmaController` and context types to separate public API from internal drag-and-drop orchestration state variables (such as `activeId`, `activeType`, `dismissIntentId`, `containerRef`, etc.), cleaning up the TypeScript surface.
  - Removed internal actions like `splitPane`, `updateSplitPercentage`, and `moveTab` from the public actions context (`ZeugmaActionsValue`).
  - Renamed `onLayoutChange` context state setter function to `setLayout` across context interfaces and consumers to follow standard React hooks conventions.
- **Set Dragged Tab as Active & Internal Refactoring**:
  - Updated the drag-and-drop state machine to set a tab as the active pane tab immediately when dragging starts.
  - Refactored contexts, context hooks, and types into the `shared` layer to resolve cross-entity FSD dependencies between `entities/pane` and `entities/zeugma`.
  - Modularized `Zeugma.tsx` by extracting dnd-kit handlers, sensors, and collision detection into a dedicated `useZeugmaDnd` custom hook.
  - Fixed TypeScript configuration errors resulting from loose types and unused variables.
- **100% Headless Style-Agnostic Setup & Simplified Tab Drop Preview**:
  - Removed all internal default fallback class names (such as `zeugma-pane-locked`, `zeugma-locked-preview`, `zeugma-resizer`, `zeugma-dashboard-root`, `zeugma-dashboard-dismiss-active`, `zeugma-dashboard-locked`, and `zeugma-dismiss-preview`) to achieve a fully headless, style-agnostic library.
  - Added new `dashboard` and `dashboardDismissActive` options to the `ZeugmaClassNames` interface for styling the root container and its active dismiss state.
  - Replaced the tab drop preview system with an internally-rendered single line element in the `<Tab>` component. This line is absolute-positioned on left/right boundaries internally and can be customized via the single `tabDropPreview` class name.

## 4.1.1

### Patch Changes

- **Support Controlled Layout Property**:
  - Implemented both controlled (`layout`) and uncontrolled (`initialLayout`) state modes inside the `useZeugma` hook. The hook now operates in controlled mode when the `layout` prop is provided, and in uncontrolled (self-managed) mode using `initialLayout` on mount when it is omitted.

## 4.1.0

### Minor Changes

- **Unified Context Access Hook (`useZeugmaContext`)**:
  - Implemented and exported the new public `useZeugmaContext` hook to simplify dashboard integration. It merges `useZeugmaState` and `useZeugmaActions` into a single, comprehensive layout control hook, removing callback prop-drilling for external components like sidebars.
  - Added and exported the `ZeugmaContextValue` type interface.

## 4.0.0

### Major Changes

- **Flat API Refactoring & useZeugma Hook Integration (Simplified root API & Context encapsulation)**:
  - Introduced the brand new **`useZeugma` hook**, allowing developers to declare and manage layout state, configuration, and actions setup locally within their components.
  - Re-architected the `<Zeugma>` component props to directly extend `ZeugmaController`. This allows spreading the return value of `useZeugma` directly (e.g., `<Zeugma {...zeugma} />`) rather than manually passing separate `layout`, `onChange`, and other state/callback props individually.
  - Removed internal context hooks (`useZeugmaState`, `useZeugmaActions`) from public exports in `packages/react-zeugma/src/index.ts` to fully encapsulate internal state mechanics and simplify the public library surface.

## 3.0.1

### Patch Changes

- **Bento Puzzle Enhancements & Theme-Specific Styling**:
  - Implemented the custom Zeugma Museum Zen Bento Builder puzzle, complete with interactive archeological widgets (Gypsy Girl, Excavation Grid, Statue of Mars, Euphrates Level, and Conservation Logs).
  - Encapsulated drag-and-drop mechanics inside `<Tab>` and `<DragHandle>` components.
  - Made the puzzle non-closable by disabling pane and tab close triggers to preserve layout components.
  - Aligned drop zone overlays, active tab indicators, reorder markers, and split-pane resizer handles with the warm sand/gold/terracotta theme.

## 3.0.0

### Major Changes

- **Tabbed Panes (Tabulation) & High-Performance Layout Engine**:
  - **First-Class Tabbed Panes**: Added support for multi-tab panels/panes. Panes can now hold multiple tabs, with support for tab selection, closing, and updating tab-specific metadata.
  - **Clean, Encapsulated APIs**: Introduced a custom `<Tab>` wrapper component that handles all `@dnd-kit` drag-and-drop mechanics internally. Consumers can build custom tabbed layouts without importing or dealing with the underlying DND hooks.
  - **Drag-to-Reorder, Tabulate & Split**: Implemented intuitive tab drag gestures:
    - Reorder tabs by dragging them horizontally within their pane.
    - Merge tabs between panes by dragging one tab onto the header bar dropzone of another pane.
    - Split a tab off from a tab group to form side-by-side or stacked pane splits by dropping on its outer borders.
  - **Parent Split Guard**: Enabled parent pane splitting for multi-tab pane groups, accompanied by a guard in the drop handler that blocks splitting single-tab panes (avoiding node deletion issues).
  - **Tab Drop Fallback**: Implemented a custom hybrid collision detection callback that checks if the pointer is within any active drop zone, falling back to `closestCenter` restricted to `tab-drop-` elements when dragging tab headers. This allows dragging and drop-reordering tabs to the end of lists (into empty tab bar space).
  - **CSS Custom Property Resizing**: Offloaded active pane resizing to CSS Custom Properties (`--pane-left-${id}`, etc.) set dynamically on the parent container. Size modifications bypass intermediate React rendering entirely, committing to the React tree state exactly once at gesture end (`pointerup`).
  - **Widget Caching**: Integrated `MemoizedPaneContent` wrapper in `<PaneTree>` to cache layout widget contents. This isolates user-rendered panels (like tables, editors, charts) from executing React render cycles during layout resizes and transitions.
  - **Refactored Calculations**: Consolidated layout bounding box calculations (`computeLayout`) into pure shared utilities in `tree-helpers.ts` for cleaner separation of concerns.

## 2.3.0

### Minor Changes

- **Layout and Pane Lock Feature**:
  - Added support for a first-class `locked` property on the layout tree nodes (`PaneNode`).
  - Added global dashboard-level locking via the `locked` prop on `<Zeugma>`, which disables all pane dragging and split resizing.
  - Implemented the `updatePaneLock` action to toggle individual pane locks dynamically.
  - Implemented automatic pointer cursor overrides (`not-allowed`) using a custom `useBodyCursorOverride` hook when attempting to drag over locked drop zones.
  - Added visual drop previews for blocked target actions (`lockedPreview`).
  - Provided custom class configurations for locks: `paneLocked`, `dashboardLocked`, and `lockedPreview`.
  - Fully type-safe context updates for drag handles, removing legacy `as any` type assertions.

## 2.2.2

### Patch Changes

- **Optimize Resize Performance**:
  - Resizer now keeps the split percentage change completely local to a React hook state during dragging, eliminating heavy re-renders of all dashboard pane widgets on every move event.
  - The parent `onLayoutChange` and `onChange` callbacks are deferred and invoked exactly once when the drag/resize gesture ends.

## 2.2.1

### Patch Changes

- **Revert Drag Hiding and Live Layout Estimation**:
  - Reverted the live layout estimation and hiding of active dragged widgets. Widgets now remain visible at their original layout position during dragging.

## 2.2.0

### Minor Changes

- **Flat Layout Rendering with Absolute Positioning**:
  - Re-architected layout engine from recursive nested flexboxes to a single-level flat layout positioned with relative percentages.
  - Keeps all pane widgets continuously mounted when reordering, resizing, or switching to and from fullscreen, resolving virtual DOM remounting issues.
- **Live Layout Estimation during Drag**:
  - Dynamically collapses and resizes the remaining panes during dragging as if the dragged pane was removed, giving accurate drop zone previews.
  - Retains the dragged pane mounted invisibly (`display: 'none'`) during the drag to preserve its state and prevent unmounting.

### Patch Changes

- **Fix Drag-Out False-Positives next to Edges**:
  - Implemented window-level pointer/touch move listeners during active drags to track the actual mouse/finger client coordinates.
  - Fixes a bug where hiding the original drag source element in the DOM (via `display: none` for live estimation) caused `@dnd-kit`'s layout delta calculations to jump, resulting in false-positive `onDragOut`/dismiss actions when releasing items near the edges.

## 2.1.0

### Minor Changes

- **Removed Root-Level Tile Placement**:
  - Removed the root-level drop zones feature that allowed placing tiles to the top, bottom, left, or right edges of the entire dashboard root.
  - Removed the `RootDropZone` and `RootDropZones` components.
  - Removed the `splitRoot` tree utility function. Consumers who relied on `splitRoot` should use `splitPane` to split against a specific target pane instead.
  - The `onDragEnd` callback no longer reports `'root'` as the `overId` for root-level drops.

## 2.0.0

### Major Changes

- **Renamed Context Hooks & Types**:
  - Rebranded and renamed all dashboard context hooks, state, values, and contexts to use `Zeugma`-prefixed names instead of legacy `Dashboard` naming.
  - Renamed hooks: `useDashboardState` -> `useZeugmaState`, `useDashboardActions` -> `useZeugmaActions`.
  - Renamed context state values: `DashboardStateValue` -> `ZeugmaStateValue`, `DashboardActionsValue` -> `ZeugmaActionsValue`.
  - Renamed context objects: `DashboardStateContext` -> `ZeugmaStateContext`, `DashboardActionsContext` -> `ZeugmaActionsContext`.
  - Removed all deprecated `DashboardProvider` and `DashboardProviderProps` exports.

- **Refactored Dashboard Architecture**:
  - Renamed the internal component entity directory from `entities/dashboard` to `entities/zeugma`.
  - Modularized the dashboard code: split types/interfaces into `model/types.ts`, context creation into `model/context.ts`, hooks into `model/hooks.ts`, custom sensors into `lib/sensors.ts`, and helper components into `ui/CursorOverlay.tsx`.

## 1.5.0

### Minor Changes

- **Rename Core Layout Wrapper to `<Zeugma>`**:
  - Renamed the primary layout provider component from `<DashboardProvider>` to `<Zeugma>` (with `<ZeugmaProps>`) to align with the workspace layout engine branding.
  - Deprecated `<DashboardProvider>` and `<DashboardProviderProps>` exports.
  - Updated context hook error messages to reference Zeugma providers.

## 1.4.1

### Patch Changes

- **Fix Layout State Syncing & Refactor Callback Refs**:
  - Fixed `handleLocalLayoutChange` (exposed as `onLayoutChange` in state context) to correctly propagate layout updates to the parent component via `onChange(newLayout)`. This resolves a bug where layout actions (such as resizes or preset selection) were reverted on parent re-renders.
  - Refactored `DashboardProvider` to eliminate `useRef` callback-bypassing refs (`layoutRef`, `onChangeRef`, `onDismissIntentChangeRef`, `onResizeEndPropRef`, `renderPaneRef`), replacing them with standard, clean React dependencies in `useCallback` hooks.

## 1.4.0

### Minor Changes

- **Added `ResizableContainer` Widget**: Introduced a new container component that provides vertical resizing via a bottom-edge drag handle.
  - Supports controlled `height` or auto-derived initial heights.
  - Supports optional localStorage height persistence via the `persist` boolean and customizable `localStorageKey` (defaults to `'default-pane'`).
  - Added an `active` boolean prop (default `true`) to toggle resizable behavior dynamically while keeping internal child components continuously mounted.
  - Implemented infinite auto-scrolling during drag gestures when moving near parent container boundaries, calculating height updates to dynamically account for scroll offsets.

## 1.3.1

### Patch Changes

- **Fix Strict Mode Layout Sync**: Changed layout prop synchronization to use state instead of ref to prevent double-rendering bugs and errors in development mode/React Strict Mode.

## 1.3.0

### Minor Changes

- **Refactored to Drag-to-Dismiss Conventions**: Refactored the boundary overflow drag-to-close gesture API to follow standard conventions.
  - Added `enableDragToDismiss` boolean prop (default `false`) to explicitly activate the feature.
  - Renamed `dragOutThreshold` prop to `dismissThreshold` (default `60` pixels).
  - Renamed `onDragOutChange` callback to `onDismissIntentChange`.
  - Renamed context state `draggedOutId` to `dismissIntentId` (`useDashboardState()`).
  - Renamed `dragOut` property in `classNames` to `dismissPreview` for consistency.
  - Removed the redundant `onDragOut` callback and unified boundary drop events to trigger the existing `onRemove` callback directly.

## 1.2.0

### Minor Changes

- **Drag-Out-to-Close Gesture**: Added support for closing widgets by dragging them outside of the dashboard container boundaries.
  - Added `dragOutThreshold` prop (default `60` pixels) to specify the boundary overflow distance required to trigger the dismiss intent.
  - Added `onDragOutChange` callback to listen for boundary transitions.
  - Added `onDragOut` callback to handle widget dropping outside the container (automatically falls back to pane removal if no callback is supplied).
  - Added `draggedOutId` and `setContainerRef` state variables to the state context hook (`useDashboardState()`).
  - Added `dragOut` class name to `ZeugmaClassNames` to configure custom visual styles when a widget is dragged out.

## 1.1.1

### Patch Changes

- Bump version to force new release and sync documents.

## 1.1.0

### Minor Changes

- Add proper touch sensor support to the dashboard layout engine. Register `TouchSensor` alongside `PointerSensor` and configure `touch-action: none` on interactive drag/resize elements to prevent mobile scrolling conflicts.

## 1.0.0

### Major Changes

- **API Cleanups & Breaking Changes**:
  - Removed **`useDashboard()`** context hook entirely.
  - Removed **`DashboardContextValue`** type entirely.
  - Users are now required to use **`useDashboardState()`** for reactive layout values and **`useDashboardActions()`** for stable mutation actions, preventing accidental full-tree re-render waterfalls.

### Minor Changes

- **Context Splitting**: Split the single context structure into `DashboardStateContext` (for reactive state values) and `DashboardActionsContext` (for stable mutation actions).
  - Added **`useDashboardState()`** hook to consume only reactive layout state.
  - Added **`useDashboardActions()`** hook to consume stable dispatch functions (e.g. `removePane`, `splitPane`). Because these action callbacks are stable and never change reference, components utilizing `useDashboardActions()` will not trigger re-renders on layout updates, improving performance.
- **Performance Optimizations**:
  - **Imperative Resizing**: Flex layouts are now updated imperatively during drag gestures, writing to React state only when resizing completes, preventing full-tree layout updates on every frame.
  - **Ref-Based Prop Syncing**: Replaced two-useState state syncing pattern in `DashboardProvider` with a single ref-based pattern, saving render cycles.
  - **Stable callbacks**: Added stable refs for `onResizeEnd` and custom `renderPane` handlers to immunize callbacks against inline consumer updates.
  - **Memoized Pane Props**: Memoized `renderProps` in `Pane` to prevent unnecessary child pane content component re-renders.
  - **Guarded tree traversal**: Guarded the recursive tree-traversal calculation `hasOtherPanes` in `PaneTree` to only run at the root layout node.

## 0.8.1

### Patch Changes

- 8580fff: Added drag-cancel class.

## 0.8.0

### Minor Changes

- 387763f: Change `onChange` layout callback to only fire when user actions are completed (e.g. at the end of a resize gesture or on drag drop end) rather than continuously during resizing.

## 0.7.0

### Minor Changes

- 831edea: Rename `findPaneNode` utility function to `findPane` and add it to the README.

## 0.6.1

### Patch Changes

- 824e083: fix: Issue with the swapping documents is solved

## 0.6.0

### Minor Changes

- Added optional `metadata` property (`Record<string, unknown>`) to `PaneNode`, allowing consumers to attach arbitrary key-value data to individual panes.

## 0.5.3

### Patch Changes

- docs: update documentation

## 0.5.2

### Patch Changes

- docs: update documentation layout, responsiveness, and padding constraints

## 0.5.1

### Patch Changes

- Fixed root-level drop zones to be bounded by the panels container (PaneTree) instead of occupying the entire browser viewport (which was covering sidebars and controls).

## 0.5.0

### Minor Changes

- Added root-level drop zones to support placing dragged panes into the top, bottom, left, or right half of the entire dashboard root.

## 0.4.0

### Minor Changes

- **API Customization & Callbacks**:
  - Added custom resizer rendering support (`renderResizer` prop on `DashboardProvider` and `PaneTree`).
  - Added drag callbacks (`onDragStart`, `onDragEnd`) to listen to pane dragging states.
  - Added resize callbacks (`onResizeStart`, `onResize`, `onResizeEnd`) to listen to pane resizing states.
  - Added customizable split bounds (`minSplitPercentage`, `maxSplitPercentage`) to constrain pane sizes.
  - Exposed convenient layout mutation helpers (`removePane`, `addPane`, `swapPanes`, `splitPane`, `updateSplitPercentage`) directly on `useDashboard()` context hook.
  - Updated `Pane` removal component logic to automatically fall back to mutating the tree via context if no custom `onRemove` callback is passed.

## 0.3.0

### Minor Changes

- 4ed8cde: - **Feature**: Added resizer edge snapping (magnet snapping). Resizing edges will now snap to adjacent pane edges when they come within a configurable threshold.
  - **Refactor**: Re-architected the folder structure into Feature Sliced Design (FSD) layers (`shared`, `entities`, `features`, `widgets`), establishing clean and unidirectional dependencies.
  - **Performance**: Optimized rendering by memoizing context values in `DashboardProvider` and `Pane` to prevent unnecessary component re-renders during dragging and resizing.

## 0.2.0

### Minor Changes

- f4b812f: - Added `dragActivationDistance` to `DashboardProvider` to configure drag start threshold.
  - Added `renderDragOverlay` support to customize the drag overlay during dragging.
  - Fixed an issue where the fullscreen state would not exit properly when a fullscreen pane was removed.

## 0.1.2

### Patch Changes

- Simplify installation command in documentation by removing manual installation of `@dnd-kit` packages.

## 0.1.1

### Patch Changes

- Initial public release on npm.
