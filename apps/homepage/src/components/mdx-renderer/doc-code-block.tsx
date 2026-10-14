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
    <div className="w-full max-w-full relative group rounded-xl overflow-hidden border border-border-primary bg-bg-pane-inner my-6 font-mono text-xs shadow-2xs transition-colors">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary bg-bg-sidebar/60 text-text-muted text-xs select-none">
        <span className="eyebrow">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-xs font-mono"
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
      <pre className="p-4 overflow-x-hidden text-text-primary select-all whitespace-pre-wrap break-words leading-relaxed font-mono">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
