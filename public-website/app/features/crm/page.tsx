import Link from 'next/link'
import '../../franchise.css'

export default function CRMFeature() {
  return (
    <div className="feature-page">
      <div className="feature-hero">
        <div className="container">
          <Link href="/" className="back-link">← Zpět na hlavní stránku</Link>
          <div className="feature-icon-large">👥</div>
          <h1>CRM & Správa Klientů</h1>
          <p className="feature-hero-subtitle">
            Kompletní správa klientů, historie návštěv a GDPR compliance
          </p>
        </div>
      </div>

      <div className="feature-content">
        <div className="container">
          <section className="feature-section">
            <h2>Centralizovaná správa klientů</h2>
            <p>
              Všechny informace o vašich klientech na jednom místě. Historie návštěv, preference,
              alergie, a mnohem více. Vše v souladu s GDPR.
            </p>
            <ul className="feature-list">
              <li>✅ Kompletní databáze klientů</li>
              <li>✅ Historie všech návštěv</li>
              <li>✅ GDPR souhlas a správa</li>
              <li>✅ Preference a poznámky</li>
              <li>✅ Alergie a kontraindikace</li>
              <li>✅ Marketingové kampaně</li>
            </ul>
          </section>

          <section className="feature-section">
            <h2>Klíčové funkce</h2>
            <div className="feature-grid-small">
              <div className="feature-card-small">
                <h3>Kompletní profil klienta</h3>
                <p>Všechny informace o klientovi na jednom místě - kontakt, historie, preference, poznámky.</p>
              </div>
              <div className="feature-card-small">
                <h3>GDPR compliance</h3>
                <p>Automatická správa souhlasů, export dat, právo na výmaz - vše v souladu s GDPR.</p>
              </div>
              <div className="feature-card-small">
                <h3>Historie návštěv</h3>
                <p>Kompletní historie všech návštěv, zakoupených služeb a produktů pro každého klienta.</p>
              </div>
              <div className="feature-card-small">
                <h3>LTV analýza</h3>
                <p>Automatický výpočet životní hodnoty klienta (LTV) pro lepší rozhodování.</p>
              </div>
            </div>
          </section>

          <section className="feature-cta">
            <h2>Zaujal vás CRM systém?</h2>
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
