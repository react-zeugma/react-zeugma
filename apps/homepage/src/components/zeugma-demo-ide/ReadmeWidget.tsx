export function ReadmeWidget() {
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-8 text-zinc-300 select-text font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">my-zeugma-app</h1>

        <p className="text-base text-zinc-400 mb-6 leading-relaxed">
          Welcome to the official workspace layout demo built with{' '}
          <code className="bg-zinc-800/80 text-indigo-400 font-mono px-1.5 py-0.5 rounded text-sm font-semibold">
            react-zeugma
          </code>{' '}
          — a recursive, style-agnostic, and high-performance drag-and-drop dashboard layout engine
          for React.
        </p>

        <div className="border-l-4 border-indigo-500 bg-indigo-500/5 p-4 rounded-r-lg mb-8 text-sm text-zinc-300 leading-relaxed">
          <strong className="text-indigo-400 font-semibold block mb-1">
            💡 Interactive Playground
          </strong>
          Try dragging tabs to different edges of the workspace, resizing panels using the custom
          handles, or reorganizing the layout dynamically.
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 border-b border-zinc-800 pb-2">
          Core Features
        </h2>

        <ul className="space-y-4 list-none pl-0">
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 font-extrabold text-lg select-none leading-none">
              ✦
            </span>
            <div>
              <strong className="text-zinc-100 text-sm block">Drag-to-Split Layouts</strong>
              <p className="text-sm text-zinc-400 leading-relaxed mt-1">
                Drag tabs toward any outer edge of a pane to split it. Tabs can be rearranged within
                the same tab bar or detached entirely into new panes.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-400 font-extrabold text-lg select-none leading-none">
              ✦
            </span>
            <div>
              <strong className="text-zinc-100 text-sm block">Interactive File Explorer</strong>
              <p className="text-sm text-zinc-400 leading-relaxed mt-1">
                Browse the directory tree on the left sidebar and click files to open them in your
                active editor.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-violet-400 font-extrabold text-lg select-none leading-none">
              ✦
            </span>
            <div>
              <strong className="text-zinc-100 text-sm block">Real-time Layout Inspector</strong>
              <p className="text-sm text-zinc-400 leading-relaxed mt-1">
                A dedicated right-hand side panel showing the serialized JSON state tree of your
                workspace layout updating live as you make adjustments.
              </p>
            </div>
          </li>
        </ul>

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
          to see how to define the layout tree structure and initialize the controller.
        </p>
      </div>
    </div>
  )
}
