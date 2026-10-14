import { Suspense } from 'react'
import { Metadata } from 'next'
import { DemoView } from '@/views/demo'
import { demoMetadata, demoJsonLd } from '@/config/seo'

export const metadata: Metadata = demoMetadata

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(demoJsonLd) }}
      />
      <Suspense>
        <DemoView />
      </Suspense>
    </>
  )
}
