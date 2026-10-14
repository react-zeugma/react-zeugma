import { Info, Lightbulb, AlertTriangle } from 'lucide-react'
import type { CalloutType } from './types'

const styles: Record<CalloutType, string> = {
  note: 'bg-accent/6 border-accent/20 text-text-secondary',
  tip: 'bg-emerald-500/6 border-emerald-500/20 text-text-secondary',
  warning: 'bg-rose-500/6 border-rose-500/20 text-text-secondary',
}

const icons: Record<CalloutType, React.ReactNode> = {
  note: <Info className="w-4 h-4 text-accent shrink-0" />,
  tip: <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
}

export function Callout({
  type,
  title,
  children,
}: {
  type: CalloutType
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex gap-3 border rounded-xl p-4 my-6 text-xs sm:text-sm leading-relaxed transition-colors ${styles[type]}`}
    >
      {icons[type]}
      <div className="space-y-1">
        <h5 className="font-bold text-text-primary tracking-tight">{title}</h5>
        <div>{children}</div>
      </div>
    </div>
  )
}
