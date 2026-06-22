import { Suspense } from 'react'
import { Metadata } from 'next'
import { Home as HomePage } from '@/views/home'
import { fetchArticlesList } from '@/lib/fetch-docs'
import { homeMetadata, homeJsonLd } from '@/config/seo'

export const metadata: Metadata = homeMetadata

export default async function Page() {
  const articles = await fetchArticlesList()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Suspense>
        <HomePage articles={articles} />
      </Suspense>
    </>
  )
}
