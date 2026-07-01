import React from 'react'
import { introductionSection } from './docs-data/introduction'
import { quickstartSection } from './docs-data/quickstart'
import { treeLayoutSection } from './docs-data/tree-layout'
import { stateControllerSection } from './docs-data/state-controller'
import { paneCustomizationSection } from './docs-data/pane-customization'
import { advancedFeaturesSection } from './docs-data/advanced-features'
import { skillMdSection } from './docs-data/skill-md'
import { apiReferenceSection } from './docs-data/api-reference'

export interface DocSubSection {
  id: string
  title: string
  content: React.ReactNode
}

export interface DocSection {
  id: string
  title: string
  category: 'overview' | 'core' | 'advanced' | 'api'
  content?: React.ReactNode
  subsections?: DocSubSection[]
}

export const docsData: DocSection[] = [
  introductionSection,
  quickstartSection,
  treeLayoutSection,
  stateControllerSection,
  paneCustomizationSection,
  advancedFeaturesSection,
  skillMdSection,
  apiReferenceSection,
]
