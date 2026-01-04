'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking, getAvailability } from '@/lib/api'

export default function BookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [bookingResult, setBookingResult] = useState<any>(null)

  const [formData, setFormData] = useState({
    client_first_name: '',
    client_last_name: '',
    client_phone: '',
    client_email: '',
    master_id: '',
    service_id: '',
    date: '',
    time: '',
    duration_minutes: 60,
    gdpr_consent: false,
  })

  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Load available slots when date is selected
  const handleDateChange = async (date: string) => {
    setFormData({ ...formData, date })
    if (date && formData.master_id) {
      setLoadingSlots(true)
      try {
        const data = await getAvailability(formData.master_id, date)
        setAvailableSlots(data.slots || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load availability')
      } finally {
        setLoadingSlots(false)
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Combine date and time
      const startsAt = new Date(`${formData.date}T${formData.time}`).toISOString()

      const result = await createBooking({
        client: {
          first_name: formData.client_first_name,
          last_name: formData.client_last_name,
          phone: formData.client_phone,
          email: formData.client_email || undefined,
          gdpr_consent: formData.gdpr_consent,
        },
        master_id: formData.master_id,
        service_id: formData.service_id,
        starts_at: startsAt,
        duration_minutes: formData.duration_minutes,
      })

      setBookingResult(result.data)
      setStep('confirm')
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'confirm' && bookingResult) {
    return (
      <div>
        <header className="header">
          <div className="container">
            <h1>Booking Confirmed</h1>
          </div>
        </header>

        <main className="main">
          <div className="container">
            <div className="success-message">
              <h2>Your appointment has been confirmed!</h2>
              <p>Confirmation Code: <strong>{bookingResult.confirmation_code}</strong></p>
              {bookingResult.sms_sent ? (
                <p className="success">SMS confirmation has been sent to your phone.</p>
              ) : (
                <p className="error">SMS confirmation could not be sent. Please save your confirmation code.</p>
              )}
              <div style={{ marginTop: '20px' }}>
                <button className="button" onClick={() => router.push('/')}>
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>Book Appointment</h1>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                required
                value={formData.client_first_name}
                onChange={(e) => setFormData({ ...formData, client_first_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                required
                value={formData.client_last_name}
                onChange={(e) => setFormData({ ...formData, client_last_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Phone * (Format: +420XXXXXXXXX)</label>
              <input
                type="tel"
                required
                pattern="\+420\d{9}"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                placeholder="+420123456789"
              />
            </div>

            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Master ID *</label>
              <input
                type="text"
                required
                value={formData.master_id}
                onChange={(e) => setFormData({ ...formData, master_id: e.target.value })}
                placeholder="Enter master UUID"
              />
            </div>

            <div className="form-group">
              <label>Service ID *</label>
              <input
                type="text"
                required
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                placeholder="Enter service UUID"
              />
            </div>

            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                required
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  required
                  checked={formData.gdpr_consent}
                  onChange={(e) => setFormData({ ...formData, gdpr_consent: e.target.checked })}
                />
                {' '}I consent to the processing of my personal data (GDPR) *
              </label>
            </div>

            {error && <div className="error">{error}</div>}

            {loadingSlots && <div className="loading">Loading available slots...</div>}

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

