export {
  generateUniqueId,
  removePane,
  removeTab,
  splitPane,
  insertLeaf,
  addTab,
  updateSplitPercentage,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  getTabMetadata,
  getActiveTabMetadata,
  updateMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  movePaneTabs,
  computeLayout,
  calculateTabDropIndex,
} from './shared/lib/tree/tree-helpers'

export type { ComputedPane, ComputedSplitter } from './shared/lib/tree/tree-helpers'
