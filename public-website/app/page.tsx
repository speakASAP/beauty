'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import './globals.css'

interface Tenant {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  design_theme: string
  url_slug?: string
  state: string
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tenantId = searchParams.get('tenant_id')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(true)

  useEffect(() => {
    // If tenant_id is present, redirect to /salon page
    if (tenantId) {
      router.push(`/salon?tenant_id=${tenantId}`)
      return
    }
    
    // Fetch all active tenants
    fetchTenants()
  }, [tenantId, router])

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setTenants(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching tenants:', error)
    } finally {
      setTenantsLoading(false)
    }
  }

  // Show the franchise landing page
  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-section-mobile md:py-section-desktop overflow-hidden bg-light">
        <div className="absolute inset-0 bg-gradient-to-b from-light to-light/80 z-0"></div>
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="mb-6">
              Vlastní Beauty Salon?
              <br />
              <span className="text-accent">Začněte ještě dnes</span>
            </h1>
            <p className="text-soft mb-10 max-w-2xl mx-auto font-poppins">
              Kompletní IT platforma pro váš beauty salon. Vše, co potřebujete pro úspěšný start a růst vašeho podnikání.
            </p>
            <div className="flex gap-5 justify-center flex-wrap">
              <Link href="#franchise-form" className="btn btn-primary">
                Chci vlastní salon
              </Link>
              <Link href="#features" className="btn btn-secondary">
                Zjistit více
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Salons Section */}
      {tenants.length > 0 && (
        <section id="our-salons" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight">
          <div className="container">
            <h2 className="text-center mb-4">Naše Beauty Salony</h2>
            <p className="text-center text-soft mb-16 max-w-2xl mx-auto font-poppins">
              Objevte naše partnerské salony a rezervujte si termín ještě dnes
            </p>
            {tenantsLoading ? (
              <div className="text-center py-15 text-soft">
                <p>Načítání salonů...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
                {tenants.map((tenant) => (
                  <Link
                    key={tenant.id}
                    href={`/salon?tenant_id=${tenant.id}`}
                    className="bg-light p-8 rounded-2xl block transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-3">
                      <h3 className="font-semibold text-dark mb-0">{tenant.name}</h3>
                      {tenant.address && (
                        <p className="text-soft m-0">📍 {tenant.address}</p>
                      )}
                      {tenant.phone && (
                        <p className="text-soft m-0">📞 {tenant.phone}</p>
                      )}
                      <span className="mt-3 font-semibold text-accent transition-colors">Navštívit salon →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Overview */}
      <section id="features" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight">
        <div className="container">
          <h2 className="text-center mb-4">Vše, co potřebujete v jednom systému</h2>
          <p className="text-center text-soft mb-15 max-w-2xl mx-auto font-poppins">
            Moderní platforma navržená speciálně pro beauty salony v České republice
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-15">
            <Link href="/features/pos" className="bg-light p-10 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent hover:shadow-lg">
              <div className="text-6xl mb-5">💳</div>
              <h3 className="font-semibold text-dark mb-3">POS Systém</h3>
              <p className="text-soft font-poppins">Prodej služeb a produktů, rychlé platby, tisk účtenek</p>
            </Link>

            <Link href="/features/crm" className="bg-light p-10 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent hover:shadow-lg">
              <div className="text-6xl mb-5">👥</div>
              <h3 className="font-semibold text-dark mb-3">CRM & Klienti</h3>
              <p className="text-soft font-poppins">Správa klientů, historie návštěv, GDPR souhlas</p>
            </Link>

            <Link href="/features/booking" className="bg-light p-10 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent hover:shadow-lg">
              <div className="text-6xl mb-5">📅</div>
              <h3 className="font-semibold text-dark mb-3">Online Rezervace</h3>
              <p className="text-soft font-poppins">Online i offline rezervace, kalendář, notifikace</p>
            </Link>

            <Link href="/features/inventory" className="bg-light p-10 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent hover:shadow-lg">
              <div className="text-6xl mb-5">📦</div>
              <h3 className="font-semibold text-dark mb-3">Sklad & Inventura</h3>
              <p className="text-soft font-poppins">Správa zásob, automatické upozornění, reporty</p>
            </Link>

            <Link href="/features/analytics" className="bg-light p-10 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent hover:shadow-lg">
              <div className="text-6xl mb-5">📊</div>
              <h3 className="font-semibold text-dark mb-3">Analytika & Reporty</h3>
              <p className="text-soft font-poppins">Real-time metriky, tržby, využití kapacit, LTV klientů</p>
            </Link>

            <Link href="/features/platform" className="bg-light p-10 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-accent hover:shadow-lg">
              <div className="text-6xl mb-5">🏢</div>
              <h3 className="font-semibold text-dark mb-3">Franchise Platforma</h3>
              <p className="text-soft font-poppins">Multi-tenant systém, centralizovaná správa, rychlý start</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-section-mobile md:py-section-desktop bg-light border-b border-borderLight">
        <div className="container">
          <h2 className="text-center mb-16">Proč zvolit naši platformu?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
            <div className="text-center">
              <div className="text-6xl font-bold mb-5 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent leading-none">01</div>
              <h3 className="font-semibold text-dark mb-3">Rychlý Start</h3>
              <p className="text-soft font-poppins">Váš salon může začít fungovat během několika dní. Vše je připraveno "out of the box".</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-5 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent leading-none">02</div>
              <h3 className="font-semibold text-dark mb-3">Kompletní Řešení</h3>
              <p className="text-soft font-poppins">Všechny nástroje, které potřebujete, v jednom systému. Žádné další integrace.</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-5 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent leading-none">03</div>
              <h3 className="font-semibold text-dark mb-3">Moderní Technologie</h3>
              <p className="text-soft font-poppins">Event-driven architektura, multi-tenant systém, škálovatelné řešení.</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-5 bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent leading-none">04</div>
              <h3 className="font-semibold text-dark mb-3">Podpora & Školení</h3>
              <p className="text-soft font-poppins">Kompletní podpora při startu a průběžné školení vašeho týmu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Franchise Form Section */}
      <section id="franchise-form" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-center mb-4">Zaujala vás naše platforma?</h2>
            <p className="text-center text-soft mb-10 max-w-xl mx-auto font-poppins">
              Vyplňte formulář a my vás kontaktujeme s detaily o franchize
            </p>
            <FranchiseForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-base/80 py-10 text-center">
        <div className="container">
          <p>&copy; 2026 Beauty Franchise Platform. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  )
}

// Franchise Form Component
function FranchiseForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      message: formData.get('message'),
    }

    // TODO: Send to backend API
    console.log('Franchise inquiry:', data)
    alert('Děkujeme za váš zájem! Brzy vás budeme kontaktovat.')
    e.currentTarget.reset()
  }

  return (
    <form className="mt-10" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 font-semibold text-dark">Jméno a příjmení *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Vaše jméno"
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 font-semibold text-dark">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="vas@email.cz"
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2 font-semibold text-dark">Telefon *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="+420 123 456 789"
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>
        <div className="mb-5">
          <label htmlFor="city" className="block mb-2 font-semibold text-dark">Město</label>
          <input
            type="text"
            id="city"
            name="city"
            placeholder="Kde chcete otevřít salon?"
            className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all"
          />
        </div>
      </div>
      <div className="mb-5">
        <label htmlFor="message" className="block mb-2 font-semibold text-dark">Vaše zpráva</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Napište nám o vašich plánech nebo otázkách..."
          className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all resize-y min-h-[120px]"
        ></textarea>
      </div>
      <button type="submit" className="btn btn-primary btn-large">
        Odeslat žádost
      </button>
    </form>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="py-10 text-center">
        <p>Loading...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}