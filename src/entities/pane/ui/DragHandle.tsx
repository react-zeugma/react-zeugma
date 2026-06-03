import React, { useContext } from 'react'
import { DragListenersCtx } from '../model/context'

interface DragHandleProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const DragHandle: React.FC<DragHandleProps> = ({ children, className, style }) => {
  const dragProps = useContext(DragListenersCtx)
  if (!dragProps) {
    throw new Error('<DragHandle> must be used inside a <Pane>')
  }
  return (
    <div
      className={className}
      style={{ cursor: 'grab', userSelect: 'none', ...style }}
      {...dragProps}
    >
      {children}
    </div>
  )
}
