import { DocsPlayground } from '../../components/docs-playground'
import {
  DocParagraph,
  DocCode,
  Checklist,
  InfoCard,
  DocHeading,
  DocCallout,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const WHY_ZEUGMA_FEATURES = [
  {
    title: 'Headless & 100% Style-Agnostic',
    desc: 'Zero opinionated CSS. Full programmatic styling control over resizers, drop previews, pane chrome, and tab bars with Tailwind, CSS modules, or vanilla classes.',
  },
  {
    title: 'Arbitrary Recursive Splitting',
    desc: 'Unlike rigid 12-column coordinate systems, panels can be split recursively into left, right, top, or bottom viewports with custom ratio percentages.',
  },
  {
    title: 'Multi-Tab Pane Docking',
    desc: 'Consolidate multiple related widgets into a single pane. Supports drag-and-drop tab reordering, cross-pane tab transfers, and active tab state isolation.',
  },
  {
    title: 'Fine-Grained Isolated Reactivity',
    desc: 'Widget metadata is decoupled from spatial topology. Updating high-frequency widget state never re-renders the layout tree or split resizer bars.',
  },
  {
    title: 'Native Multi-Window Popouts',
    desc: 'Detach any pane or tab into a separate physical browser window. React state, contexts, and dynamic theme tokens are seamlessly synced across documents.',
  },
  {
    title: 'Deterministic JSON Serialization',
    desc: 'Save and hydrate entire workspace topologies to localStorage or remote backends using an immutable, cycle-guarded JSON tree schema.',
  },
]

export const introductionSection: DocSection = {
  id: 'introduction',
  title: 'Introduction & Architecture',
  category: 'overview',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          <strong className="text-text-primary font-semibold">React Zeugma</strong> is an
          enterprise-grade, headless, recursive drag-and-drop workspace layout engine built for
          React 18 &amp; 19. It unites the arbitrary space-partitioning model of{' '}
          <DocCode highlight>react-mosaic</DocCode> with the declarative, state-driven ergonomics of{' '}
          <DocCode highlight>react-grid-layout</DocCode>, powered by the robust pointer and
          accessibility primitives of <DocCode highlight>@dnd-kit/core</DocCode>.
        </DocParagraph>
      </div>

      <DocCallout variant="tip" title="Designed for High-Density Pro Applications">
        Whether you are building an in-browser IDE, a multi-monitor financial trading terminal, or
        an observability monitoring console, React Zeugma provides the mathematical topology and
        drag-and-drop engine without dictating a single pixel of your visual design system.
      </DocCallout>

      {/* Mental Model Comparison Card */}
      <div className="border border-border-primary rounded-2xl p-6 bg-bg-pane shadow-2xs space-y-4">
        <DocHeading level={4}>Architectural Paradigm Comparison</DocHeading>
        <DocParagraph>
          Traditional dashboard libraries enforce a flat coordinate grid (e.g. 12 columns by
          arbitrary rows). While adequate for simple dashboard cards, rigid coordinate systems
          breakdown in dynamic multi-panel tools:
        </DocParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="border border-border-primary/80 bg-bg-pane-inner/40 rounded-xl p-4 space-y-2">
            <span className="eyebrow text-rose-500 font-bold flex items-center gap-1.5">
              <span>✕</span> Traditional 12-Column Grids
            </span>
            <ul className="text-xs text-text-secondary space-y-2 list-disc list-outside pl-4">
              <li>Resizing a panel forces global coordinate re-calculation across all siblings.</li>
              <li>Cannot split an arbitrary panel in half without breaking row geometry.</li>
              <li>Frequent layout jitter and cascading reflows on high-frequency data streams.</li>
              <li>Couples spatial coordinates with internal widget state.</li>
            </ul>
          </div>
          <div className="border border-accent/30 bg-accent/5 rounded-xl p-4 space-y-2">
            <span className="eyebrow text-accent font-bold flex items-center gap-1.5">
              <span>✓</span> The Zeugma Binary Tree Model
            </span>
            <ul className="text-xs text-text-secondary space-y-2 list-disc list-outside pl-4">
              <li>Every split is local: space is partitioned recursively into two children.</li>
              <li>Resizing a divider only alters the ratio between its direct children.</li>
              <li>Isolated reactivity: widget state updates bypass the layout tree.</li>
              <li>Pure immutable tree operations with zero external DOM side effects.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Playground Embed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <DocHeading level={4}>Interactive Layout Playground</DocHeading>
          <span className="text-[11px] text-text-muted font-mono">Live Engine v7.1</span>
        </div>
        <DocParagraph>
          Experience the engine directly. Drag panel headers to dock or split, resize split
          dividers, and inspect layout locking:
        </DocParagraph>
        <DocsPlayground />
      </div>

      {/* Key Guarantees Bento */}
      <div className="space-y-4">
        <DocHeading level={4}>Core Design Principles</DocHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            title="100% Headless by Design"
            titleClassName="text-accent flex items-center gap-1.5"
          >
            <p className="text-xs text-text-secondary leading-relaxed">
              React Zeugma renders no default CSS classes, fonts, or colors. You define the HTML
              wrappers, tabs, buttons, drag indicators, and resizer bars using your own design
              system.
            </p>
          </InfoCard>
          <InfoCard
            title="Immutable Tree Math"
            titleClassName="text-accent flex items-center gap-1.5"
          >
            <p className="text-xs text-text-secondary leading-relaxed">
              Layout structures are strictly immutable. All operations (<DocCode>splitPane</DocCode>
              , <DocCode>removeTab</DocCode>, <DocCode>mergeTab</DocCode>) return clean new tree
              references with full cycle detection.
            </p>
          </InfoCard>
          <InfoCard
            title="Fine-Grained Reactivity"
            titleClassName="text-text-primary flex items-center gap-1.5"
          >
            <p className="text-xs text-text-secondary leading-relaxed">
              Tab metadata is decoupled from spatial topology. High-frequency telemetry updates
              re-render only the affected widget, keeping splitters and sibling panes completely
              idle.
            </p>
          </InfoCard>
          <InfoCard
            title="Native Popout Windows"
            titleClassName="text-accent flex items-center gap-1.5"
          >
            <p className="text-xs text-text-secondary leading-relaxed">
              Widgets can be popped out into separate OS browser windows without losing React state,
              timers, or form input. Styles and theme tokens are synchronized automatically.
            </p>
          </InfoCard>
        </div>
      </div>

      {/* Why Zeugma Checklist */}
      <div className="bg-bg-pane border border-border-primary rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          Feature Matrix &amp; Capabilities
        </h3>
        <DocParagraph className="mb-4">
          Everything required to build enterprise-grade developer tools, observability dashboards,
          and financial trading stations out of the box:
        </DocParagraph>
        <Checklist items={WHY_ZEUGMA_FEATURES} />
      </div>
    </div>
  ),
}
