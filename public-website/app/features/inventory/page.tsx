import Link from 'next/link'
import '../../franchise.css'

export default function InventoryFeature() {
  return (
    <div className="feature-page">
      <div className="feature-hero">
        <div className="container">
          <Link href="/" className="back-link">← Zpět na hlavní stránku</Link>
          <div className="feature-icon-large">📦</div>
          <h1>Sklad & Inventura</h1>
          <p className="feature-hero-subtitle">
            Kompletní správa zásob, automatické upozornění a reporty
          </p>
        </div>
      </div>

      <div className="feature-content">
        <div className="container">
          <section className="feature-section">
            <h2>Správa zásob</h2>
            <p>
              Automatická správa skladu, která vám ušetří čas a peníze. Sledujte zásoby v reálném čase,
              dostávejte upozornění na nízké zásoby a automaticky aktualizujte inventuru při prodeji.
            </p>
            <ul className="feature-list">
              <li>✅ Real-time sledování zásob</li>
              <li>✅ Automatické upozornění na nízké zásoby</li>
              <li>✅ Inventura a skladové pohyby</li>
              <li>✅ Správa dodavatelů</li>
              <li>✅ Reporty a analýzy</li>
              <li>✅ Integrace s POS systémem</li>
            </ul>
          </section>

          <section className="feature-section">
            <h2>Klíčové funkce</h2>
            <div className="feature-grid-small">
              <div className="feature-card-small">
                <h3>Automatická aktualizace</h3>
                <p>Zásoby se automaticky aktualizují při každém prodeji. Žádné ruční zadávání.</p>
              </div>
              <div className="feature-card-small">
                <h3>Upozornění</h3>
                <p>Automatická upozornění na nízké zásoby. Nastavitelné prahové hodnoty pro každý produkt.</p>
              </div>
              <div className="feature-card-small">
                <h3>Inventura</h3>
                <p>Snadná inventura zásob. Porovnání skutečného stavu s evidovaným. Automatické opravy.</p>
              </div>
              <div className="feature-card-small">
                <h3>Reporty</h3>
                <p>Detailní reporty o pohybech zásob, obratech a hodnotě skladu.</p>
              </div>
            </div>
          </section>

          <section className="feature-cta">
            <h2>Zaujal vás systém skladu?</h2>
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
