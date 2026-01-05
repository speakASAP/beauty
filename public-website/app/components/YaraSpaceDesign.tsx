'use client'

import Link from 'next/link'
import { blogArticles } from './yaraSpaceBlogData'
import { useLanguage } from '../../lib/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import InstagramPosts from './InstagramPosts'

interface TenantInfo {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  design: string
}

interface YaraSpaceDesignProps {
  tenant: TenantInfo
}

export default function YaraSpaceDesign({ tenant }: YaraSpaceDesignProps) {
  const { t } = useLanguage()
  const salonName = tenant.name || 'Yara Space & Hair Spa'
  const tenantId = tenant.id
  const phone = tenant.phone || '+420 776 886 466'

  return (
    <div className="min-h-screen bg-light">
      {/* Navigation */}
      <nav className="yaraspace-nav bg-light border-b border-borderLight fixed top-0 left-0 right-0 z-[100] shadow-sm py-5">
        <div className="container flex justify-between items-center flex-wrap gap-4">
          <a href={`/salon?tenant_id=${tenantId}`} className="flex items-center gap-3">
            <img src="https://yaraspace.cz/wp-content/uploads/2025/01/logo.svg" alt="Yara Space & Hair Spa Logo" className="h-8 w-auto" />
            <span className="text-2xl font-bold font-heading text-dark">{salonName}</span>
          </a>
          <div className="flex gap-6 items-center flex-wrap">
            <a href="#about" className="text-soft font-medium hover:text-accent transition-colors">{t('nav.about')}</a>
            <Link href={`/salon/blog?tenant_id=${tenantId}`} className="text-soft font-medium hover:text-accent transition-colors">{t('nav.blog')}</Link>
            <a href="#services" className="text-soft font-medium hover:text-accent transition-colors">{t('nav.services')}</a>
            <a href="#pricing" className="text-soft font-medium hover:text-accent transition-colors">{t('nav.pricing')}</a>
            <a href="#testimonials" className="text-soft font-medium hover:text-accent transition-colors">{t('nav.testimonials')}</a>
            <a href="#contact" className="text-soft font-medium hover:text-accent transition-colors">{t('nav.contact')}</a>
            <a href="#booking" className="btn btn-primary">{t('nav.booking')}</a>
          </div>
          <div className="w-full md:w-auto flex items-center gap-3">
            <LanguageSwitcher />
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-accent font-semibold hover:text-dark transition-colors">{phone}</a>
            <a 
              href={`http://wa.me/${phone.replace(/\s/g, '').replace('+', '')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="WhatsApp" 
              className="text-accent hover:text-dark transition-colors flex items-center"
              title="Kontaktovat přes WhatsApp"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-section-mobile md:py-section-desktop overflow-hidden mt-20">
        <div className="absolute inset-0 z-0">
          <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp" alt={salonName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-light/80"></div>
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl ml-auto mr-[10%]">
            <div className="relative rounded-2xl p-8 md:p-12 border border-[#dbb89c] shadow-2xl" style={{ backgroundColor: 'rgba(219, 184, 156, 0.7)' }}>
              <div className="text-white text-center md:text-left">
                <div className="inline-block px-4 py-2 mb-8 bg-accent/60 rounded-full text-white font-semibold text-sm tracking-wider uppercase font-poppins">
                  {t('hero.badge')}
                </div>
                <h1 className="mb-8 text-white text-4xl md:text-6xl lg:text-7xl font-bold">
                  {t('hero.title')}
                </h1>
                <div className="mb-8">
                  <div className="inline-block px-4 py-2 bg-accent/70 rounded-full text-white font-semibold text-sm md:text-base font-poppins">{t('hero.subtitle')}</div>
                </div>
                <p className="text-white max-w-3xl mx-auto md:mx-0 font-poppins text-lg md:text-xl leading-relaxed">
                  {t('hero.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight mt-16 mb-24">
        <div className="container">
          <div className="flex justify-center mb-16 mt-12">
            <img src="https://yaraspace.cz/wp-content/uploads/2025/01/logo.svg" alt="Yara Space & Hair Spa Logo" className="h-16 w-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden">
              <img src="https://yaraspace.cz/wp-content/uploads/2025/02/dsc_6608-scaled.jpeg" alt="Yara Space & Hair Spa - profesionální kadeřnický salon" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent"></div>
            </div>
            <div>
              <h2 className="mb-8">
                <div className="text-5xl md:text-6xl font-bold font-heading text-dark mb-2">{t('about.title')}</div>
              </h2>
              <div className="space-y-4">
                <p className="text-soft font-poppins">{t('about.description1')}</p>
                <p className="text-soft font-poppins">{t('about.description2')}</p>
              </div>
            </div>
          </div>

          {/* Founder Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
            <div>
              <div className="text-sm text-accent font-semibold mb-4 uppercase tracking-wider font-poppins">{t('founder.badge')}</div>
              <h2 className="mb-6">{t('founder.name')}</h2>
              <div className="space-y-4">
                <p className="text-soft font-poppins">
                  {t('founder.description1').split('(@yaroslava_vlasova)')[0]}
                  (<a href="https://www.instagram.com/yaroslava_vlasova" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-dark transition-colors">@yaroslava_vlasova</a>)
                  {t('founder.description1').split('(@yaroslava_vlasova)')[1]}
                </p>
                <p className="text-soft font-poppins">{t('founder.description2')}</p>
                <p className="text-soft font-poppins">{t('founder.description3')}</p>
                <p className="text-soft font-poppins">{t('founder.description4')}</p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <img src="https://yaraspace.cz/wp-content/uploads/2025/09/vlasova-.jpeg-scaled.jpg" alt="Yaroslava Vlasova - founder of Yara Space & Hair Spa" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent"></div>
            </div>
          </div>

          {/* Key Employees Section */}
          <div className="mt-16">
            <h2 className="text-center mb-12">{t('employees.title')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-accent text-base font-semibold rounded-lg font-poppins"></div>
                <div className="relative rounded-2xl overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/09/bulatko.jpeg-scaled.jpg" alt="Anna Bulatko - Top Stylist of Yara Space & Hair Spa" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/20 to-transparent"></div>
                </div>
              </div>
              <div>
                <h3 className="mb-6">{t('employees.annaTitle')}</h3>
                <div className="space-y-4">
                  <p className="text-soft font-poppins">{t('employees.annaDescription1')}</p>
                  <p className="text-soft font-poppins">{t('employees.annaDescription2')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 md:py-20 bg-accent/10 border-b border-borderLight mt-16">
        <div className="container text-center">
          <h2 className="mb-6">{t('newsletter.title')}</h2>
          <button className="btn btn-primary mb-12">{t('newsletter.button')}</button>
        </div>
      </section>

      {/* Spacing between Newsletter and Services */}
      <div className="h-24 md:h-32 bg-light"></div>

      {/* Services Section */}
      <section id="services" className="pt-16 pb-16 md:pt-20 md:pb-20 bg-light border-b border-borderLight">
        <div className="container">
          <h1 className="text-center mb-6">{t('services.title')}</h1>
          <p className="text-center text-soft max-w-3xl mx-auto mb-16 font-poppins">
            {t('services.description')}
          </p>

          {/* Zasvětlující techniky */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Zasvětlujicí techniky</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/10/bleach-768x1024.webp" alt="Brazilian bleach" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Brazilian bleach</h3>
                  <div className="space-y-4 text-soft">
                    <p className="font-poppins">Technika Brazilian Bleach je jedinečný způsob, jak vytvořit jemný kontrast mezi tmavšími a světlejšími prameny. Diky harmonickému propojení odstín: například tmavě blond a světle karamelové vzniká přírozený, plynulý přechod barev.</p>
                    <p className="font-poppins">Tento styl barvení je vhodný pro světlé i tmavé vlasy, podtrhuje hloubku základního tónua vytváří efekt přirozené hry světla po celé délce vlasů. Ve výsledku získáte plynulé přechody od sytých tónů ke světlým odleskům, které působí elegantně, luxusně a naprosto přirozeně.</p>
                    <p className="font-poppins">Jednou z hlavních výhod Brazilian Bleach je jeho šetrnost k vlasům. Navíc tato technika nevyžaduje časté korekce a provádí se rychleji než většina jiných zesvětlujících meto. Tato technika je ideální volba pro ty, kdo oceňují přirozenost, kvalitu a svůj čas.</p>
                  </div>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/10/airtouch-768x1024.webp" alt="Airtouch" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Airtouch</h3>
                  <div className="space-y-4 text-soft">
                    <p className="font-poppins">Tato moderní technika přínáší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé.</p>
                    <p className="font-poppins">Kadeřník vybere odstín, který dokonale ladí s vaším přirozeným tónem a zvýrazní krásu vašich vlasů. Šetrné složení jemně zesvětluje prameny, nepoškozuje jejich strukturu a zachovává pružnost i přirozený lesk.</p>
                    <p className="font-poppins">S technikou Airtouch vytvoříte jedinečný, přirozený a svěží vzhled a bez ztráty své osobitosti.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2 font-poppins">V čem je Airtouch výjimečný?</h4>
                    <p className="font-poppins">Barvení v této technice zaručuje plynulý přechod mezi odstíny, takže vlasy působí naprosto přirozeně. Výhodou je, že korekce je nutná jen jednou za několik měsíců!</p>
                    <p className="font-poppins">Metoda je ideální i pro jemné ztmavení vlasů – v takovém případě kadeřník zvolí hlubší, a víc přirozené tóny, které zjemní příliš světlý blond a dodají barvě bohatý a přirozený odstín.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Péče */}
          <div>
            <h2 className="text-2xl font-semibold text-dark mb-8">Péče</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/02/laminace-vlasu.webp" alt="Laminování vlasů" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Laminování vlasů</h3>
                  <div className="space-y-4 text-soft">
                    <p>Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření!</p>
                    <p>Bez peroxidu, amoniaku a jiných agresivních látek vytváří na každém vlasu hladký a průhledný film, který mu dodává neuvěřitelný lesk a zdravý vzhled. Přípravek je univerzální a vhodný pro všechny typy vlasů.</p>
                    <p>Přírodní, naprosto bezpečné složení pro laminaci obalí šetrně vlasy, čímž chrání jejich sílu a zanechává je odolné vůči vnějším vlivům až na 4 týdny.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Výsledek, který získáte:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>zářívý, živý lesk a dokonale hladké, zdravé vlasy až na 4 týdny;</li>
                      <li>ochranu před vnějšími vlivy a UV zářením;</li>
                      <li>posílení jemných a poškozených vlasů;</li>
                      <li>vlasy se přestanou lámat;</li>
                      <li>ochranu před nadměrnou ztrátou vlhkostis;</li>
                      <li>sytější barvu, která vydrží déle mezi barveními.</li>
                    </ul>
                    <p className="mt-4">Vrať'te svým vlasům přirozený lesk a hebkost!</p>
                  </div>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/02/rekonstrukce-vlasu-odbarvene-a-zesvetlene-vlasy.webp" alt="Rekonstrukce vlasů" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Rekonstrukce vlasů</h3>
                  <div className="space-y-4 text-soft">
                    <p>Rekonstrukce vrací vlasům zdraví, pružnost a vitalitu. Díky vylepšenému a naprosto bezpečnému složení profesionální péče Philip Martin's se stav vlasů viditelně zlepší už po první aplikaci! Tato produkce je ideální pro zesvětlené i poškozené vlasy.</p>
                    <p>Unikátní receptura obsahuje přírodní rostlinné keratiny, které jsou účinné pro vlasy a jsou šetrné nejen k člověku a i přírodě.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Výsledek, který získáte:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>zdravé vlasy bez viditelných poškození;</li>
                      <li>ochranu před lámáním a roztřepenými konečky při každodenním česání;</li>
                      <li>vizuálně hustší a pevnější vlasy;</li>
                      <li>snazší úpravu, vlasy se lépe rozčesávají, nelámou a krásně drží tvari;</li>
                      <li>vlasy začnou hezky růst i při pravidelném zesvětlování a stylingu.</li>
                    </ul>
                    <p className="mt-4">Dopřejte svým vlasům novou sílu a krásu!</p>
                  </div>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/detoxikace-vlasu.jpg" alt="Detoxikace vlasů" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Detoxikace vlasů</h3>
                  <div className="space-y-4 text-soft">
                    <p>Lehké, zářivé a plné energie: zamilujete si své vlasy znovu díky výsledkům profesionální detoxikace!</p>
                    <p>Speciální složení účinně odstraňuje těžké kovy a zbytky chemických látek, které se ve vlasech hromadí po barvení, po použití stylingových přípravků nebo vlivem znečištěného ovzduší. Profesionální přípravky jsou k vlasům i pokožce hlavy maximálně šetrné nevysušují ani nedráždí.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Výsledek, který získáte:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>hloubkové vyčištění vlasů od odolných chemických nečistot;</li>
                      <li>obnovený přirozený lesk;</li>
                      <li>jemné čištění pokožky hlavy, úlevu od suchosti a svědění;</li>
                      <li>pocit svěžesti a lehkosti každého pramínku;</li>
                      <li>šetrnou péči vhodnou pro všechny typy vlasů.</li>
                    </ul>
                    <p className="mt-4">Zažijte pocit čistoty a zdraví svých vlasů už po první návštěvě!</p>
                  </div>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/hloubkova-hydratace.jpg" alt="Hloubková hydratace vlasů" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Hloubková hydratace vlasů</h3>
                  <div className="space-y-4 text-soft">
                    <p>Suché vlasy velice snadno ztrácí vlhkost i lesk, stávají se křehkými a lámavými. Procedura hloubkové hydratace intenzivně vyživí vaše vlasy a naplní je vlhkostí, čímž Jim vrátí pružnost, hebkost a zdravý přírozený lesk. Výsledek je viditelný už po první aplikaci as pravidelnou péčí se jen dál zlepšuje.</p>
                    <p>Jemné, hypoalergenní složení je zcela bezpečné pro vlasy i pokožku hlavy.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Výsledek, který získáte:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>obnovený lesk, hydrataci a vitalitu vlasů</li>
                      <li>prevenci lámání a vypadávání</li>
                      <li>zlepšení struktury a celkového zdraví vlasů, bez použití škodlivých chemických látek.</li>
                    </ul>
                    <p className="mt-4">Nechte své vlasy znovu zazářit!</p>
                  </div>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/vypadavani-vlasu-hair-loss-treatment.jpg" alt="Péče proti vypadávání vlasů" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Péče proti vypadávání vlasů</h3>
                  <div className="space-y-4 text-soft">
                    <p>V dnešní uspěchané době plné stresu a znečištěného ovzduší trápí vypadávání vlasů stále více žen imužů.</p>
                    <p>Profesionální komplex proti vypadávání vlasů od Philip Martin's přináší účinné řešení zaměřené na prevenci nadměrné ztráty vlasů,</p>
                    <p>Unikátní látky s přírodními aktivními složkami stimulují vlasové folikuly, zlepšují mikrocirkulaci pokožky hlavy a zajišťují intenzivní výživu každého vlasu.</p>
                    <p>Obsažené živiny posilují kořínky, zlepšují stav pokožky hlavy a podporují přirozené obnovení hustoty vlasů.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Výsledek, který získáte:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>viditelné snížení vypadávání a posílení vlasové struktury;</li>
                      <li>stimulace růstu nových, zdravých vlasů;</li>
                      <li>výživu a aktivaci vlasových folikulů;</li>
                      <li>zlepšení stavu pokožky hlavy a obnovení pH rovnováhy;</li>
                      <li>prodloužení anagenní fáze; období aktivního růstu vlasů, kdy získávají maximum živin (až 4 roky u mužů a až 6 let u žen).</li>
                    </ul>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Procedura zahrnuje čtyři kroky:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Detoxikace: odstranění nahromaděných nečistot a toxinů;</li>
                      <li>Očištění: příprava pokožky hlavy na další kroky ošetření;</li>
                      <li>Hydratace: hloubková výživa a obnova struktury vlasů;</li>
                      <li>Výživa a stimulace růstu: posílení kořínků a aktivace nového růstu.</li>
                    </ul>
                    <p className="mt-4">Získejte zpět husté, silné a zdravě zářící vlasy.</p>
                  </div>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/peeling-vlasove-pokozky.jpg" alt="Čištění (peeling) pokožky hlavy" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Čištění (peeling) pokožky hlavy</h3>
                  <div className="space-y-4 text-soft">
                    <p>Čistá pokožka hlavy je základem zdravých, hustých a krásných vlasů.</p>
                    <p>Peeling je důležitou součástí péče o pokožku hlavy. Přináší pocit svěžesti, odstraňuje nepříjemné pocity a zároveň probouzí vlasové folikuly. Vlasy jsou po něm lehčí, čistší a působí svěže.</p>
                    <p>Tento typ ošetření je vhodný pro všechny typy vlasů a lze jej kombinovat s většinou dalších procedur.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Výsledek, který získáte:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>šetrné vyčištění pokožky od odumřelých buněk, přebytečného mazu a nečistot;</li>
                      <li>lepší prokrvení, které podporuje výživu a okysličení pokožky;</li>
                      <li>pocit komfortu bez svědění, suchosti a napětí;</li>
                      <li>stimulaci růstu vlasů a jejich posílení.</li>
                    </ul>
                    <p className="mt-4">Dejte své pokožce i vlasům nový dech a přirozený lesk.</p>
                  </div>
                </div>
              </div>
              <div className="bg-base rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-video overflow-hidden">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/hloubkova-pece.jpg" alt="Hloubková péče o vlasy" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-dark mb-4">Hloubková péče o vlasy</h3>
                  <div className="space-y-4 text-soft">
                    <p>Inovativní složení našich produktů zajišťuje intenzivní regeneraci a výživu, působí jak uvnitř, tak na povrchu každého vlasu. Diky multimolekulárnímu složení pečující přípravky vyplňují poškozená místa ve vlasovém vláknu, doplňují ztracený keratin i vlhkost a dodávají vlasům zdravý lesk, pružnost a hebkost.</p>
                    <p>Tato péče dokáže zachránit i velmi poškozené vlasy – po zesvětlení, častém barvení či jiných náročných úpravách.</p>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Výsledek, který získáte:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>hloubkovou regeneraci a výživu vlasů po celé délce;</li>
                      <li>odstranění lámavosti a poréznostis;</li>
                      <li>pružné, lesklé a snadno upravitelné vlasy;</li>
                      <li>ochranu před vnějšími vlivy a ztrátou vlhkosti.</li>
                    </ul>
                    <h4 className="text-lg font-semibold text-dark mt-6 mb-2">Procedura zahrnuje:</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>keratinový krém s regeneračními účinky;</li>
                      <li>čistý keratin obohacený o vitaminy a přírodní extrakty;</li>
                      <li>výživný komplex přírodních olejů;</li>
                      <li>pečující fluid s fytokomponenty, aminokyselinami a vitaminy.</li>
                    </ul>
                    <p className="mt-4">Kadeřník zvolí přípravky individuálně podle typu a stavu vašich vlasů, aby jim vrátil zdravý lesk, sílu a přirozenou krásu,</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight mt-32">
        <div className="container">
          <h1 className="text-center mb-6">{t('blog.title')}</h1>
          <p className="text-center text-soft max-w-3xl mx-auto mb-16">
            {t('blog.description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/salon/blog/${article.slug}?tenant_id=${tenantId}`}
                className="bg-light rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="aspect-video overflow-hidden">
                  <img src={article.image} alt={article.imageAlt} className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <h2 className="text-xl font-semibold text-dark mb-4">{article.title}</h2>
                  <p className="text-soft mb-4">{article.excerpt}</p>
                  <p className="text-sm text-accent font-medium">* {article.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section id="instagram" className="py-section-mobile md:py-section-desktop bg-light border-b border-borderLight mt-32">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-dark mb-4">{t('instagram.title')}</h2>
            <p className="text-soft max-w-3xl mx-auto font-poppins">
              {t('instagram.description')}
            </p>
            <a
              href="https://www.instagram.com/yaraspace_hairspa/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-dark transition-colors font-semibold mt-4"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @yaraspace_hairspa
            </a>
          </div>
          <InstagramPosts username="yaraspace_hairspa" limit={4} />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-section-mobile md:py-section-desktop bg-light border-b border-borderLight mt-32">
        <div className="container">
          <h1 className="text-center mb-6">{t('pricing.title')}</h1>
          <p className="text-center text-soft max-w-3xl mx-auto mb-16">
            {t('pricing.description')}
          </p>

          {/* Krátké vlasy do 10 cm */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Krátké vlasy do 10 cm</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-base rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-accent/20">
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Služba</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Popis</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Čas</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Foukání (vodová), mytí</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">580 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Kompletní střih +komplet péče</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">680 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Barvení, odrostu do 2 cm, (trvalá ondulace, přeliv)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1730 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Melír doplnění odrostu, střih, konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1830 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Nový melír, kombinace, barev, technik, střih, konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1930 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Polodlouhé vlasy */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Polodlouhé vlasy (max. na ramena, mikádo)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-base rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-accent/20">
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Služba</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Popis</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Čas</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Foukání + mytí</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">780 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Úprava stávajícího střihu + péče + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">980 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Barvení odrostů (do 2 cm) + střih + péče + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1930 Kč / 2230 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Melír (doplnění odrostů) + střih + péče + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">2230 Kč / 2730 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Kombinace barvení + melírování nebo nový melír + střih + péče + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">2430 Kč / 2990 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Po foukání lokny, vlny, přežehlení</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">500 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dlouhé vlasy */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Dlouhé vlasy (od ramen)</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-base rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-accent/20">
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Služba</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Popis</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Čas</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Foukání + mytí</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">980 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Úprava stávajícího střihu + péče + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1280 Kč / 1680 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Barvení odrostů (do 2 cm) / přeliv / tónování + péče + střih + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">2230 Kč / 3180 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Melír (doplnění odrostů) + péče + střih + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">3630 Kč / 4080 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Kombinace technik (barva + melír) nebo nový melír / změna barvy + péče + střih + konečná úprava</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">2890 Kč / 4550 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Přežehlení vlasů, vlny, lokny</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">800 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pánské a dětské střihy */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Pánské a dětské střihy</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-base rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-accent/20">
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Služba</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Popis</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Čas</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Základní střih</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">250 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Náročný střih na čas a provedení</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">od 350 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Střih pouze strojkem</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">200 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Ofina, ornament, vousy</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">100 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Dětský střih (dle náročnosti)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">od 350 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Kompletní střih + mytí + péče + konečná úprava + styling</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">450 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Masáž hlavy</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">50 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Svatební a společenské úpravy */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Svatební a společenské úpravy vlasů</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-base rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-accent/20">
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Služba</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Popis</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Čas</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Společenský účes + péče (bez střihu)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">980 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Vlny, lokny, výčes (dle délky a hustoty vlasů, bez střihu)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1200 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Zkouška nevěsty + konzultace účesu (bez mytí a konečné úpravy, max. 2 pokusy / 1,5 hod.)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1500 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Svatební účes (bez předchozí zkoušky, v salonu)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1800 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Svatební balíček (účes v salonu včetně zkoušky předem nebo náročnější bez zkoušky)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">2800 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Úprava svatebčana (bez mytí, styling)</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">480 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Péče */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Péče</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-base rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-accent/20">
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Služba</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Popis</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Čas</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Laminace vlasů</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1150 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Rekonstrukce vlasů</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1200 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Detoxikace vlasů</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">780 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Hloubková hydratace</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">580 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Vypadávání vlasů</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">1430 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Peeling vlasové pokožky</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">780 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Hloubková péče</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">880 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Péče o pokožku</td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 text-soft"></td>
                    <td className="px-6 py-4 font-semibold text-dark">690 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rituály */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold text-dark mb-8">Rituály</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-base rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-accent/20">
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Služba</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Popis</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Čas</th>
                    <th className="px-6 py-4 text-left font-semibold text-dark border-b border-borderLight">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Suchá pokožka</td>
                    <td className="px-6 py-4 text-soft">Ošetření pro suchou a matnou pokožku hlavy</td>
                    <td className="px-6 py-4 text-soft">15 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">750 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Mastná pokožka</td>
                    <td className="px-6 py-4 text-soft">Ideální ošetření pokožky hlavy s přebytečným mazem a hyperhidrozou</td>
                    <td className="px-6 py-4 text-soft">15 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">750 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Pokožka a lupy</td>
                    <td className="px-6 py-4 text-soft">Ideální ošetření pokožky hlavy s odlupováním nebo lupy</td>
                    <td className="px-6 py-4 text-soft">15 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">750 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Svědění</td>
                    <td className="px-6 py-4 text-soft">Ideální ošetření pokožky hlavy se zarudnutím a / nebo svěděním</td>
                    <td className="px-6 py-4 text-soft">15 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">750 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">PICASSO mastná pokožka</td>
                    <td className="px-6 py-4 text-soft">Ritual pokožky hlavy regulující kožní maz</td>
                    <td className="px-6 py-4 text-soft">90 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">2000 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">HAIR LOSS TREATMENTT VÝPADAVANÍ SUCHÁ/NORMALNÍ</td>
                    <td className="px-6 py-4 text-soft">Ideální léčba k prevenci a / nebo zpomalení sezonního vypadávání</td>
                    <td className="px-6 py-4 text-soft">60 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">2200 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">HAIR LOSS TREATMENTT VÝPADAVANÍ (MASTNÁ POKOŽKA)</td>
                    <td className="px-6 py-4 text-soft">Ideální ošetření pro prevenci a / nebo zpomalení sezonního vypadávání</td>
                    <td className="px-6 py-4 text-soft">60 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">2200 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Jemné vlasy / Mechanické poškození</td>
                    <td className="px-6 py-4 text-soft">Ideální ošetření pro obnovení objemu tenkých vlasů</td>
                    <td className="px-6 py-4 text-soft">20 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">950 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Kudrnaté vlasy</td>
                    <td className="px-6 py-4 text-soft">Ideální ošetření pro obnovení elasticity a definování kadeře</td>
                    <td className="px-6 py-4 text-soft">20 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">700 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">Suché vlasy</td>
                    <td className="px-6 py-4 text-soft">Ideální kůra pro obnovení hydratace a lesku suchých vlasů</td>
                    <td className="px-6 py-4 text-soft">20 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">950 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">SŤEDNĚ POŠKOZENÉ VLASY</td>
                    <td className="px-6 py-4 text-soft">Ideální kůra pro vlasy poškozené chemickým ošetřením nebo nadměrným a nesprávným používáním žehliček a fénu</td>
                    <td className="px-6 py-4 text-soft">90 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">2700 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">SILNĚ POŠKOZENÉ VLASY A SLABÝ VLAS</td>
                    <td className="px-6 py-4 text-soft">Ideální kůra pro vlasy poškozené chemickým ošetřením nebo nadměrným a nesprávným používáním žehliček a fénu</td>
                    <td className="px-6 py-4 text-soft">90 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">2750 Kč</td>
                  </tr>
                  <tr className="border-b border-borderLight hover:bg-light/50 transition-colors">
                    <td className="px-6 py-4 text-soft">UNDER CONTROL Ošetření proti krepatění</td>
                    <td className="px-6 py-4 text-soft">Osvěžující fluid pro suché a rozcuchané vlasy. Poskytuje lesk a hebkost. Pomáhá udržovat vlasy v kondici, chrání je před zdroji tepla ( fén, žehlička) a vlhkosti. Nezanechává žádné zbytky, nemastí a nezatěžuje vlasy.</td>
                    <td className="px-6 py-4 text-soft">150 min</td>
                    <td className="px-6 py-4 font-semibold text-dark">3850 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight mt-32">
        <div className="container">
          <h1 className="text-center mb-6">{t('testimonials.title')}</h1>
          <p className="text-center text-soft max-w-3xl mx-auto mb-8">
            {t('testimonials.description')}
          </p>
          <div className="text-center mb-12">
            <button className="btn btn-secondary">{t('testimonials.button')}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Děkuji za skvělý servis. Skvělá kadeřnice, velmi milá a přátelská, profesionálka ve svém oboru. Ostrihala mě velmi pečlivě a krásně, přesně jak jsem chtěla. Vřele doporučuji.</p>
              <p className="font-semibold text-dark">Tatiana Titorenko</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Nejednou jsem využila služby "Yara Spase & Hair Spa Vlasový Welness" a jsem velmi spokojená!!! Kvalita produktů a úroveň provedení práce je vždy na vysoké úrovni!!! Kadeřnice vždy chápe potřeby a přání zákazníka, je v dobré náladě a má pozitivní přístup ke každému klientovi. Vždy poradí, podpoří a udělá vše co nejlépe.Široký výběr procedur pro péči o vlasy, regenerace poškozených vlasů, používají se pouze přírodní složky.Salon je snadno dostupný, nachází se v prvním patře, je přístupný i pro kočárky, což usnadňuje návštěvu maminkám s malými dětmi. Vřele doporučuji!</p>
              <p className="font-semibold text-dark mb-2">Tatiana Kravčuk</p>
              <a href="#" className="text-accent hover:text-dark transition-colors text-sm font-medium">Přečíst více</a>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Děkuji kadeřnici za skvělou práci! Je to velmi příjemná a laskavá dívka. Vřele ji doporučuji!</p>
              <p className="font-semibold text-dark">Tatiana Dudčenko</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Dnes jsem byla v tomto salonu, kadeřnice byla velmi příjemná 🥰. Všechno se mi moc líbilo 😍, výsledek je skvělý 👍. Pokud chcete krásnou barvu vlasů, střih nebo péči, doporučuji 🤗!</p>
              <p className="font-semibold text-dark mb-2">Sofie</p>
              <a href="#" className="text-accent hover:text-dark transition-colors text-sm font-medium">Přečíst více</a>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Chci zanechat recenzi na tento úžasný kadeřnický salon a zejména na kadeřnici! Práce byla provedena na nejvyšší úrovni – velmi pečlivě, kvalitně a s důrazem na detaily. Je vidět, že tato osoba miluje svou profesi a vkládá do své práce srdce. Výsledek předčil všechna očekávání!Také bych chtěla vyzdvihnout dostupné ceny, které dělají návštěvu této kadeřnice ještě příjemnější. Pokud hledáte profesionála, kterému můžete svěřit svůj účes, vřele doporučuji! Určitě budete spokojeni!</p>
              <p className="font-semibold text-dark mb-2">Marina Vološko</p>
              <a href="#" className="text-accent hover:text-dark transition-colors text-sm font-medium">Přečíst více</a>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Velmi dobrá kadeřnice, milá a přátelská dívka, která odvedla skvělou práci.</p>
              <p className="font-semibold text-dark">Lesja Sochanič</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Pomohli mi vybrat domácí péči, která se mi moc líbila.</p>
              <p className="font-semibold text-dark">Ilona Trubina</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Mír a lásku všem! Nechali jsme ostříhat naše dva syny, 9 a 19 let. Kadeřnice Jaroslava odvedla skvělou práci a proměnila sny chlapců ve skutečnost. Děkujeme vám za váš profesionalismus!!! Příště určitě znovu využijeme vašich služeb!</p>
              <p className="font-semibold text-dark mb-2">Alexandr Andrievskij</p>
              <a href="#" className="text-accent hover:text-dark transition-colors text-sm font-medium">Přečíst více</a>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Nabarvila jsem si své dlouhé vlasy s šedinami barvou Filip Martin. Příjemně mě překvapila barva a lesk. Vlasy se vyživily oleji, zhoustly a změkly. Objem copu se znatelně zvětšil. Navíc při růstu kořínků není přechod viditelný (vybrali jsme odstín barvy podle mého přirozeného tónu vlasů). Celkově jsem velmi spokojená a chci to zopakovat. Vlasy vypadají zdravě a upraveně, a kadeřnice Jaroslava byla pozorná a snažila se dosáhnout co nejlepšího výsledku. Všem doporučuji tento nový kadeřnický salon!</p>
              <p className="font-semibold text-dark">Zel</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-accent/20 mb-6 mx-auto"></div>
              <p className="text-soft mb-6">Skvělá práce a opravdu šikovná kadeřnice! Je vidět, že má zkušenosti a dělá to s citem. Moc doporučuji!</p>
              <p className="font-semibold text-dark">Kate Prokopenko</p>
            </div>
          </div>
          <div className="text-center mt-12 mb-12">
            <button className="btn btn-secondary">{t('testimonials.loadMore')}</button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-section-mobile md:py-section-desktop bg-base border-b border-borderLight mt-32">
        <div className="container">
          <h2 className="text-center mb-12">{t('whyChoose.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-dark mb-4">Bezpečí</h3>
              <p className="text-soft font-poppins">Profesionalita začíná u detailů: dokonale čisté nástroje, bezpečné produkty a ohleduplný přístup. Náš salon je mistem, kde se můžete uvolnit a vychutnat si příjemnou atmosférus jistotou, že vaše krása je v dobrých rukou.</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-dark mb-4">Otevřenost</h3>
              <p className="text-soft font-poppins">Každá služba ať už jde o líčení, střih nebo regeneraci vlasů začíná konzultaci. Vysvětlíme vám postup, cenu i složení používané kosmetiky, poradíme, jak si účes upravit doma, a doporučíme produkty, které vám péči usnadní. Jsme tu, abychom naslouchali vašim přáním a podpořili i ty nejodvážnější nápady.</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-dark mb-4">Sebevědomí</h3>
              <p className="text-soft font-poppins">Víme, že krása je v jedinečnosti. Pomůžeme vám objevit svůj styl, zdůraznit vaše přednosti a cítit se skvěle ve své kůži. Ať už hledáte nový střih, barvu, slavnostní účes nebo svatební make-up naši stylisté se postarají o to, abyste zářili sebejistotou.</p>
            </div>
            <div className="bg-light p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-semibold text-dark mb-4">Atmosféra</h3>
              <p className="text-soft font-poppins">Yara Space & Hair Spa není jen salon krásy, ale místo, kde se zastaví čas. Příjemná hudbag vůně čaje, teplé úsměvy a pohodová konverzace - každý detail vytváří atmosféru, do které se budete chtit vracet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-section-mobile md:py-section-desktop bg-light border-b border-borderLight mt-32">
        <div className="container">
          <h1 className="text-center mb-12">{t('contact.title')}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="bg-base p-8 rounded-2xl shadow-sm">
              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement form submission
                alert('Formulář bude brzy funkční. Prozatím nás kontaktujte na office@yaraspace.cz');
              }}>
                <input
                  type="text"
                  name="name"
                  placeholder={`${t('contact.name')} *`}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-borderLight bg-light text-dark placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={`${t('contact.phone')} *`}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-borderLight bg-light text-dark placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t('contact.email')}
                  className="w-full px-4 py-3 rounded-lg border border-borderLight bg-light text-dark placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <textarea
                  name="message"
                  placeholder={t('contact.message')}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-borderLight bg-light text-dark placeholder:text-soft focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                />
                <button type="submit" className="btn btn-primary w-full">{t('contact.send')}</button>
              </form>
            </div>
            <div className="space-y-8">
              <div className="bg-base p-8 rounded-2xl shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-dark mb-2">{t('contact.email')}</h3>
                    <a href="mailto:office@yaraspace.cz" className="text-accent hover:text-dark transition-colors">office@yaraspace.cz</a>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-dark mb-2">{t('contact.phone')}</h3>
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-accent hover:text-dark transition-colors">{phone}</a>
                  </div>
                </div>
              </div>
              <div className="bg-base p-8 rounded-2xl shadow-sm">
                <div className="flex gap-6 justify-center">
                  <a href="https://www.instagram.com/yaraspace_hairspa" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-accent hover:text-dark transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="https://www.facebook.com/people/Yara-Space-Hair-Spa/61566509807038/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-accent hover:text-dark transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="http://wa.me/420776886466" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-accent hover:text-dark transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-base p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="text-3xl">🕐</div>
              <p className="text-soft font-poppins">Po–Pá: 09:00–19:00, So: 10:00–16:00</p>
            </div>
            <div className="bg-base p-6 rounded-2xl shadow-sm flex items-center gap-4">
              <div className="text-3xl">📍</div>
              <p className="text-soft font-poppins">Križná 169/8, Kroměříž</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2605.1234567890123!2d17.394814!3d49.297924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4713e5c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5c!2sKrižn%C3%A1%20169%2F8%2C%20Krom%C4%9B%C5%99%C3%AD%C5%BE!5e0!3m2!1scs!2scz!4v1234567890123!5m2!1scs!2scz"
              width="100%"
              height="400"
              className="border-0 w-full"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Yara Space & Hair Spa Location"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base border-t border-borderLight py-section-mobile md:py-section-desktop">
        <div className="container">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
              <div className="flex items-center gap-4 md:gap-6">
                <img src="https://yaraspace.cz/wp-content/uploads/2025/01/logo.svg" alt="Yara Space & Hair Spa Logo" className="h-12 w-auto" />
                <nav className="flex flex-wrap items-center gap-4 md:gap-6 text-soft">
                  <a href="/" className="hover:text-accent transition-colors">Beauty Franchise</a>
                  <a href="/#features" className="hover:text-accent transition-colors">Funkce</a>
                  <a href="/#franchise-form" className="hover:text-accent transition-colors">Kontakt</a>
                  <a href="#about" className="hover:text-accent transition-colors">{t('nav.about')}</a>
                  <Link href={`/salon/blog?tenant_id=${tenantId}`} className="hover:text-accent transition-colors">{t('nav.blog')}</Link>
                  <a href="#services" className="hover:text-accent transition-colors">{t('nav.services')}</a>
                  <a href="#pricing" className="hover:text-accent transition-colors">{t('nav.pricing')}</a>
                  <a href="#testimonials" className="hover:text-accent transition-colors">{t('nav.testimonials')}</a>
                  <a href="#contact" className="hover:text-accent transition-colors">{t('nav.contact')}</a>
                </nav>
              </div>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/yaraspace_hairspa" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-accent hover:text-dark transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/people/Yara-Space-Hair-Spa/61566509807038/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-accent hover:text-dark transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="http://wa.me/420776886466" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-accent hover:text-dark transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="border-t border-borderLight pt-8 text-center space-y-2">
              <p className="text-soft font-poppins">Yara Space & Hair Spa © 2026</p>
              <p className="text-soft font-poppins">{t('footer.rights')}</p>
              <a href="/privacy/" className="text-accent hover:text-dark transition-colors">{t('footer.privacy')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
