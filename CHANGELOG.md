# react-zeugma

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
