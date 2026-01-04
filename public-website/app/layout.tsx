import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beauty Franchise Platform - Vlastní Beauty Salon',
  description: 'Kompletní IT platforma pro beauty salony. POS, CRM, rezervace, sklad, analytika - vše v jednom systému. Začněte vlastní beauty salon ještě dnes.',
  keywords: 'beauty salon, franchise, POS systém, CRM, rezervace, beauty platforma, vlastní salon',
  openGraph: {
    title: 'Beauty Franchise Platform - Vlastní Beauty Salon',
    description: 'Kompletní IT platforma pro beauty salony. Vše, co potřebujete pro úspěšný start.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>
        <nav className="main-nav">
          <div className="container">
            <a href="/" className="nav-logo">Beauty Franchise</a>
            <div className="nav-links">
              <a href="/#features">Funkce</a>
              <a href="/#franchise-form">Kontakt</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}

