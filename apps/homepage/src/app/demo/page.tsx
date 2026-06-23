import { Suspense } from 'react'
import { Metadata } from 'next'
import { DemoView } from '@/views/demo'
import { demoMetadata } from '@/config/seo'

export const metadata: Metadata = demoMetadata

export default function Page() {
  return (
    <Suspense>
      <DemoView />
    </Suspense>
  )
}
