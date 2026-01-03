import Link from 'next/link'
import './globals.css'

export default function Home() {
  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>Beauty Salon - Online Booking</h1>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <h2>Welcome to Our Beauty Salon</h2>
          <p>Book your appointment online easily and quickly.</p>

          <div style={{ marginTop: '40px' }}>
            <Link href="/book" className="button">
              Book Appointment
            </Link>
          </div>

          <div style={{ marginTop: '40px' }}>
            <Link href="/availability">
              Check Availability
            </Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Beauty Salon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

