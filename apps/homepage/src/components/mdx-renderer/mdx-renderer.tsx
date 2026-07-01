import type { RootContent } from './types'
import { renderBlock } from './render-block'

export interface MdxRendererProps {
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
