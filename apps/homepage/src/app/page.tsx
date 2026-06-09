import { Suspense } from 'react'
import { Metadata } from 'next'
import { Home as HomePage } from '@/views/home'
import { homeMetadata, homeJsonLd } from '@/config/seo'

export const metadata: Metadata = homeMetadata

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Suspense>
        <HomePage />
      </Suspense>
    </>
  )
}
