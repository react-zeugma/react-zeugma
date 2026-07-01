import React from 'react'
import { Info, Sparkles, AlertTriangle } from 'lucide-react'
import type { CalloutType } from './types'

const styles: Record<CalloutType, string> = {
  note: 'bg-indigo-500/5 border-indigo-500/20 text-text-secondary',
  tip: 'bg-emerald-500/5 border-emerald-500/20 text-text-secondary',
  warning: 'bg-rose-500/5 border-rose-500/20 text-text-secondary',
}

const icons: Record<CalloutType, React.ReactNode> = {
  note: <Info className="w-4 h-4 text-indigo-500 shrink-0" />,
  tip: <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />,
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
      className={`flex gap-3 border rounded-xl p-4 my-6 text-sm leading-relaxed transition-colors duration-200 ${styles[type]}`}
    >
      {icons[type]}
      <div>
        <h5 className="font-bold text-text-primary mb-1">{title}</h5>
        {children}
      </div>
    </div>
  )
}
