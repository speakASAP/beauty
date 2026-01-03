import { notFound } from 'next/navigation'
import { getBookingByToken } from '@/lib/api'

interface PageProps {
  params: {
    token: string
  }
}

export default async function ConfirmPage({ params }: PageProps) {
  let booking;
  
  try {
    const result = await getBookingByToken(params.token)
    booking = result.data
  } catch (error) {
    notFound()
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>Booking Confirmation</h1>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="booking-details">
            <h2>Your Booking Details</h2>
            <div className="detail-item">
              <strong>Client:</strong> {booking.client_name}
            </div>
            <div className="detail-item">
              <strong>Service:</strong> {booking.service_name}
            </div>
            <div className="detail-item">
              <strong>Date & Time:</strong> {new Date(booking.starts_at).toLocaleString('cs-CZ')}
            </div>
            <div className="detail-item">
              <strong>Status:</strong> {booking.status}
            </div>
            <div className="detail-item">
              <strong>Confirmation Code:</strong> {booking.confirmation_token?.substring(0, 6).toUpperCase()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

