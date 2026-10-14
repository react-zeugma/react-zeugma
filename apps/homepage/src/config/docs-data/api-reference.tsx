import { DocParagraph, DocCode, DocHeading, DocTable } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const ZEUGMA_PROPS = [
  [
    'controller',
    'ZeugmaController',
    'Required',
    'The layout state controller instance returned by useZeugma().',
  ],
  [
    'renderPane',
    '(paneId: string) => ReactNode',
    'Required (Standalone)',
    'Callback that maps active pane IDs to custom pane structures. Forbidden when <Zeugma> wraps children.',
  ],
  ['resizerSize', 'number', '4', 'Thickness of the split resizer divider handles in pixels.'],
  [
    'snapThreshold',
    'number',
    '8',
    'Pixel threshold to snap layout resizers to adjacent edges or center alignment.',
  ],
  [
    'locked',
    'boolean',
    'false',
    'Disable all dragging, dropping, and resizing across the workspace.',
  ],
  [
    'enableDragToDismiss',
    'boolean',
    'false',
    'Enables dragging widgets out of dashboard container boundaries to dismiss them.',
  ],
  [
    'dismissThreshold',
    'number',
    '40',
    'Pixel distance beyond dashboard boundaries required to trigger dismissal.',
  ],
  [
    'classNames',
    'ZeugmaClassNames',
    'undefined',
    'Custom CSS classes for headless elements (resizer, dropPreview, tabDropPreview, etc.).',
  ],
  [
    'persist',
    'boolean | ZeugmaPersistOptions',
    'undefined',
    'Auto-persistence in localStorage: { enabled?: boolean; key?: string } (default key: "zeugma-layout").',
  ],
  [
    'renderPopoutWrapper',
    '(props: { tabId: string; document: Document; window: Window; children: React.ReactNode }) => React.ReactNode',
    'undefined',
    '[Experimental] Custom wrapper to inject style managers / providers into secondary popout windows.',
  ],
]

const RENDER_TAB_PROPS = [
  ['id', 'string', "The tab's unique string ID."],
  ['paneId', 'string', 'The ID of the pane containing this tab.'],
  ['isActive', 'boolean', 'True if this tab is currently selected/active in its pane.'],
  ['index', 'number', "The tab's 0-indexed position in the pane tab bar."],
  [
    'metadata',
    'Record<string, unknown> | undefined',
    'Custom metadata values associated with this tab.',
  ],
  ['isDragging', 'boolean', 'True if this tab is actively being dragged.'],
  ['isOver', 'boolean', 'True if another dragged tab or item is hovering over this tab.'],
  ['onSelect', '() => void', 'Callback to select and activate this tab.'],
  ['onRemove', '() => void', 'Callback to close/remove this tab.'],
  ['isPoppedOut', 'boolean', '[Experimental] True if this tab is open in a new browser window.'],
  ['popout', '() => void', '[Experimental] Callback to pop out this tab into a new window.'],
  ['dock', '() => void', '[Experimental] Callback to dock this tab back to the dashboard.'],
]

const USE_ZEUGMA_OPTIONS = [
  [
    'initialLayout',
    'TreeNode | null',
    'null',
    'Initial layout tree structure for uncontrolled mode.',
  ],
  [
    'layout',
    'TreeNode | null',
    'undefined',
    'Current layout tree for controlled mode. Must be paired with onChange.',
  ],
  [
    'onChange',
    '(newLayout: TreeNode | null) => void',
    'undefined',
    'State update handler invoked whenever layout topology or split ratios change.',
  ],
  ['locked', 'boolean', 'false', 'Global freeze state for resizing and drag-and-drop actions.'],
  [
    'fullscreenPaneId',
    'string | null',
    'null',
    'Pane ID to maximize to 100% container view. Structural layout edits are blocked while active.',
  ],
  [
    'onFullscreenChange',
    '(paneId: string | null) => void',
    'undefined',
    'Callback fired when fullscreen state is toggled.',
  ],
]

const ZEUGMA_CONTROLLER_METHODS = [
  ['layout', 'TreeNode | null', 'The current layout tree state.'],
  ['locked', 'boolean', 'True if workspace dragging and resizing is globally disabled.'],
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
  [
    'removePane',
    '(paneId: string) => void',
    'Removes a pane and collapses the parent split with its sibling.',
  ],
  [
    'splitPane',
    "(targetId: string, direction: SplitDirection, type: 'left' | 'right' | 'top' | 'bottom', paneToAdd: string) => void",
    'Splits a target pane in a given direction and adds a new pane.',
  ],
  [
    'updatePaneLock',
    '(paneId: string, locked: boolean) => void',
    'Toggles lock state for a specific pane independently.',
  ],
  [
    'mergeTab',
    '(draggedTabId: string, targetPaneId: string) => void',
    'Moves a tab from its source pane to target pane.',
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
    'getTabMetadata',
    '<T>(tabId: string) => T | undefined',
    'Retrieves immutable metadata registered to a tab.',
  ],
  [
    'getActiveTabMetadata',
    '<T>(paneId: string) => T | undefined',
    'Retrieves metadata for the active tab in a pane.',
  ],
  [
    'poppedOutTabIds',
    'string[]',
    '[Experimental] Array of tab IDs currently detached into popout windows.',
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
    'Splits a pane and inserts another pane, returning a fresh tree reference.',
  ],
  [
    'removePane',
    '(tree: TreeNode, paneId: string) => TreeNode | null',
    'Removes a pane and collapses the parent split with its sibling.',
  ],
  [
    'addTab',
    '(tree: TreeNode, targetPaneId: string, tabId: string, metadata?: Record<string, unknown>) => TreeNode',
    'Appends a tab into a target pane and sets it active.',
  ],
  [
    'removeTab',
    '(tree: TreeNode, tabId: string) => TreeNode | null',
    'Removes a tab; collapses empty panes automatically.',
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
  [
    'updatePaneLock',
    '(tree: TreeNode, paneId: string, locked: boolean) => TreeNode',
    'Updates the lock state of a specific pane.',
  ],
  [
    'isValidTreeNode',
    '(node: unknown) => boolean',
    'Validates that an object conforms to the structural TreeNode schema with cycle detection.',
  ],
  [
    'computeLayout',
    '(tree: TreeNode) => Record<string, { left: number; top: number; width: number; height: number }>',
    'Calculates absolute percentage geometry boxes for all panes and splitters.',
  ],
]

export const apiReferenceSection: DocSection = {
  id: 'api-reference',
  title: 'API Reference',
  category: 'api',
  content: (
    <DocParagraph>
      Complete, authoritative TypeScript API reference for React Zeugma components, hooks, contexts,
      and pure tree utilities.
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
            <DocTable
              headers={['Prop', 'Type', 'Default', 'Description']}
              rows={ZEUGMA_PROPS}
              searchable
              searchPlaceholder="Filter <Zeugma> props..."
            />
          </div>

          <div>
            <DocHeading level={4}>RenderTabProps</DocHeading>
            <DocParagraph className="mb-3">
              Properties passed to the <DocCode>renderTab</DocCode> callback in{' '}
              <DocCode>&lt;Pane.Tabs&gt;</DocCode>.
            </DocParagraph>
            <DocTable
              headers={['Property', 'Type', 'Description']}
              rows={RENDER_TAB_PROPS}
              searchable
              searchPlaceholder="Filter RenderTabProps..."
            />
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
              searchable
              searchPlaceholder="Filter useZeugma options..."
            />
          </div>

          <div>
            <DocHeading level={4}>ZeugmaController Methods & Queries</DocHeading>
            <DocTable
              headers={['Method / Query', 'Signature', 'Description']}
              rows={ZEUGMA_CONTROLLER_METHODS}
              searchable
              searchPlaceholder="Filter controller methods..."
            />
          </div>

          <div>
            <DocHeading level={4}>usePaneContext() Properties</DocHeading>
            <DocParagraph className="mb-3">
              Returns <DocCode>PaneContextValue</DocCode>. Available inside any child of{' '}
              <DocCode>&lt;Pane&gt;</DocCode>.
            </DocParagraph>
            <DocTable
              headers={['Property', 'Type', 'Description']}
              rows={USE_PANE_CONTEXT_PROPERTIES}
              searchable
              searchPlaceholder="Filter pane context properties..."
            />
          </div>
        </div>
      ),
    },
    {
      id: 'api-utilities',
      title: 'Tree Utilities (react-zeugma/utils)',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Pure, immutable tree-manipulation utility functions imported from{' '}
            <DocCode highlight>react-zeugma/utils</DocCode>. These functions never mutate tree nodes
            in place, returning fresh tree references for deterministic React rendering.
          </DocParagraph>
          <DocTable
            headers={['Function', 'Signature', 'Description']}
            rows={TREE_UTILITIES}
            searchable
            searchPlaceholder="Filter tree utilities..."
          />
        </div>
      ),
    },
    {
      id: 'api-devtools',
      title: 'DevTools & Profiling (react-zeugma/devtools)',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Instrumentation utilities imported from{' '}
            <DocCode highlight>react-zeugma/devtools</DocCode> for auditing component mounts,
            renders, and layout performance.
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
            searchable
            searchPlaceholder="Filter DevTools exports..."
          />
        </div>
      ),
    },
  ],
}
