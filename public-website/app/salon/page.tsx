'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import '../globals.css'
import './salon.css'
import Salon1Design from '../components/Salon1Design'
import Salon2Design from '../components/Salon2Design'
import Salon3Design from '../components/Salon3Design'

// Force dynamic rendering since we need tenant_id from search params
export const dynamic = 'force-dynamic'

interface TenantInfo {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  state: string
  design_theme: string
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
        // Use local API route for consistency
        const response = await fetch(`/api/tenant?tenant_id=${tenantId}`)
        
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
        if (data.success && data.data) {
          setTenantInfo(data.data)
        } else {
          setError('Failed to load salon information')
        }
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
  // Map database values to component names
  const renderSalonDesign = () => {
    const theme = tenantInfo.design_theme
    
    // Convert tenantInfo to match component interface
    const tenant = {
      id: tenantInfo.id,
      name: tenantInfo.name,
      address: tenantInfo.address || null,
      phone: tenantInfo.phone || null,
      email: tenantInfo.email || null,
      design: tenantInfo.design_theme,
    }
    
    // Map various theme values to our 3 designs
    if (theme === 'salon1' || theme === 'luna') {
      return <Salon1Design tenant={tenant} />
    } else if (theme === 'salon2' || theme === 'aurora') {
      return <Salon2Design tenant={tenant} />
    } else if (theme === 'salon3' || theme === 'serenity') {
      return <Salon3Design tenant={tenant} />
    } else {
      // Default to salon1
      return <Salon1Design tenant={tenant} />
    }
  }

  return renderSalonDesign()
}
