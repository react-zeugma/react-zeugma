import { Metadata } from 'next'
import { fetchDocs } from '@/lib/fetch-docs'
import { parseDocs } from '@/lib/parse-mdx'
import { Docs } from '@/views/docs'
import { docsMetadata, docsJsonLd } from '@/config/seo'

export const metadata: Metadata = docsMetadata

export default async function Page() {
  const markdown = await fetchDocs()
  const { skillMdContent } = parseDocs(markdown)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(docsJsonLd) }}
      />
      <Docs skillMdContent={skillMdContent} />
    </>
  )
}
