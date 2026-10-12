import { describe, it, expect } from 'vitest'
import * as mainApi from '../index'
import * as utilsApi from '../utils'
import * as devtoolsApi from '../devtools'

describe('Public API Runtime Exports Snapshot', () => {
  it('should preserve all exports from main entry (index.ts)', () => {
    const keys = Object.keys(mainApi).sort()
    expect(keys).toEqual([
      'Pane',
      'PaneTree',
      'RenderCounterBadge',
      'RenderCounterFooter',
      'Zeugma',
      'usePaneContext',
      'useRenderCounter',
      'useResizer',
      'useZeugma',
      'useZeugmaContext',
    ])
  })

  it('should preserve all exports from utils entry (utils.ts)', () => {
    const keys = Object.keys(utilsApi).sort()
    expect(keys).toEqual([
      'addTab',
      'calculateTabDropIndex',
      'computeLayout',
      'findPaneById',
      'findPaneContainingTab',
      'findTabById',
      'generateUniqueId',
      'getActiveTabMetadata',
      'getTabMetadata',
      'insertLeaf',
      'isValidTreeNode',
      'mergeTab',
      'movePaneTabs',
      'moveTab',
      'removePane',
      'removeTab',
      'selectTab',
      'splitPane',
      'swapTabs',
      'updatePaneLock',
      'updateSplitPercentage',
    ])
  })

  it('should preserve all exports from devtools entry (devtools.ts)', () => {
    const keys = Object.keys(devtoolsApi).sort()
    expect(keys).toEqual([
      'RenderCounterBadge',
      'RenderCounterFooter',
      'clearAllCounters',
      'resetCounterRecord',
      'useRenderCounter',
    ])
  })
})
