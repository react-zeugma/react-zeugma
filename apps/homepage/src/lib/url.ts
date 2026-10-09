export function isSafeUrl(url: string): boolean {
  if (!url) return false
  const trimmed = url.trim()
  if (trimmed.startsWith('//') || /[\x00-\x1f\x7f]/.test(trimmed)) {
    return false
  }
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return true
  }
  try {
    const parsed = new URL(trimmed, 'https://react-zeugma.com')
    return (
      parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:'
    )
  } catch {
    return false
  }
}
