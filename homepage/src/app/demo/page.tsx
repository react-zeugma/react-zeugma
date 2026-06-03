import dynamic from 'next/dynamic'
import { Metadata } from 'next'

const DemoPage = dynamic(() => import('@/views/demo').then((mod) => ({ default: mod.Demo })))

import { demoMetadata } from '@/config/seo'

export const metadata: Metadata = demoMetadata

export default function Page() {
  return <DemoPage />
}
