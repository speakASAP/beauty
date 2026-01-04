'use client'

import { useState, FormEvent } from 'react'
import { getAvailability } from '@/lib/api'

export default function AvailabilityPage() {
  const [date, setDate] = useState('')
  const [masterId, setMasterId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slots, setSlots] = useState<any[]>([])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await getAvailability(masterId || undefined, date)
      setSlots(data.slots || [])
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load availability')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light">
      <header className="bg-base border-b border-borderLight py-section-mobile md:py-section-desktop">
        <div className="container">
          <h1 className="text-h1-mobile md:text-h1-desktop font-heading font-bold text-dark">Check Availability</h1>
        </div>
      </header>

      <main className="py-section-mobile md:py-section-desktop">
        <div className="container">
          <form onSubmit={handleSubmit} className="mb-10">
            <div className="mb-6">
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Master ID (Optional)
              </label>
              <input
                type="text"
                value={masterId}
                onChange={(e) => setMasterId(e.target.value)}
                placeholder="Enter master UUID to filter"
                className="w-full px-4 py-3 rounded-button border border-borderLight bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Check Availability'}
            </button>
          </form>

          {error && (
            <div className="mb-6 p-4 rounded-button bg-red-50 border border-red-200 text-red-800 text-body-mobile md:text-body-desktop font-body">
              {error}
            </div>
          )}

          {slots.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark">Available Slots</h2>
              {slots.map((masterSlot, idx) => (
                <div key={idx} className="bg-base border border-borderLight rounded-button p-6">
                  <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-4">
                    {masterSlot.master_name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {masterSlot.available_slots.map((slot: any, slotIdx: number) => (
                      <div
                        key={slotIdx}
                        className="px-4 py-3 bg-light border border-borderLight rounded-button text-body-mobile md:text-body-desktop font-body text-dark text-center"
                      >
                        {slot.start_time} - {slot.end_time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && slots.length === 0 && date && !error && (
            <div className="text-center py-12 text-body-mobile md:text-body-desktop font-body text-soft">
              No available slots found for this date.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

