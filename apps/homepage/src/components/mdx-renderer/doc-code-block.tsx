'use client'

import { useState, useMemo } from 'react'
import { Copy, Check } from 'lucide-react'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'

export function DocCodeBlock({ code, language = 'tsx' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const html = useMemo(() => {
    const cleanLang = language.toLowerCase()
    const grammar = Prism.languages[cleanLang] || Prism.languages.tsx || Prism.languages.javascript
    return Prism.highlight(code, grammar, cleanLang)
  }, [code, language])

  return (
    <div className="w-full max-w-full relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-border-primary bg-zinc-50 dark:bg-zinc-950 my-6 font-mono text-[13px] shadow-sm dark:shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs select-none">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer text-[11px]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-zinc-800 dark:text-zinc-200 select-all whitespace-pre leading-relaxed font-mono">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
