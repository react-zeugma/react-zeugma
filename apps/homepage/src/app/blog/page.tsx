import { Metadata } from 'next'
import { fetchArticlesList } from '@/lib/fetch-docs'
import { BlogIndex } from '@/views/blog-index'

export const metadata: Metadata = {
  title: 'Blog — react-zeugma',
  description:
    'Technical articles, layouts, and engineering updates from the creators of react-zeugma.',
}

export default async function Page() {
  const articles = await fetchArticlesList()
  return <BlogIndex articles={articles} />
}
