import { ReactNode } from 'react'

export const DocCode = ({
  children,
  highlight = false,
}: {
  children: ReactNode
  highlight?: boolean
}) => (
  <code
    className={`px-1.5 py-0.5 bg-bg-pane-inner border border-border-primary rounded font-mono text-xs ${highlight ? 'text-indigo-500' : 'text-text-primary'}`}
  >
    {children}
  </code>
)

export const DocParagraph = ({
  children,
  size = 'sm',
  className = '',
}: {
  children: ReactNode
  size?: 'sm' | 'base'
  className?: string
}) => (
  <p
    className={`text-text-secondary leading-relaxed ${size === 'base' ? 'text-base' : 'text-sm'} ${className}`}
  >
    {children}
  </p>
)

export const DocHeading = ({
  children,
  level = 3,
  className = '',
}: {
  children: ReactNode
  level?: 3 | 4
  className?: string
}) => {
  if (level === 4) {
    return (
      <h4 className={`text-sm font-bold text-text-primary mb-3 font-mono ${className}`}>
        {children}
      </h4>
    )
  }
  return (
    <h3 className={`text-base font-bold text-text-primary mt-6 mb-3 ${className}`}>{children}</h3>
  )
}

export const DocList = ({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) => {
  const Tag = ordered ? 'ol' : 'ul'
  const listClass = ordered
    ? 'list-decimal list-inside text-text-secondary space-y-3 text-sm leading-relaxed'
    : 'list-disc list-inside text-text-secondary space-y-2 text-sm leading-relaxed'
  return (
    <Tag className={listClass}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  )
}

export const InfoCard = ({
  title,
  titleClassName = 'text-text-primary',
  children,
}: {
  title: string
  titleClassName?: string
  children: React.ReactNode
}) => (
  <div className="border border-border-primary rounded-xl p-5 bg-bg-pane/30 text-sm space-y-2">
    <h4 className={`font-bold ${titleClassName}`}>{title}</h4>
    {children}
  </div>
)

export const Checklist = ({ items }: { items: { title: string; desc: string }[] }) => (
  <ul className="grid sm:grid-cols-2 gap-4 text-sm text-text-secondary">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2">
        <span className="text-indigo-500 font-bold">✓</span>
        <span>
          <strong>{item.title}</strong>: {item.desc}
        </span>
      </li>
    ))}
  </ul>
)

export const DocTable = ({
  headers,
  rows,
}: {
  headers: string[]
  rows: (React.ReactNode | string)[][]
}) => (
  <div className="w-full max-w-full overflow-x-auto border border-border-primary rounded-lg">
    <table className="min-w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-border-primary bg-bg-sidebar text-text-secondary uppercase tracking-wider">
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-2 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-primary/60 text-text-primary bg-bg-pane/30">
        {rows.map((row, rIndex) => (
          <tr key={rIndex}>
            {row.map((cell, cIndex) => {
              const isFirst = cIndex === 0
              const isSecond = cIndex === 1
              const isMono = isFirst || isSecond
              return (
                <td
                  key={cIndex}
                  className={`px-4 py-3 ${isMono ? 'font-mono' : ''} ${
                    isFirst ? 'text-indigo-500' : ''
                  }`}
                >
                  {cell}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
