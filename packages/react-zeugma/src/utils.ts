export {
  generateUniqueId,
  removePane,
  removeTab,
  splitPane,
  addWidget,
  insertLeaf,
  addTab,
  updateSplitPercentage,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  updateMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  computeLayout,
  calculateTabDropIndex,
} from './shared/lib/tree/tree-helpers'

export type { ComputedPane, ComputedSplitter } from './shared/lib/tree/tree-helpers'
