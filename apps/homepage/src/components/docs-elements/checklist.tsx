import { ReactNode } from 'react'
import { Check } from 'lucide-react'

export interface ChecklistItem {
  title: string
  desc: string | ReactNode
}

export interface ChecklistProps {
  items: ChecklistItem[]
  columns?: 1 | 2
  className?: string
}

export function Checklist({ items, columns = 2, className = '' }: ChecklistProps) {
  const colClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'

  return (
    <ul className={`grid ${colClass} gap-3.5 text-xs text-text-secondary ${className}`}>
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 p-3.5 rounded-xl bg-bg-pane border border-border-primary/70 hover:border-border-secondary transition-all shadow-2xs"
        >
          <div className="w-5 h-5 rounded-md bg-accent/10 border border-accent/25 flex items-center justify-center shrink-0 mt-0.5 text-accent">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="space-y-1 min-w-0">
            <strong className="text-text-primary font-semibold block text-xs">{item.title}</strong>
            <span className="text-text-secondary leading-relaxed block">{item.desc}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
