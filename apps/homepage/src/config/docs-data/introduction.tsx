import { DocsPlayground } from '../../components/docs-playground'
import { DocParagraph, DocCode, Checklist } from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const WHY_ZEUGMA_FEATURES = [
  {
    title: 'Headless (Style-Agnostic)',
    desc: 'No built-in styles. You have absolute control over containers, resizers, and previews using your own Tailwind or CSS classes.',
  },
  {
    title: 'Multi-Tab Pane Groups',
    desc: 'Multiple widgets can be docked inside a single pane and switched using tabs.',
  },
  {
    title: 'Drag-to-Dismiss',
    desc: 'Drag a tab or pane out of the dashboard boundary to remove or close it.',
  },
  {
    title: 'JSON Serialization',
    desc: 'Save and restore layouts easily using a clean JSON-serializable tree structure.',
  },
]

export const introductionSection: DocSection = {
  id: 'introduction',
  title: 'Introduction',
  category: 'overview',
  content: (
    <div className="space-y-6">
      <DocParagraph size="base">
        <strong>React Zeugma</strong> is a recursive, drag-and-drop dashboard layout engine for
        React. It combines the tree-based, arbitrary splitting capabilities of{' '}
        <DocCode highlight>react-mosaic</DocCode> with the declarative, state-driven API model of{' '}
        <DocCode highlight>react-grid-layout</DocCode>, powered by the robust drag-and-drop
        primitives of <DocCode highlight>@dnd-kit/core</DocCode>.
      </DocParagraph>

      <div className="my-6">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 select-none">
          Interactive Playground
        </h3>
        <DocsPlayground />
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 my-6">
        <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          Why Zeugma?
        </h3>
        <DocParagraph className="mb-4">
          Most dashboard layout managers restrict you to a rigid grid where columns and rows are
          pre-calculated. Zeugma uses a <strong>binary tree layout</strong>, enabling users to split
          any panel vertically or horizontally to create highly complex, nested workspaces.
          Additionally, it features:
        </DocParagraph>
        <Checklist items={WHY_ZEUGMA_FEATURES} />
      </div>
    </div>
  ),
}
