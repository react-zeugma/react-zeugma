---
name: frontend-architecture
description: Frontend file architecture rules for the project. Enforces single-responsibility modules, barrel index patterns, and structured directory layouts for components, hooks, and utilities.
---

# Skill: Frontend Architecture

Rules and patterns for how frontend code should be organized in this project.

> [!IMPORTANT]
> **Proactive enforcement:** When working on any task, if you encounter a file that violates the rules defined here (e.g. a monolithic file mixing multiple concerns, missing barrel index, components/hooks/utils co-located in a single large file), you **must** refactor that file to comply with these rules as part of the current task — in addition to implementing the requested changes.

---

## File Organization Rules

### Single Responsibility

Each file should have **one clear responsibility**. If you can't summarize what a file does in a single short phrase, it should be split.

| Category              | One file per…                                   |
| --------------------- | ----------------------------------------------- |
| **Types**             | Shared type definitions and re-exports          |
| **Pure utilities**    | Helper functions with no React/DOM dependencies |
| **Components**        | Each significant React component                |
| **Hooks**             | Each custom React hook                          |
| **Constants**         | Config objects, style maps, static data         |
| **Renderers / logic** | Render functions, mapping logic, transformers   |

### When to split a file into a directory

A file should be converted to a directory module when it meets **any** of these criteria:

- Contains **more than ~200 lines** of mixed concerns
- Defines **2+ exported components** or **2+ hooks**
- Mixes **types + utilities + components** in the same file
- Contains **internal helper functions** that serve only one of its exports

### Directory module structure

When a file is split, replace it with a same-named directory:

```
# Before
components/my-component.tsx    (large monolithic file)

# After
components/my-component/
  ├── index.ts              # Barrel — re-exports public API only
  ├── types.ts              # Shared types & re-exports
  ├── utils.ts              # Pure helper functions
  ├── my-component.tsx      # Main component
  ├── sub-component-a.tsx   # Extracted sub-component
  └── use-my-hook.ts        # Extracted hook
```

### Barrel `index.ts` rules

- Re-export **only the public API** — symbols that external consumers actually import.
- **Do NOT** re-export internal helpers, private components, or types only used within the module.
- This preserves all existing import paths since `from './my-component'` resolves to `./my-component/index.ts`.

### Dependency order (bottom-up)

Create files in dependency order to prevent circular imports:

1. `types.ts` — No internal imports
2. Pure utilities — Import only from `types.ts` or external packages
3. Leaf components — Small components, no internal component imports
4. Composition layers — Functions/components that compose the above
5. Main component — The primary export, wiring everything together
6. `index.ts` — Barrel file

---

## Rules

- **No import path changes for consumers.** The barrel `index.ts` must cover the full public API so no downstream files need updating after a refactor.
- **No circular imports.** Follow the bottom-up dependency order. If two files need each other, the shared piece belongs in `types.ts` or a shared utility.
- **Keep `'use client'` directives.** Any file that uses React hooks or browser APIs needs `'use client'` at the top. Pure type/utility files should not have it.
- **Preserve all comments and docstrings.** Don't lose documentation during the move — copy JSDoc and comments faithfully.

---

## Refactor Checklist

When splitting a file into a directory module:

1. [ ] Grep for all imports of the target file — note the public API symbols
2. [ ] Create the new directory (same name as original file, minus extension)
3. [ ] Create `types.ts` with shared types
4. [ ] Create utility files (pure functions)
5. [ ] Create component/hook files (one per concern)
6. [ ] Create the main component file
7. [ ] Create `index.ts` barrel re-exporting only the public API
8. [ ] Delete the original monolithic file
9. [ ] Run `npx tsc --noEmit` — fix any errors
10. [ ] Verify no consumer import paths changed
