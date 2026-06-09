import { fetchDocs } from '@/lib/fetch-docs'

export const revalidate = 3600 // Cache for 1 hour, matching fetchDocs ISR revalidation

export async function GET() {
  const markdown = await fetchDocs()
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
