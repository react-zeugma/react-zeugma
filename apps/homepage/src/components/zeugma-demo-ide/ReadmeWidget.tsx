export function ReadmeWidget() {
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-6 text-zinc-300 select-text font-sans">
      <h1 className="text-lg font-black text-white mb-3 flex items-center gap-2">
        <span>my-zeugma-app</span>
      </h1>
      <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
        A workspace layout demo built with{' '}
        <code className="bg-zinc-800 text-indigo-300 px-1 py-0.5 rounded text-[10px]">
          react-zeugma
        </code>{' '}
        + Vite + React 19. Explore the drag-and-drop split layout engine interactively.
      </p>
      <div className="space-y-4">
        {[
          {
            color: 'text-indigo-400',
            label: '1. Drag & Split',
            desc: 'Drag tabs (like App.tsx or WorkspacePane.tsx) toward the edge of another pane to split the view. Tabs reorder inline via sortable drag, and detach into floating overlays when pulled far enough — just like browser tabs.',
          },
          {
            color: 'text-emerald-400',
            label: '2. File Explorer',
            desc: 'Click any file in the sidebar to open it as a tab. The project uses a standard Vite + React structure with src/, components/, and styles/ directories.',
          },
          {
            color: 'text-violet-400',
            label: '3. Layout Inspector',
            desc: 'Switch to the Layout Inspector tab in the terminal pane to see the serialized JSON tree update live as you drag, resize, or reorder.',
          },
        ].map(({ color, label, desc }) => (
          <div key={label} className="bg-[#252526] p-4 rounded-xl border border-zinc-800/80">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${color} block mb-1`}>
              {label}
            </span>
            <p className="text-[11px] text-zinc-400 leading-normal">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
