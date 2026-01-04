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
      <div className="min-h-screen bg-light">
        <header className="bg-base border-b border-borderLight py-section-mobile md:py-section-desktop">
          <div className="container">
            <h1 className="text-h1-mobile md:text-h1-desktop font-heading font-bold text-dark">Booking Confirmed</h1>
          </div>
        </header>

        <main className="py-section-mobile md:py-section-desktop">
          <div className="container">
            <div className="bg-base border border-borderLight rounded-button p-8 md:p-12 text-center">
              <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark mb-6">
                Your appointment has been confirmed!
              </h2>
              <p className="text-body-mobile md:text-body-desktop font-body text-dark mb-4">
                Confirmation Code: <strong className="font-semibold">{bookingResult.confirmation_code}</strong>
              </p>
              {bookingResult.sms_sent ? (
                <p className="text-body-mobile md:text-body-desktop font-body text-green-700 mb-6">
                  SMS confirmation has been sent to your phone.
                </p>
              ) : (
                <p className="text-body-mobile md:text-body-desktop font-body text-red-700 mb-6">
                  SMS confirmation could not be sent. Please save your confirmation code.
                </p>
              )}
              <div className="mt-5">
                <button className="btn btn-primary" onClick={() => router.push('/')}>
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
    <div className="min-h-screen bg-light">
      <header className="bg-base border-b border-borderLight py-section-mobile md:py-section-desktop">
        <div className="container">
          <h1 className="text-h1-mobile md:text-h1-desktop font-heading font-bold text-dark">Book Appointment</h1>
        </div>
      </header>

      <main className="py-section-mobile md:py-section-desktop">
        <div className="container">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.client_first_name}
                onChange={(e) => setFormData({ ...formData, client_first_name: e.target.value })}
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.client_last_name}
                onChange={(e) => setFormData({ ...formData, client_last_name: e.target.value })}
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Phone * (Format: +420XXXXXXXXX)
              </label>
              <input
                type="tel"
                required
                pattern="\+420\d{9}"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                placeholder="+420123456789"
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Master ID *
              </label>
              <input
                type="text"
                required
                value={formData.master_id}
                onChange={(e) => setFormData({ ...formData, master_id: e.target.value })}
                placeholder="Enter master UUID"
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Service ID *
              </label>
              <input
                type="text"
                required
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                placeholder="Enter service UUID"
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                checked={formData.gdpr_consent}
                onChange={(e) => setFormData({ ...formData, gdpr_consent: e.target.checked })}
                className="mt-1 mr-3 w-5 h-5 rounded border-borderLight text-accent focus:ring-2 focus:ring-accent"
              />
              <label className="text-body-mobile md:text-body-desktop font-body text-dark">
                I consent to the processing of my personal data (GDPR) *
              </label>
            </div>

            {error && (
              <div className="p-4 rounded-button bg-red-50 border border-red-200 text-red-800 text-body-mobile md:text-body-desktop font-body">
                {error}
              </div>
            )}

            {loadingSlots && (
              <div className="text-center py-4 text-body-mobile md:text-body-desktop font-body text-soft">
                Loading available slots...
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

