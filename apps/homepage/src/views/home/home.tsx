'use client'

import {
  HeroSection,
  ShowcaseSection,
  PillarsSection,
  ComparisonSection,
  CodePreviewSection,
  FaqSection,
  StorySection,
} from './components'
import { Footer } from '../../components/footer'

export function Home() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '7.1.2'

  return (
    <div className="flex flex-col min-h-screen bg-bg-app">
      {/* 1. Hero Section */}
      <HeroSection appVersion={appVersion} />

      {/* 2. Live Interactive Observability Showcase */}
      <ShowcaseSection />

      {/* 3. Core Engine Primitives (Bento Grid) */}
      <PillarsSection />

      {/* 4. Layout Engine Comparison & Alternatives (react-mosaic, react-grid-layout, golden-layout) */}
      <ComparisonSection />

      {/* 5. Clean Code Preview & Declarative API */}
      <CodePreviewSection />

      {/* 6. Frequently Asked Questions (Syncs with FAQPage Schema) */}
      <FaqSection />

      {/* 7. Origin Story Callout */}
      <StorySection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
