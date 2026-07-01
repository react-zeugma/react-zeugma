---
name: react-zeugma-api-change-maintenance
description: Checklist and instructions for updating all documentation, code examples, demos, and references across the monorepo after a change to the react-zeugma library API (props, hooks, types, utilities, or exports).
---

# Skill: API Change Maintenance

When a **react-zeugma** library API surface changes — e.g. a prop is added/removed/renamed, a hook signature changes, a type is modified, a utility function is added, or an export is removed — the following locations **must** be audited and updated to stay in sync.

---

## 1. Library README (Source of Truth)

**File:** `packages/react-zeugma/README.md`

This is the canonical API reference. It contains:

- Component prop tables (`<Zeugma>`, `<PaneTree>`, `<Pane>`, `<Tabs>`)
- Hook option/return tables (`useZeugma`, `useZeugmaContext`, `usePaneContext`, `useResizer`)
- Type definitions (`TreeNode`, `SplitNode`, `PaneNode`, `TabDetails`, `ZeugmaPersistOptions`, `ZeugmaClassNames`)
- Tree utility function signatures (`react-zeugma/utils`)
- Inline code examples (Quick Start, Standalone, Provider mode, Styling)

**Action:** Update the relevant prop table, type block, code example, or utility list.

---

## 2. Library Exports

**File:** `packages/react-zeugma/src/index.ts`

All public components, hooks, and types are re-exported here.

**Action:** Add or remove exports to match the API change. Verify named vs. type exports.

---

## 3. Homepage Docs — Data Files

These TSX files contain the structured content rendered on the `/docs` page. Each has inline code strings, prop tables (as arrays), and descriptive text that reference the API.

| File                                                        | What it contains                                                                                                                                                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/homepage/src/config/docs-data/introduction.tsx`       | Feature descriptions, "Why Zeugma" checklist                                                                                                                                                    |
| `apps/homepage/src/config/docs-data/quickstart.tsx`         | `QUICKSTART_CODE` — full quick-start code block with imports, `TreeNode`, `useZeugma`, `<Zeugma>`, `<Pane>` usage                                                                               |
| `apps/homepage/src/config/docs-data/tree-layout.tsx`        | `TREE_LAYOUT_CODE` — `TreeNode`, `SplitNode`, `PaneNode` type definitions                                                                                                                       |
| `apps/homepage/src/config/docs-data/state-controller.tsx`   | `useZeugma` controlled/uncontrolled code snippets, `ZeugmaController` descriptions                                                                                                              |
| `apps/homepage/src/config/docs-data/pane-customization.tsx` | `<Pane>`, `<Pane.DragHandle>`, `<Pane.Content>`, `<Pane.Tabs>` subcomponent descriptions                                                                                                        |
| `apps/homepage/src/config/docs-data/advanced-features.tsx`  | `DEBOUNCED_SYNC_CODE`, `CONTEXT_APIS_CODE` — advanced code examples using `useZeugma`, `usePaneContext`, controlled mode                                                                        |
| `apps/homepage/src/config/docs-data/api-reference.tsx`      | `ZEUGMA_PROPS`, `RENDER_TAB_PROPS`, `USE_ZEUGMA_OPTIONS`, `ZEUGMA_CONTROLLER_METHODS`, `USE_PANE_CONTEXT_PROPERTIES`, `TREE_UTILITIES` — these are row arrays powering the API reference tables |
| `apps/homepage/src/config/docs-data/skill-md.tsx`           | `SKILL_MD_CONTENT` — the full SKILL.md text shown in docs, duplicates prop lists and type schemas                                                                                               |

**Action:** Search each file for the changed API name (prop, hook, type, function). Update matching code string constants, table row arrays, and descriptive JSX.

---

## 4. Homepage Docs — Interactive Components

| File                                               | What it contains                                                                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/homepage/src/components/docs-playground.tsx` | Interactive playground embedded in the Introduction docs section — uses `useZeugma`, `<Zeugma>`, `<Pane>`, `<PaneTree>`                     |
| `apps/homepage/src/components/docs-mini-demos.tsx` | `BasicSplitDemo`, `TabControllerDemo`, `CustomStylingDemo` — small interactive examples embedded in docs sections, use library API directly |

**Action:** If the changed API is used by any demo, update the import and usage.

---

## 5. Demo Dashboard Page

The `/demo` route renders a full interactive dashboard. These files use the library API directly:

| File                                                     | Key API usage                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/homepage/src/components/zeugma-demo-dashboard.tsx` | `useZeugma`, `<Zeugma>` (with most props: `resizerSize`, `enableDragToDismiss`, `dismissThreshold`, `snapThreshold`, `dragActivationDistance`, `minSplitPercentage`, `maxSplitPercentage`, `persist`, `classNames`), `<PaneTree>`, `<Pane>`, `<Pane.DragHandle>`, `<Pane.Content>`, `<Pane.Tabs>`, `usePaneContext`, `TabDetails` |
| `apps/homepage/src/components/zeugma-demo-dashboard/`    | Subdirectory with `DashboardDrawer`, `DashboardLayout`, widget panels, `constants.ts` — the drawer exposes API props as interactive controls                                                                                                                                                                                      |

**Action:** Update prop usage, imports, and the drawer controls if a `<Zeugma>` prop changes.

---

## 6. Homepage Landing Page

**File:** `apps/homepage/src/views/home.tsx`

Contains a live `<ZeugmaDemoDashboard />` embed and feature description cards. If a major feature is added/removed, update the feature card text.

---

## 7. SKILL.md in Docs

**File:** `apps/homepage/src/config/docs-data/skill-md.tsx` → `SKILL_MD_CONTENT`

This is a **complete duplicate** of the API surface written as a markdown string for AI consumption. It includes:

- Core rules & constraints
- `TreeNode`/`SplitNode`/`PaneNode`/`TabDetails` type schemas
- Component composition examples
- `useZeugma` options list
- `useZeugmaContext` and `usePaneContext` return values
- Tree utility function signatures

**Action:** This is the most error-prone file — it's a giant string literal with escaped backticks. After any API change, carefully update the relevant section inside `SKILL_MD_CONTENT`.

---

## Quick Checklist

When changing the API, go through this list:

1. [ ] `packages/react-zeugma/src/index.ts` — exports
2. [ ] `packages/react-zeugma/README.md` — canonical docs
3. [ ] `apps/homepage/src/config/docs-data/api-reference.tsx` — prop/method table arrays
4. [ ] `apps/homepage/src/config/docs-data/skill-md.tsx` — `SKILL_MD_CONTENT` string
5. [ ] `apps/homepage/src/config/docs-data/quickstart.tsx` — `QUICKSTART_CODE` if affected
6. [ ] `apps/homepage/src/config/docs-data/tree-layout.tsx` — `TREE_LAYOUT_CODE` if types changed
7. [ ] `apps/homepage/src/config/docs-data/state-controller.tsx` — if `useZeugma` options changed
8. [ ] `apps/homepage/src/config/docs-data/pane-customization.tsx` — if `<Pane>` subcomponents changed
9. [ ] `apps/homepage/src/config/docs-data/advanced-features.tsx` — if context/hook APIs changed
10. [ ] `apps/homepage/src/components/zeugma-demo-dashboard.tsx` — live demo usage
11. [ ] `apps/homepage/src/components/docs-playground.tsx` — interactive playground
12. [ ] `apps/homepage/src/components/docs-mini-demos.tsx` — inline mini demos
13. [ ] `apps/homepage/src/views/home.tsx` — feature cards (if major feature added/removed)

### Tips

- **Use grep**: Run `grep -rn "changedPropName"` across `apps/homepage/src/` to catch all occurrences.
- **String constants are fragile**: Code blocks in docs data files are stored as template literal strings. Pay attention to escaped backticks (`\\\``) and interpolation (`\\${}`) when editing.
- **Verify the build**: Run `npm run dev:homepage` after changes to ensure no import errors or broken renders.
