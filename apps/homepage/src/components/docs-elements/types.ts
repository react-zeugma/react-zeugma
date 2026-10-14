import { ReactNode } from 'react'

export type CalloutVariant = 'note' | 'tip' | 'important' | 'warning' | 'caution'

export interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: ReactNode
  className?: string
}

export interface StepItem {
  number?: number | string
  title: string
  description?: ReactNode
  children?: ReactNode
}

export interface TableColumn {
  header: string
  accessor?: string
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface DocTableProps {
  headers: string[]
  rows: (ReactNode | string)[][]
  searchable?: boolean
  searchPlaceholder?: string
  caption?: string
  className?: string
}

export interface PackageManagerTab {
  label: 'pnpm' | 'npm' | 'yarn' | 'bun'
  command: string
}
