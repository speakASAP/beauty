import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beauty Salon - Online Booking',
  description: 'Book your appointment online at our beauty salon',
  keywords: 'beauty salon, booking, appointment, beauty services',
  openGraph: {
    title: 'Beauty Salon - Online Booking',
    description: 'Book your appointment online at our beauty salon',
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
      <body>{children}</body>
    </html>
  )
}

