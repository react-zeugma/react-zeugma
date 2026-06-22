import path from 'node:path'
import { readFileSync, existsSync, readdirSync } from 'node:fs'

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
    const localPath = path.resolve(process.cwd(), '../../packages/react-zeugma/CHANGELOG.md')
    if (existsSync(localPath)) {
      return readFileSync(localPath, 'utf-8')
    }
    throw new Error('Local CHANGELOG.md not found')
  } catch (err) {
    console.error('Error reading changelog:', err)
    return '# Changelog\n\nUnable to load changelog. Please try again later.'
  }
}

/**
 * Fetch a specific blog article from the root articles directory by slug.
 */
export async function fetchArticle(slug: string): Promise<string> {
  try {
    const localPath = path.resolve(process.cwd(), `../../articles/${slug}.md`)
    if (existsSync(localPath)) {
      return readFileSync(localPath, 'utf-8')
    }
    throw new Error(`Article ${slug}.md not found`)
  } catch (err) {
    console.error(`Error reading article ${slug}:`, err)
    return `# Article Not Found\n\nUnable to load the requested article "${slug}".`
  }
}

/**
 * Fetch list of all blog articles with basic metadata parsed from markdown.
 */
export async function fetchArticlesList(): Promise<
  { slug: string; title: string; description: string }[]
> {
  try {
    const articlesDir = path.resolve(process.cwd(), '../../articles')
    if (!existsSync(articlesDir)) {
      return []
    }
    const files = readdirSync(articlesDir).filter((f) => f.endsWith('.md'))
    return files.map((file) => {
      const slug = file.replace(/\.md$/, '')
      const content = readFileSync(path.join(articlesDir, file), 'utf-8')

      const lines = content.split('\n')
      let title = slug
      let description = ''

      const titleLine = lines.find((l) => l.startsWith('# '))
      if (titleLine) {
        title = titleLine.replace('# ', '').trim()
      }

      // Find first non-empty paragraph that is not a heading, list, code block, etc.
      for (const line of lines) {
        const trimmed = line.trim()
        if (
          trimmed &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('|') &&
          !trimmed.startsWith('[') &&
          !trimmed.startsWith('>') &&
          !trimmed.startsWith('`')
        ) {
          description = trimmed
          break
        }
      }

      return { slug, title, description }
    })
  } catch (err) {
    console.error('Error fetching articles list:', err)
    return []
  }
}
