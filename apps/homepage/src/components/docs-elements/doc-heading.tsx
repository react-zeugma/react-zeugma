import { ReactNode } from 'react'

export interface DocHeadingProps {
  children: ReactNode
  level?: 2 | 3 | 4
  className?: string
  id?: string
}

export function DocHeading({ children, level = 3, className = '', id }: DocHeadingProps) {
  if (level === 4) {
    return (
      <h4
        id={id}
        className={`text-xs font-bold font-mono uppercase tracking-wider text-text-muted mt-6 mb-2.5 flex items-center gap-2 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 inline-block" />
        {children}
      </h4>
    )
  }

  if (level === 2) {
    return (
      <h2
        id={id}
        className={`text-xl sm:text-2xl font-extrabold text-text-primary mt-10 mb-4 tracking-tight pb-2 border-b border-border-primary/60 ${className}`}
      >
        {children}
      </h2>
    )
  }

  return (
    <h3
      id={id}
      className={`text-base sm:text-lg font-bold text-text-primary mt-8 mb-3 tracking-tight flex items-center gap-2 ${className}`}
    >
      {children}
    </h3>
  )
}
