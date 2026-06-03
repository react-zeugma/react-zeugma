import type { NextConfig } from 'next'
import path from 'node:path'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'))

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['react-zeugma'],
  turbopack: {
    root: path.resolve(__dirname, '..'),
    resolveAlias: {
      'react-zeugma': '../dist/index.js',
    },
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
}

export default nextConfig
