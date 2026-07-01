import React from 'react'
import type { RootContent, Text, Strong, Emphasis, InlineCode, Link } from './types'

export function renderInline(nodes: RootContent[], keyPrefix = ''): React.ReactNode[] {
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
