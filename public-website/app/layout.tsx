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
        <nav className="main-nav hidden bg-base/95 backdrop-blur-sm border-b border-borderLight sticky top-0 z-[100] shadow-sm py-5">
          <div className="container flex justify-between items-center">
            <a href="/" className="text-2xl font-bold font-heading text-dark">Beauty Franchise</a>
            <div className="flex gap-8">
              <a href="/#features" className="text-soft font-medium hover:text-accent transition-colors">Funkce</a>
              <a href="/#franchise-form" className="text-soft font-medium hover:text-accent transition-colors">Kontakt</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}

