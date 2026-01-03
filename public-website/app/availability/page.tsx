'use client'

import { useState, FormEvent } from 'react'
import { getAvailability } from '@/lib/api'
import './availability.css'

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
    <div>
      <header className="header">
        <div className="container">
          <h1>Check Availability</h1>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <form onSubmit={handleSubmit} style={{ marginBottom: '40px' }}>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Master ID (Optional)</label>
              <input
                type="text"
                value={masterId}
                onChange={(e) => setMasterId(e.target.value)}
                placeholder="Enter master UUID to filter"
              />
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Loading...' : 'Check Availability'}
            </button>
          </form>

          {error && <div className="error">{error}</div>}

          {slots.length > 0 && (
            <div className="slots-container">
              <h2>Available Slots</h2>
              {slots.map((masterSlot, idx) => (
                <div key={idx} className="master-slot">
                  <h3>{masterSlot.master_name}</h3>
                  <div className="slots-list">
                    {masterSlot.available_slots.map((slot: any, slotIdx: number) => (
                      <div key={slotIdx} className="slot-item">
                        {slot.start_time} - {slot.end_time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && slots.length === 0 && date && !error && (
            <div className="no-slots">No available slots found for this date.</div>
          )}
        </div>
      </main>
    </div>
  )
}

