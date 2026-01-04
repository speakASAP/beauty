'use client'

import Link from 'next/link'
import './globals.css'
import './franchise.css'

export default function Home() {
  return (
    <div className="franchise-landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Vlastní Beauty Salon?
              <br />
              <span className="hero-title-accent">Začněte ještě dnes</span>
            </h1>
            <p className="hero-subtitle">
              Kompletní IT platforma pro váš beauty salon. Vše, co potřebujete pro úspěšný start a růst vašeho podnikání.
            </p>
            <div className="hero-cta">
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

      {/* Features Overview */}
      <section id="features" className="features-overview">
        <div className="container">
          <h2 className="section-title">Vše, co potřebujete v jednom systému</h2>
          <p className="section-subtitle">
            Moderní platforma navržená speciálně pro beauty salony v České republice
          </p>
          
          <div className="features-grid">
            <Link href="/features/pos" className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>POS Systém</h3>
              <p>Prodej služeb a produktů, rychlé platby, tisk účtenek</p>
            </Link>

            <Link href="/features/crm" className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>CRM & Klienti</h3>
              <p>Správa klientů, historie návštěv, GDPR souhlas</p>
            </Link>

            <Link href="/features/booking" className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Online Rezervace</h3>
              <p>Online i offline rezervace, kalendář, notifikace</p>
            </Link>

            <Link href="/features/inventory" className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Sklad & Inventura</h3>
              <p>Správa zásob, automatické upozornění, reporty</p>
            </Link>

            <Link href="/features/analytics" className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytika & Reporty</h3>
              <p>Real-time metriky, tržby, využití kapacit, LTV klientů</p>
            </Link>

            <Link href="/features/platform" className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Franchise Platforma</h3>
              <p>Multi-tenant systém, centralizovaná správa, rychlý start</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <h2 className="section-title">Proč zvolit naši platformu?</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <div className="benefit-number">01</div>
              <h3>Rychlý Start</h3>
              <p>Váš salon může začít fungovat během několika dní. Vše je připraveno "out of the box".</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">02</div>
              <h3>Kompletní Řešení</h3>
              <p>Všechny nástroje, které potřebujete, v jednom systému. Žádné další integrace.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">03</div>
              <h3>Moderní Technologie</h3>
              <p>Event-driven architektura, multi-tenant systém, škálovatelné řešení.</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-number">04</div>
              <h3>Podpora & Školení</h3>
              <p>Kompletní podpora při startu a průběžné školení vašeho týmu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Franchise Form Section */}
      <section id="franchise-form" className="franchise-form-section">
        <div className="container">
          <div className="form-container">
            <h2 className="section-title">Zaujala vás naše platforma?</h2>
            <p className="section-subtitle">
              Vyplňte formulář a my vás kontaktujeme s detaily o franchize
            </p>
            <FranchiseForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="franchise-footer">
        <div className="container">
          <p>&copy; 2024 Beauty Franchise Platform. Všechna práva vyhrazena.</p>
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
    <form className="franchise-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Jméno a příjmení *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Vaše jméno"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="vas@email.cz"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="phone">Telefon *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="+420 123 456 789"
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">Město</label>
          <input
            type="text"
            id="city"
            name="city"
            placeholder="Kde chcete otevřít salon?"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="message">Vaše zpráva</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Napište nám o vašich plánech nebo otázkách..."
        ></textarea>
      </div>
      <button type="submit" className="btn btn-primary btn-large">
        Odeslat žádost
      </button>
    </form>
  )
}