import Link from 'next/link'
import '../../franchise.css'

export default function POSFeature() {
  return (
    <div className="feature-page">
      <div className="feature-hero">
        <div className="container">
          <Link href="/" className="back-link">← Zpět na hlavní stránku</Link>
          <div className="feature-icon-large">💳</div>
          <h1>POS Systém</h1>
          <p className="feature-hero-subtitle">
            Kompletní řešení pro prodej služeb a produktů ve vašem beauty salonu
          </p>
        </div>
      </div>

      <div className="feature-content">
        <div className="container">
          <section className="feature-section">
            <h2>Prodej služeb a produktů</h2>
            <p>
              Moderní POS systém navržený speciálně pro beauty salony. Rychlý a intuitivní prodej,
              který vám ušetří čas a zvýší spokojenost klientů.
            </p>
            <ul className="feature-list">
              <li>✅ Rychlý prodej služeb a produktů</li>
              <li>✅ Integrovaný platební terminál</li>
              <li>✅ Tisk účtenek a faktur</li>
              <li>✅ Správa cen a slev</li>
              <li>✅ Historie všech transakcí</li>
              <li>✅ Export do účetních systémů</li>
            </ul>
          </section>

          <section className="feature-section">
            <h2>Klíčové funkce</h2>
            <div className="feature-grid-small">
              <div className="feature-card-small">
                <h3>Rychlý checkout</h3>
                <p>Prodej během několika kliknutí. Optimalizováno pro tablety a dotykové obrazovky.</p>
              </div>
              <div className="feature-card-small">
                <h3>Platební integrace</h3>
                <p>Podpora platebních karet, hotovosti a bezkontaktních plateb. Integrace se Stripe a českými bankami.</p>
              </div>
              <div className="feature-card-small">
                <h3>Automatické účtování</h3>
                <p>Automatické vytváření faktur a účtenek. Export do Money S3, Pohoda, ABRA, Fakturama.</p>
              </div>
              <div className="feature-card-small">
                <h3>Real-time inventura</h3>
                <p>Automatická aktualizace skladu při prodeji. Okamžité upozornění na nízké zásoby.</p>
              </div>
            </div>
          </section>

          <section className="feature-cta">
            <h2>Zaujal vás POS systém?</h2>
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
