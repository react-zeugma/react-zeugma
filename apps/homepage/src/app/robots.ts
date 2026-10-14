import { MetadataRoute } from 'next'
import { SEO_CONSTANTS } from '@/config/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONSTANTS.siteUrl
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
