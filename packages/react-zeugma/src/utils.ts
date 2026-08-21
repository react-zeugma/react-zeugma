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
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  swapTabs,
  movePaneTabs,
  computeLayout,
  calculateTabDropIndex,
} from './shared/lib/tree/tree-helpers'

export { areLayoutsEqual, areMetadataEqual, areObjectsEqual } from './shared/lib/tree/compare'

export type { ComputedPane, ComputedSplitter } from './shared/lib/tree/tree-helpers'
