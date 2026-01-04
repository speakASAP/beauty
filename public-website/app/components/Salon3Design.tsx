'use client'

import Link from 'next/link'
import '../globals.css'

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
    <div className="min-h-screen bg-light salon-landing">
      <nav className="bg-base/95 backdrop-blur-sm border-b border-borderLight sticky top-0 z-[100] shadow-sm py-5">
        <div className="container flex justify-between items-center">
          <a href={`/salon?tenant_id=${tenantId}`} className="text-2xl font-bold font-heading text-dark">{salonName}</a>
          <div className="flex gap-8 items-center">
            <a href="#about" className="text-soft font-medium hover:text-accent transition-colors">O nás</a>
            <a href="#services" className="text-soft font-medium hover:text-accent transition-colors">Služby</a>
            <a href="#pricing" className="text-soft font-medium hover:text-accent transition-colors">Ceník</a>
            <a href="#testimonials" className="text-soft font-medium hover:text-accent transition-colors">Zkušenosti</a>
            <a href="#contact" className="text-soft font-medium hover:text-accent transition-colors">Kontakty</a>
            <a href="#booking" className="btn btn-primary">Rezervace</a>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[90vh] flex items-center justify-center py-section-mobile md:py-section-desktop overflow-hidden bg-light">
        <div className="absolute inset-0 bg-gradient-to-b from-light to-light/80 z-0"></div>
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 mb-6 bg-accent/20 rounded-full text-accent font-semibold text-sm tracking-wider uppercase font-poppins">
              PREMIUM BEAUTY LOUNGE
            </div>
            <h1 className="mb-6">
              {firstName}
              <br />
              <span className="text-accent">{restName}</span>
            </h1>
            <p className="text-soft mb-10 max-w-2xl mx-auto font-poppins">
              Sophisticated elegance meets natural beauty. Oáza klidu a luxusu, kde se vaše krása probouzí v nejjemnější podobě.
            </p>
            <div className="flex gap-5 justify-center flex-wrap">
              <a href="#booking" className="btn btn-primary">Vytvořit rezervaci</a>
              <a href="#services" className="btn btn-secondary">Prozkoumat služby</a>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">O nás</h2>
            <div className="w-24 h-1 bg-accent mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xl font-semibold text-dark mb-6">{salonName} – místo, kde se setkává sofistikovaná elegance s přirozenou krásou.</p>
              <p className="text-soft mb-4">Každý detail má svůj význam. Každý dotek je promyšlený. Každá návštěva je zážitek, který vás posune blíže k vašemu ideálnímu já. Naše lounge kombinuje nejnovější trendy s nadčasovou elegancí.</p>
              <p className="text-soft">Jsme tým odborníků, kteří chápou, že skutečná krása vychází zevnitř. Naším cílem je zdůraznit vaši přirozenou krásu a dodat vám sebevědomí, které si zasloužíte.</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp" alt={salonName} className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-section-mobile md:py-section-desktop bg-light border-b border-borderLight">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Naše služby</h2>
            <p className="text-soft max-w-2xl mx-auto">Profesionální péče o vaši krásu</p>
          </div>
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-dark mb-8">Zasvětlující techniky</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/brazilian-bleach.webp" alt="Brazilian Bleach" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-semibold text-dark mb-4 font-poppins">Brazilian Bleach</h4>
                  <p className="text-soft font-poppins">Technika Brazilian Bleach je jedinečný způsob, jak vytvořit jemný kontrast mezi tmavšími a světlejšími prameny. Díky harmonickému propojení odstínů vzniká přirozený, plynulý přechod barev.</p>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/airtouch.webp" alt="Airtouch" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-semibold text-dark mb-4 font-poppins">Airtouch</h4>
                  <p className="text-soft font-poppins">Tato moderní technika přináší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-dark mb-8">Péče</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/laminovani.webp" alt="Laminování vlasů" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-semibold text-dark mb-4 font-poppins">Laminování vlasů</h4>
                  <p className="text-soft font-poppins">Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření! Bez peroxidu, amoniaku a jiných agresivních látek.</p>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/05/rekonstrukce.webp" alt="Rekonstrukce vlasů" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-semibold text-dark mb-4 font-poppins">Rekonstrukce vlasů</h4>
                  <p className="text-soft font-poppins">Rekonstrukce vrací vlasům zdraví, pružnost a vitalitu. Díky vylepšenému a naprosto bezpečnému složení profesionální péče se stav vlasů viditelně zlepší už po první aplikaci!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Proč si vybrat právě nás?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-5">🛡️</div>
              <h3 className="font-semibold text-dark mb-3">Bezpečí</h3>
              <p className="text-soft">Profesionalita začíná u detailů: dokonale čisté nástroje, bezpečné produkty a ohleduplný přístup.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-5">💬</div>
              <h3 className="font-semibold text-dark mb-3">Otevřenost</h3>
              <p className="text-soft">Každá služba začíná konzultací. Vysvětlíme vám postup, cenu i složení používané kosmetiky.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-5">✨</div>
              <h3 className="font-semibold text-dark mb-3">Sebevědomí</h3>
              <p className="text-soft">Víme, že krása je v jedinečnosti. Pomůžeme vám objevit svůj styl a zdůraznit vaše přednosti.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-5">🌿</div>
              <h3 className="font-semibold text-dark mb-3">Atmosféra</h3>
              <p className="text-soft">{salonName} není jen salon krásy, ale místo, kde se zastaví čas. Příjemná hudba, vůně čaje, teplé úsměvy.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-section-mobile md:py-section-desktop bg-light border-b border-borderLight">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Zkušenosti zákazníků</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-base p-8 rounded-2xl shadow-sm">
              <div className="text-accent text-xl mb-4">★★★★★</div>
              <p className="text-soft mb-6">"Děkuji za skvělý servis. Skvělá kadeřnice, velmi milá a přátelská, profesionálka ve svém oboru. Ostříhala mě velmi pečlivě a krásně, přesně jak jsem chtěla. Vřele doporučuji."</p>
              <p className="font-semibold text-dark">Tatiana Titorenko</p>
            </div>
            <div className="bg-base p-8 rounded-2xl shadow-sm">
              <div className="text-accent text-xl mb-4">★★★★★</div>
              <p className="text-soft mb-6">"Nejednou jsem využila služby {salonName} a jsem velmi spokojená!!! Kvalita produktů a úroveň provedení práce je vždy na vysoké úrovni!!!"</p>
              <p className="font-semibold text-dark">Tatiana Kravčuk</p>
            </div>
            <div className="bg-base p-8 rounded-2xl shadow-sm">
              <div className="text-accent text-xl mb-4">★★★★★</div>
              <p className="text-soft mb-6">"Děkuji kadeřnici za skvělou práci! Je to velmi příjemná a laskavá dívka. Vřele ji doporučuji!"</p>
              <p className="font-semibold text-dark">Tatiana Dudčenko</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="mb-8">Kontakty</h2>
              {tenant.address && (
                <div className="mb-6">
                  <strong className="block text-dark mb-2">Adresa:</strong>
                  <p className="text-soft">{tenant.address}</p>
                </div>
              )}
              {tenant.phone && (
                <div className="mb-6">
                  <strong className="block text-dark mb-2">Telefon:</strong>
                  <p className="text-soft"><a href={`tel:${tenant.phone}`} className="hover:text-accent transition-colors">{tenant.phone}</a></p>
                </div>
              )}
              {tenant.email && (
                <div className="mb-6">
                  <strong className="block text-dark mb-2">Email:</strong>
                  <p className="text-soft"><a href={`mailto:${tenant.email}`} className="hover:text-accent transition-colors">{tenant.email}</a></p>
                </div>
              )}
              <div className="mb-6">
                <strong className="block text-dark mb-2">Otevírací doba:</strong>
                <p className="text-soft">Po - Pá: 10:00 - 19:00<br />So: 10:00 - 17:00<br />Ne: Zavřeno</p>
              </div>
            </div>
            <div id="booking">
              <h2 className="mb-8">Vytvořit rezervaci</h2>
              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault()
                window.location.href = `/book?tenant_id=${tenantId}`
              }}>
                <div>
                  <label className="block mb-2 font-semibold text-dark">Jméno a příjmení *</label>
                  <input type="text" required placeholder="Vaše jméno" className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-dark">Telefon *</label>
                  <input type="tel" required placeholder="+420 123 456 789" className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-dark">Email *</label>
                  <input type="email" required placeholder="vas@email.cz" className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-dark">Služba *</label>
                  <select required className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all">
                    <option value="">Vyberte službu</option>
                    <option value="strih">Střih</option>
                    <option value="barveni">Barvení</option>
                    <option value="pece">Péče o vlasy</option>
                    <option value="makeup">Make-up</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-dark">Datum a čas *</label>
                  <input type="datetime-local" required className="w-full px-4 py-3.5 border-2 border-borderLight rounded-xl bg-light focus:outline-none focus:border-accent focus:bg-base transition-all" />
                </div>
                <button type="submit" className="btn btn-primary btn-large">Odeslat rezervaci</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-base/80 py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6 flex-wrap justify-center">
              <a href="#about" className="hover:text-accent transition-colors">O nás</a>
              <a href="#services" className="hover:text-accent transition-colors">Služby</a>
              <a href="#pricing" className="hover:text-accent transition-colors">Ceník</a>
              <a href="#testimonials" className="hover:text-accent transition-colors">Zkušenosti</a>
              <a href="#contact" className="hover:text-accent transition-colors">Kontakty</a>
            </div>
            <p className="text-center md:text-right">{salonName} © 2026 Všechna práva vyhrazena</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
