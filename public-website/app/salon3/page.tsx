'use client'

import Link from 'next/link'
import '../globals.css'
import './salon3.css'

interface TenantInfo {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  state: string
  design_theme: string
}

export default function Salon3({ tenantInfo }: { tenantInfo: TenantInfo }) {
  const salonName = tenantInfo?.name || 'Coral Bloom'
  const phone = tenantInfo?.phone || '+420 776 886 466'
  const address = tenantInfo?.address || 'Križná 169/8, Kroměříž'
  const hours = 'Po–Pá: 09:00–19:00, So: 10:00–16:00'
  return (
    <div className="salon-landing salon3">
      {/* Navigation */}
      <nav className="salon-nav">
        <div className="container">
          <div className="nav-content">
            <a href={`/?tenant_id=${tenantInfo?.id}`} className="nav-logo">{salonName}</a>
            <div className="nav-links">
              <a href="#services">Služby</a>
              <a href="#about">O nás</a>
              <a href="#testimonials">Recenze</a>
              <a href="#contact">Kontakt</a>
            </div>
            <a href={`/book?tenant_id=${tenantInfo?.id}`} className="btn-booking">Rezervace</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-waves">
          <svg className="wave wave-top" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,0 L0,0 Z" fill="currentColor"></path>
          </svg>
          <svg className="wave wave-bottom" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,20 600,100 900,60 C1050,40 1150,80 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-tagline">Kosmetický Salon</div>
              <h1 className="hero-title">
                {salonName}
                <span className="title-subtitle">Hair Space & Spa</span>
              </h1>
              <p className="hero-subtitle">
                Vaše krása si zaslouží zazářit. My víme, jak na to. Odvážné mikádo, nová energie, dokonalé svatební fotografie. První rande, na kterém se cítíte jako královna. Účes, který vám opravdu sluší!
              </p>
              <div className="hero-cta">
                <a href={`/book?tenant_id=${tenantInfo?.id}`} className="btn btn-primary">
                  Vytvořit rezervaci
                </a>
                <a href="#services" className="btn btn-secondary">
                  Naše služby
                </a>
              </div>
            </div>
            <div className="hero-image">
              <div className="image-container">
                <div className="wave-decoration wave-dec1"></div>
                <div className="wave-decoration wave-dec2"></div>
                <img 
                  src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp" 
                  alt="{salonName} Salon"
                  className="hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Bar */}
      <section className="contact-bar">
        <div className="container">
          <div className="contact-items">
            <div className="contact-item">
              <div className="contact-icon-circle">
                <span className="contact-icon">📞</span>
              </div>
              <div className="contact-details">
                <span className="contact-label">Telefon</span>
                <span className="contact-value">{phone}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon-circle">
                <span className="contact-icon">📍</span>
              </div>
              <div className="contact-details">
                <span className="contact-label">Adresa</span>
                <span className="contact-value">{address}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon-circle">
                <span className="contact-icon">🕐</span>
              </div>
              <div className="contact-details">
                <span className="contact-label">Otevírací doba</span>
                <span className="contact-value">Po–Pá: 09:00–19:00, So: 10:00–16:00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-wave-top">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,20 900,60 C1050,80 1150,40 1200,60 L1200,0 L0,0 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Zasvětlujicí techniky</h2>
            <p className="section-subtitle">Profesionální služby pro vaši krásu</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-image-container">
                <img 
                  src="https://yaraspace.cz/wp-content/uploads/2025/05/brazilian-bleach.webp" 
                  alt="Brazilian Bleach"
                  className="service-img"
                />
                <div className="service-wave-overlay"></div>
              </div>
              <div className="service-content">
                <h3>Brazilian Bleach</h3>
                <p>Technika Brazilian Bleach je jedinečný způsob, jak vytvořit jemný kontrast mezi tmavšími a světlejšími prameny. Diky harmonickému propojení odstín: například tmavě blond a světle karamelové vzniká přírozený, plynulý přechod barev.</p>
              </div>
            </div>
            <div className="service-card">
              <div className="service-image-container">
                <img 
                  src="https://yaraspace.cz/wp-content/uploads/2025/05/airtouch.webp" 
                  alt="Airtouch"
                  className="service-img"
                />
                <div className="service-wave-overlay"></div>
              </div>
              <div className="service-content">
                <h3>Airtouch</h3>
                <p>Tato moderní technika přínáší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé.</p>
              </div>
            </div>
            <div className="service-card">
              <div className="service-image-container">
                <img 
                  src="https://yaraspace.cz/wp-content/uploads/2025/05/laminovani-vlasu.webp" 
                  alt="Laminování vlasů"
                  className="service-img"
                />
                <div className="service-wave-overlay"></div>
              </div>
              <div className="service-content">
                <h3>Laminování vlasů</h3>
                <p>Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření! Bez peroxidu, amoniaku a jiných agresivních látek vytváří na každém vlasu hladký a průhledný film.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-wave-bottom">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,20 600,100 900,60 C1050,40 1150,80 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="why-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Proč si vybrat právě nás?</h2>
          </div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-container">
                <div className="why-icon">🛡️</div>
              </div>
              <h3>Bezpečí</h3>
              <p>Profesionalita začíná u detailů: dokonale čisté nástroje, bezpečné produkty a ohleduplný přístup. Náš salon je místem, kde se můžete uvolnit a vychutnat si příjemnou atmosféru s jistotou, že vaše krása je v dobrých rukou.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-container">
                <div className="why-icon">💬</div>
              </div>
              <h3>Otevřenost</h3>
              <p>Každá služba ať už jde o líčení, střih nebo regeneraci vlasů začíná konzultací. Vysvětlíme vám postup, cenu i složení používané kosmetiky, poradíme, jak si účes upravit doma.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-container">
                <div className="why-icon">✨</div>
              </div>
              <h3>Sebevědomí</h3>
              <p>Víme, že krása je v jedinečnosti. Pomůžeme vám objevit svůj styl, zdůraznit vaše přednosti a cítit se skvěle ve své kůži. Ať už hledáte nový střih, barvu, slavnostní účes nebo svatební make-up.</p>
            </div>
            <div className="why-card">
              <div className="why-icon-container">
                <div className="why-icon">🌺</div>
              </div>
              <h3>Atmosféra</h3>
              <p>{salonName} není jen salon krásy, ale místo, kde se zastaví čas. Příjemná hudba, vůně čaje, teplé úsměvy a pohodová konverzace - každý detail vytváří atmosféru, do které se budete chtít vracet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-wave-top">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,20 900,60 C1050,80 1150,40 1200,60 L1200,0 L0,0 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Zkušenosti zákazníků</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <div className="testimonial-stars">★★★★★</div>
              </div>
              <div className="testimonial-quote-mark">"</div>
              <p className="testimonial-text">Děkuji za skvělý servis. Skvělá kadeřnice, velmi milá a přátelská, profesionálka ve svém oboru. Ostrihala mě velmi pečlivě a krásně, přesně jak jsem chtěla. Vřele doporučuji.</p>
              <div className="testimonial-author">Tatiana Titorenko</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <div className="testimonial-stars">★★★★★</div>
              </div>
              <div className="testimonial-quote-mark">"</div>
              <p className="testimonial-text">Kvalita produktů a úroveň provedení práce je vždy na vysoké úrovni!!! Kadeřnice vždy chápe potřeby a přání zákazníka, je v dobré náladě a má pozitivní přístup ke každému klientovi.</p>
              <div className="testimonial-author">Tatiana Kravčuk</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <div className="testimonial-stars">★★★★★</div>
              </div>
              <div className="testimonial-quote-mark">"</div>
              <p className="testimonial-text">Práce byla provedena na nejvyšší úrovni – velmi pečlivě, kvalitně a s důrazem na detaily. Je vidět, že tato osoba miluje svou profesi a vkládá do své práce srdce. Výsledek předčil všechna očekávání!</p>
              <div className="testimonial-author">Marina Vološko</div>
            </div>
          </div>
        </div>
        <div className="section-wave-bottom">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,20 600,100 900,60 C1050,40 1150,80 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section id="booking" className="cta-section">
        <div className="cta-waves">
          <svg className="wave wave-cta-top" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,80 600,20 900,60 C1050,80 1150,40 1200,60 L1200,0 L0,0 Z" fill="currentColor"></path>
          </svg>
          <svg className="wave wave-cta-bottom" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,20 600,100 900,60 C1050,40 1150,80 1200,60 L1200,120 L0,120 Z" fill="currentColor"></path>
          </svg>
        </div>
        <div className="container">
          <div className="cta-content">
            <h2>Připraveni začít?</h2>
            <p>Rezervujte si termín ještě dnes a objevte svou krásu</p>
            <a href={`/book?tenant_id=${tenantInfo?.id}`} className="btn btn-primary btn-large">Vytvořit rezervaci</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="salon-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>{salonName}</h4>
              <p>Hair Space & Spa</p>
            </div>
            <div className="footer-section">
              <h4>Kontakt</h4>
              <p>{phone}</p>
              <p>{address}</p>
            </div>
            <div className="footer-section">
              <h4>Otevírací doba</h4>
              <p>Po–Pá: 09:00–19:00</p>
              <p>So: 10:00–16:00</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 {salonName}. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
