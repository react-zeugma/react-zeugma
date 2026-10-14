import { DocCodeBlock } from '../../components/mdx-renderer'
import {
  DocParagraph,
  DocCode,
  DocHeading,
  DocList,
  InfoCard,
  DocCallout,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const PERSISTENCE_LOCALSTORAGE_CODE = `import { useZeugma, Zeugma } from 'react-zeugma'

export function PersistedWorkspace() {
  const controller = useZeugma({ initialLayout: defaultLayout })

  return (
    <Zeugma
      controller={controller}
      // Zero-config persistence: auto-saves to and restores from localStorage
      persist={{
        enabled: true,
        key: 'app-workspace-layout-v2',
      }}
      renderPane={...}
    />
  )
}`

const PERSISTENCE_REMOTE_CODE = `import { useState, useEffect } from 'react'
import { useZeugma, TreeNode } from 'react-zeugma'

export function RemoteSyncedWorkspace({ teamId }: { teamId: string }) {
  const [layout, setLayout] = useState<TreeNode | null>(null)

  // 1. Fetch remote layout on mount
  useEffect(() => {
    fetch(\`/api/teams/\${teamId}/layout\`)
      .then((res) => res.json())
      .then((data) => setLayout(data.layout))
  }, [teamId])

  // 2. Debounced save to remote database (waits for drag actions to settle)
  useEffect(() => {
    if (!layout) return

    const timer = setTimeout(() => {
      fetch(\`/api/teams/\${teamId}/layout\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout }),
      })
    }, 800) // 800ms debounce

    return () => clearTimeout(timer)
  }, [layout, teamId])

  const controller = useZeugma({ layout, onChange: setLayout })

  if (!layout) return <div>Restoring workspace topology...</div>

  return <Zeugma controller={controller} renderPane={...} />
}`

const POPOUT_CODE = `import { usePaneContext } from 'react-zeugma'
import { ExternalLink } from 'lucide-react'

// Detach a tab into a native secondary desktop window
function PopoutButton({ tabId }: { tabId: string }) {
  const { popoutTab, dockTab, isActiveTabPoppedOut } = usePaneContext()

  if (isActiveTabPoppedOut) {
    return (
      <button onClick={() => dockTab(tabId)} className="text-xs text-accent">
        Dock Back
      </button>
    )
  }

  return (
    <button onClick={() => popoutTab(tabId)} title="Open in dedicated desktop window">
      <ExternalLink className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" />
    </button>
  )
}`

const POPOUT_WRAPPER_CODE = `import React, { useMemo } from 'react'
import { Zeugma } from 'react-zeugma'
import { StyleSheetManager } from 'styled-components'
import { StyleProvider, createCache } from '@ant-design/cssinjs'

// Injects dynamic CSS-in-JS style managers into the popout window's <head>
function PopoutStyleManager({
  document,
  children,
}: {
  document: Document
  children: React.ReactNode
}) {
  const cache = useMemo(() => createCache(), [])

  return (
    <StyleSheetManager target={document.head}>
      <StyleProvider cache={cache} container={document.head}>
        {children}
      </StyleProvider>
    </StyleSheetManager>
  )
}

export function App() {
  return (
    <Zeugma
      controller={controller}
      renderPopoutWrapper={({ document, children }) => (
        <PopoutStyleManager document={document}>{children}</PopoutStyleManager>
      )}
      renderPane={...}
    />
  )
}`

const TAB_METADATA_CODE = `import { useTabMetadata } from 'react-zeugma'

// Immutable tab metadata registered during tab creation
export function ChartTabWidget({ tabId }: { tabId: string }) {
  // Subscribes via useSyncExternalStore for fine-grained re-renders
  const metadata = useTabMetadata<{ symbol: string; interval: string }>(tabId)

  return (
    <div className="p-4">
      <h3 className="font-bold">{metadata?.symbol || 'UNKNOWN'}</h3>
      <span>Interval: {metadata?.interval || '1D'}</span>
    </div>
  )
}`

const DEVTOOLS_CODE = `import { useRenderCounter, RenderCounterBadge, RenderCounterFooter } from 'react-zeugma/devtools'

export function MonitoredWidget({ tabId }: { tabId: string }) {
  // React 18/19 StrictMode resilient mount and render tracking
  const { mounts, renders, reset } = useRenderCounter(\`widget-\${tabId}\`)

  return (
    <div className="relative h-full flex flex-col justify-between p-4">
      <RenderCounterBadge id={tabId} position="top-right" />
      
      <div>Widget Content: {tabId}</div>

      <RenderCounterFooter
        id={tabId}
        label="Performance Metrics"
        className="text-[10px] text-text-muted border-t pt-1"
      />
    </div>
  )
}`

export const advancedFeaturesSection: DocSection = {
  id: 'advanced-features',
  title: 'Advanced Features',
  category: 'advanced',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          Beyond core binary splitting, React Zeugma provides an enterprise-ready suite of advanced
          workspace capabilities: zero-remount DOM keep-alive portals, multi-window browser popouts
          with real-time stylesheet syncing, isolated tab metadata, drag-to-dismiss gestures, and
          built-in render cycle DevTools.
        </DocParagraph>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard title="Zero-Remount Portals" titleClassName="text-accent font-mono text-xs">
          <DocParagraph size="sm">
            Preserves iframes, WebGL contexts, canvas layers, and form state without unmounting
            during drag/splits.
          </DocParagraph>
        </InfoCard>
        <InfoCard title="Multi-Window Popouts" titleClassName="text-accent font-mono text-xs">
          <DocParagraph size="sm">
            Detaches tabs into independent native desktop browser windows while maintaining live
            state sync.
          </DocParagraph>
        </InfoCard>
        <InfoCard title="Render DevTools" titleClassName="text-accent font-mono text-xs">
          <DocParagraph size="sm">
            StrictMode-safe profiling hooks to detect unwanted component mount and render
            lifecycles.
          </DocParagraph>
        </InfoCard>
      </div>
    </div>
  ),
  subsections: [
    {
      id: 'keep-alive-portals',
      title: 'Zero-Remount Keep-Alive Portals',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Traditional layout managers destroy and re-create React components when moving them
            between branches in the DOM tree. This destroys scroll positions, resets audio/video
            players, reloads iframes, and loses uncommitted form input.
          </DocParagraph>
          <DocParagraph>
            <strong>React Zeugma solves this permanently</strong>. It decouples the logical React
            tree from the physical DOM rendering hierarchy via an off-screen portal registry:
          </DocParagraph>
          <DocList
            items={[
              <>
                <strong>Single Mount Lifecycle</strong>: Every tab component is mounted once into an
                offscreen host node and retained across all layout reorganizations.
              </>,
              <>
                <strong>Physical DOM Reparenting</strong>: When a tab is moved or its container
                splits, Zeugma projects its existing DOM subtree using atomic DOM manipulation,
                preserving native state perfectly.
              </>,
              <>
                <strong>Focus & Scroll Retention</strong>: Cursor positions in textareas, active
                WebGL canvas contexts, and scroll offsets are preserved with 0ms interruption.
              </>,
            ]}
          />
          <DocCallout variant="tip" title="Tested on Heavy Media & Maps">
            Check the Live Demo in the navigation bar to see interactive Leaflet maps, WebGL
            particle systems, and audio waveforms retained smoothly across split and merge gestures.
          </DocCallout>
        </div>
      ),
    },
    {
      id: 'multi-window-popouts',
      title: 'Multi-Window Browser Popouts',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Modern trading stations, video editors, and IDEs require detaching tabs into separate
            desktop monitors. React Zeugma provides first-class support for multi-window popouts via
            native <DocCode>window.open()</DocCode> and React Portals.
          </DocParagraph>

          <DocHeading level={4}>Triggering Popout and Docking</DocHeading>
          <DocCodeBlock code={POPOUT_CODE} language="tsx" />

          <DocHeading level={4}>Automatic Stylesheet Synchronization</DocHeading>
          <DocParagraph>
            When a popout window opens, React Zeugma automatically copies all static stylesheets,
            CSS link elements, and root attributes (such as{' '}
            <DocCode>data-theme=&quot;dark&quot;</DocCode> and class names) to the child window.
            Theme changes in the primary dashboard sync to popouts in real-time.
          </DocParagraph>

          <DocCallout variant="warning" title="Browser Popup Blocker Considerations">
            Browsers require popouts to be triggered from a trusted user gesture (e.g. a direct
            click event). If called asynchronously or from a timer, the browser will block the
            popout window.
          </DocCallout>

          <DocHeading level={4}>Dynamic CSS-in-JS (renderPopoutWrapper)</DocHeading>
          <DocParagraph>
            For libraries that inject CSS into <DocCode>&lt;head&gt;</DocCode> at runtime (like
            Styled Components or Ant Design), use the{' '}
            <DocCode highlight>renderPopoutWrapper</DocCode> prop to inject dynamic style targets:
          </DocParagraph>
          <DocCodeBlock code={POPOUT_WRAPPER_CODE} language="tsx" />
        </div>
      ),
    },
    {
      id: 'tab-metadata',
      title: 'Isolated Tab Metadata',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Tab metadata is decoupled from the structural <DocCode>TreeNode</DocCode> schema.
            Metadata is registered at creation time and queried reactively using the{' '}
            <DocCode highlight>useTabMetadata</DocCode> hook, powered by React&apos;s{' '}
            <DocCode>useSyncExternalStore</DocCode>:
          </DocParagraph>
          <DocCodeBlock code={TAB_METADATA_CODE} language="tsx" />
          <DocCallout variant="note" title="Zero Re-render Cascades">
            Because tab metadata is decoupled from the tree topology, updating high-frequency
            telemetry in one widget does not trigger layout re-renders across split dividers or
            sibling panels.
          </DocCallout>
        </div>
      ),
    },
    {
      id: 'persistence',
      title: 'Layout Persistence Strategies',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Choose between frictionless client-side storage or debounced server synchronization:
          </DocParagraph>

          <DocHeading level={4}>1. Built-in LocalStorage Persistence</DocHeading>
          <DocCodeBlock code={PERSISTENCE_LOCALSTORAGE_CODE} language="tsx" />

          <DocHeading level={4}>2. Remote Database Sync (Debounced)</DocHeading>
          <DocParagraph>
            In collaborative or cloud dashboards, debounce layout mutations to avoid sending
            high-frequency network requests during active divider dragging:
          </DocParagraph>
          <DocCodeBlock code={PERSISTENCE_REMOTE_CODE} language="tsx" />
        </div>
      ),
    },
    {
      id: 'drag-to-dismiss',
      title: 'Drag-to-Dismiss Gestures',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            Enable intuitive gesture dismissal by setting{' '}
            <DocCode highlight>enableDragToDismiss=&#123;true&#125;</DocCode> on{' '}
            <DocCode>&lt;Zeugma&gt;</DocCode>.
          </DocParagraph>
          <DocList
            items={[
              <>
                <strong>Boundary Tracking</strong>: Zeugma continuously monitors pointer coordinates
                against the dashboard bounding rectangle.
              </>,
              <>
                <strong>Dismiss Threshold</strong>: When dragged beyond the edge by more than{' '}
                <DocCode>dismissThreshold</DocCode> pixels (default 40px), the dismiss preview
                activates.
              </>,
              <>
                <strong>Visual Indicator</strong>: Style the active drop intent using the{' '}
                <DocCode>classNames.dismissPreview</DocCode> CSS configuration.
              </>,
            ]}
          />
        </div>
      ),
    },
    {
      id: 'devtools-profiling',
      title: 'DevTools & Performance Profiling',
      content: (
        <div className="space-y-4">
          <DocParagraph>
            The dedicated <DocCode highlight>react-zeugma/devtools</DocCode> package offers
            StrictMode-safe instrumentation to verify that layout operations do not cause unwanted
            component remounts or runaway render cycles:
          </DocParagraph>
          <DocCodeBlock code={DEVTOOLS_CODE} language="tsx" />
        </div>
      ),
    },
  ],
}
