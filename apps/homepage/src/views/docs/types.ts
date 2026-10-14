import { ReactNode } from 'react'

export interface SubsectionItem {
  id: string
  title: string
  badge?: string
}

export interface SidebarItemData {
  id: string
  title: string
  category: 'overview' | 'core' | 'advanced' | 'api'
  badge?: string
  icon?: string
  subsections?: SubsectionItem[]
}

export interface SidebarGroupData {
  key: string
  title: string
  icon?: ReactNode
  items: SidebarItemData[]
}

export interface DocsProps {
  skillMdContent: string | null
}

export interface PageMetadata {
  readingTime: string
  version: string
  lastUpdated: string
  categoryLabel: string
}

export type FeedbackState = 'idle' | 'helpful' | 'not-helpful'
