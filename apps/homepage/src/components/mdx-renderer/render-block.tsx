import React from 'react'
import type {
  RootContent,
  Heading,
  Code,
  Paragraph,
  List,
  ListItem,
  Table,
  TableRow,
  TableCell,
  Blockquote,
} from './types'
import { nodeText, parseCallout } from './ast-utils'
import { renderInline } from './render-inline'
import { DocCodeBlock } from './doc-code-block'
import { Callout } from './callout'

export function renderBlock(
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
            className="group flex items-center gap-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-3"
          >
            <span>{renderInline(heading.children as RootContent[], `${key}-`)}</span>
            <a
              href={`#${headingId}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(headingId)
              }}
              className="text-text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none"
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
            className={`group flex items-center gap-2 text-2xl font-bold text-text-primary pb-2.5 transition-colors ${
              isZeugmaSection
                ? 'border-b border-accent font-display italic text-accent text-3xl'
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
              className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xl select-none text-text-muted hover:text-accent"
            >
              #
            </a>
          </h2>
        )
      }
      if (heading.depth === 3) {
        return (
          <h3
            key={key}
            id={headingId}
            className="text-lg font-bold text-text-primary mt-6 mb-2 tracking-tight"
          >
            {renderInline(heading.children as RootContent[], `${key}-`)}
          </h3>
        )
      }
      if (heading.depth === 4) {
        const textContent = text.trim()
        if (textContent.includes('(') || textContent.includes(':')) {
          return (
            <h4 key={key} id={headingId} className="font-mono text-sm text-accent font-bold">
              {text}
            </h4>
          )
        }
        return (
          <h4 key={key} id={headingId} className="eyebrow pt-3 text-text-secondary">
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
          className={`${list.ordered ? 'list-decimal' : 'list-disc'} list-outside pl-5 text-text-secondary space-y-2 text-sm leading-relaxed marker:text-text-muted`}
        >
          {list.children.map((item: ListItem, li: number) => (
            <li key={`${key}-li-${li}`} className="pl-1">
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
          className="w-full max-w-full overflow-x-auto border border-border-primary rounded-xl overflow-hidden my-4 shadow-2xs"
        >
          <table className="min-w-full text-left text-xs border-collapse">
            {headerRow && (
              <thead>
                <tr className="border-b border-border-primary bg-bg-sidebar/80 eyebrow">
                  {(headerRow as TableRow).children.map((cell: TableCell, ci: number) => (
                    <th key={`${key}-th-${ci}`} className="px-4 py-2.5 font-semibold">
                      {renderInline(cell.children as RootContent[], `${key}-th-${ci}-`)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-border-primary/60 text-text-primary bg-bg-pane/40">
              {bodyRows.map((row: TableRow, ri: number) => (
                <tr key={`${key}-tr-${ri}`} className="hover:bg-bg-sidebar/30 transition-colors">
                  {row.children.map((cell: TableCell, ci: number) => {
                    const cellText = nodeText(cell as unknown as RootContent)
                    const isFirstCol = ci === 0
                    const isRequired = cellText.trim() === 'Yes'
                    const isOptional = cellText.trim() === 'No'
                    let className = 'px-4 py-3'
                    if (isFirstCol) className += ' font-mono text-accent'
                    else if (ci === 1) className += ' font-mono'
                    if (isRequired) className += ' font-semibold text-emerald-500'
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
            className="bg-accent/8 border border-accent/25 rounded-2xl p-6 my-6 select-none font-display italic text-accent text-base leading-relaxed"
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
          className="border-l-2 border-accent pl-4 my-4 text-text-secondary italic text-sm leading-relaxed"
        >
          {bq.children.map((child, ci) =>
            renderBlock(child as unknown as RootContent, ci, scrollToSection, sectionId),
          )}
        </blockquote>
      )
    }

    case 'thematicBreak':
      return <hr key={key} className="border-border-primary/80 my-8" />

    case 'html':
      return null

    default:
      return null
  }
}
