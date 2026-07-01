import React from 'react'
import { DocSection } from '../../config/docs-data'

export interface SearchResult {
  sectionId: string
  sectionTitle: string
  subsectionId?: string
  subsectionTitle?: string
  category: 'overview' | 'core' | 'advanced' | 'api'
  type: 'section' | 'subsection' | 'content'
  matchedText?: string
  score: number
}

export function getTextFromReactNode(node: React.ReactNode): string {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(getTextFromReactNode).join(' ')
  }
  if (React.isValidElement(node)) {
    const props = node.props as any
    let text = ''
    if (props) {
      for (const key in props) {
        const val = props[key]
        if (typeof val === 'string') {
          text += ' ' + val
        } else if (Array.isArray(val)) {
          // Recurse into array props (e.g. DocTable rows/headers, DocList items)
          text += ' ' + getTextFromReactNode(val)
        } else if (React.isValidElement(val)) {
          text += ' ' + getTextFromReactNode(val)
        }
      }
    }
    return text
  }
  return ''
}

export function searchDocs(query: string, sections: DocSection[]): SearchResult[] {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  const results: SearchResult[] = []

  sections.forEach((section) => {
    const sectionTitle = section.title
    const sectionId = section.id
    const category = section.category

    // 1. Check section title
    if (sectionTitle.toLowerCase().includes(cleanQuery)) {
      results.push({
        sectionId,
        sectionTitle,
        category,
        type: 'section',
        score: 10,
      })
    }

    // 2. Check section content
    if (section.content) {
      const contentText = getTextFromReactNode(section.content)
      if (contentText.toLowerCase().includes(cleanQuery)) {
        results.push({
          sectionId,
          sectionTitle,
          category,
          type: 'content',
          matchedText: getSnippet(contentText, cleanQuery),
          score: 2,
        })
      }
    }

    // 3. Check subsections
    if (section.subsections) {
      section.subsections.forEach((sub) => {
        const subTitle = sub.title
        const subId = sub.id

        // Check subsection title
        if (subTitle.toLowerCase().includes(cleanQuery)) {
          results.push({
            sectionId,
            sectionTitle,
            subsectionId: subId,
            subsectionTitle: subTitle,
            category,
            type: 'subsection',
            score: 8,
          })
        }

        // Check subsection content
        if (sub.content) {
          const subContentText = getTextFromReactNode(sub.content)
          if (subContentText.toLowerCase().includes(cleanQuery)) {
            results.push({
              sectionId,
              sectionTitle,
              subsectionId: subId,
              subsectionTitle: subTitle,
              category,
              type: 'content',
              matchedText: getSnippet(subContentText, cleanQuery),
              score: 1,
            })
          }
        }
      })
    }
  })

  // Sort by score (descending)
  return results.sort((a, b) => b.score - a.score)
}

function getSnippet(text: string, query: string): string {
  // Normalize whitespace
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const index = cleanText.toLowerCase().indexOf(query.toLowerCase())
  if (index === -1) return cleanText.slice(0, 100) + (cleanText.length > 100 ? '...' : '')

  const start = Math.max(0, index - 40)
  const end = Math.min(cleanText.length, index + query.length + 60)

  let snippet = cleanText.slice(start, end)
  if (start > 0) snippet = '...' + snippet
  if (end < cleanText.length) snippet = snippet + '...'

  return snippet
}
