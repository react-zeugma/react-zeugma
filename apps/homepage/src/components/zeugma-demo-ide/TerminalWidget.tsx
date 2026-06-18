export function TerminalWidget() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0'
  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto p-4 font-mono text-[11px] leading-relaxed text-[#858585] select-text">
      <div className="flex justify-between items-center pb-2 border-b border-[#2d2d30] mb-3 text-zinc-500">
        <span>bash (npm run dev)</span>
        <span>~/my-zeugma-app</span>
      </div>
      <div className="text-[#abb2bf]">
        <span className="text-emerald-400">user@dev:~/my-zeugma-app$</span> npm run dev
        <br />
        <span className="text-[#5c6370]">{`> my-zeugma-app@${version} dev`}</span>
        <br />
        <span className="text-[#5c6370]">{`> vite`}</span>
        <br />
        <br />
        <span className="text-cyan-400">{'  VITE v5.1.4  ready in 184 ms'}</span>
        <br />
        <br />
        {'  ➜  '}Local:{' '}
        <span className="text-indigo-400 underline cursor-pointer">http://localhost:5173/</span>
        <br />
        {'  ➜  '}Network: use --host to expose
        <br />
        <br />
        <span className="text-zinc-600 animate-pulse">▋</span>
      </div>
    </div>
  )
}
