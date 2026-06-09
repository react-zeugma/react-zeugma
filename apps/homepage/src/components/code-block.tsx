'use client'

import { useState } from 'react'
import { Check, Copy, FileCode2 } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

const TOKEN_REGEX = [
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g },
  { type: 'string', pattern: /(['"`])(?:\\.|(?!\1)[^\\])*\1/g },
  {
    type: 'keyword',
    pattern: /\b(import|from|export|default|function|return|const|let|var|if|else|new)\b/g,
  },
  { type: 'builtin', pattern: /\b(useState|useEffect|useRef|useMemo|useCallback)\b/g },
  { type: 'component', pattern: /\b(DashboardProvider|PaneTree|Pane|DragHandle|TreeNode)\b/g },
  { type: 'number', pattern: /\b(\d+)\b/g },
  { type: 'tag', pattern: /(&lt;\/?)([a-zA-Z][\w-]*)/g },
]

function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function indexToLetters(num: number): string {
  let str = ''
  let n = num
  do {
    str = String.fromCharCode(97 + (n % 26)) + str
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return str
}

function lettersToIndex(str: string): number {
  let num = 0
  for (let i = 0; i < str.length; i++) {
    num = num * 26 + (str.charCodeAt(i) - 97 + 1)
  }
  return num - 1
}

function highlight(code: string): string {
  const escaped = escapeHtml(code)
  const placeholders: string[] = []

  const stash = (raw: string, cls: string) => {
    const token = `___TOKEN_${indexToLetters(placeholders.length)}___`
    placeholders.push(`<span class="${cls}">${raw}</span>`)
    return token
  }

  let working = escaped

  for (const { type, pattern } of TOKEN_REGEX) {
    working = working.replace(pattern, (match) => {
      if (type === 'tag') {
        return stash(match, 'text-[#e06c75]')
      }
      if (type === 'string' || type === 'comment') {
        return stash(match, type === 'comment' ? 'text-[#5c6370] italic' : 'text-[#98c379]')
      }
      if (type === 'keyword') {
        return stash(match, 'text-[#c678dd]')
      }
      if (type === 'builtin') {
        return stash(match, 'text-[#61afef]')
      }
      if (type === 'component') {
        return stash(match, 'text-[#e06c75]')
      }
      if (type === 'number') {
        return stash(match, 'text-[#d19a66]')
      }
      return match
    })
  }

  return working.replace(/___TOKEN_([a-z]+)___/g, (_, chars) => placeholders[lettersToIndex(chars)])
}

export function CodeBlock({ code, language = 'tsx', filename = 'App.tsx' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const html = highlight(code)

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden flex flex-col w-full text-left shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 bg-[#18181b] border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-zinc-500" />
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            {filename}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono ml-2">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition-colors bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto p-5">
        <pre
          className="m-0 text-[13px] leading-relaxed text-zinc-100 font-mono whitespace-pre"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
