'use client'

import Link from 'next/link'
import '../globals.css'
import './yaraspace.css'

export default function YaraSpace() {
  return (
    <div className="salon-landing salon-yaraspace">
      {/* Navigation */}
      <nav className="salon-nav">
        <div className="container">
          <a href="/yaraspace" className="nav-logo">Yara Space & Hair Spa</a>
          <div className="nav-links">
            <a href="#about">O nás</a>
            <a href="#blog">Blog</a>
            <a href="#services">Služby</a>
            <a href="#pricing">Ceník</a>
            <a href="#testimonials">Zkušenosti</a>
            <a href="#contact">Kontakty</a>
            <a href="#booking" className="btn-booking">Vytvořit rezervaci</a>
          </div>
          <div className="nav-contact">
            <a href="tel:+420776886466" className="nav-phone">+420 776 886 466</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp" alt="Yara Space & Hair Spa" className="hero-image" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">KOSMETICKÝ SALON</div>
            <h1 className="hero-title">
              Yara
              <br />
              <span className="hero-title-line2">Hair</span>
            </h1>
            <div className="hero-subtitle-section">
              <h2 className="hero-subtitle-title">
                Space &
                <br />
                Spa
              </h2>
              <div className="hero-subtitle-badge">Vlasový Wellness</div>
            </div>
            <p className="hero-description">
              Yara Space & Hair Spa – to je vaše dobrá nálada, sebevědomí a ten pocit, že jste to vy, jen ještě krásnější. Odvážné mikádo, nová energie, dokonalé svatební fotografie. První rande, na kterém se citíte jako královna. Účes, který vám opravdu sluší! Za tím vším stojí lidé, kteří milují svou práci a dělají ji srdcem. Jsem tým profesionálů, který vidí krásu v každém a ví, jak ji zvýraznit. Vaše krása si zaslouží zazářit. My víme, jak na to.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <h2 className="newsletter-title">Sledujte novinky a propagační akce!</h2>
          <button className="newsletter-btn">Přihlaste se k odběru newsletteru</button>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          {/* Zasvětlující techniky */}
          <div className="services-category">
            <a href="#services" className="category-link">
              <h2 className="category-title">Zasvětlujicí techniky</h2>
            </a>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/brazilian-bleach.webp" alt="Brazilian bleach" />
                </div>
                <div className="service-content">
                  <h3>Brazilian bleach</h3>
                  <p>Technika Brazilian Bleach je jedinečný způsob, jak vytvořit jemný kontrast mezi tmavšími a světlejšími prameny. Diky harmonickému propojení odstín: například tmavě blond a světle karamelové vzniká přírozený, plynulý přechod barev. Tento styl barvení je vhodný pro světlé i tmavé vlasy, podtrhuje hloubku základního tónua vytváří efekt přirozené hry světla po...</p>
                  <a href="#services" className="service-link">Go to Brazilian bleach</a>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/airtouch.webp" alt="Airtouch" />
                </div>
                <div className="service-content">
                  <h3>Airtouch</h3>
                  <p>Tato moderní technika přínáší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé. Kadeřník vybere odstín, který dokonale ladí s vaším přirozeným tónem a zvýrazní krásu vašich vlasů. Šetrné složení jemně zesvětluje prameny, nepoškozuje jejich strukturu a zachovává pružnost i přirozený...</p>
                  <a href="#services" className="service-link">Go to Airtouch</a>
                </div>
              </div>
            </div>
          </div>

          {/* Péče */}
          <div className="services-category">
            <a href="#services" className="category-link">
              <h2 className="category-title">Péče</h2>
            </a>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/laminovani.webp" alt="Laminování vlasů" />
                </div>
                <div className="service-content">
                  <h3>Laminování vlasů</h3>
                  <p>Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření! Bez peroxidu, amoniaku a jiných agresivních látek vytváří na každém vlasu hladký a průhledný film, který mu dodává neuvěřitelný lesk a zdravý vzhled. Přípravek je univerzální a vhodný pro všechny typy vlasů. Přírodní, naprosto bezpečné složení pro laminaci...</p>
                  <a href="#services" className="service-link">Go to Laminování vlasů</a>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/rekonstrukce.webp" alt="Rekonstrukce vlasů" />
                </div>
                <div className="service-content">
                  <h3>Rekonstrukce vlasů</h3>
                  <p>Rekonstrukce vrací vlasům zdraví, pružnost a vitalitu. Díky vylepšenému a naprosto bezpečnému složení profesionální péče Philip Martin's se stav vlasů viditelně zlepší už po první aplikaci! Tato produkce je ideální pro zesvětlené i poškozené vlasy. Unikátní receptura obsahuje přírodní rostlinné keratiny, které jsou účinné pro vlasy a jsou šetrné nejen...</p>
                  <a href="#services" className="service-link">Go to Rekonstrukce vlasů</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Zkušenosti zákazníků</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Děkuji za skvělý servis. Skvělá kadeřnice, velmi milá a přátelská, profesionálka ve svém oboru. Ostrihala mě velmi pečlivě a krásně, přesně jak jsem chtěla. Vřele doporučuji.</p>
              <p className="testimonial-author">Tatiana Titorenko</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Nejednou jsem využila služby "Yara Spase & Hair Spa Vlasový Welness" a jsem velmi spokojená!!! Kvalita produktů a úroveň provedení práce je vždy na vysoké úrovni!!! Kadeřnice vždy chápe potřeby a přání zákazníka, je v dobré náladě a má pozitivní přístup ke každému klientovi. Vždy poradí, podpoří a udělá vše co nejlépe.Široký výběr procedur pro péči o vlasy, regenerace poškozených vlasů, používají se pouze přírodní složky.Salon je snadno dostupný, nachází se v prvním patře, je přístupný i pro kočárky, což usnadňuje návštěvu maminkám s malými dětmi. Vřele doporučuji!</p>
              <p className="testimonial-author">Tatiana Kravčuk</p>
              <a href="#" className="testimonial-read-more">Читать далее</a>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Děkuji kadeřnici za skvělou práci! Je to velmi příjemná a laskavá dívka. Vřele ji doporučuji!</p>
              <p className="testimonial-author">Tatiana Dudčenko</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Dnes jsem byla v tomto salonu, kadeřnice byla velmi příjemná 🥰. Všechno se mi moc líbilo 😍, výsledek je skvělý 👍. Pokud chcete krásnou barvu vlasů, střih nebo péči, doporučuji 🤗!</p>
              <p className="testimonial-author">Sofie</p>
              <a href="#" className="testimonial-read-more">Читать далее</a>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Chci zanechat recenzi na tento úžasný kadeřnický salon a zejména na kadeřnici! Práce byla provedena na nejvyšší úrovni – velmi pečlivě, kvalitně a s důrazem na detaily. Je vidět, že tato osoba miluje svou profesi a vkládá do své práce srdce. Výsledek předčil všechna očekávání!Také bych chtěla vyzdvihnout dostupné ceny, které dělají návštěvu této kadeřnice ještě příjemnější. Pokud hledáte profesionála, kterému můžete svěřit svůj účes, vřele doporučuji! Určitě budete spokojeni!</p>
              <p className="testimonial-author">Marina Vološko</p>
              <a href="#" className="testimonial-read-more">Читать далее</a>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Velmi dobrá kadeřnice, milá a přátelská dívka, která odvedla skvělou práci.</p>
              <p className="testimonial-author">Lesja Sochanič</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Pomohli mi vybrat domácí péči, která se mi moc líbila.</p>
              <p className="testimonial-author">Ilona Trubina</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Mír a lásku všem! Nechali jsme ostříhat naše dva syny, 9 a 19 let. Kadeřnice Jaroslava odvedla skvělou práci a proměnila sny chlapců ve skutečnost. Děkujeme vám za váš profesionalismus!!! Příště určitě znovu využijeme vašich služeb!</p>
              <p className="testimonial-author">Alexandr Andrievskij</p>
              <a href="#" className="testimonial-read-more">Читать далее</a>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Nabarvila jsem si své dlouhé vlasy s šedinami barvou Filip Martin. Příjemně mě překvapila barva a lesk. Vlasy se vyživily oleji, zhoustly a změkly. Objem copu se znatelně zvětšil. Navíc při růstu kořínků není přechod viditelný (vybrali jsme odstín barvy podle mého přirozeného tónu vlasů). Celkově jsem velmi spokojená a chci to zopakovat. Vlasy vypadají zdravě a upraveně, a kadeřnice Jaroslava byla pozorná a snažila se dosáhnout co nejlepšího výsledku. Všem doporučuji tento nový kadeřnický salon!</p>
              <p className="testimonial-author">Zel</p>
              <a href="#" className="testimonial-read-more">Читать далее</a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <h2 className="section-title">Proč si vybrat právě nás?</h2>
          <div className="why-grid">
            <div className="why-item">
              <h3>Bezpečí</h3>
              <p>Profesionalita začíná u detailů: dokonale čisté nástroje, bezpečné produkty a ohleduplný přístup. Náš salon je mistem, kde se můžete uvolnit a vychutnat si příjemnou atmosférus jistotou, že vaše krása je v dobrých rukou.</p>
            </div>
            <div className="why-item">
              <h3>Otevřenost</h3>
              <p>Každá služba ať už jde o líčení, střih nebo regeneraci vlasů začíná konzultaci. Vysvětlíme vám postup, cenu i složení používané kosmetiky, poradíme, jak si účes upravit doma, a doporučíme produkty, které vám péči usnadní. Jsme tu, abychom naslouchali vašim přáním a podpořili i ty nejodvážnější nápady.</p>
            </div>
            <div className="why-item">
              <h3>Sebevědomí</h3>
              <p>Víme, že krása je v jedinečnosti. Pomůžeme vám objevit svůj styl, zdůraznit vaše přednosti a cítit se skvěle ve své kůži. Ať už hledáte nový střih, barvu, slavnostní účes nebo svatební make-up naši stylisté se postarají o to, abyste zářili sebejistotou.</p>
            </div>
            <div className="why-item">
              <h3>Atmosféra</h3>
              <p>Yara Space & Hair Spa není jen salon krásy, ale místo, kde se zastaví čas. Příjemná hudbag vůně čaje, teplé úsměvy a pohodová konverzace - každý detail vytváří atmosféru, do které se budete chtit vracet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="salon-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_logo.webp" alt="Yara Space & Hair Spa Logo" />
            </div>
            <div className="footer-social">
              <a href="https://www.instagram.com/yaraspace_hairspa" target="_blank" rel="noopener noreferrer">
                <img src="/instagram-icon.svg" alt="Instagram" />
              </a>
              <a href="https://www.facebook.com/people/Yara-Space-Hair-Spa/61566509807038/" target="_blank" rel="noopener noreferrer">
                <img src="/facebook-icon.svg" alt="Facebook" />
              </a>
              <a href="http://wa.me/420776886466" target="_blank" rel="noopener noreferrer">
                <img src="/whatsapp-icon.svg" alt="WhatsApp" />
              </a>
            </div>
            <nav className="footer-nav">
              <a href="#about">O nás</a>
              <a href="#blog">Blog</a>
              <a href="#services">Služby</a>
              <a href="#pricing">Ceník</a>
              <a href="#testimonials">Zkušenosti</a>
              <a href="#contact">Kontakty</a>
            </nav>
            <div className="footer-bottom">
              <p>Yara Space & Hair Spa © 2026</p>
              <p>Všechna práva vyhrazena</p>
              <p>Vývoj a podpora - <a href="https://twox.pro/" target="_blank" rel="noopener noreferrer">TwoX</a></p>
              <a href="/privacy/">Zásady ochrany osobních údajů</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
