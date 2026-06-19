export {
  generateUniqueId,
  removePane,
  removeTab,
  splitPane,
  addPane,
  updateSplitPercentage,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  updateTabMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  computeLayout,
  calculateTabDropIndex,
} from './shared/lib/tree/tree-helpers'

export type { ComputedPane, ComputedSplitter } from './shared/lib/tree/tree-helpers'

export { getOrCreateHiddenContainer } from './shared/lib/dom'
