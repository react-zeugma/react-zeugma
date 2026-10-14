import { ComparisonFeature } from './types'

export const COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: 'Layout Topology',
    zeugma: 'Recursive Binary Tree (Arbitrary split depth)',
    mosaic: 'Binary Tree (Arbitrary split depth)',
    gridLayout: 'Flat 12-Column Grid (Row/col locked)',
    goldenLayout: 'Multi-root Tree (Stack/row/col)',
    highlight: true,
  },
  {
    name: 'Headless / Styling',
    zeugma: '100% Headless & Style-Agnostic',
    mosaic: 'Opinionated CSS / Blueprint theme',
    gridLayout: 'Inline transforms / CSS styles',
    goldenLayout: 'Heavy bundled CSS/LESS themes',
    highlight: true,
  },
  {
    name: 'React 18 & 19 Support',
    zeugma: 'Full Concurrent Mode & useSyncExternalStore',
    mosaic: 'Legacy lifecycle hooks (React 16-17 era)',
    gridLayout: 'React 18 compatible',
    goldenLayout: 'Imperative DOM wrapper layer',
    highlight: true,
  },
  {
    name: 'Multi-Tab Pane Docking',
    zeugma: 'Native multi-tab stacks & tab drag-transfer',
    mosaic: 'Single widget per node (No tab stacks)',
    gridLayout: 'No native tabs (Requires manual nesting)',
    goldenLayout: 'Built-in tab headers',
  },
  {
    name: 'Native Multi-Window Popouts',
    zeugma: 'Native popout window with synced state & CSS',
    mosaic: 'No native popout support',
    gridLayout: 'No native popout support',
    goldenLayout: 'Popout window support (complex bridge)',
  },
  {
    name: 'Re-render Isolation',
    zeugma: '0 layout reflows (Decoupled widget metadata)',
    mosaic: 'Parent re-renders on node state change',
    gridLayout: 'Cascading recalculation on sibling change',
    goldenLayout: 'DOM mutations bypass React tree',
  },
  {
    name: 'Bundle Footprint',
    zeugma: '~4.8 kB gzipped (Zero CSS bloat)',
    mosaic: '~30 kB (Excluding Blueprint CSS)',
    gridLayout: '~45 kB',
    goldenLayout: '~60+ kB (Excluding theme assets)',
  },
]
