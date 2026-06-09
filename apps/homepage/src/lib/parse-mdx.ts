import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import type { Root, RootContent } from 'mdast'

// ─── Public types ────────────────────────────────────────────────────

export interface DocSection {
  id: string
  title: string
  /** AST children that belong to this section (everything between headings) */
  children: RootContent[]
}

export interface ParsedDocs {
  /** Ordered list of sections (split on `## ` h2 headings) */
  sections: DocSection[]
  /** The raw SKILL.md content extracted from the fenced code block, if present */
  skillMdContent: string | null
}

// Re-export mdast types the renderer will need
export type { Root, RootContent }

// ─── Helpers ─────────────────────────────────────────────────────────

/** Turn a heading text into a URL-safe slug, matching the homepage's existing IDs */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[<>`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Map certain heading texts to the IDs used on the current docs page */
const SLUG_OVERRIDES: Record<string, string> = {
  'react-zeugma': 'introduction',
  'types reference': 'typescript-types',
  'skill.md': 'skill-md',
  'the story of zeugma': 'zeugma-mosaics',
}

function headingToSlug(text: string): string {
  const lower = text.toLowerCase()
  return SLUG_OVERRIDES[lower] ?? slugify(text)
}

/** Extract plain text from an mdast node tree */
function extractText(node: RootContent): string {
  if ('value' in node) return (node as { value: string }).value
  if ('children' in node) {
    return (node as { children: RootContent[] }).children.map(extractText).join('')
  }
  return ''
}

// ─── Parser ──────────────────────────────────────────────────────────

export function parseDocs(markdown: string): ParsedDocs {
  // Strip the MDX meta comment if present (e.g. {/* @meta title="Introduction" */})
  const cleaned = markdown.replace(/^\s*\{\/\*.*?\*\/\}\s*/s, '')

  const tree = unified().use(remarkParse).use(remarkGfm).parse(cleaned) as Root

  const sections: DocSection[] = []
  let currentSection: DocSection | null = null
  let skillMdContent: string | null = null

  for (const node of tree.children) {
    // Detect h2 headings → start a new section
    if (node.type === 'heading' && node.depth === 2) {
      const title = node.children.map(extractText).join('')
      const id = headingToSlug(title)

      const existing = sections.find((s) => s.id === id)
      if (existing) {
        currentSection = existing
        currentSection.children.push(node)
      } else {
        currentSection = { id, title, children: [node] }
        sections.push(currentSection)
      }
      continue
    }

    // Extract SKILL.md code fence content (the ~~~markdown block)
    if (
      node.type === 'code' &&
      node.lang === 'markdown' &&
      node.value.includes('name: use-react-zeugma')
    ) {
      skillMdContent = node.value
    }

    // Append to current section (or create an implicit intro section)
    if (!currentSection) {
      currentSection = { id: 'introduction', title: 'Introduction', children: [] }
      sections.push(currentSection)
    }
    currentSection.children.push(node)
  }

  return { sections, skillMdContent }
}

export function parseMarkdown(markdown: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root
}
