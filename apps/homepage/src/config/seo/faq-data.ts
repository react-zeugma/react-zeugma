import { FaqItem } from './types'

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Why is react-zeugma considered a modern alternative to react-mosaic?',
    answer:
      'react-mosaic pioneered recursive binary-tree tiling in React, but it relies on older React lifecycle patterns and bundles opinionated Blueprint CSS styling. react-zeugma modernizes this architecture: it is 100% headless (zero bundled CSS runtime), fully compatible with React 18 & 19 concurrent features, uses useSyncExternalStore for zero-reflow isolated metadata updates, and provides built-in multi-tab pane docking and native multi-window popouts.',
  },
  {
    question:
      'How does a recursive tree layout engine differ from a 12-column grid like react-grid-layout?',
    answer:
      'Traditional 12-column grid engines (such as react-grid-layout) constrain widgets to rigid row/column coordinates. Resizing or splitting an element forces cascading re-calculations and layout reflows across siblings. In contrast, react-zeugma uses a recursive binary space-partitioning tree: any pane can be split horizontally or vertically at arbitrary ratios, and resizing a divider only recalculates the ratio between its direct children.',
  },
  {
    question: 'How does react-zeugma compare to golden-layout and dockview?',
    answer:
      'golden-layout originates from imperative DOM and jQuery architectures, resulting in a heavy bundle (~60+ kB) and fragile React state bridges. dockview offers docking but carries opinionated styles and heavier abstraction. react-zeugma is built natively for modern React (~4.8 kB gzipped), completely headless, strictly typed, and supports arbitrary recursive splitting, multi-tab docking, and popouts out of the box.',
  },
  {
    question: 'Can react-zeugma detach panels into separate physical browser windows?',
    answer:
      'Yes. react-zeugma provides native multi-window popout support. Popping a pane into an external window spawns a real OS browser window that preserves active React state, timers, and form inputs, while CSS stylesheets and dynamic design tokens are automatically mirrored and synchronized across windows.',
  },
  {
    question: 'Is react-zeugma completely headless and compatible with Tailwind CSS?',
    answer:
      'Yes. react-zeugma renders zero default CSS classes, fonts, or colors. You have 100% control over the DOM markup and styling for split dividers, tab bars, drop indicators, and pane containers using Tailwind CSS, CSS Modules, Radix UI, Shadcn, or plain CSS.',
  },
  {
    question: 'Does react-zeugma support high-frequency streaming data without lag?',
    answer:
      'Yes. react-zeugma separates widget metadata (such as tab labels, badges, or notification counts) from spatial layout topology. High-frequency telemetry updates re-render only the affected widget component via useSyncExternalStore, leaving splitters and sibling panes completely idle with 0 layout reflows.',
  },
]
