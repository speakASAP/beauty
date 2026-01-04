'use client'

import Link from 'next/link'
import '../globals.css'
import '../yaraspace/yaraspace.css'
import { blogArticles } from './yaraSpaceBlogData'

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
  const salonName = tenant.name || 'Yara Space & Hair Spa'
  const tenantId = tenant.id
  const phone = tenant.phone || '+420 776 886 466'

  return (
    <div className="salon-landing salon-yaraspace">
      {/* Navigation */}
      <nav className="salon-nav">
        <div className="container">
          <a href={`/salon?tenant_id=${tenantId}`} className="nav-logo">
            <img src="https://yaraspace.cz/wp-content/uploads/2025/01/logo.svg" alt="Yara Space & Hair Spa Logo" className="nav-logo-img" />
            <span className="nav-logo-text">{salonName}</span>
          </a>
          <div className="nav-links">
            <a href="#about">O nás</a>
            <Link href={`/salon/blog?tenant_id=${tenantId}`}>Blog</Link>
            <a href="#services">Služby</a>
            <a href="#pricing">Ceník</a>
            <a href="#testimonials">Zkušenosti</a>
            <a href="#contact">Kontakty</a>
            <a href="#booking" className="btn-booking">Vytvořit rezervaci</a>
          </div>
          <div className="nav-contact">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="nav-phone">{phone}</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp" alt={salonName} className="hero-image" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">KOSMETICKÝ SALON</div>
            <h1 className="hero-title">
              Yara Space & Hair Spa
            </h1>
            <div className="hero-subtitle-section">
              <div className="hero-subtitle-badge">Vlasový Wellness</div>
            </div>
            <p className="hero-description">
              Yara Space & Hair Spa – to je vaše dobrá nálada, sebevědomí a ten pocit, že jste to vy, jen ještě krásnější. Odvážné mikádo, nová energie, dokonalé svatební fotografie. První rande, na kterém se citíte jako královna. Účes, který vám opravdu sluší! Za tím vším stojí lidé, kteří milují svou práci a dělají ji srdcem. Jsem tým profesionálů, který vidí krásu v každém a ví, jak ji zvýraznit. Vaše krása si zaslouží zazářit. My víme, jak na to.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-logo">
            <img src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_logo.webp" alt="Yara Space & Hair Spa Logo" />
          </div>
          <div className="about-hero">
            <div className="about-hero-image">
              <img src="https://yaraspace.cz/wp-content/uploads/2025/02/dsc_6608-scaled.jpeg" alt="Yara Space & Hair Spa - profesionální kadeřnický salon" />
            </div>
            <div className="about-hero-content">
              <div className="about-hero-title">
                <span className="about-title-line1">Yara</span>
                <span className="about-title-line2">Hair</span>
              </div>
              <div className="about-hero-subtitle">
                <span className="about-subtitle-line1">Space &</span>
                <span className="about-subtitle-line2">Spa</span>
              </div>
              <div className="about-hero-text">
                <p>Yara Space & Hair Spa není jen obyčejný salon krásy. Je to místo, kde se setkávají talentovaní odborníci, kteří svou práci dělají s láskou a péčí. Skuteční profesionálové nikdy nepracují podle šablony. Náš tým tvoří s citem pro detail a hledá individuální řešení pro každého klienta podle struktury vlasů, tónu pleti i osobního stylu.</p>
                <p>Naše filozofie stojí na respektu k vaší jedinečné kráse a zdraví. Používáme bezpečné a účinné produkty, moderní techniky a spolupracujeme pouze s certifikovanými odborníky, kteří přesně vědí, jak dosáhnout vašeho vysněného výsledku a vykouzlit vám úsměv na tváři. Každá návštěva Yara Space & Hair Spa je jako malé prázdniny pro duši a proměna, která vám dodá novou energii.</p>
              </div>
            </div>
          </div>

          {/* Founder Section */}
          <div className="founder-section">
            <div className="founder-image">
              <img src="https://yaraspace.cz/wp-content/uploads/2025/09/vlasova-.jpeg-scaled.jpg" alt="Yaroslava Vlasova - founder of Yara Space & Hair Spa" />
            </div>
            <div className="founder-content">
              <div className="founder-label">Zakladatelka salónu krásy Yara Space & Hair SPA</div>
              <h2 className="founder-name">Ing. Yaroslava Vlasová</h2>
              <div className="founder-text">
                <p>Yaroslava Vlasova (<a href="https://www.instagram.com/yaroslava_vlasova" target="_blank" rel="noopener noreferrer">@yaroslava_vlasova</a>) je stylistka, kadeřnice a vizážistka, která stojí za konceptem salonů Yara Space & Hair SPA a pro kterou je práce s individualitou každého člověka něco víc. Yaroslava je člověk s velkým srdcem, pro kterého je klid klienta na prvním místě.</p>
                <p>Yara Space & Hair SPA je salon, kde se snoubí profesionalita, ekologické produkty a individuální přístup ke každému klientovi. Celý tým se neustále zdokonaluje tím, že navštěvuje odborné kurzy a učí se nové vlasové techniky, používání nových produktů a nové techniky barvení.</p>
                <p>Náš salon je nejen krásný, ale vytvořili jsme pro vás také útulné a příjemné prostředí. Každému klientovi věnujeme zvláštní pozornost a individuální přístup s péčí a pozorností.</p>
                <p>✨ Yara Space & Hair SPA je místem, kde vládne harmonie a krása.</p>
              </div>
            </div>
          </div>

          {/* Key Employees Section */}
          <div className="employees-section">
            <h2 className="section-title">Klíčoví zaměstnanci</h2>
            <div className="employee-card">
              <div className="employee-image-wrapper">
                <div className="employee-badge">Top Stylist</div>
                <div className="employee-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/09/anna-bulatko.webp" alt="Anna Bulatko - Top Stylist of Yara Space & Hair Spa" />
                </div>
              </div>
              <div className="employee-content">
                <h3 className="employee-name">Anna Bulatko</h3>
                <div className="employee-text">
                  <p>Anna Bulatko — Top Stylist salonu Yara Space & Hair SPA, pro kterou je práce s vlasy uměním a způsobem, jak zdůraznit individualitu každého klienta. Vyznačuje se jemným smyslem pro styl, smyslem pro detail a schopností vytvářet harmonické obrazy, které zdůrazňují přirozenou krásu.</p>
                  <p>Anna neustále zlepšuje své dovednosti, učí se novým technikám stříhání a barvení a také pracuje s moderními produkty, aby klienti vždy dosáhli výsledku prémiové úrovně.</p>
                </div>
              </div>
            </div>
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
          <h1 className="services-main-title">Služby</h1>
          <p className="services-description">
            Ať už toužíte po čerstvé manikúře, moderním barvení, svatebním účesu nebo jen potřebujete upravit konečky, u nás si můžete vybrat jakoukoli službu bez obav o kvalitu a bezpečnost. Používáme šetrné produkty, ověřené techniky a naši stylisté neustále zdokonalují své dovednosti, aby byl výsledek vždy přesně takový, jaký si přejete.
          </p>

          {/* Zasvětlující techniky */}
          <div className="services-category">
            <h2 className="category-title">Zasvětlujicí techniky</h2>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/10/bleach-768x1024.webp" alt="Brazilian bleach" />
                </div>
                <div className="service-content">
                  <h3>Brazilian bleach</h3>
                  <p>Technika Brazilian Bleach je jedinečný způsob, jak vytvořit jemný kontrast mezi tmavšími a světlejšími prameny. Diky harmonickému propojení odstín: například tmavě blond a světle karamelové vzniká přírozený, plynulý přechod barev.</p>
                  <p>Tento styl barvení je vhodný pro světlé i tmavé vlasy, podtrhuje hloubku základního tónua vytváří efekt přirozené hry světla po celé délce vlasů. Ve výsledku získáte plynulé přechody od sytých tónů ke světlým odleskům, které působí elegantně, luxusně a naprosto přirozeně.</p>
                  <p>Jednou z hlavních výhod Brazilian Bleach je jeho šetrnost k vlasům. Navíc tato technika nevyžaduje časté korekce a provádí se rychleji než většina jiných zesvětlujících meto. Tato technika je ideální volba pro ty, kdo oceňují přirozenost, kvalitu a svůj čas.</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/10/airtouch-768x1024.webp" alt="Airtouch" />
                </div>
                <div className="service-content">
                  <h3>Airtouch</h3>
                  <p>Tato moderní technika přínáší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé.</p>
                  <p>Kadeřník vybere odstín, který dokonale ladí s vaším přirozeným tónem a zvýrazní krásu vašich vlasů. Šetrné složení jemně zesvětluje prameny, nepoškozuje jejich strukturu a zachovává pružnost i přirozený lesk.</p>
                  <p>S technikou Airtouch vytvoříte jedinečný, přirozený a svěží vzhled a bez ztráty své osobitosti.</p>
                  <h4>V čem je Airtouch výjimečný?</h4>
                  <p>Barvení v této technice zaručuje plynulý přechod mezi odstíny, takže vlasy působí naprosto přirozeně. Výhodou je, že korekce je nutná jen jednou za několik měsíců!</p>
                  <p>Metoda je ideální i pro jemné ztmavení vlasů – v takovém případě kadeřník zvolí hlubší, a víc přirozené tóny, které zjemní příliš světlý blond a dodají barvě bohatý a přirozený odstín.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Péče */}
          <div className="services-category">
            <h2 className="category-title">Péče</h2>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/02/laminace-vlasu.webp" alt="Laminování vlasů" />
                </div>
                <div className="service-content">
                  <h3>Laminování vlasů</h3>
                  <p>Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření!</p>
                  <p>Bez peroxidu, amoniaku a jiných agresivních látek vytváří na každém vlasu hladký a průhledný film, který mu dodává neuvěřitelný lesk a zdravý vzhled. Přípravek je univerzální a vhodný pro všechny typy vlasů.</p>
                  <p>Přírodní, naprosto bezpečné složení pro laminaci obalí šetrně vlasy, čímž chrání jejich sílu a zanechává je odolné vůči vnějším vlivům až na 4 týdny.</p>
                  <h4>Výsledek, který získáte:</h4>
                  <ul className="service-benefits">
                    <li>zářívý, živý lesk a dokonale hladké, zdravé vlasy až na 4 týdny;</li>
                    <li>ochranu před vnějšími vlivy a UV zářením;</li>
                    <li>posílení jemných a poškozených vlasů;</li>
                    <li>vlasy se přestanou lámat;</li>
                    <li>ochranu před nadměrnou ztrátou vlhkostis;</li>
                    <li>sytější barvu, která vydrží déle mezi barveními.</li>
                  </ul>
                  <p>Vrať'te svým vlasům přirozený lesk a hebkost!</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/02/rekonstrukce-vlasu-odbarvene-a-zesvetlene-vlasy.webp" alt="Rekonstrukce vlasů" />
                </div>
                <div className="service-content">
                  <h3>Rekonstrukce vlasů</h3>
                  <p>Rekonstrukce vrací vlasům zdraví, pružnost a vitalitu. Díky vylepšenému a naprosto bezpečnému složení profesionální péče Philip Martin's se stav vlasů viditelně zlepší už po první aplikaci! Tato produkce je ideální pro zesvětlené i poškozené vlasy.</p>
                  <p>Unikátní receptura obsahuje přírodní rostlinné keratiny, které jsou účinné pro vlasy a jsou šetrné nejen k člověku a i přírodě.</p>
                  <h4>Výsledek, který získáte:</h4>
                  <ul className="service-benefits">
                    <li>zdravé vlasy bez viditelných poškození;</li>
                    <li>ochranu před lámáním a roztřepenými konečky při každodenním česání;</li>
                    <li>vizuálně hustší a pevnější vlasy;</li>
                    <li>snazší úpravu, vlasy se lépe rozčesávají, nelámou a krásně drží tvari;</li>
                    <li>vlasy začnou hezky růst i při pravidelném zesvětlování a stylingu.</li>
                  </ul>
                  <p>Dopřejte svým vlasům novou sílu a krásu!</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/detoxikace-vlasu.jpg" alt="Detoxikace vlasů" />
                </div>
                <div className="service-content">
                  <h3>Detoxikace vlasů</h3>
                  <p>Lehké, zářivé a plné energie: zamilujete si své vlasy znovu díky výsledkům profesionální detoxikace!</p>
                  <p>Speciální složení účinně odstraňuje těžké kovy a zbytky chemických látek, které se ve vlasech hromadí po barvení, po použití stylingových přípravků nebo vlivem znečištěného ovzduší. Profesionální přípravky jsou k vlasům i pokožce hlavy maximálně šetrné nevysušují ani nedráždí.</p>
                  <h4>Výsledek, který získáte:</h4>
                  <ul className="service-benefits">
                    <li>hloubkové vyčištění vlasů od odolných chemických nečistot;</li>
                    <li>obnovený přirozený lesk;</li>
                    <li>jemné čištění pokožky hlavy, úlevu od suchosti a svědění;</li>
                    <li>pocit svěžesti a lehkosti každého pramínku;</li>
                    <li>šetrnou péči vhodnou pro všechny typy vlasů.</li>
                  </ul>
                  <p>Zažijte pocit čistoty a zdraví svých vlasů už po první návštěvě!</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/hloubkova-hydratace.jpg" alt="Hloubková hydratace vlasů" />
                </div>
                <div className="service-content">
                  <h3>Hloubková hydratace vlasů</h3>
                  <p>Suché vlasy velice snadno ztrácí vlhkost i lesk, stávají se křehkými a lámavými. Procedura hloubkové hydratace intenzivně vyživí vaše vlasy a naplní je vlhkostí, čímž Jim vrátí pružnost, hebkost a zdravý přírozený lesk. Výsledek je viditelný už po první aplikaci as pravidelnou péčí se jen dál zlepšuje.</p>
                  <p>Jemné, hypoalergenní složení je zcela bezpečné pro vlasy i pokožku hlavy.</p>
                  <h4>Výsledek, který získáte:</h4>
                  <ul className="service-benefits">
                    <li>obnovený lesk, hydrataci a vitalitu vlasů</li>
                    <li>prevenci lámání a vypadávání</li>
                    <li>zlepšení struktury a celkového zdraví vlasů, bez použití škodlivých chemických látek.</li>
                  </ul>
                  <p>Nechte své vlasy znovu zazářit!</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/vypadavani-vlasu-hair-loss-treatment.jpg" alt="Péče proti vypadávání vlasů" />
                </div>
                <div className="service-content">
                  <h3>Péče proti vypadávání vlasů</h3>
                  <p>V dnešní uspěchané době plné stresu a znečištěného ovzduší trápí vypadávání vlasů stále více žen imužů.</p>
                  <p>Profesionální komplex proti vypadávání vlasů od Philip Martin's přináší účinné řešení zaměřené na prevenci nadměrné ztráty vlasů,</p>
                  <p>Unikátní látky s přírodními aktivními složkami stimulují vlasové folikuly, zlepšují mikrocirkulaci pokožky hlavy a zajišťují intenzivní výživu každého vlasu.</p>
                  <p>Obsažené živiny posilují kořínky, zlepšují stav pokožky hlavy a podporují přirozené obnovení hustoty vlasů.</p>
                  <h4>Výsledek, který získáte:</h4>
                  <ul className="service-benefits">
                    <li>viditelné snížení vypadávání a posílení vlasové struktury;</li>
                    <li>stimulace růstu nových, zdravých vlasů;</li>
                    <li>výživu a aktivaci vlasových folikulů;</li>
                    <li>zlepšení stavu pokožky hlavy a obnovení pH rovnováhy;</li>
                    <li>prodloužení anagenní fáze; období aktivního růstu vlasů, kdy získávají maximum živin (až 4 roky u mužů a až 6 let u žen).</li>
                  </ul>
                  <h4>Procedura zahrnuje čtyři kroky:</h4>
                  <ul className="service-benefits">
                    <li>Detoxikace: odstranění nahromaděných nečistot a toxinů;</li>
                    <li>Očištění: příprava pokožky hlavy na další kroky ošetření;</li>
                    <li>Hydratace: hloubková výživa a obnova struktury vlasů;</li>
                    <li>Výživa a stimulace růstu: posílení kořínků a aktivace nového růstu.</li>
                  </ul>
                  <p>Získejte zpět husté, silné a zdravě zářící vlasy.</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/peeling-vlasove-pokozky.jpg" alt="Čištění (peeling) pokožky hlavy" />
                </div>
                <div className="service-content">
                  <h3>Čištění (peeling) pokožky hlavy</h3>
                  <p>Čistá pokožka hlavy je základem zdravých, hustých a krásných vlasů.</p>
                  <p>Peeling je důležitou součástí péče o pokožku hlavy. Přináší pocit svěžesti, odstraňuje nepříjemné pocity a zároveň probouzí vlasové folikuly. Vlasy jsou po něm lehčí, čistší a působí svěže.</p>
                  <p>Tento typ ošetření je vhodný pro všechny typy vlasů a lze jej kombinovat s většinou dalších procedur.</p>
                  <h4>Výsledek, který získáte:</h4>
                  <ul className="service-benefits">
                    <li>šetrné vyčištění pokožky od odumřelých buněk, přebytečného mazu a nečistot;</li>
                    <li>lepší prokrvení, které podporuje výživu a okysličení pokožky;</li>
                    <li>pocit komfortu bez svědění, suchosti a napětí;</li>
                    <li>stimulaci růstu vlasů a jejich posílení.</li>
                  </ul>
                  <p>Dejte své pokožce i vlasům nový dech a přirozený lesk.</p>
                </div>
              </div>
              <div className="service-card">
                <div className="service-image">
                  <img src="https://yaraspace.cz/wp-content/uploads/2025/01/hloubkova-pece.jpg" alt="Hloubková péče o vlasy" />
                </div>
                <div className="service-content">
                  <h3>Hloubková péče o vlasy</h3>
                  <p>Inovativní složení našich produktů zajišťuje intenzivní regeneraci a výživu, působí jak uvnitř, tak na povrchu každého vlasu. Diky multimolekulárnímu složení pečující přípravky vyplňují poškozená místa ve vlasovém vláknu, doplňují ztracený keratin i vlhkost a dodávají vlasům zdravý lesk, pružnost a hebkost.</p>
                  <p>Tato péče dokáže zachránit i velmi poškozené vlasy – po zesvětlení, častém barvení či jiných náročných úpravách.</p>
                  <h4>Výsledek, který získáte:</h4>
                  <ul className="service-benefits">
                    <li>hloubkovou regeneraci a výživu vlasů po celé délce;</li>
                    <li>odstranění lámavosti a poréznostis;</li>
                    <li>pružné, lesklé a snadno upravitelné vlasy;</li>
                    <li>ochranu před vnějšími vlivy a ztrátou vlhkosti.</li>
                  </ul>
                  <h4>Procedura zahrnuje:</h4>
                  <ul className="service-benefits">
                    <li>keratinový krém s regeneračními účinky;</li>
                    <li>čistý keratin obohacený o vitaminy a přírodní extrakty;</li>
                    <li>výživný komplex přírodních olejů;</li>
                    <li>pečující fluid s fytokomponenty, aminokyselinami a vitaminy.</li>
                  </ul>
                  <p>Kadeřník zvolí přípravky individuálně podle typu a stavu vašich vlasů, aby jim vrátil zdravý lesk, sílu a přirozenou krásu,</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="blog-section">
        <div className="container">
          <h1 className="blog-main-title">Blog</h1>
          <p className="blog-description">
            Objevte nejnovější trendy v péči o pleť, líčení i barvení vlasů. Poradíme vám, jak si vybrat kosmetiku, která vám opravdu sedne, a podělíme se o novinky z našeho salonu. Vítejte na blogu Yara Space & Hair Spa, kde najdete inspiraci, praktické tipy a rady od našich odborníků.
          </p>
          <div className="blog-grid">
            {blogArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/salon/blog/${article.slug}?tenant_id=${tenantId}`}
                className="blog-card"
              >
                <div className="blog-card-image">
                  <img src={article.image} alt={article.imageAlt} />
                </div>
                <div className="blog-card-content">
                  <h2 className="blog-card-title">{article.title}</h2>
                  <p className="blog-card-excerpt">{article.excerpt}</p>
                  <p className="blog-card-author">* {article.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <h1 className="pricing-main-title">Ceník</h1>
          <p className="pricing-description">
            Naše transparentní cenová politika a otevřený ceník vám umožní snadno si naplánovat rozpočet na vaši oblíbenou péči i nové beauty zážitky. Pokud uvažujete o více procedurách nebo chcete využít naše zvýhodněné balíčky, zavolejte nắm nebo nám napište přímo zde na webu - rádi vám poradíme.
          </p>

          {/* Krátké vlasy do 10 cm */}
          <div className="pricing-category">
            <h2 className="pricing-category-title">Krátké vlasy do 10 cm</h2>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Služba</th>
                    <th>Popis</th>
                    <th>Čas</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Foukání (vodová), mytí</td>
                    <td></td>
                    <td></td>
                    <td>580 Kč</td>
                  </tr>
                  <tr>
                    <td>Kompletní střih +komplet péče</td>
                    <td></td>
                    <td></td>
                    <td>680 Kč</td>
                  </tr>
                  <tr>
                    <td>Barvení, odrostu do 2 cm, (trvalá ondulace, přeliv)</td>
                    <td></td>
                    <td></td>
                    <td>1730 Kč</td>
                  </tr>
                  <tr>
                    <td>Melír doplnění odrostu, střih, konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>1830 Kč</td>
                  </tr>
                  <tr>
                    <td>Nový melír, kombinace, barev, technik, střih, konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>1930 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Polodlouhé vlasy */}
          <div className="pricing-category">
            <h2 className="pricing-category-title">Polodlouhé vlasy (max. na ramena, mikádo)</h2>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Služba</th>
                    <th>Popis</th>
                    <th>Čas</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Foukání + mytí</td>
                    <td></td>
                    <td></td>
                    <td>780 Kč</td>
                  </tr>
                  <tr>
                    <td>Úprava stávajícího střihu + péče + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>980 Kč</td>
                  </tr>
                  <tr>
                    <td>Barvení odrostů (do 2 cm) + střih + péče + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>1930 Kč / 2230 Kč</td>
                  </tr>
                  <tr>
                    <td>Melír (doplnění odrostů) + střih + péče + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>2230 Kč / 2730 Kč</td>
                  </tr>
                  <tr>
                    <td>Kombinace barvení + melírování nebo nový melír + střih + péče + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>2430 Kč / 2990 Kč</td>
                  </tr>
                  <tr>
                    <td>Po foukání lokny, vlny, přežehlení</td>
                    <td></td>
                    <td></td>
                    <td>500 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dlouhé vlasy */}
          <div className="pricing-category">
            <h2 className="pricing-category-title">Dlouhé vlasy (od ramen)</h2>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Služba</th>
                    <th>Popis</th>
                    <th>Čas</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Foukání + mytí</td>
                    <td></td>
                    <td></td>
                    <td>980 Kč</td>
                  </tr>
                  <tr>
                    <td>Úprava stávajícího střihu + péče + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>1280 Kč / 1680 Kč</td>
                  </tr>
                  <tr>
                    <td>Barvení odrostů (do 2 cm) / přeliv / tónování + péče + střih + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>2230 Kč / 3180 Kč</td>
                  </tr>
                  <tr>
                    <td>Melír (doplnění odrostů) + péče + střih + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>3630 Kč / 4080 Kč</td>
                  </tr>
                  <tr>
                    <td>Kombinace technik (barva + melír) nebo nový melír / změna barvy + péče + střih + konečná úprava</td>
                    <td></td>
                    <td></td>
                    <td>2890 Kč / 4550 Kč</td>
                  </tr>
                  <tr>
                    <td>Přežehlení vlasů, vlny, lokny</td>
                    <td></td>
                    <td></td>
                    <td>800 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pánské a dětské střihy */}
          <div className="pricing-category">
            <h2 className="pricing-category-title">Pánské a dětské střihy</h2>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Služba</th>
                    <th>Popis</th>
                    <th>Čas</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Základní střih</td>
                    <td></td>
                    <td></td>
                    <td>250 Kč</td>
                  </tr>
                  <tr>
                    <td>Náročný střih na čas a provedení</td>
                    <td></td>
                    <td></td>
                    <td>od 350 Kč</td>
                  </tr>
                  <tr>
                    <td>Střih pouze strojkem</td>
                    <td></td>
                    <td></td>
                    <td>200 Kč</td>
                  </tr>
                  <tr>
                    <td>Ofina, ornament, vousy</td>
                    <td></td>
                    <td></td>
                    <td>100 Kč</td>
                  </tr>
                  <tr>
                    <td>Dětský střih (dle náročnosti)</td>
                    <td></td>
                    <td></td>
                    <td>od 350 Kč</td>
                  </tr>
                  <tr>
                    <td>Kompletní střih + mytí + péče + konečná úprava + styling</td>
                    <td></td>
                    <td></td>
                    <td>450 Kč</td>
                  </tr>
                  <tr>
                    <td>Masáž hlavy</td>
                    <td></td>
                    <td></td>
                    <td>50 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Svatební a společenské úpravy */}
          <div className="pricing-category">
            <h2 className="pricing-category-title">Svatební a společenské úpravy vlasů</h2>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Služba</th>
                    <th>Popis</th>
                    <th>Čas</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Společenský účes + péče (bez střihu)</td>
                    <td></td>
                    <td></td>
                    <td>980 Kč</td>
                  </tr>
                  <tr>
                    <td>Vlny, lokny, výčes (dle délky a hustoty vlasů, bez střihu)</td>
                    <td></td>
                    <td></td>
                    <td>1200 Kč</td>
                  </tr>
                  <tr>
                    <td>Zkouška nevěsty + konzultace účesu (bez mytí a konečné úpravy, max. 2 pokusy / 1,5 hod.)</td>
                    <td></td>
                    <td></td>
                    <td>1500 Kč</td>
                  </tr>
                  <tr>
                    <td>Svatební účes (bez předchozí zkoušky, v salonu)</td>
                    <td></td>
                    <td></td>
                    <td>1800 Kč</td>
                  </tr>
                  <tr>
                    <td>Svatební balíček (účes v salonu včetně zkoušky předem nebo náročnější bez zkoušky)</td>
                    <td></td>
                    <td></td>
                    <td>2800 Kč</td>
                  </tr>
                  <tr>
                    <td>Úprava svatebčana (bez mytí, styling)</td>
                    <td></td>
                    <td></td>
                    <td>480 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Péče */}
          <div className="pricing-category">
            <h2 className="pricing-category-title">Péče</h2>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Služba</th>
                    <th>Popis</th>
                    <th>Čas</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Laminace vlasů</td>
                    <td></td>
                    <td></td>
                    <td>1150 Kč</td>
                  </tr>
                  <tr>
                    <td>Rekonstrukce vlasů</td>
                    <td></td>
                    <td></td>
                    <td>1200 Kč</td>
                  </tr>
                  <tr>
                    <td>Detoxikace vlasů</td>
                    <td></td>
                    <td></td>
                    <td>780 Kč</td>
                  </tr>
                  <tr>
                    <td>Hloubková hydratace</td>
                    <td></td>
                    <td></td>
                    <td>580 Kč</td>
                  </tr>
                  <tr>
                    <td>Vypadávání vlasů</td>
                    <td></td>
                    <td></td>
                    <td>1430 Kč</td>
                  </tr>
                  <tr>
                    <td>Peeling vlasové pokožky</td>
                    <td></td>
                    <td></td>
                    <td>780 Kč</td>
                  </tr>
                  <tr>
                    <td>Hloubková péče</td>
                    <td></td>
                    <td></td>
                    <td>880 Kč</td>
                  </tr>
                  <tr>
                    <td>Péče o pokožku</td>
                    <td></td>
                    <td></td>
                    <td>690 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rituály */}
          <div className="pricing-category">
            <h2 className="pricing-category-title">Rituály</h2>
            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Služba</th>
                    <th>Popis</th>
                    <th>Čas</th>
                    <th>Cena</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Suchá pokožka</td>
                    <td>Ošetření pro suchou a matnou pokožku hlavy</td>
                    <td>15 min</td>
                    <td>750 Kč</td>
                  </tr>
                  <tr>
                    <td>Mastná pokožka</td>
                    <td>Ideální ošetření pokožky hlavy s přebytečným mazem a hyperhidrozou</td>
                    <td>15 min</td>
                    <td>750 Kč</td>
                  </tr>
                  <tr>
                    <td>Pokožka a lupy</td>
                    <td>Ideální ošetření pokožky hlavy s odlupováním nebo lupy</td>
                    <td>15 min</td>
                    <td>750 Kč</td>
                  </tr>
                  <tr>
                    <td>Svědění</td>
                    <td>Ideální ošetření pokožky hlavy se zarudnutím a / nebo svěděním</td>
                    <td>15 min</td>
                    <td>750 Kč</td>
                  </tr>
                  <tr>
                    <td>PICASSO mastná pokožka</td>
                    <td>Ritual pokožky hlavy regulující kožní maz</td>
                    <td>90 min</td>
                    <td>2000 Kč</td>
                  </tr>
                  <tr>
                    <td>HAIR LOSS TREATMENTT VÝPADAVANÍ SUCHÁ/NORMALNÍ</td>
                    <td>Ideální léčba k prevenci a / nebo zpomalení sezonního vypadávání</td>
                    <td>60 min</td>
                    <td>2200 Kč</td>
                  </tr>
                  <tr>
                    <td>HAIR LOSS TREATMENTT VÝPADAVANÍ (MASTNÁ POKOŽKA)</td>
                    <td>Ideální ošetření pro prevenci a / nebo zpomalení sezonního vypadávání</td>
                    <td>60 min</td>
                    <td>2200 Kč</td>
                  </tr>
                  <tr>
                    <td>Jemné vlasy / Mechanické poškození</td>
                    <td>Ideální ošetření pro obnovení objemu tenkých vlasů</td>
                    <td>20 min</td>
                    <td>950 Kč</td>
                  </tr>
                  <tr>
                    <td>Kudrnaté vlasy</td>
                    <td>Ideální ošetření pro obnovení elasticity a definování kadeře</td>
                    <td>20 min</td>
                    <td>700 Kč</td>
                  </tr>
                  <tr>
                    <td>Suché vlasy</td>
                    <td>Ideální kůra pro obnovení hydratace a lesku suchých vlasů</td>
                    <td>20 min</td>
                    <td>950 Kč</td>
                  </tr>
                  <tr>
                    <td>SŤEDNĚ POŠKOZENÉ VLASY</td>
                    <td>Ideální kůra pro vlasy poškozené chemickým ošetřením nebo nadměrným a nesprávným používáním žehliček a fénu</td>
                    <td>90 min</td>
                    <td>2700 Kč</td>
                  </tr>
                  <tr>
                    <td>SILNĚ POŠKOZENÉ VLASY A SLABÝ VLAS</td>
                    <td>Ideální kůra pro vlasy poškozené chemickým ošetřením nebo nadměrným a nesprávným používáním žehliček a fénu</td>
                    <td>90 min</td>
                    <td>2750 Kč</td>
                  </tr>
                  <tr>
                    <td>UNDER CONTROL Ošetření proti krepatění</td>
                    <td>Osvěžující fluid pro suché a rozcuchané vlasy. Poskytuje lesk a hebkost. Pomáhá udržovat vlasy v kondici, chrání je před zdroji tepla ( fén, žehlička) a vlhkosti. Nezanechává žádné zbytky, nemastí a nezatěžuje vlasy.</td>
                    <td>150 min</td>
                    <td>3850 Kč</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <h1 className="testimonials-main-title">Zkušenosti</h1>
          <p className="testimonials-intro">
            Každý spokojený klient je pro nás malým úspěchem, který pro nás znamená víc než jakékoli ocenění. Děkujeme, že nám důvěřujete a umožňujete naší práci podtrhnout vaši přirozenou krásu. Vaše zpětná vazba je pro nás každodenní inspirací a hnací silou, proč to děláme.
          </p>
          <button className="testimonials-comment-btn">Zanechat komentář</button>
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
              <a href="#" className="testimonial-read-more">Přečíst více</a>
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
              <a href="#" className="testimonial-read-more">Přečíst více</a>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Chci zanechat recenzi na tento úžasný kadeřnický salon a zejména na kadeřnici! Práce byla provedena na nejvyšší úrovni – velmi pečlivě, kvalitně a s důrazem na detaily. Je vidět, že tato osoba miluje svou profesi a vkládá do své práce srdce. Výsledek předčil všechna očekávání!Také bych chtěla vyzdvihnout dostupné ceny, které dělají návštěvu této kadeřnice ještě příjemnější. Pokud hledáte profesionála, kterému můžete svěřit svůj účes, vřele doporučuji! Určitě budete spokojeni!</p>
              <p className="testimonial-author">Marina Vološko</p>
              <a href="#" className="testimonial-read-more">Přečíst více</a>
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
              <a href="#" className="testimonial-read-more">Přečíst více</a>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Nabarvila jsem si své dlouhé vlasy s šedinami barvou Filip Martin. Příjemně mě překvapila barva a lesk. Vlasy se vyživily oleji, zhoustly a změkly. Objem copu se znatelně zvětšil. Navíc při růstu kořínků není přechod viditelný (vybrali jsme odstín barvy podle mého přirozeného tónu vlasů). Celkově jsem velmi spokojená a chci to zopakovat. Vlasy vypadají zdravě a upraveně, a kadeřnice Jaroslava byla pozorná a snažila se dosáhnout co nejlepšího výsledku. Všem doporučuji tento nový kadeřnický salon!</p>
              <p className="testimonial-author">Zel</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar"></div>
              <p className="testimonial-text">Skvělá práce a opravdu šikovná kadeřnice! Je vidět, že má zkušenosti a dělá to s citem. Moc doporučuji!</p>
              <p className="testimonial-author">Kate Prokopenko</p>
            </div>
          </div>
          <button className="testimonials-load-more-btn">Stáhnout více</button>
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

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h1 className="contact-main-title">Kontakty</h1>
          <div className="contact-content">
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={(e) => {
                e.preventDefault();
                // TODO: Implement form submission
                alert('Formulář bude brzy funkční. Prozatím nás kontaktujte na office@yaraspace.cz');
              }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Název *"
                  required
                  className="contact-form-input"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Telefonní číslo *"
                  required
                  className="contact-form-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  className="contact-form-input"
                />
                <textarea
                  name="message"
                  placeholder="Vaše zpráva"
                  rows={5}
                  className="contact-form-textarea"
                />
                <button type="submit" className="contact-form-submit">Odeslat</button>
              </form>
            </div>
            <div className="contact-info-wrapper">
              <div className="contact-info">
                <div className="contact-item">
                  <h3 className="contact-item-title">E-mail</h3>
                  <a href="mailto:office@yaraspace.cz" className="contact-item-value">office@yaraspace.cz</a>
                </div>
                <div className="contact-item">
                  <h3 className="contact-item-title">Telefonní číslo</h3>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="contact-item-value">{phone}</a>
                </div>
              </div>
              <div className="contact-social">
                <a href="https://www.instagram.com/yaraspace_hairspa" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/people/Yara-Space-Hair-Spa/61566509807038/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="http://wa.me/420776886466" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="contact-details">
            <div className="contact-detail-item">
              <div className="contact-detail-icon">🕐</div>
              <p className="contact-detail-text">Po–Pá: 09:00–19:00, So: 10:00–16:00</p>
            </div>
            <div className="contact-detail-item">
              <div className="contact-detail-icon">📍</div>
              <p className="contact-detail-text">Križná 169/8, Kroměříž</p>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2605.1234567890123!2d17.394814!3d49.297924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4713e5c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5c!2sKrižn%C3%A1%20169%2F8%2C%20Krom%C4%9B%C5%99%C3%AD%C5%BE!5e0!3m2!1scs!2scz!4v1234567890123!5m2!1scs!2scz"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Yara Space & Hair Spa Location"
            />
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
              <a href="https://www.instagram.com/yaraspace_hairspa" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/people/Yara-Space-Hair-Spa/61566509807038/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="http://wa.me/420776886466" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
            <nav className="footer-nav">
              <a href="/">Beauty Franchise</a>
              <a href="/#features">Funkce</a>
              <a href="/#franchise-form">Kontakt</a>
              <a href="#about">O nás</a>
              <Link href={`/salon/blog?tenant_id=${tenantId}`}>Blog</Link>
              <a href="#services">Služby</a>
              <a href="#pricing">Ceník</a>
              <a href="#testimonials">Zkušenosti</a>
              <a href="#contact">Kontakty</a>
            </nav>
            <div className="footer-bottom">
              <p>Yara Space & Hair Spa © 2026</p>
              <p>Všechna práva vyhrazena</p>
              <a href="/privacy/">Zásady ochrany osobních údajů</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
