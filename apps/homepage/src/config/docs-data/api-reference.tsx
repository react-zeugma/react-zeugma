import { DocParagraph, DocCode, DocHeading, DocTable } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const ZEUGMA_PROPS = [
  ['controller', 'ZeugmaController', '-', 'The layout controller returned by useZeugma()'],
  [
    'renderPane',
    '(paneId: string) => ReactNode',
    '-',
    'Callback that maps active pane IDs to custom pane structures',
  ],
  ['resizerSize', 'number', '4', 'Thickness of the split resizer handles in pixels'],
  ['snapThreshold', 'number', '8', 'Pixel threshold to snap layout resizers to adjacent edges'],
  ['locked', 'boolean', 'false', 'Disable all dragging and resizing'],
  [
    'enableDragToDismiss',
    'boolean',
    'false',
    'Enables dragging widgets out of boundaries to dismiss them',
  ],
  ['classNames', 'ZeugmaClassNames', '-', 'Custom CSS classes for dashboard elements'],
  [
    'renderPopoutWrapper',
    '(props: { tabId: string; document: Document; window: Window; children: React.ReactNode }) => React.ReactNode',
    '-',
    '[Experimental] Custom wrapper to inject style managers / providers into popout windows',
  ],
]

const RENDER_TAB_PROPS = [
  ['id', 'string', "The tab's unique ID."],
  ['paneId', 'string', 'The ID of the pane containing this tab.'],
  ['isActive', 'boolean', 'True if this tab is currently selected/active.'],
  ['index', 'number', "The tab's 0-indexed position in the pane tab bar."],
  [
    'metadata',
    'Record<string, unknown> | undefined',
    'Custom metadata values associated with this tab.',
  ],
  ['isDragging', 'boolean', 'True if this tab is actively being dragged.'],
  ['isOver', 'boolean', 'True if another dragged tab/item is currently hovering over this tab.'],
  ['onSelect', '() => void', 'Callback to select/activate this tab.'],
  ['onRemove', '() => void', 'Callback to close/remove this tab.'],
  ['isPoppedOut', 'boolean', '[Experimental] True if this tab is open in a new popup window.'],
  ['popout', '() => void', '[Experimental] Callback to popout this tab into a new window.'],
  ['dock', '() => void', '[Experimental] Callback to dock this tab back to the dashboard.'],
]

const USE_ZEUGMA_OPTIONS = [
  [
    'initialLayout',
    'TreeNode | null',
    'null',
    'The initial layout tree structure for the dashboard',
  ],
  ['locked', 'boolean', 'false', 'Initial lock state of the workspace'],
]

const ZEUGMA_CONTROLLER_METHODS = [
  [
    'setLayout',
    '(layout: TreeNode | null) => void',
    'Replaces the entire layout tree with a new layout structure.',
  ],
  [
    'setLocked',
    '(locked: boolean) => void',
    'Locks or unlocks all resizing and dragging actions globally.',
  ],
  [
    'addTab',
    '(tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => void',
    'Appends a tab into a target pane, or splits/creates a new pane if target is omitted.',
  ],
  [
    'removeTab',
    '(tabId: string) => void',
    'Removes a tab by its ID. Automatically collapses empty splits.',
  ],
  [
    'selectTab',
    '(paneId: string, tabId: string) => void',
    'Sets the active tab in the given pane.',
  ],
  ['removePane', '(paneId: string) => void', 'Removes a pane and collapses the parent split.'],
  [
    'splitPane',
    "(targetId: string, direction: SplitDirection, type: 'left' | 'right' | 'top' | 'bottom', paneToAdd: string) => void",
    'Splits a target pane in a given direction and adds a new pane.',
  ],
  [
    'updatePaneLock',
    '(paneId: string, locked: boolean) => void',
    'Toggles lock state for a specific pane.',
  ],
  [
    'mergeTab',
    '(draggedTabId: string, targetPaneId: string) => void',
    'Drags and drops a tab from its source pane to a target pane.',
  ],
  [
    'moveTab',
    "(draggedTabId: string, targetTabId: string, position?: 'before' | 'after' | 'center') => void",
    "Reorders a tab relative to another target tab, or swaps them if position is 'center'.",
  ],
  ['findPaneById', '(paneId: string) => PaneNode | null', 'Queries a PaneNode by its unique ID.'],
  [
    'findPaneContainingTab',
    '(tabId: string) => PaneNode | null',
    'Queries the parent PaneNode of a tab.',
  ],
  [
    'findTabById',
    '(tabId: string) => TabDetails | null',
    'Queries details (paneId, index, metadata, isActive) of a tab.',
  ],
  [
    'popoutTab',
    '(tabId: string) => void',
    '[Experimental] Opens the specified tab in a new popup window.',
  ],
  [
    'dockTab',
    '(tabId: string) => void',
    '[Experimental] Docks the specified tab back into the dashboard grid layout.',
  ],
]

const USE_PANE_CONTEXT_PROPERTIES = [
  ['id', 'string', 'The unique ID of the current pane.'],
  ['tabIds', 'string[]', 'List of tab IDs docked inside the pane.'],
  ['activeTabId', 'string', 'Currently active/selected tab ID.'],
  ['isDragging', 'boolean', 'True if this pane is currently being dragged.'],
  ['isFullscreen', 'boolean', 'True if this pane occupies the fullscreen/zoomed view.'],
  ['toggleFullscreen', '() => void', 'Toggles the pane to and from fullscreen mode.'],
  ['remove', '() => void', 'Removes the pane from the layout tree and collapses its parent split.'],
  ['selectTab', '(tabId: string) => void', 'Activates a specific tab in the pane.'],
  [
    'removeTab',
    '(tabId: string) => void',
    'Closes a tab. If it was the last tab, removes the pane.',
  ],
  [
    'metadata',
    'Record<string, unknown> | undefined',
    'Metadata values associated with the active tab.',
  ],
  ['locked', 'boolean', 'True if this specific pane or the dashboard globally is locked.'],
  [
    'tabsMetadata',
    'Record<string, Record<string, unknown>> | undefined',
    'Tab metadata mapping for all tabs inside this pane.',
  ],
  [
    'isActiveTabPoppedOut',
    'boolean',
    '[Experimental] True if the active tab in this pane is open in a new window.',
  ],
  [
    'popoutTab',
    '(tabId?: string) => void',
    '[Experimental] Pops out the active tab (or specific tab ID) into a new window.',
  ],
  [
    'dockTab',
    '(tabId?: string) => void',
    '[Experimental] Docks the active tab (or specific tab ID) back to the dashboard grid.',
  ],
]

const TREE_UTILITIES = [
  [
    'splitPane',
    '(tree: TreeNode, targetId: string, direction: SplitDirection, type: SplitType, paneToAdd: string | PaneNode) => TreeNode',
    'Splits a pane and inserts another pane.',
  ],
  [
    'removePane',
    '(tree: TreeNode, paneId: string) => TreeNode | null',
    'Removes a pane and collapses the parent split.',
  ],
  [
    'addTab',
    '(tree: TreeNode, targetPaneId: string, tabId: string, metadata?: Record<string, unknown>) => TreeNode',
    'Appends a tab into a target pane.',
  ],
  [
    'removeTab',
    '(tree: TreeNode, tabId: string) => TreeNode | null',
    'Removes a tab; collapses empty panes.',
  ],
  [
    'selectTab',
    '(tree: TreeNode, paneId: string, tabId: string) => TreeNode',
    'Sets the active tab in the given pane.',
  ],
  [
    'mergeTab',
    '(tree: TreeNode, draggedTabId: string, targetPaneId: string) => TreeNode',
    'Moves a tab from its source pane to target pane.',
  ],
  [
    'moveTab',
    "(tree: TreeNode, draggedTabId: string, targetTabId: string, position?: 'before' | 'after' | 'center') => TreeNode",
    "Reorders a tab relative to another target tab, or swaps them if position is 'center'.",
  ],
  [
    'swapTabs',
    '(tree: TreeNode, draggedTabId: string, targetTabId: string) => TreeNode',
    'Swaps the positions and active states of two tabs.',
  ],
  [
    'movePaneTabs',
    "(tree: TreeNode, draggedPaneId: string, targetTabId: string, position?: 'before' | 'after') => TreeNode",
    'Moves all tabs from a dragged pane next to a target tab.',
  ],
]

export const apiReferenceSection: DocSection = {
  id: 'api-reference',
  title: 'API Reference',
  category: 'api',
  content: (
    <DocParagraph>
      Complete API reference for React Zeugma components, hooks, contexts, and pure tree utilities.
    </DocParagraph>
  ),
  subsections: [
    {
      id: 'api-components',
      title: 'Components & Props',
      content: (
        <div className="space-y-8">
          <div>
            <DocHeading level={4}>&lt;Zeugma&gt; Props</DocHeading>
            <DocTable headers={['Prop', 'Type', 'Default', 'Description']} rows={ZEUGMA_PROPS} />
          </div>

          <div>
            <DocHeading level={4}>RenderTabProps</DocHeading>
            <DocParagraph className="mb-3">
              Properties passed to the <DocCode>renderTab</DocCode> callback in{' '}
              <DocCode>&lt;Pane.Tabs&gt;</DocCode>.
            </DocParagraph>
            <DocTable headers={['Property', 'Type', 'Description']} rows={RENDER_TAB_PROPS} />
          </div>
        </div>
      ),
    },
    {
      id: 'api-hooks',
      title: 'Hooks & Contexts',
      content: (
        <div className="space-y-8">
          <div>
            <DocHeading level={4}>useZeugma Options</DocHeading>
            <DocTable
              headers={['Option', 'Type', 'Default', 'Description']}
              rows={USE_ZEUGMA_OPTIONS}
            />
          </div>

          <div>
            <DocHeading level={4}>ZeugmaController Methods & Queries</DocHeading>
            <DocTable
              headers={['Method / Query', 'Signature', 'Description']}
              rows={ZEUGMA_CONTROLLER_METHODS}
            />
          </div>

          <div>
            <DocHeading level={4}>usePaneContext() Properties</DocHeading>
            <DocParagraph className="mb-3">
              Returns <DocCode>PaneContextValue</DocCode> (extends{' '}
              <DocCode>PaneRenderProps</DocCode>). Available inside any child of{' '}
              <DocCode>&lt;Pane&gt;</DocCode>.
            </DocParagraph>
            <DocTable
              headers={['Property', 'Type', 'Description']}
              rows={USE_PANE_CONTEXT_PROPERTIES}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'api-utilities',
      title: 'Tree Utilities',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Pure, immutable tree-manipulation utility functions imported from{' '}
            <DocCode highlight>react-zeugma/utils</DocCode>. These return a fresh tree reference and
            are used to perform state updates in controlled mode.
          </DocParagraph>
          <DocTable headers={['Function', 'Signature', 'Description']} rows={TREE_UTILITIES} />
        </div>
      ),
    },
    {
      id: 'api-devtools',
      title: 'DevTools & Profiling',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Built-in DevTools utilities imported from{' '}
            <DocCode highlight>react-zeugma/devtools</DocCode> (or <DocCode>react-zeugma</DocCode>)
            for auditing mount lifecycles and render performance.
          </DocParagraph>
          <DocTable
            headers={['Export', 'Signature', 'Description']}
            rows={[
              [
                'useRenderCounter',
                '(idOrOptions?, options?) => { mounts, renders, reset }',
                'React 18/19 StrictMode safe hook for tracking component mounts and renders.',
              ],
              [
                'RenderCounterBadge',
                '(props: RenderCounterBadgeProps) => ReactNode',
                'Floating overlay badge displaying mount and render counters.',
              ],
              [
                'RenderCounterFooter',
                '(props: RenderCounterFooterProps) => ReactNode',
                'Status bar footer component that wraps panel widgets.',
              ],
            ]}
          />
        </div>
      ),
    },
  ],
}
