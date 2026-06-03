import type { NextConfig } from 'next'
import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

let appVersion = '0.0.0'
const reactZeugmaPkgPath = path.resolve(__dirname, 'node_modules/react-zeugma/package.json')
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

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['react-zeugma'],
  turbopack: {
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
}

export default nextConfig
