'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import '../globals.css'
import './salon.css'
import Salon1 from '../salon1/page'
import Salon2 from '../salon2/page'
import Salon3 from '../salon3/page'

interface TenantInfo {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  state: string
  design_theme: 'salon1' | 'salon2' | 'salon3'
}

export default function SalonPage() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenant_id')
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) {
      setError('Tenant ID is required')
      setLoading(false)
      return
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(tenantId)) {
      setError('Invalid tenant ID format')
      setLoading(false)
      return
    }

    // Fetch tenant info from API
    const fetchTenantInfo = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100'
        const response = await fetch(`${apiUrl}/public/tenants/${tenantId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Salon not found')
          } else {
            setError('Failed to load salon information')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setTenantInfo(data.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching tenant info:', err)
        setError('Failed to load salon information')
        setLoading(false)
      }
    }

    fetchTenantInfo()
  }, [tenantId])

  if (loading) {
    return (
      <div className="salon-loading">
        <div className="loading-spinner"></div>
        <p>Loading salon information...</p>
      </div>
    )
  }

  if (error || !tenantInfo) {
    return (
      <div className="salon-error">
        <h1>Salon Not Found</h1>
        <p>{error || 'The requested salon could not be found.'}</p>
        <a href="/">Return to homepage</a>
      </div>
    )
  }

  // Render the appropriate design based on design_theme
  const renderSalonDesign = () => {
    switch (tenantInfo.design_theme) {
      case 'salon1':
        return <Salon1 tenantInfo={tenantInfo} />
      case 'salon2':
        return <Salon2 tenantInfo={tenantInfo} />
      case 'salon3':
        return <Salon3 tenantInfo={tenantInfo} />
      default:
        return <Salon1 tenantInfo={tenantInfo} />
    }
  }

  return renderSalonDesign()
}
