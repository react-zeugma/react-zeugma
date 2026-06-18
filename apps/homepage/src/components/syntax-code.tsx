import { useMemo } from 'react'

export type TokenType =
  | 'kw'
  | 'fn'
  | 'str'
  | 'num'
  | 'cmt'
  | 'cls'
  | 'op'
  | 'prop'
  | 'tag'
  | 'attr'
  | 'punc'
  | 'bool'
  | 'plain'

export type Token = [TokenType, string] | string

export function tokenizeJS(code: string): Token[] {
  const regex =
    /(\/\/.*|\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*'|`[^`]*`)|((?<!\.)\b(?:import|export|default|function|const|let|var|return|if|else|for|while|switch|case|break|continue|class|interface|type|from|as|new|typeof|instanceof|extends|implements|try|catch|finally|throw|async|await|yield)\b(?!\s*:))|(\b(?:true|false|null|undefined)\b)|(\b\d+(?:\.\d*)?\b)|(\b[A-Z]\w*\b)|(\b[a-zA-Z_]\w*(?=\())|([{}()\[\].,:;?+\-*\/%&|^=<>!~])|([a-zA-Z_]\w*)|(\s+)/g
  const tokens: Token[] = []
  let match
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) tokens.push(['cmt', match[1]])
    else if (match[2]) tokens.push(['str', match[2]])
    else if (match[3]) tokens.push(['kw', match[3]])
    else if (match[4]) tokens.push(['bool', match[4]])
    else if (match[5]) tokens.push(['num', match[5]])
    else if (match[6]) tokens.push(['cls', match[6]])
    else if (match[7]) tokens.push(['fn', match[7]])
    else if (match[8]) tokens.push(['punc', match[8]])
    else if (match[9]) tokens.push(match[9])
    else if (match[10]) tokens.push(match[10])
  }
  return tokens
}

export function tokenizeCSS(code: string): Token[] {
  const regex =
    /(\/\*[\s\S]*?\*\/)|(\.[a-zA-Z0-9_\-:]+)|([a-zA-Z\-]+(?=\s*:))|(:)|(\d+(?:px|em|rem|%|vh|vw|ms|s|deg)?)|(#[a-fA-F0-9]{3,8})|([{}()\[\].,;?+\-*\/%&|^=<>!~])|([a-zA-Z_]\w*)|(\s+)/g
  const tokens: Token[] = []
  let match
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) tokens.push(['cmt', match[1]])
    else if (match[2]) tokens.push(['fn', match[2]])
    else if (match[3]) tokens.push(['prop', match[3]])
    else if (match[4]) tokens.push(['op', match[4]])
    else if (match[5]) tokens.push(['num', match[5]])
    else if (match[6]) tokens.push(['str', match[6]])
    else if (match[7]) tokens.push(['punc', match[7]])
    else if (match[8]) tokens.push(match[8])
    else if (match[9]) tokens.push(match[9])
  }
  return tokens
}

export function tokenizeHTML(code: string): Token[] {
  const regex =
    /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z0-9\-]+)|([a-zA-Z0-9\-]+(?=\s*=))|(=)|("[^"]*"|'[^']*')|([{}()\[\].,;:?+\-*\/%&|^<>!~])|([a-zA-Z0-9_]+)|(\s+)/g
  const tokens: Token[] = []
  let match
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) tokens.push(['cmt', match[1]])
    else if (match[2]) tokens.push(['tag', match[2]])
    else if (match[3]) tokens.push(['attr', match[3]])
    else if (match[4]) tokens.push(['op', match[4]])
    else if (match[5]) tokens.push(['str', match[5]])
    else if (match[6]) tokens.push(['punc', match[6]])
    else if (match[7]) tokens.push(match[7])
    else if (match[8]) tokens.push(match[8])
  }
  return tokens
}

export function tokensToHTML(tokens: Token[]): string {
  const COLOR: Record<TokenType, string> = {
    kw: '#c678dd',
    fn: '#61afef',
    str: '#98c379',
    num: '#d19a66',
    cmt: '#5c6370',
    cls: '#e5c07b',
    op: '#56b6c2',
    prop: '#e06c75',
    tag: '#e06c75',
    attr: '#d19a66',
    punc: '#abb2bf',
    bool: '#56b6c2',
    plain: '#abb2bf',
  }
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return tokens
    .map((t) => {
      if (typeof t === 'string') return esc(t)
      const [cls, text] = t
      const style = cls === 'cmt' ? `color:${COLOR[cls]};font-style:italic` : `color:${COLOR[cls]}`
      return `<span style="${style}">${esc(text)}</span>`
    })
    .join('')
}

export function SyntaxCode({ tokens }: { tokens: Token[]; language: string }) {
  const html = useMemo(() => tokensToHTML(tokens), [tokens])
  const lines = useMemo(() => {
    const raw = tokens.map((t) => (typeof t === 'string' ? t : t[1])).join('')
    return raw.split('\n').length
  }, [tokens])

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto select-text">
      <div className="flex font-mono text-[12px] leading-[22px] text-[#abb2bf] min-h-full w-fit min-w-full">
        {/* Gutter */}
        <div className="sticky left-0 z-10 py-4 pr-3 pl-4 bg-[#1e1e1e] border-r border-[#2d2d30] text-right text-[#4e5066] select-none min-w-[44px] shrink-0">
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        {/* Code */}
        <div
          className="p-4 flex-1 whitespace-pre selection:bg-indigo-500/30"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

export function JSONFormatter({ json }: { json: any }) {
  const formatted = useMemo(() => {
    if (!json) return ''
    const str = JSON.stringify(json, null, 2)
    return str.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let style = 'color:#d19a66'
        if (/^"/.test(match)) {
          style = /:$/.test(match) ? 'color:#c678dd;font-weight:600' : 'color:#98c379'
        } else if (/true|false/.test(match)) {
          style = 'color:#56b6c2'
        } else if (/null/.test(match)) {
          style = 'color:#5c6370'
        }
        return `<span style="${style}">${match}</span>`
      },
    )
  }, [json])

  return (
    <pre
      className="m-0 text-[11px] leading-relaxed text-[#abb2bf] font-mono whitespace-pre overflow-x-auto p-4 select-text"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  )
}
