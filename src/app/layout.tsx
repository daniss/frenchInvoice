import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Facture-X Pro - Solution de Facturation Électronique Française',
  description: 'Solution complète de facturation électronique conforme aux réglementations françaises. Génération automatique de factures Factur-X, intégration PDP et conformité 2026.',
  keywords: 'facturation électronique, Factur-X, PDP, conformité française, 2026, TPE, PME, micro-entreprise',
  authors: [{ name: 'Facture-X Pro' }],
  creator: 'Facture-X Pro',
  publisher: 'Facture-X Pro',
  metadataBase: new URL('https://facture-x-pro.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://facture-x-pro.fr',
    title: 'Facture-X Pro - Facturation Électronique Française',
    description: 'Préparez votre entreprise à la facturation électronique obligatoire de 2026. Solution française complète et abordable.',
    siteName: 'Facture-X Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facture-X Pro - Facturation Électronique Française',
    description: 'Solution de facturation électronique conforme 2026',
  },
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        {/* Skip link for accessibility (RGAA compliance) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-french-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-french-blue-500"
        >
          Aller au contenu principal
        </a>
        
        <div className="min-h-full">
          <main id="main-content" className="min-h-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}