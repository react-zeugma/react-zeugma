---
'react-zeugma': minor
---

- **Feature**: Added resizer edge snapping (magnet snapping). Resizing edges will now snap to adjacent pane edges when they come within a configurable threshold.
- **Refactor**: Re-architected the folder structure into Feature Sliced Design (FSD) layers (`shared`, `entities`, `features`, `widgets`), establishing clean and unidirectional dependencies.
- **Performance**: Optimized rendering by memoizing context values in `DashboardProvider` and `Pane` to prevent unnecessary component re-renders during dragging and resizing.
