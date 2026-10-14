import { ReactNode } from 'react'

export interface DocParagraphProps {
  children: ReactNode
  size?: 'sm' | 'base' | 'lg'
  lead?: boolean
  className?: string
}

export function DocParagraph({
  children,
  size = 'sm',
  lead = false,
  className = '',
}: DocParagraphProps) {
  const sizeClasses = lead
    ? 'text-base sm:text-lg text-text-secondary leading-relaxed font-normal'
    : size === 'lg'
      ? 'text-base text-text-secondary leading-relaxed'
      : size === 'base'
        ? 'text-sm sm:text-base text-text-secondary leading-relaxed'
        : 'text-sm text-text-secondary leading-relaxed'

  return <p className={`${sizeClasses} ${className}`}>{children}</p>
}
