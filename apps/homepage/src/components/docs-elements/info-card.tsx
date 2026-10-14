import { ReactNode } from 'react'

export interface InfoCardProps {
  title: string
  titleClassName?: string
  children: ReactNode
  icon?: ReactNode
  badge?: string
  className?: string
}

export function InfoCard({
  title,
  titleClassName = 'text-text-primary',
  children,
  icon,
  badge,
  className = '',
}: InfoCardProps) {
  return (
    <div
      className={`border border-border-primary rounded-xl p-5 bg-bg-pane/60 hover:bg-bg-pane hover:border-border-secondary transition-all text-sm space-y-2.5 shadow-2xs relative group ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-accent shrink-0">{icon}</div>}
          <h4 className={`font-bold tracking-tight text-sm ${titleClassName}`}>{title}</h4>
        </div>
        {badge && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
            {badge}
          </span>
        )}
      </div>
      <div className="text-text-secondary text-xs sm:text-sm leading-relaxed">{children}</div>
    </div>
  )
}
