# react-zeugma

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
