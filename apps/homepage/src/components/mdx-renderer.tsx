'use client'

import React, { useState } from 'react'
import { Copy, Check, Info, Sparkles, AlertTriangle } from 'lucide-react'
import type { RootContent } from '../lib/parse-mdx'
import type {
  Heading,
  Text,
  Code,
  InlineCode,
  Paragraph,
  Strong,
  Emphasis,
  Link,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  Blockquote,
} from 'mdast'

// ─── Styled primitives ───────────────────────────────────────────────

function DocCodeBlock({ code, language = 'tsx' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-full relative group rounded-lg overflow-hidden border border-border-primary bg-bg-pane-inner my-4 font-mono text-[13px] transition-colors duration-200">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-primary bg-bg-sidebar text-text-secondary text-xs select-none transition-colors duration-200">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-text-primary transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-text-primary select-all whitespace-pre leading-relaxed">
        {code}
      </pre>
    </div>
  )
}

function Callout({
  type,
  title,
  children,
}: {
  type: 'note' | 'tip' | 'warning'
  title: string
  children: React.ReactNode
}) {
  const styles = {
    note: 'bg-indigo-500/5 border-indigo-500/20 text-text-secondary',
    tip: 'bg-emerald-500/5 border-emerald-500/20 text-text-secondary',
    warning: 'bg-rose-500/5 border-rose-500/20 text-text-secondary',
  }

  const icons = {
    note: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
    tip: <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
  }

  return (
    <div
      className={`flex gap-3 border rounded-xl p-4 my-6 text-sm leading-relaxed transition-colors duration-200 ${styles[type]}`}
    >
      {icons[type]}
      <div>
        <h5 className="font-bold text-text-primary mb-1">{title}</h5>
        {children}
      </div>
    </div>
  )
}

// ─── AST helpers ─────────────────────────────────────────────────────

/** Extract plain text from an AST node */
function nodeText(node: RootContent): string {
  if ('value' in node) return (node as Text).value
  if ('children' in node) {
    return (node as { children: RootContent[] }).children.map(nodeText).join('')
  }
  return ''
}

/** Check if a blockquote is a GitHub-style callout (> [!TIP], > [!NOTE], > [!WARNING]) */
function parseCallout(
  node: Blockquote,
): { type: 'note' | 'tip' | 'warning'; title: string; bodyNodes: RootContent[] } | null {
  const firstChild = node.children[0]
  if (!firstChild || firstChild.type !== 'paragraph') return null
  const text = nodeText(firstChild as unknown as RootContent)
  const match = text.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*\n?(.*)/)
  if (!match) return null

  const rawType = match[1].toLowerCase()
  const calloutType =
    rawType === 'important' || rawType === 'caution'
      ? 'warning'
      : (rawType as 'note' | 'tip' | 'warning')

  const firstPara = firstChild as Paragraph
  let titleText = match[2].replace(/^[\s—–-]+/, '').trim()

  const boldChild = firstPara.children.find((c) => c.type === 'strong')
  if (boldChild) {
    titleText = nodeText(boldChild as unknown as RootContent)
  }

  const bodyNodes: RootContent[] = []
  const firstParaChildren = [...firstPara.children]

  const markerIdx = firstParaChildren.findIndex(
    (c) =>
      c.type === 'text' && (c as Text).value.match(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/),
  )
  if (markerIdx !== -1) {
    const markerNode = firstParaChildren[markerIdx] as Text
    const afterMarker = markerNode.value
      .replace(/\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*\n?/, '')
      .replace(/^[\s—–-]+/, '')
    if (afterMarker.trim()) {
      firstParaChildren[markerIdx] = { ...markerNode, value: afterMarker }
    } else {
      firstParaChildren.splice(markerIdx, 1)
    }
  }

  const boldIdx = firstParaChildren.findIndex((c) => c.type === 'strong')
  if (boldIdx !== -1) {
    firstParaChildren.splice(boldIdx, 1)
    if (firstParaChildren[boldIdx] && firstParaChildren[boldIdx].type === 'text') {
      const t = firstParaChildren[boldIdx] as Text
      const trimmed = t.value.replace(/^[\s—–-]+/, '')
      if (trimmed) {
        firstParaChildren[boldIdx] = { ...t, value: trimmed }
      } else {
        firstParaChildren.splice(boldIdx, 1)
      }
    }
  }

  if (firstParaChildren.length > 0) {
    bodyNodes.push({ type: 'paragraph', children: firstParaChildren } as Paragraph)
  }

  for (let i = 1; i < node.children.length; i++) {
    bodyNodes.push(node.children[i] as unknown as RootContent)
  }

  return {
    type: calloutType,
    title: titleText || calloutType.charAt(0).toUpperCase() + calloutType.slice(1),
    bodyNodes,
  }
}

// ─── Inline renderer ─────────────────────────────────────────────────

function renderInline(nodes: RootContent[], keyPrefix = ''): React.ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}${i}`
    switch (node.type) {
      case 'text':
        return <React.Fragment key={key}>{(node as Text).value}</React.Fragment>
      case 'strong':
        return (
          <strong key={key} className="font-bold text-text-primary">
            {renderInline((node as Strong).children as RootContent[], `${key}-`)}
          </strong>
        )
      case 'emphasis':
        return (
          <em key={key}>{renderInline((node as Emphasis).children as RootContent[], `${key}-`)}</em>
        )
      case 'inlineCode':
        return (
          <code
            key={key}
            className="bg-bg-pane-inner border border-border-primary rounded px-1.5 py-0.5 text-xs font-mono"
          >
            {(node as InlineCode).value}
          </code>
        )
      case 'link': {
        const link = node as Link
        return (
          <a
            key={key}
            href={link.url}
            target={link.url.startsWith('http') ? '_blank' : undefined}
            rel={link.url.startsWith('http') ? 'noreferrer' : undefined}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {renderInline(link.children as RootContent[], `${key}-`)}
          </a>
        )
      }
      case 'delete':
        return (
          <del key={key}>
            {renderInline((node as { children: RootContent[] }).children, `${key}-`)}
          </del>
        )
      case 'image': {
        const img = node as unknown as { url: string; alt?: string; title?: string }
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={img.url}
            alt={img.alt || ''}
            title={img.title || undefined}
            className="inline-block mr-1.5 align-middle"
          />
        )
      }
      case 'html':
        return null
      default:
        if ('value' in node)
          return <React.Fragment key={key}>{(node as { value: string }).value}</React.Fragment>
        return null
    }
  })
}

// ─── Block renderer ──────────────────────────────────────────────────

function renderBlock(
  node: RootContent,
  index: number,
  scrollToSection: (id: string) => void,
  sectionId: string,
): React.ReactNode {
  const key = `${sectionId}-${index}`

  switch (node.type) {
    case 'heading': {
      const heading = node as Heading
      const text = nodeText(heading as unknown as RootContent)
      const isZeugmaSection = sectionId === 'zeugma-mosaics'

      const slug = text
        .toLowerCase()
        .replace(/[<>`]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const headingId = slug || sectionId

      if (heading.depth === 1) {
        return (
          <h1
            key={key}
            id={headingId}
            className="group flex items-center gap-2 text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-2"
          >
            <span>{renderInline(heading.children as RootContent[], `${key}-`)}</span>
            <a
              href={`#${headingId}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(headingId)
              }}
              className="text-text-muted hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
            >
              #
            </a>
          </h1>
        )
      }
      if (heading.depth === 2) {
        return (
          <h2
            key={key}
            id={headingId}
            className={`group flex items-center gap-2 text-2xl font-bold text-text-primary pb-2 transition-colors duration-200 ${
              isZeugmaSection
                ? 'border-b border-[#D8BA8E] font-serif'
                : 'border-b border-border-primary'
            }`}
          >
            <span>{renderInline(heading.children as RootContent[], `${key}-`)}</span>
            <a
              href={`#${headingId}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(headingId)
              }}
              className={`opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none ${
                isZeugmaSection
                  ? 'text-[#D8BA8E]/50 hover:text-[#D8BA8E]'
                  : 'text-text-muted hover:text-indigo-500'
              }`}
            >
              #
            </a>
          </h2>
        )
      }
      if (heading.depth === 3) {
        return (
          <h3 key={key} id={headingId} className="text-lg font-bold text-text-primary mt-6 mb-2">
            {renderInline(heading.children as RootContent[], `${key}-`)}
          </h3>
        )
      }
      if (heading.depth === 4) {
        const textContent = text.trim()
        if (textContent.includes('(') || textContent.includes(':')) {
          return (
            <h4
              key={key}
              id={headingId}
              className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold"
            >
              {text}
            </h4>
          )
        }
        return (
          <h4
            key={key}
            id={headingId}
            className="text-xs uppercase font-bold tracking-wider text-text-secondary pt-2"
          >
            {renderInline(heading.children as RootContent[], `${key}-`)}
          </h4>
        )
      }
      return (
        <h5 key={key} id={headingId} className="text-sm font-semibold text-text-primary">
          {renderInline(heading.children as RootContent[], `${key}-`)}
        </h5>
      )
    }

    case 'paragraph': {
      const para = node as Paragraph
      return (
        <p key={key} className="text-text-secondary text-sm leading-relaxed">
          {renderInline(para.children as RootContent[], `${key}-`)}
        </p>
      )
    }

    case 'code': {
      const code = node as Code
      return <DocCodeBlock key={key} code={code.value} language={code.lang ?? 'tsx'} />
    }

    case 'list': {
      const list = node as List
      const Tag = list.ordered ? 'ol' : 'ul'
      return (
        <Tag
          key={key}
          className={`${list.ordered ? 'list-decimal' : 'list-disc'} list-inside text-text-secondary space-y-1.5 text-sm leading-relaxed`}
        >
          {list.children.map((item: ListItem, li: number) => (
            <li key={`${key}-li-${li}`}>
              {item.children.map((child, ci) => {
                if (child.type === 'paragraph') {
                  return (
                    <React.Fragment key={`${key}-li-${li}-${ci}`}>
                      {renderInline(
                        (child as Paragraph).children as RootContent[],
                        `${key}-li-${li}-${ci}-`,
                      )}
                    </React.Fragment>
                  )
                }
                return renderBlock(child as unknown as RootContent, ci, scrollToSection, sectionId)
              })}
            </li>
          ))}
        </Tag>
      )
    }

    case 'table': {
      const table = node as Table
      const [headerRow, ...bodyRows] = table.children
      return (
        <div
          key={key}
          className="w-full max-w-full overflow-x-auto border border-border-primary rounded-lg transition-colors duration-200"
        >
          <table className="min-w-full text-left text-xs border-collapse">
            {headerRow && (
              <thead>
                <tr className="border-b border-border-primary bg-bg-sidebar text-text-secondary uppercase tracking-wider transition-colors duration-200">
                  {(headerRow as TableRow).children.map((cell: TableCell, ci: number) => (
                    <th key={`${key}-th-${ci}`} className="px-4 py-2 font-semibold">
                      {renderInline(cell.children as RootContent[], `${key}-th-${ci}-`)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-border-primary/60 text-text-primary">
              {bodyRows.map((row: TableRow, ri: number) => (
                <tr
                  key={`${key}-tr-${ri}`}
                  className="bg-bg-pane/30 transition-colors duration-200"
                >
                  {row.children.map((cell: TableCell, ci: number) => {
                    const cellText = nodeText(cell as unknown as RootContent)
                    const isFirstCol = ci === 0
                    const isRequired = cellText.trim() === 'Yes'
                    const isOptional = cellText.trim() === 'No'
                    let className = 'px-4 py-3'
                    if (isFirstCol) className += ' font-mono text-indigo-600 dark:text-indigo-400'
                    else if (ci === 1) className += ' font-mono'
                    if (isRequired)
                      className += ' font-medium text-emerald-600 dark:text-emerald-400'
                    else if (isOptional) className += ' text-text-secondary'
                    return (
                      <td key={`${key}-td-${ri}-${ci}`} className={className}>
                        {renderInline(cell.children as RootContent[], `${key}-td-${ri}-${ci}-`)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'blockquote': {
      const bq = node as Blockquote
      const callout = parseCallout(bq)
      if (callout) {
        return (
          <Callout key={key} type={callout.type} title={callout.title}>
            {callout.bodyNodes.map((child, ci) =>
              renderBlock(child, ci, scrollToSection, sectionId),
            )}
          </Callout>
        )
      }
      if (sectionId === 'zeugma-mosaics') {
        return (
          <div
            key={key}
            className="bg-[#D8BA8E]/5 border border-[#D8BA8E]/20 rounded-xl p-5 select-none font-serif italic text-[#c29b47] dark:text-[#D8BA8E]/90 text-sm leading-relaxed transition-colors duration-200"
          >
            {bq.children.map((child, ci) => {
              if (child.type === 'paragraph') {
                return (
                  <React.Fragment key={`${key}-bq-${ci}`}>
                    {renderInline(
                      (child as Paragraph).children as RootContent[],
                      `${key}-bq-${ci}-`,
                    )}
                  </React.Fragment>
                )
              }
              return renderBlock(child as unknown as RootContent, ci, scrollToSection, sectionId)
            })}
          </div>
        )
      }
      return (
        <blockquote
          key={key}
          className="border-l-4 border-border-primary pl-4 my-4 text-text-secondary italic text-sm leading-relaxed"
        >
          {bq.children.map((child, ci) =>
            renderBlock(child as unknown as RootContent, ci, scrollToSection, sectionId),
          )}
        </blockquote>
      )
    }

    case 'thematicBreak':
      return null

    case 'html':
      return null

    default:
      return null
  }
}

// ─── Public component ────────────────────────────────────────────────

interface MdxRendererProps {
  /** AST children to render */
  children: RootContent[]
  /** The section ID this content belongs to (for anchor links and special styling) */
  sectionId: string
  /** Callback to scroll/navigate to a section by ID */
  scrollToSection: (id: string) => void
}

/**
 * Renders a list of mdast AST nodes into styled React elements.
 * Handles headings, paragraphs, code blocks, tables, lists,
 * callouts (GitHub-style blockquotes), and the Zeugma story quote.
 */
export function MdxRenderer({ children, sectionId, scrollToSection }: MdxRendererProps) {
  return <>{children.map((node, i) => renderBlock(node, i, scrollToSection, sectionId))}</>
}
