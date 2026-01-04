import Link from 'next/link'
import '../../franchise.css'

export default function PlatformFeature() {
  return (
    <div className="feature-page">
      <div className="feature-hero">
        <div className="container">
          <Link href="/" className="back-link">← Zpět na hlavní stránku</Link>
          <div className="feature-icon-large">🏢</div>
          <h1>Franchise Platforma</h1>
          <p className="feature-hero-subtitle">
            Multi-tenant systém, centralizovaná správa a rychlý start
          </p>
        </div>
      </div>

      <div className="feature-content">
        <div className="container">
          <section className="feature-section">
            <h2>Multi-tenant architektura</h2>
            <p>
              Platforma navržená od začátku pro franchise. Každý salon má svou vlastní izolovanou
              databázi, ale vše je řízeno z centrálního systému. Rychlý start nových salonů "out of the box".
            </p>
            <ul className="feature-list">
              <li>✅ Multi-tenant systém od začátku</li>
              <li>✅ Izolovaná data pro každý salon</li>
              <li>✅ Centralizovaná správa franchizorem</li>
              <li>✅ Rychlý start nových salonů</li>
              <li>✅ Event-driven architektura</li>
              <li>✅ Škálovatelné řešení</li>
            </ul>
          </section>

          <section className="feature-section">
            <h2>Klíčové výhody</h2>
            <div className="feature-grid-small">
              <div className="feature-card-small">
                <h3>Rychlý start</h3>
                <p>Nový salon může začít fungovat během několika dní. Vše je připraveno "out of the box".</p>
              </div>
              <div className="feature-card-small">
                <h3>Centralizovaná správa</h3>
                <p>Franchizor má plnou kontrolu nad daty, standardy a analytikou celé sítě salonů.</p>
              </div>
              <div className="feature-card-small">
                <h3>Lokální flexibilita</h3>
                <p>Každý salon má autonomii v rámci centrálně definovaných pravidel.</p>
              </div>
              <div className="feature-card-small">
                <h3>Škálovatelnost</h3>
                <p>Architektura podporuje růst z 1 na 100+ salonů bez nutnosti přepisování.</p>
              </div>
            </div>
          </section>

          <section className="feature-section">
            <h2>Technologie</h2>
            <p>
              Platforma je postavena na moderních technologiích: Domain-Driven Design, Event-Driven Architecture,
              PostgreSQL s Row-Level Security, a mikroservisní architektura. Vše navrženo pro spolehlivost a škálovatelnost.
            </p>
          </section>

          <section className="feature-cta">
            <h2>Zaujala vás naše platforma?</h2>
            <p>Začněte ještě dnes s kompletní platformou pro váš beauty salon.</p>
            <Link href="/#franchise-form" className="btn btn-primary">
              Kontaktujte nás
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
