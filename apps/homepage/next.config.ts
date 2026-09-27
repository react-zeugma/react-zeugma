import type { NextConfig } from 'next'
import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

let appVersion = '0.0.0'
const reactZeugmaPkgPath = path.resolve(__dirname, '../../packages/react-zeugma/package.json')
if (existsSync(reactZeugmaPkgPath)) {
  try {
    const pkg = JSON.parse(readFileSync(reactZeugmaPkgPath, 'utf-8'))
    appVersion = pkg.version
  } catch {
    // ignore
  }
} else {
  const localPkgPath = path.resolve(__dirname, './package.json')
  if (existsSync(localPkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(localPkgPath, 'utf-8'))
      appVersion = pkg.version
    } catch {
      // ignore
    }
  }
}

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://unpkg.com;
  font-src 'self' data:;
  connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://va.vercel-scripts.com https://vitals.vercel-insights.com;
  frame-ancestors 'self';
  form-action 'self';
  base-uri 'self';
`
  .replace(/\s{2,}/g, ' ')
  .trim()

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['react-zeugma'],
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
