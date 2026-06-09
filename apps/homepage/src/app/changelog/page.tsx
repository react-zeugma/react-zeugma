import { Metadata } from 'next'
import { fetchChangelog } from '@/lib/fetch-docs'
import { parseMarkdown } from '@/lib/parse-mdx'
import { Changelog } from '@/views/changelog'

export const metadata: Metadata = {
  title: 'Changelog — react-zeugma',
  description: 'See the latest release notes, improvements, and updates for react-zeugma.',
}

export default async function Page() {
  const markdown = await fetchChangelog()
  const ast = parseMarkdown(markdown)

  // Skip the top H1 (# react-zeugma) if it exists, since we have our own page header
  const contentNodes =
    ast.children[0]?.type === 'heading' && (ast.children[0] as any).depth === 1
      ? ast.children.slice(1)
      : ast.children

  return <Changelog contentNodes={contentNodes} />
}
