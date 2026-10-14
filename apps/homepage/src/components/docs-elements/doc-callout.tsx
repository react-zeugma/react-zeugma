import React, { ReactNode } from 'react'
import { Info, Lightbulb, AlertTriangle, AlertOctagon, Flame } from 'lucide-react'
import type { CalloutVariant } from './types'

export interface DocCalloutProps {
  variant?: CalloutVariant
  title?: string
  children: ReactNode
  className?: string
}

const CALLOUT_CONFIG: Record<
  CalloutVariant,
  {
    icon: React.ComponentType<{ className?: string }>
    defaultTitle: string
    containerClass: string
    borderClass: string
    iconColor: string
    titleColor: string
    badgeBg: string
  }
> = {
  note: {
    icon: Info,
    defaultTitle: 'Note',
    containerClass:
      'bg-accent/5 border-l-4 border-l-accent border-y border-r border-border-primary/80',
    borderClass: 'border-accent/40',
    iconColor: 'text-accent',
    titleColor: 'text-accent',
    badgeBg: 'bg-accent/10',
  },
  tip: {
    icon: Lightbulb,
    defaultTitle: 'Tip',
    containerClass:
      'bg-emerald-500/5 border-l-4 border-l-emerald-500 border-y border-r border-border-primary/80',
    borderClass: 'border-emerald-500/40',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
  },
  important: {
    icon: Flame,
    defaultTitle: 'Important',
    containerClass:
      'bg-purple-500/5 border-l-4 border-l-purple-500 border-y border-r border-border-primary/80',
    borderClass: 'border-purple-500/40',
    iconColor: 'text-purple-500',
    titleColor: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-500/10',
  },
  warning: {
    icon: AlertTriangle,
    defaultTitle: 'Warning',
    containerClass:
      'bg-amber-500/5 border-l-4 border-l-amber-500 border-y border-r border-border-primary/80',
    borderClass: 'border-amber-500/40',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/10',
  },
  caution: {
    icon: AlertOctagon,
    defaultTitle: 'Caution',
    containerClass:
      'bg-rose-500/5 border-l-4 border-l-rose-500 border-y border-r border-border-primary/80',
    borderClass: 'border-rose-500/40',
    iconColor: 'text-rose-500',
    titleColor: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-500/10',
  },
}

export function DocCallout({ variant = 'note', title, children, className = '' }: DocCalloutProps) {
  const config = CALLOUT_CONFIG[variant]
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle

  return (
    <div
      role="region"
      aria-label={displayTitle}
      className={`rounded-r-xl rounded-l-xs p-4 sm:p-5 my-6 transition-colors shadow-2xs ${config.containerClass} ${className}`}
    >
      <div className="flex items-center gap-2 mb-2 select-none">
        <Icon className={`w-4 h-4 shrink-0 ${config.iconColor}`} />
        <span
          className={`text-xs font-bold uppercase tracking-wider font-mono ${config.titleColor}`}
        >
          {displayTitle}
        </span>
      </div>
      <div className="text-text-secondary text-xs sm:text-sm leading-relaxed pl-6 space-y-2">
        {children}
      </div>
    </div>
  )
}
