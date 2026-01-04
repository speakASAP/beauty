'use client'

import Link from 'next/link'
import '../globals.css'
import './salon2.css'

export default function Salon2() {
  return (
    <div className="salon-landing salon-aurora">
      {/* Navigation */}
      <nav className="salon-nav">
        <div className="container">
          <a href="/salon2" className="nav-logo">Aurora Hair Studio</a>
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

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="flowing-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">PREMIUM HAIR STUDIO</div>
            <h1 className="hero-title">
              Aurora
              <br />
              <span className="hero-title-accent">Hair Studio</span>
            </h1>
            <p className="hero-subtitle">
              Elegance, která vás oslní. Profesionální péče o vlasy s důrazem na detail a jedinečný styl. Vaše krása v novém světle.
            </p>
            <div className="hero-cta">
              <a href="#booking" className="btn btn-primary">
                Vytvořit rezervaci
              </a>
              <a href="#services" className="btn btn-secondary">
                Objevte naše služby
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">O nás</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-content">
            <div className="about-image">
              <div className="image-wrapper">
                <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp" alt="Aurora Hair Studio" />
                <div className="image-overlay"></div>
              </div>
            </div>
            <div className="about-text">
              <p className="lead-text">
                Aurora Hair Studio – místo, kde se vaše krása probouzí a září v plné síle.
              </p>
              <p>
                Každý účes je umělecké dílo. Každá barva je příběh. Každá návštěva je zážitek. Naše studio kombinuje nejnovější techniky s tradičním řemeslem, abychom vám přinesli výsledek, který předčí vaše očekávání.
              </p>
              <p>
                Jsme tým vášnivých profesionálů, kteří věří, že každá žena si zaslouží vypadat a cítit se jako královna. Vaše sebevědomí je naší prioritou.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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

      {/* Why Choose Us */}
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
              <div className="why-icon">🌟</div>
              <h3>Atmosféra</h3>
              <p>Aurora Hair Studio není jen salon krásy, ale místo, kde se zastaví čas. Příjemná hudba, vůně čaje, teplé úsměvy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Zkušenosti zákazníků</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Děkuji za skvělý servis. Skvělá kadeřnice, velmi milá a přátelská, profesionálka ve svém oboru. Ostříhala mě velmi pečlivě a krásně, přesně jak jsem chtěla. Vřele doporučuji."
              </p>
              <p className="testimonial-author">Tatiana Titorenko</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Nejednou jsem využila služby Aurora Hair Studio a jsem velmi spokojená!!! Kvalita produktů a úroveň provedení práce je vždy na vysoké úrovni!!!"
              </p>
              <p className="testimonial-author">Tatiana Kravčuk</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Děkuji kadeřnici za skvělou práci! Je to velmi příjemná a laskavá dívka. Vřele ji doporučuji!"
              </p>
              <p className="testimonial-author">Tatiana Dudčenko</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Booking */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Kontakty</h2>
              <div className="contact-item">
                <strong>Adresa:</strong>
                <p>Masarykovo náměstí 45<br />Kroměříž, 767 01</p>
              </div>
              <div className="contact-item">
                <strong>Telefon:</strong>
                <p><a href="tel:+420776886467">+420 776 886 467</a></p>
              </div>
              <div className="contact-item">
                <strong>Email:</strong>
                <p><a href="mailto:info@aurorastudio.cz">info@aurorastudio.cz</a></p>
              </div>
              <div className="contact-item">
                <strong>Otevírací doba:</strong>
                <p>Po - Pá: 9:00 - 19:00<br />So: 9:00 - 16:00<br />Ne: Zavřeno</p>
              </div>
            </div>
            <div id="booking" className="booking-form">
              <h2>Vytvořit rezervaci</h2>
              <form className="booking-form-content">
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
                <button type="submit" className="btn btn-primary btn-large">
                  Odeslat rezervaci
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
            <p className="footer-copyright">
              Aurora Hair Studio © 2026 Všechna práva vyhrazena
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
