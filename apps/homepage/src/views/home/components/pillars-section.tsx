import { Split, Move, FileJson, Cpu, Layers, Zap } from 'lucide-react'

const PILLARS = [
  {
    title: 'Arbitrary Recursive Splits',
    tag: 'Binary Tree',
    description:
      'Split horizontally or vertically without predefined column constraints. Create nested bento workspaces, side-by-side diff viewers, and complex cockpit monitors.',
    icon: Split,
    stat: 'Infinite depth',
    badge: 'Core Engine',
  },
  {
    title: 'Multi-Tab Pane Docking',
    tag: 'Tab Stacks',
    description:
      'Combine multiple widget panels into a single tabbed container. Drag tabs between panes, detach them into independent views, or reorder tabs on the fly.',
    icon: Layers,
    stat: 'Drag & Dock',
    badge: 'Flexibility',
  },
  {
    title: 'Decoupled Metadata Store',
    tag: 'React 18 & 19',
    description:
      'Powered by useSyncExternalStore. Update tab badges, notification counts, and panel titles without triggering layout re-renders or resizer recalculations.',
    icon: Zap,
    stat: '0 re-renders',
    badge: 'High Performance',
  },
  {
    title: 'Drag-to-Dismiss Physics',
    tag: 'Spatial DnD',
    description:
      'Drag a panel or tab beyond the dashboard perimeter to dismiss or close it, complete with scale feedback and velocity-aware animations.',
    icon: Move,
    stat: 'Fluid touch & mouse',
    badge: 'UX Delight',
  },
  {
    title: 'Pure JSON Serialization',
    tag: 'State & URL',
    description:
      'The entire topology serializes into a clean, human-readable JSON tree. Save to localStorage, sync across team URLs, or restore user workspaces in milliseconds.',
    icon: FileJson,
    stat: '100% Serializable',
    badge: 'Persistence',
  },
  {
    title: '100% Headless Architecture',
    tag: 'Unopinionated',
    description:
      'Zero bundled CSS runtime. Zeugma calculates coordinates, split math, and drop targets while giving you total freedom over your DOM, Tailwind, and theme tokens.',
    icon: Cpu,
    stat: '~4.8 kB gzipped',
    badge: 'Zero Bloat',
  },
]

export function PillarsSection() {
  return (
    <section className="py-24 px-6 sm:px-8 border-b border-border-primary bg-bg-sidebar/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-2">Engine Primitives</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Built for Desktop-Grade Web Interfaces
          </h2>
          <p className="text-text-secondary text-sm mt-3 leading-relaxed">
            Every detail is engineered for performance, strict typing, and developer autonomy.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="group relative p-7 rounded-2xl bg-bg-pane border border-border-primary hover:border-border-secondary shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="eyebrow text-[10px]">{pillar.badge}</span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-primary/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                  <span>{pillar.tag}</span>
                  <span className="font-semibold text-text-primary">{pillar.stat}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
