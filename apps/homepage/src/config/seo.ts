import { Metadata } from 'next'

export const globalMetadata: Metadata = {
  metadataBase: new URL('https://react-zeugma.com'),
  title: {
    default: 'react-zeugma - Recursive Drag-and-Drop Workspace Layout Engine for React',
    template: '%s | react-zeugma',
  },
  description:
    'A flexible, headless, and completely unopinionated workspace layout engine for React. Split, drag, and resize panes recursively without constraints.',

  verification: {
    google: 'p1Yy4RYx3yF6E5ZbbrV50GZHwKnEXR-7M2UxPlHDHKc',
  },

  keywords: [
    'react',
    'drag-and-drop',
    'dnd',
    'dashboard',
    'layout manager',
    'workspace layouts',
    'resizable panels',
    'docking layout',
    'react-zeugma',
    'recursive layouts',
    'headless UI',
  ],
  authors: [{ name: 'Yusuf Arslan', url: 'https://github.com/yusufarsln98' }],
  creator: 'Yusuf Arslan',
  publisher: 'Yusuf Arslan',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: 'react-zeugma - Recursive Drag-and-Drop Workspace Layouts',
    description:
      'A flexible, headless, and completely unopinionated workspace layout engine for React. Split, drag, and resize panes recursively.',
    type: 'website',
    url: 'https://react-zeugma.com',
    siteName: 'react-zeugma',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'react-zeugma Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'react-zeugma - Recursive Drag-and-Drop Workspace Layouts',
    description: 'Headless, draggable, and resizable layout manager for React.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: '/',
  },
}

export const homeMetadata: Metadata = {
  title: 'react-zeugma - Recursive Drag-and-Drop Workspace Layout Engine for React',
  alternates: {
    canonical: '/',
  },
}

export const docsMetadata: Metadata = {
  title: 'Documentation',
  description:
    'Detailed API references, installation instructions, quick-start guide, custom styling, and tree mutation utility documentation for react-zeugma.',
  openGraph: {
    title: 'Documentation - react-zeugma',
    description:
      'Detailed API references, installation instructions, quick-start guide, custom styling, and tree mutation utility documentation for react-zeugma.',
    url: 'https://react-zeugma.com/docs',
  },
  alternates: {
    canonical: '/docs',
  },
}

export const demoMetadata: Metadata = {
  title: 'Live Demo — Interactive Dashboard',
  description:
    'Interactive Grafana-style monitoring dashboard powered by react-zeugma. Drag, resize, and rearrange live panels with real-time simulated metrics, charts, tables, and log streams.',
  openGraph: {
    title: 'Live Demo — react-zeugma Dashboard',
    description:
      'Interactive Grafana-style monitoring dashboard powered by react-zeugma. Drag, resize, and rearrange live panels.',
    url: 'https://react-zeugma.com/demo',
  },
  alternates: {
    canonical: '/demo',
  },
}

export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'react-zeugma',
  description:
    'A flexible, headless, and completely unopinionated workspace layout engine for React. Split, drag, and resize panes recursively without constraints.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  license: 'https://github.com/react-zeugma/react-zeugma/blob/main/LICENSE',
  url: 'https://react-zeugma.com',
  repository: 'https://github.com/react-zeugma/react-zeugma',
  downloadUrl: 'https://www.npmjs.com/package/react-zeugma',
  author: {
    '@type': 'Person',
    name: 'Yusuf Arslan',
  },
}

export const docsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  name: 'react-zeugma Documentation',
  headline: 'react-zeugma Documentation',
  description:
    'Detailed API references, installation instructions, quick-start guide, custom styling, and tree mutation utility documentation for react-zeugma.',
  inLanguage: 'en',
  url: 'https://react-zeugma.com/docs',
  mainEntityOfPage: 'https://react-zeugma.com/docs',
  about: {
    '@type': 'SoftwareApplication',
    name: 'react-zeugma',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    url: 'https://react-zeugma.com',
  },
  author: {
    '@type': 'Person',
    name: 'Yusuf Arslan',
  },
  publisher: {
    '@type': 'Person',
    name: 'Yusuf Arslan',
  },
  hasPart: [
    {
      '@type': 'WebPageElement',
      name: 'Introduction',
      url: 'https://react-zeugma.com/docs#introduction',
    },
    {
      '@type': 'WebPageElement',
      name: 'Quick Start',
      url: 'https://react-zeugma.com/docs#quickstart',
    },
    {
      '@type': 'WebPageElement',
      name: 'Tree Layout Structure',
      url: 'https://react-zeugma.com/docs#tree-layout',
    },
    {
      '@type': 'WebPageElement',
      name: 'State Controller',
      url: 'https://react-zeugma.com/docs#state-controller',
    },
    {
      '@type': 'WebPageElement',
      name: 'Pane Customization',
      url: 'https://react-zeugma.com/docs#pane-customization',
    },
    {
      '@type': 'WebPageElement',
      name: 'Advanced Features',
      url: 'https://react-zeugma.com/docs#advanced-features',
    },
    {
      '@type': 'WebPageElement',
      name: 'API Reference',
      url: 'https://react-zeugma.com/docs#api-reference',
    },
    {
      '@type': 'WebPageElement',
      name: 'AI Integration (SKILL.md)',
      url: 'https://react-zeugma.com/docs#skill-md',
    },
  ],
}
