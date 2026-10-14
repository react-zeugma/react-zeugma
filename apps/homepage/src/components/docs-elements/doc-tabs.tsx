'use client'

import { useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'

export interface PackageManagerTabsProps {
  packageNames?: string
  dev?: boolean
  className?: string
}

export function PackageManagerTabs({
  packageNames = 'react-zeugma',
  dev = false,
  className = '',
}: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<'pnpm' | 'npm' | 'yarn' | 'bun'>('pnpm')
  const [copied, setCopied] = useState(false)

  const commands: Record<'pnpm' | 'npm' | 'yarn' | 'bun', string> = {
    pnpm: dev ? `pnpm add -D ${packageNames}` : `pnpm add ${packageNames}`,
    npm: dev ? `npm install -D ${packageNames}` : `npm install ${packageNames}`,
    yarn: dev ? `yarn add -D ${packageNames}` : `yarn add ${packageNames}`,
    bun: dev ? `bun add -d ${packageNames}` : `bun add ${packageNames}`,
  }

  const currentCommand = commands[activeTab]

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`w-full rounded-xl overflow-hidden border border-border-primary bg-bg-pane-inner font-mono text-xs shadow-2xs my-4 transition-colors ${className}`}
    >
      {/* Tab bar header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-primary bg-bg-sidebar/70 select-none">
        <div className="flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-text-muted mr-1.5" />
          {(['pnpm', 'npm', 'yarn', 'bun'] as const).map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-bg-pane text-accent shadow-2xs border border-border-primary'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-pane/40 border border-transparent'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-pane text-xs transition-colors cursor-pointer"
          title="Copy command"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Command prompt display */}
      <div className="p-4 flex items-center justify-between text-text-primary overflow-x-auto select-all">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold select-none">$</span>
          <code className="text-xs sm:text-sm font-mono whitespace-nowrap">{currentCommand}</code>
        </div>
      </div>
    </div>
  )
}
