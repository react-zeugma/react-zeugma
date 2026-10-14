import { ReactNode } from 'react'

export interface DocListProps {
  items: ReactNode[]
  ordered?: boolean
  className?: string
}

export function DocList({ items, ordered = false, className = '' }: DocListProps) {
  const Tag = ordered ? 'ol' : 'ul'
  const listClass = ordered
    ? 'list-decimal list-outside pl-5 text-text-secondary space-y-2.5 text-sm leading-relaxed marker:text-text-muted marker:font-mono marker:text-xs'
    : 'list-disc list-outside pl-5 text-text-secondary space-y-2.5 text-sm leading-relaxed marker:text-accent'

  return (
    <Tag className={`${listClass} ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="pl-1.5">
          {item}
        </li>
      ))}
    </Tag>
  )
}
