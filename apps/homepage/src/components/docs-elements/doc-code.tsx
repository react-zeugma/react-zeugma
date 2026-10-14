import { ReactNode } from 'react'

export interface DocCodeProps {
  children: ReactNode
  highlight?: boolean
  className?: string
}

export function DocCode({ children, highlight = false, className = '' }: DocCodeProps) {
  return (
    <code
      className={`px-1.5 py-0.5 bg-bg-pane-inner border border-border-primary/80 rounded-md font-mono text-[12px] transition-colors ${
        highlight ? 'text-accent font-semibold bg-accent/10 border-accent/30' : 'text-text-primary'
      } ${className}`}
    >
      {children}
    </code>
  )
}
