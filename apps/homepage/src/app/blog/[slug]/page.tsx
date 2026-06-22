import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchArticle, fetchArticlesList } from '@/lib/fetch-docs'
import { parseMarkdown } from '@/lib/parse-mdx'
import { BlogPost } from '@/views/blog-post'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const articles = await fetchArticlesList()
  const article = articles.find((a) => a.slug === slug)

  if (!article) {
    return {
      title: 'Article Not Found — react-zeugma',
    }
  }

  return {
    title: `${article.title} — react-zeugma`,
    description: article.description,
  }
}

export async function generateStaticParams() {
  const articles = await fetchArticlesList()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const markdown = await fetchArticle(slug)

  if (markdown.startsWith('# Article Not Found')) {
    notFound()
  }

  const ast = parseMarkdown(markdown)

  // Extract the H1 title and content
  let title = slug
  const titleNode = ast.children.find((node) => node.type === 'heading' && node.depth === 1)
  if (titleNode) {
    title = (titleNode as any).children.map((c: any) => c.value || '').join('')
  }

  // Skip the top H1 (# Title) if it exists, since we render it in our page header
  const contentNodes =
    ast.children[0]?.type === 'heading' && (ast.children[0] as any).depth === 1
      ? ast.children.slice(1)
      : ast.children

  return <BlogPost title={title} contentNodes={contentNodes} />
}
