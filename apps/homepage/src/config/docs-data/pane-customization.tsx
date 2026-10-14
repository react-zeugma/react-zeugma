import { CustomStylingDemo } from '../../components/docs-mini-demos'
import { DocCodeBlock } from '../../components/mdx-renderer'
import {
  DocParagraph,
  DocCode,
  DocHeading,
  DocList,
  InfoCard,
  DocTable,
  DocCallout,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const COMPOUND_PANE_CODE = `import { Pane, usePaneContext, TabDetails } from 'react-zeugma'
import { Maximize2, Minimize2, X, Move, ExternalLink } from 'lucide-react'

// 1. Fully custom pane header using usePaneContext()
function CustomPaneChrome() {
  const {
    id,
    tabIds,
    activeTabId,
    selectTab,
    removeTab,
    remove,
    isFullscreen,
    toggleFullscreen,
    popoutTab,
    locked,
  } = usePaneContext()

  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-bg-sidebar border-b border-border-primary select-none">
      {/* Draggable DragHandle region */}
      <Pane.DragHandle className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-xs font-semibold text-text-primary mr-2">
        <Move className="w-3.5 h-3.5 text-accent" />
        <span>{id}</span>
      </Pane.DragHandle>

      {/* Custom Tab List */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
        {tabIds.map((tabId) => (
          <div
            key={tabId}
            onClick={() => selectTab(tabId)}
            className={\`group flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer \${
              tabId === activeTabId
                ? 'bg-bg-pane text-accent font-semibold shadow-2xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-pane/40'
            }\`}
          >
            <span>{tabId}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeTab(tabId)
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Pane Action Controls */}
      <div className="flex items-center gap-1 ml-2 text-text-muted">
        <button
          onClick={() => popoutTab(activeTabId)}
          title="Pop out to new window"
          className="p-1 hover:text-text-primary hover:bg-bg-pane rounded transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Restore' : 'Maximize'}
          className="p-1 hover:text-text-primary hover:bg-bg-pane rounded transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        {!locked && (
          <button
            onClick={remove}
            title="Close pane"
            className="p-1 hover:text-rose-500 hover:bg-bg-pane rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// 2. Composing the complete Pane with Content
export function MyCustomPane({ paneId }: { paneId: string }) {
  return (
    <Pane id={paneId} className="flex flex-col h-full bg-bg-pane border border-border-primary rounded-xl overflow-hidden shadow-2xs">
      <CustomPaneChrome />
      <Pane.Content className="flex-1 overflow-auto p-4 bg-bg-app/50">
        {(tab: TabDetails) => <TabRenderer tab={tab} />}
      </Pane.Content>
    </Pane>
  )
}`

const CLASSNAMES_CONFIG_CODE = `<Zeugma
  controller={controller}
  resizerSize={4}
  classNames={{
    // Resizer dividers between split panes
    resizer: 'bg-border-primary hover:bg-accent transition-colors duration-150',
    // Drag preview indicator when hovering over pane edge drop targets
    dropPreview: 'bg-accent/15 border-2 border-accent border-dashed rounded-xl shadow-lg',
    // Insertion marker when dragging tabs along a tab bar
    tabDropPreview: 'w-1 bg-accent rounded-full animate-pulse',
    // Drag overlay preview for floating dragged pane
    paneDragPreview: 'opacity-85 shadow-2xl ring-2 ring-accent rounded-xl backdrop-blur-md',
    // Drag overlay preview for floating dragged tab
    tabDragPreview: 'opacity-90 shadow-xl bg-bg-pane border border-border-primary rounded-md px-3 py-1.5',
  }}
  renderPane={(paneId) => <MyCustomPane paneId={paneId} />}
/>`

const CONTEXT_PROVIDER_MODE_CODE = `import { useZeugma, Zeugma, PaneTree } from 'react-zeugma'

export function AppShell() {
  const controller = useZeugma({ initialLayout })

  return (
    <Zeugma controller={controller}>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Custom sidebar outside the dynamic pane tree */}
        <AppSidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader />
          
          {/* Main layout canvas: renderPane MUST be passed to PaneTree */}
          <div className="flex-1 p-2 bg-bg-app">
            <PaneTree renderPane={(paneId) => <MyCustomPane paneId={paneId} />} />
          </div>

          <AppFooter />
        </div>
      </div>
    </Zeugma>
  )
}`

const USE_PANE_CONTEXT_TABLE = [
  ['id', 'string', 'The unique string identifier of this pane container.'],
  ['tabIds', 'string[]', 'Array of tab IDs currently housed inside this pane.'],
  ['activeTabId', 'string', 'The currently active tab ID in this pane.'],
  ['isDragging', 'boolean', 'True if this entire pane is actively being dragged.'],
  ['isFullscreen', 'boolean', 'True if this pane is currently zoomed to full container view.'],
  [
    'toggleFullscreen',
    '() => void',
    'Zooms this pane to occupy 100% of the dashboard, or restores prior layout.',
  ],
  [
    'remove',
    '() => void',
    'Closes this pane and auto-collapses its parent split with its sibling.',
  ],
  ['selectTab', '(tabId: string) => void', 'Activates a specific tab inside this pane.'],
  [
    'removeTab',
    '(tabId: string) => void',
    'Closes a specific tab. If it was the last tab, auto-removes the pane.',
  ],
  ['locked', 'boolean', 'True if this specific pane or the workspace is locked.'],
  [
    'metadata',
    'Record<string, unknown> | undefined',
    'Read-only metadata registered with the active tab.',
  ],
  [
    'tabsMetadata',
    'Record<string, Record<string, unknown>>',
    'All tab metadata mappings for tabs inside this pane.',
  ],
  [
    'isActiveTabPoppedOut',
    'boolean',
    '[Experimental] True if the active tab is detached in a multi-window popout.',
  ],
  [
    'popoutTab',
    '(tabId?: string) => void',
    '[Experimental] Spawns a secondary browser window for the specified tab.',
  ],
  [
    'dockTab',
    '(tabId?: string) => void',
    '[Experimental] Closes the popout window and re-integrates tab into the pane.',
  ],
]

export const paneCustomizationSection: DocSection = {
  id: 'pane-customization',
  title: 'Pane Customization',
  category: 'core',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          React Zeugma is <strong>100% headless</strong>. It does not ship default buttons, colors,
          borders, or opinionated CSS. Instead, it provides compound subcomponents and granular
          React Context hooks so you can design everything from minimal code editors to dark-mode
          financial terminals with full design freedom.
        </DocParagraph>
      </div>

      <CustomStylingDemo />

      <DocHeading>Compound Component Architecture</DocHeading>
      <DocParagraph>
        Every pane is rendered via the <DocCode highlight>&lt;Pane&gt;</DocCode> compound component
        hierarchy:
      </DocParagraph>

      <div className="grid sm:grid-cols-2 gap-4">
        <InfoCard title="<Pane id={paneId}>" titleClassName="font-mono text-accent text-xs">
          <DocParagraph size="sm">
            The root container of a panel. Establishes the drop zone target, registers drag event
            listeners, and provides <DocCode>usePaneContext()</DocCode> to all descendants.
          </DocParagraph>
        </InfoCard>
        <InfoCard title="<Pane.DragHandle>" titleClassName="font-mono text-accent text-xs">
          <DocParagraph size="sm">
            Designates which element initiates panel dragging. Attach it to a title bar, an icon, or
            the entire header. Injects pointer events and drag accessibility attributes
            automatically.
          </DocParagraph>
        </InfoCard>
        <InfoCard title="<Pane.Content>" titleClassName="font-mono text-accent text-xs">
          <DocParagraph size="sm">
            Renders the active tab. Accepts a function child{' '}
            <DocCode>{'(tab: TabDetails) => ReactNode'}</DocCode> which only re-renders when the
            active tab changes.
          </DocParagraph>
        </InfoCard>
        <InfoCard title="<Pane.Tabs>" titleClassName="font-mono text-accent text-xs">
          <DocParagraph size="sm">
            Optional convenience component for rendering reorderable tabs with drag preview hooks,
            or build your own with <DocCode>usePaneContext()</DocCode>.
          </DocParagraph>
        </InfoCard>
      </div>

      <DocCallout variant="important" title="renderPane Placement Rule">
        If using <DocCode>&lt;Zeugma&gt;</DocCode> with children (Context Provider Mode), you{' '}
        <strong>MUST</strong> pass the <DocCode>renderPane</DocCode> prop directly to{' '}
        <DocCode>&lt;PaneTree renderPane=&#123;renderPane&#125; /&gt;</DocCode>, and passing{' '}
        <DocCode>renderPane</DocCode> to <DocCode>&lt;Zeugma&gt;</DocCode> is forbidden. If using{' '}
        <DocCode>&lt;Zeugma&gt;</DocCode> in Standalone Mode (without children), you pass{' '}
        <DocCode>renderPane</DocCode> directly to{' '}
        <DocCode>&lt;Zeugma renderPane=&#123;renderPane&#125; /&gt;</DocCode>.
      </DocCallout>

      <DocHeading>Building a Production Pane with usePaneContext()</DocHeading>
      <DocParagraph>
        Inside any child of <DocCode>&lt;Pane&gt;</DocCode>, call{' '}
        <DocCode highlight>usePaneContext()</DocCode> to gain full access to local pane state and
        actions:
      </DocParagraph>

      <DocCodeBlock code={COMPOUND_PANE_CODE} language="tsx" />

      <DocHeading>usePaneContext() Properties &amp; Actions</DocHeading>
      <DocTable
        headers={['Property', 'Type', 'Description']}
        rows={USE_PANE_CONTEXT_TABLE}
        searchable
        searchPlaceholder="Filter pane context properties..."
        caption="usePaneContext Hook Returns"
      />

      <DocHeading>Headless Styling via classNames</DocHeading>
      <DocParagraph>
        Because Zeugma is headless, you configure CSS classes for interaction states (dividers,
        hover previews, and drag ghost overlays) via the <DocCode highlight>classNames</DocCode>{' '}
        prop:
      </DocParagraph>

      <DocCodeBlock code={CLASSNAMES_CONFIG_CODE} language="tsx" />

      <DocHeading>Context Provider Mode (&lt;PaneTree&gt;)</DocHeading>
      <DocParagraph>
        In complex enterprise applications where the dashboard layout sits alongside app-level
        sidebars, toolbars, or status indicators, use Zeugma as a context provider wrapping{' '}
        <DocCode highlight>&lt;PaneTree&gt;</DocCode>:
      </DocParagraph>

      <DocCodeBlock code={CONTEXT_PROVIDER_MODE_CODE} language="tsx" />

      <DocHeading>Composition Rules Checklist</DocHeading>
      <DocList
        items={[
          <>
            <strong>Interactive DragHandle Requirement</strong>: Every movable pane MUST contain a
            child <DocCode>&lt;Pane.DragHandle&gt;</DocCode> to establish the pointer event capture
            zone.
          </>,
          <>
            <strong>Drop Zone Highlighting</strong>: Configure <DocCode>dropPreview</DocCode> with
            high contrast so users clearly anticipate split orientation before dropping.
          </>,
          <>
            <strong>Tab Overflow Handling</strong>: Provide horizontal scrollbars or dropdown menus
            when panes house 10+ tabs.
          </>,
        ]}
      />
    </div>
  ),
}
