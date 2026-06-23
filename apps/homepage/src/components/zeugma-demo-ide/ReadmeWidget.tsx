export function ReadmeWidget() {
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-8 text-zinc-300 select-text font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">my-zeugma-app</h1>

        <p className="text-base text-zinc-400 mb-8 leading-relaxed">
          Welcome to <strong className="text-white font-semibold">my-zeugma-app</strong>, an
          interactive preview of a custom React layout powered by{' '}
          <code className="bg-zinc-800/80 text-indigo-400 font-mono px-1.5 py-0.5 rounded text-sm font-semibold">
            react-zeugma
          </code>{' '}
          — a recursive, style-agnostic, and high-performance drag-and-drop dashboard layout engine.
          This live editor is fully interactive: try dragging tabs to split panes horizontally or
          vertically, resizing panels, and exploring the source files.
        </p>

        {/* Core Layout Features */}
        <h2 className="text-xl font-bold text-white mt-8 mb-4 border-b border-zinc-800 pb-2">
          Core Layout Features
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-lg">
            <strong className="text-indigo-400 text-sm block mb-1">Arbitrary Splits</strong>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Split horizontally or vertically without constraints. Create complex bento grids or
              simple side-by-side layouts instantly.
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-lg">
            <strong className="text-emerald-400 text-sm block mb-1">Smooth Resizing</strong>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Fluid, non-blocking resize handles with snap-to-edge capabilities. Feels completely
              native to the browser.
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-lg">
            <strong className="text-amber-400 text-sm block mb-1">Flexible & Unopinionated</strong>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Save and load layout trees via simple JSON serialization. Complete control over state
              management and persistence flows.
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-lg">
            <strong className="text-rose-400 text-sm block mb-1">Headless Design</strong>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We handle the complex math, drop zones, and tree states. You bring your own CSS and
              components.
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <h2 className="text-xl font-bold text-white mt-8 mb-4 border-b border-zinc-800 pb-2">
          Getting Started
        </h2>

        <p className="text-sm text-zinc-400 mb-4">
          To use the library in your own project, install the package via npm:
        </p>

        <pre className="bg-[#141416] border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 overflow-x-auto mb-6">
          <code>npm install react-zeugma</code>
        </pre>

        <p className="text-sm text-zinc-400">
          Refer to{' '}
          <code className="bg-zinc-800/80 text-zinc-200 font-mono px-1 py-0.5 rounded text-xs">
            App.tsx
          </code>{' '}
          (viewable in the editor tabs) to see how to define the layout tree structure and
          initialize the controller.
        </p>
      </div>
    </div>
  )
}
