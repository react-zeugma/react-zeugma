import { Metadata } from 'next'
import { demoMetadata } from '@/config/seo'
import { DemoClientPage } from './DemoClientPage'

export const metadata: Metadata = demoMetadata

export default function Page() {
  return <DemoClientPage />
}
