import { DocCodeBlock } from '../../components/mdx-renderer'
import { DocParagraph, DocCode, DocList } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const DEBOUNCED_SYNC_CODE = `import { useState, useEffect } from 'react'
import { useZeugma, TreeNode } from 'react-zeugma'

export function PersistentDashboard({ userId }: { userId: string }) {
  const [layout, setLayout] = useState<TreeNode | null>(null)

  // 1. Fetch initial layout from DB on mount
  useEffect(() => {
    fetch(\`/api/layouts/\${userId}\`)
      .then(res => res.json())
      .then(data => setLayout(data.layout))
  }, [userId])

  // 2. Debounce and save layout changes to DB
  useEffect(() => {
    if (!layout) return

    const timer = setTimeout(() => {
      fetch(\`/api/layouts/\${userId}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout })
      })
    }, 1000) // Save layout after 1 second of inactivity

    return () => clearTimeout(timer)
  }, [layout, userId])

  const controller = useZeugma({
    layout,
    onChange: setLayout
  })

  if (!layout) return <div>Loading workspace...</div>

  return <Zeugma controller={controller} renderPane={...} />
}`

const CONTEXT_APIS_CODE = `import { usePaneContext, Pane } from 'react-zeugma'
import { Maximize2, Minimize2, X } from 'lucide-react'

function CustomPaneHeader() {
  const { 
    id, 
    tabIds, 
    activeTabId, 
    selectTab, 
    remove, 
    toggleFullscreen, 
    isFullscreen 
  } = usePaneContext()

  return (
    <div className="flex items-center justify-between p-2 bg-zinc-800 text-white">
      {/* 1. Custom Tab Bar */}
      <div className="flex gap-1">
        {tabIds.map(tabId => (
          <button
            key={tabId}
            onClick={() => selectTab(tabId)}
            className={\`px-2.5 py-1 text-xs \${tabId === activeTabId ? 'bg-indigo-600' : 'bg-zinc-700'}\`}
          >
            {tabId}
          </button>
        ))}
      </div>

      {/* 2. Drag Handle */}
      <Pane.DragHandle className="flex-1 h-full cursor-grab" />

      {/* 3. Pane Controls */}
      <div className="flex gap-1">
        <button onClick={toggleFullscreen} title="Maximize">
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button onClick={remove} title="Close Pane" className="hover:text-red-500">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}`

export const advancedFeaturesSection: DocSection = {
  id: 'advanced-features',
  title: 'Advanced Features',
  category: 'advanced',
  content: (
    <div className="space-y-6">
      <DocParagraph>
        React Zeugma includes advanced features to build rich, professional workspaces, including
        layout persistence, drag-to-dismiss, and context-isolated APIs.
      </DocParagraph>
    </div>
  ),
  subsections: [
    {
      id: 'persistence',
      title: 'Layout Persistence',
      content: (
        <div className="space-y-4 text-sm text-text-secondary">
          <DocParagraph>
            React Zeugma provides automatic local storage persistence, but you can easily intercept
            state changes to sync layout trees to a remote database.
          </DocParagraph>
          <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            Example: Debounced Database Sync
          </h4>
          <DocParagraph>
            When working in controlled mode, you can implement a debounced sync mechanism in a
            custom hook to avoid hitting your backend API on every intermediate pixel drag during
            resizing:
          </DocParagraph>
          <DocCodeBlock code={DEBOUNCED_SYNC_CODE} language="tsx" />
        </div>
      ),
    },
    {
      id: 'drag-to-dismiss',
      title: 'Drag-to-Dismiss',
      content: (
        <div className="space-y-4 text-sm text-text-secondary">
          <DocParagraph>
            When <DocCode highlight>enableDragToDismiss</DocCode> is enabled, users can drag a tab
            or pane outside the outer boundaries of the dashboard to close it.
          </DocParagraph>
          <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider">
            How it works:
          </h4>
          <DocList
            items={[
              <>
                <strong>Pointer Boundary Check</strong>: Zeugma tracks the cursor position relative
                to the root dashboard bounding client rect.
              </>,
              <>
                <strong>Trigger Distance</strong>: If the cursor exceeds the boundaries by more than{' '}
                <DocCode highlight>dismissThreshold</DocCode> (in pixels), a dismissal intent is
                registered.
              </>,
              <>
                <strong>Visual Indicator</strong>: Zeugma applies the{' '}
                <DocCode highlight>dismissPreview</DocCode> class to the background, allowing you to
                show a red overlay or close icon indicating that letting go will discard the panel.
              </>,
            ]}
          />
        </div>
      ),
    },
    {
      id: 'context-apis',
      title: 'Context APIs (usePaneContext)',
      content: (
        <div className="space-y-4 text-sm text-text-secondary">
          <DocParagraph>
            The <DocCode highlight>usePaneContext</DocCode> hook provides access to the state and
            actions of the specific pane. This enables you to build custom pane headers, close
            buttons, and maximize toggles easily:
          </DocParagraph>
          <DocCodeBlock code={CONTEXT_APIS_CODE} language="tsx" />
        </div>
      ),
    },
    {
      id: 'keep-alive-portals',
      title: 'No Re-mounting (Keep-Alive) & Portals',
      content: (
        <div className="space-y-4 text-sm text-text-secondary">
          <DocParagraph>
            In traditional tree-based layout managers (such as <code>react-mosaic</code>),
            rearranging, splitting, or dragging panels changes the React component tree hierarchy,
            causing components to unmount and lose their state.{' '}
            <strong>React Zeugma prevents this by keeping components alive</strong>. It decouples
            the logical React tree from physical DOM rendering using an off-screen portal registry.
          </DocParagraph>
          <DocParagraph>
            Every tab is mounted once into a stable, persistent DOM wrapper. When a tab becomes
            active, Zeugma projects its wrapper into the pane using <code>appendChild()</code>. When
            a tab is inactive or in-transit, it is stashed in a hidden container. This preserves
            iframe states, scroll positions, and input focus perfectly across all layout operations.
          </DocParagraph>
        </div>
      ),
    },
  ],
}
