import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

/**
 * Fetch the docs.mdx content from the local react-zeugma package.
 * Called at build time (or ISR revalidation) from a server component.
 */
export async function fetchDocs(): Promise<string> {
  try {
    const localPath = path.resolve(process.cwd(), '../../packages/react-zeugma/README.md')
    if (existsSync(localPath)) {
      return readFileSync(localPath, 'utf-8')
    }
    throw new Error('Local README.md not found')
  } catch (err) {
    console.error('Error reading documentation:', err)
    return '# Documentation\n\nUnable to load documentation. Please try again later.'
  }
}

/**
 * Fetch the CHANGELOG.md content from the local monorepo root.
 * Called at build time (or ISR revalidation) from a server component.
 */
export async function fetchChangelog(): Promise<string> {
  try {
    const localPath = path.resolve(process.cwd(), '../../CHANGELOG.md')
    if (existsSync(localPath)) {
      return readFileSync(localPath, 'utf-8')
    }
    throw new Error('Local CHANGELOG.md not found')
  } catch (err) {
    console.error('Error reading changelog:', err)
    return '# Changelog\n\nUnable to load changelog. Please try again later.'
  }
}
