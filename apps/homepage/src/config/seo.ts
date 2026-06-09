import { Metadata } from 'next'

export const globalMetadata: Metadata = {
  metadataBase: new URL('https://react-zeugma.vercel.app'),
  title: {
    default: 'react-zeugma - Recursive Drag-and-Drop Workspace Layout Engine for React',
    template: '%s | react-zeugma',
  },
  description:
    'A flexible, headless, and completely unopinionated workspace layout engine for React. Split, drag, and resize panes recursively without constraints.',
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
    url: 'https://react-zeugma.vercel.app',
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

export const demoMetadata: Metadata = {
  title: 'Live Demo',
  description:
    'Try react-zeugma layout manager in an interactive workspace with file explorer, code editor, and live preview panels.',
  openGraph: {
    title: 'Live Demo - react-zeugma',
    description:
      'Try react-zeugma layout manager in an interactive workspace with file explorer, code editor, and live preview panels.',
    url: 'https://react-zeugma.vercel.app/demo',
  },
  alternates: {
    canonical: '/demo',
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
    url: 'https://react-zeugma.vercel.app/docs',
  },
  alternates: {
    canonical: '/docs',
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
  url: 'https://react-zeugma.vercel.app',
  repository: 'https://github.com/react-zeugma/react-zeugma',
  downloadUrl: 'https://www.npmjs.com/package/react-zeugma',
  author: {
    '@type': 'Person',
    name: 'Yusuf Arslan',
  },
}
