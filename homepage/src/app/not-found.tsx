import { Metadata } from 'next'
import { NotFoundClient } from '@/views/not-found'

export const metadata: Metadata = {
  title: 'Page Not Found - react-zeugma',
}

export default function NotFound() {
  return <NotFoundClient />
}
