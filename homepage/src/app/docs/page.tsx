import dynamic from 'next/dynamic'
import { Metadata } from 'next'

const DocsPage = dynamic(() => import('@/views/docs').then((mod) => ({ default: mod.Docs })))

import { docsMetadata } from '@/config/seo'

export const metadata: Metadata = docsMetadata

export default function Page() {
  return <DocsPage />
}
