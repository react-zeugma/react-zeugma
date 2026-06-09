import { Metadata } from 'next'
import { fetchDocs } from '@/lib/fetch-docs'
import { parseDocs } from '@/lib/parse-mdx'
import { Docs } from '@/views/docs'
import { docsMetadata } from '@/config/seo'

export const metadata: Metadata = docsMetadata

export default async function Page() {
  const markdown = await fetchDocs()
  const { sections, skillMdContent } = parseDocs(markdown)

  return <Docs sections={sections} skillMdContent={skillMdContent} />
}
