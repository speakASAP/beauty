'use client'

import Link from 'next/link'
import '../globals.css'
import '../salon3/salon3.css'

interface TenantInfo {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  design: string
}

interface Salon3DesignProps {
  tenant: TenantInfo
}

export default function Salon3Design({ tenant }: Salon3DesignProps) {
  const salonName = tenant.name || 'Serenity Beauty Lounge'
  const tenantId = tenant.id
  const nameParts = salonName.split(' ')
  const firstName = nameParts[0]
  const restName = nameParts.slice(1).join(' ')

  return (
    <div className="salon-landing salon-serenity">
      <nav className="salon-nav">
        <div className="container">
          <a href={`/salon?tenant_id=${tenantId}`} className="nav-logo">{salonName}</a>
          <div className="nav-links">
            <a href="#about">O nás</a>
            <a href="#services">Služby</a>
            <a href="#pricing">Ceník</a>
            <a href="#testimonials">Zkušenosti</a>
            <a href="#contact">Kontakty</a>
            <a href="#booking" className="btn-booking">Rezervace</a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-background">
          <div className="organic-shapes">
            <div className="organic organic-1"></div>
            <div className="organic organic-2"></div>
            <div className="organic organic-3"></div>
            <div className="organic organic-4"></div>
          </div>
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">PREMIUM BEAUTY LOUNGE</div>
            <h1 className="hero-title">
              {firstName}
              <br />
              <span className="hero-title-accent">{restName}</span>
            </h1>
            <p className="hero-subtitle">
              Sophisticated elegance meets natural beauty. Oáza klidu a luxusu, kde se vaše krása probouzí v nejjemnější podobě.
            </p>
            <div className="hero-cta">
              <a href="#booking" className="btn btn-primary">Vytvořit rezervaci</a>
              <a href="#services" className="btn btn-secondary">Prozkoumat služby</a>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">O nás</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-content">
            <div className="about-text">
              <p className="lead-text">{salonName} – místo, kde se setkává sofistikovaná elegance s přirozenou krásou.</p>
              <p>Každý detail má svůj význam. Každý dotek je promyšlený. Každá návštěva je zážitek, který vás posune blíže k vašemu ideálnímu já. Naše lounge kombinuje nejnovější trendy s nadčasovou elegancí.</p>
              <p>Jsme tým odborníků, kteří chápou, že skutečná krása vychází zevnitř. Naším cílem je zdůraznit vaši přirozenou krásu a dodat vám sebevědomí, které si zasloužíte.</p>
            </div>
            <div className="about-image">
              <div className="image-wrapper">
                <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp" alt={salonName} />
                <div className="image-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Naše služby</h2>
            <p className="section-subtitle">Profesionální péče o vaši krásu</p>
          </div>
          <div className="services-category">
            <h3 className="category-title">Zasvětlující techniky</h3>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/brazilian-bleach.webp" alt="Brazilian Bleach" />
                </div>
                <div className="service-content">
                  <h4>Brazilian Bleach</h4>
                  <p>Technika Brazilian Bleach je jedinečný způsob, jak vytvořit jemný kontrast mezi tmavšími a světlejšími prameny. Díky harmonickému propojení odstínů vzniká přirozený, plynulý přechod barev.</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/airtouch.webp" alt="Airtouch" />
                </div>
                <div className="service-content">
                  <h4>Airtouch</h4>
                  <p>Tato moderní technika přináší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="services-category">
            <h3 className="category-title">Péče</h3>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/laminovani.webp" alt="Laminování vlasů" />
                </div>
                <div className="service-content">
                  <h4>Laminování vlasů</h4>
                  <p>Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření! Bez peroxidu, amoniaku a jiných agresivních látek.</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/rekonstrukce.webp" alt="Rekonstrukce vlasů" />
                </div>
                <div className="service-content">
                  <h4>Rekonstrukce vlasů</h4>
                  <p>Rekonstrukce vrací vlasům zdraví, pružnost a vitalitu. Díky vylepšenému a naprosto bezpečnému složení profesionální péče se stav vlasů viditelně zlepší už po první aplikaci!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Proč si vybrat právě nás?</h2>
          </div>
          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon">🛡️</div>
              <h3>Bezpečí</h3>
              <p>Profesionalita začíná u detailů: dokonale čisté nástroje, bezpečné produkty a ohleduplný přístup.</p>
            </div>
            <div className="why-item">
              <div className="why-icon">💬</div>
              <h3>Otevřenost</h3>
              <p>Každá služba začíná konzultací. Vysvětlíme vám postup, cenu i složení používané kosmetiky.</p>
            </div>
            <div className="why-item">
              <div className="why-icon">✨</div>
              <h3>Sebevědomí</h3>
              <p>Víme, že krása je v jedinečnosti. Pomůžeme vám objevit svůj styl a zdůraznit vaše přednosti.</p>
            </div>
            <div className="why-item">
              <div className="why-icon">🌿</div>
              <h3>Atmosféra</h3>
              <p>{salonName} není jen salon krásy, ale místo, kde se zastaví čas. Příjemná hudba, vůně čaje, teplé úsměvy.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Zkušenosti zákazníků</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"Děkuji za skvělý servis. Skvělá kadeřnice, velmi milá a přátelská, profesionálka ve svém oboru. Ostříhala mě velmi pečlivě a krásně, přesně jak jsem chtěla. Vřele doporučuji."</p>
              <p className="testimonial-author">Tatiana Titorenko</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"Nejednou jsem využila služby {salonName} a jsem velmi spokojená!!! Kvalita produktů a úroveň provedení práce je vždy na vysoké úrovni!!!"</p>
              <p className="testimonial-author">Tatiana Kravčuk</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"Děkuji kadeřnici za skvělou práci! Je to velmi příjemná a laskavá dívka. Vřele ji doporučuji!"</p>
              <p className="testimonial-author">Tatiana Dudčenko</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Kontakty</h2>
              {tenant.address && (
                <div className="contact-item">
                  <strong>Adresa:</strong>
                  <p>{tenant.address}</p>
                </div>
              )}
              {tenant.phone && (
                <div className="contact-item">
                  <strong>Telefon:</strong>
                  <p><a href={`tel:${tenant.phone}`}>{tenant.phone}</a></p>
                </div>
              )}
              {tenant.email && (
                <div className="contact-item">
                  <strong>Email:</strong>
                  <p><a href={`mailto:${tenant.email}`}>{tenant.email}</a></p>
                </div>
              )}
              <div className="contact-item">
                <strong>Otevírací doba:</strong>
                <p>Po - Pá: 10:00 - 19:00<br />So: 10:00 - 17:00<br />Ne: Zavřeno</p>
              </div>
            </div>
            <div id="booking" className="booking-form">
              <h2>Vytvořit rezervaci</h2>
              <form className="booking-form-content" onSubmit={(e) => {
                e.preventDefault()
                window.location.href = `/book?tenant_id=${tenantId}`
              }}>
                <div className="form-group">
                  <label>Jméno a příjmení *</label>
                  <input type="text" required placeholder="Vaše jméno" />
                </div>
                <div className="form-group">
                  <label>Telefon *</label>
                  <input type="tel" required placeholder="+420 123 456 789" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required placeholder="vas@email.cz" />
                </div>
                <div className="form-group">
                  <label>Služba *</label>
                  <select required>
                    <option value="">Vyberte službu</option>
                    <option value="strih">Střih</option>
                    <option value="barveni">Barvení</option>
                    <option value="pece">Péče o vlasy</option>
                    <option value="makeup">Make-up</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Datum a čas *</label>
                  <input type="datetime-local" required />
                </div>
                <button type="submit" className="btn btn-primary btn-large">Odeslat rezervaci</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="salon-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#about">O nás</a>
              <a href="#services">Služby</a>
              <a href="#pricing">Ceník</a>
              <a href="#testimonials">Zkušenosti</a>
              <a href="#contact">Kontakty</a>
            </div>
            <p className="footer-copyright">{salonName} © 2026 Všechna práva vyhrazena</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
