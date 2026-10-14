import { ReactNode } from 'react'

export interface StepItem {
  title: string
  number?: number | string
  badge?: string
  children: ReactNode
}

export interface DocStepperProps {
  steps: StepItem[]
  className?: string
}

export function DocStepper({ steps, className = '' }: DocStepperProps) {
  return (
    <div className={`space-y-6 my-6 relative ${className}`}>
      {steps.map((step, idx) => {
        const stepNum = step.number ?? idx + 1
        const isLast = idx === steps.length - 1

        return (
          <div key={idx} className="relative flex gap-4 sm:gap-6 group">
            {/* Step Number Circle and Vertical Connector Line */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-accent/10 border-2 border-accent text-accent font-mono text-xs font-bold flex items-center justify-center shrink-0 z-10 shadow-xs group-hover:scale-105 transition-transform">
                {stepNum}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-border-primary/80 my-1 group-hover:bg-accent/40 transition-colors" />
              )}
            </div>

            {/* Step Content */}
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-2' : 'pb-8'} space-y-3`}>
              <div className="flex items-center gap-2 pt-1">
                <h4 className="text-base font-bold text-text-primary tracking-tight">
                  {step.title}
                </h4>
                {step.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-bg-pane-inner border border-border-primary text-text-muted font-semibold">
                    {step.badge}
                  </span>
                )}
              </div>
              <div className="text-text-secondary text-sm leading-relaxed space-y-3">
                {step.children}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
