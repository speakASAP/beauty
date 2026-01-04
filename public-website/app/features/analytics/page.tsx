import Link from 'next/link'
import '../../franchise.css'

export default function AnalyticsFeature() {
  return (
    <div className="feature-page">
      <div className="feature-hero">
        <div className="container">
          <Link href="/" className="back-link">← Zpět na hlavní stránku</Link>
          <div className="feature-icon-large">📊</div>
          <h1>Analytika & Reporty</h1>
          <p className="feature-hero-subtitle">
            Real-time metriky, tržby, využití kapacit a LTV klientů
          </p>
        </div>
      </div>

      <div className="feature-content">
        <div className="container">
          <section className="feature-section">
            <h2>Business Intelligence</h2>
            <p>
              Kompletní analytika vašeho beauty salonu. Real-time metriky, které vám pomohou
              lépe rozhodovat a růst. Všechna data na jednom místě.
            </p>
            <ul className="feature-list">
              <li>✅ Real-time tržby a marže</li>
              <li>✅ Využití kapacit (staff / time slots)</li>
              <li>✅ LTV (Life Time Value) klientů</li>
              <li>✅ Reporty podle služeb a produktů</li>
              <li>✅ Srovnání časových období</li>
              <li>✅ Export dat pro další analýzy</li>
            </ul>
          </section>

          <section className="feature-section">
            <h2>Klíčové metriky</h2>
            <div className="feature-grid-small">
              <div className="feature-card-small">
                <h3>Tržby</h3>
                <p>Denní, týdenní, měsíční tržby. Srovnání s předchozími obdobími. Trendy a prognózy.</p>
              </div>
              <div className="feature-card-small">
                <h3>Využití kapacit</h3>
                <p>Kolik času je skutečně využito. Optimalizace rozvrhu a zvýšení efektivity.</p>
              </div>
              <div className="feature-card-small">
                <h3>LTV klientů</h3>
                <p>Životní hodnota každého klienta. Identifikace nejhodnotnějších klientů.</p>
              </div>
              <div className="feature-card-small">
                <h3>Top služby</h3>
                <p>Nejprodávanější služby a produkty. Analýza ziskovosti jednotlivých položek.</p>
              </div>
            </div>
          </section>

          <section className="feature-cta">
            <h2>Zaujala vás analytika?</h2>
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
