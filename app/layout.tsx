import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/context/CartContext'
import CyberCursor from '@/components/portfolio/CyberCursor'
import CyberHUDController from '@/components/portfolio/CyberHUDController'

export const metadata: Metadata = {
  title: {
    default: 'Saurabh Kumar Gaur — AI/ML Engineer',
    template: '%s | Saurabh Kumar Gaur',
  },
  description:
    'AI/ML Engineer specialising in LLM systems, agentic RAG pipelines, and frontier model evaluation. Also an AI artist selling digital art.',
  openGraph: {
    type: 'website',
    url: 'https://saurabhgaur.world',
    title: 'Saurabh Kumar Gaur — AI/ML Engineer',
    description: 'AI/ML Engineer · LLM Systems · Agentic AI · AI Art Storefront',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-image.jpg'],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://saurabhgaur.world'),
}

export const viewport: Viewport = {
  themeColor: '#070B0F',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Saurabh Kumar Gaur',
    url: 'https://saurabhgaur.world',
    jobTitle: 'AI/ML Engineer',
    description: 'AI Engineer specialising in LLM systems, agentic RAG pipelines, and frontier model evaluation.',
    sameAs: [
      'https://github.com/saurabhgaur',
      'https://linkedin.com/in/saurabhgaur',
    ],
    knowsAbout: ['LangGraph', 'RAG Systems', 'Gemini API', 'LLM Evaluation', 'Agentic AI', 'Next.js', 'FastAPI'],
  }

  return (
    <html lang="en">
      {/* Resource hints: preconnect to Google Fonts CDN to reduce DNS lookup latency */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#0A0A0A] text-[#F0F0F0] antialiased">
        {/* Skip to main content for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-mono focus:uppercase"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          Skip to content
        </a>
        <CartProvider>
          <CyberCursor />
          <CyberHUDController />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
