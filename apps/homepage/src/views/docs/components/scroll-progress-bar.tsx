'use client'

export function ScrollProgressBar() {
  return (
    <div
      aria-hidden="true"
      className="sticky top-14 z-30 h-0.5 w-full bg-border-primary/40 overflow-hidden"
    >
      <div className="h-full bg-accent scroll-progress w-full" />
    </div>
  )
}
