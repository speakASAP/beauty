import Link from 'next/link'

export default function BookingFeature() {
  return (
    <div className="feature-page">
      <div className="feature-hero">
        <div className="container">
          <Link href="/" className="back-link">← Zpět na hlavní stránku</Link>
          <div className="feature-icon-large">📅</div>
          <h1>Online Rezervace</h1>
          <p className="feature-hero-subtitle">
            Online i offline rezervace, kalendář a automatické notifikace
          </p>
        </div>
      </div>

      <div className="feature-content">
        <div className="container">
          <section className="feature-section">
            <h2>Rezervační systém</h2>
            <p>
              Moderní rezervační systém, který umožňuje klientům rezervovat termíny online 24/7,
              nebo vám umožní rezervovat offline přímo v salonu. Vše synchronizováno v reálném čase.
            </p>
            <ul className="feature-list">
              <li>✅ Online rezervace 24/7</li>
              <li>✅ Offline rezervace v salonu</li>
              <li>✅ Kalendář s přehledem</li>
              <li>✅ Automatické notifikace SMS</li>
              <li>✅ Připomínky návštěv</li>
              <li>✅ Správa kapacit a časových slotů</li>
            </ul>
          </section>

          <section className="feature-section">
            <h2>Klíčové funkce</h2>
            <div className="feature-grid-small">
              <div className="feature-card-small">
                <h3>Online rezervace</h3>
                <p>Klienti si mohou rezervovat termíny online kdykoliv. Veřejné webové stránky s integrovaným rezervačním systémem.</p>
              </div>
              <div className="feature-card-small">
                <h3>Kalendář</h3>
                <p>Přehledný kalendář všech rezervací. Zobrazení podle mastera, služby nebo dne. Drag & drop přesunutí.</p>
              </div>
              <div className="feature-card-small">
                <h3>SMS notifikace</h3>
                <p>Automatické SMS připomínky klientům. Integrace s českými SMS bránami.</p>
              </div>
              <div className="feature-card-small">
                <h3>Správa kapacit</h3>
                <p>Automatická správa dostupných časových slotů. Optimalizace využití kapacit salonu.</p>
              </div>
            </div>
          </section>

          <section className="feature-cta">
            <h2>Zaujal vás rezervační systém?</h2>
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
