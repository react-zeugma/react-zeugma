import { DocCodeBlock } from '../../components/mdx-renderer'
import { DocParagraph, DocCode, DocHeading, DocList } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const QUICKSTART_CODE = `import { useZeugma, Zeugma, Pane, TreeNode } from 'react-zeugma'

// 1. Define the initial layout tree structure
const initialLayout: TreeNode = {
  type: 'split',
  direction: 'row',
  splitPercentage: 30,
  first: { type: 'pane', id: 'left-panel', tabIds: ['left-panel'], activeTabId: 'left-panel' },
  second: { type: 'pane', id: 'right-panel', tabIds: ['right-panel'], activeTabId: 'right-panel' },
}

// 2. Build your custom pane wrapper
function DashboardPane({ id }: { id: string }) {
  return (
    <Pane id={id}>
      <div className="flex flex-col h-full bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
        <Pane.DragHandle className="p-2 bg-zinc-800 cursor-grab text-zinc-300 font-semibold select-none">
          {id}
        </Pane.DragHandle>
        <Pane.Content className="flex-1 p-4 text-zinc-400">
          {(tab) => <div>Active Tab Content: {tab.id}</div>}
        </Pane.Content>
      </div>
    </Pane>
  )
}

// 3. Mount the layout controller and dashboard renderer
export default function DashboardApp() {
  const controller = useZeugma({ initialLayout })

  return (
    <div className="w-screen h-screen p-4 bg-zinc-950">
      <Zeugma 
        controller={controller} 
        renderPane={(paneId) => <DashboardPane id={paneId} />} 
        classNames={{
          resizer: 'bg-zinc-850 hover:bg-indigo-500 w-1 transition-colors',
          dropPreview: 'bg-indigo-500/10 border border-indigo-500 border-dashed rounded-lg'
        }}
      />
    </div>
  )`

export const quickstartSection: DocSection = {
  id: 'quickstart',
  title: 'Quick Start',
  category: 'overview',
  content: (
    <div className="space-y-6">
      <DocParagraph>
        To get started, install the package using your package manager of choice:
      </DocParagraph>

      <div className="w-full max-w-full relative group rounded-lg overflow-hidden border border-border-primary bg-bg-pane-inner my-4 font-mono text-[13px]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary bg-bg-sidebar text-text-secondary text-xs select-none">
          <span>Terminal</span>
        </div>
        <pre className="p-4 overflow-x-auto text-text-primary select-all whitespace-pre leading-relaxed">
          npm install react-zeugma
        </pre>
      </div>

      <DocParagraph>
        Here is a complete, minimal example showing how to initialize a layout tree with the{' '}
        <DocCode highlight>useZeugma</DocCode> hook, render your panes, and mount the{' '}
        <DocCode highlight>&lt;Zeugma&gt;</DocCode> component.
      </DocParagraph>

      <DocCodeBlock code={QUICKSTART_CODE} language="tsx" />

      <DocHeading>Step-by-Step Breakdown</DocHeading>
      <DocList
        ordered
        items={[
          <>
            <strong>Define a Layout Tree</strong>: The layout is defined recursively. In this case,
            we split the workspace horizontally into a row containing <DocCode>left-panel</DocCode>{' '}
            (30% width) and <DocCode>right-panel</DocCode> (70% width).
          </>,
          <>
            <strong>Build a Custom Pane Component</strong>: The <DocCode>&lt;Pane&gt;</DocCode>{' '}
            component sets up the drag boundary. We add a <DocCode>&lt;Pane.DragHandle&gt;</DocCode>{' '}
            to allow dragging, and a <DocCode>&lt;Pane.Content&gt;</DocCode> which uses a render
            function to display the active tab's content.
          </>,
          <>
            <strong>Mount &lt;Zeugma&gt;</strong>: The root component manages the drag-and-drop
            context, handles layout calculation, and positions the split resizer bars between panes.
          </>,
        ]}
      />
    </div>
  ),
}
