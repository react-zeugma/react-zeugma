import { Metadata } from 'next'
import { fetchChangelog } from '@/lib/fetch-docs'
import { parseMarkdown } from '@/lib/parse-mdx'
import { Changelog } from '@/views/changelog'
import { changelogMetadata, changelogJsonLd } from '@/config/seo'

export const metadata: Metadata = changelogMetadata

export default async function Page() {
  const markdown = await fetchChangelog()
  const ast = parseMarkdown(markdown)

  // Skip the top H1 (# react-zeugma) if it exists, since we have our own page header
  const contentNodes =
    ast.children[0]?.type === 'heading' && (ast.children[0] as any).depth === 1
      ? ast.children.slice(1)
      : ast.children

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(changelogJsonLd) }}
      />
      <Changelog contentNodes={contentNodes} />
    </>
  )
}
