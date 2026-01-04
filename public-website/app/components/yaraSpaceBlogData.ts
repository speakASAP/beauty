// Blog articles data from yaraspace.cz/cs/articles/
export interface BlogArticle {
  slug: string
  title: string
  excerpt: string
  image: string
  imageAlt: string
  author: string
}

export const blogArticles: BlogArticle[] = [
  {
    slug: 'airtouch-barveni-v-kromerizi',
    title: 'AirTouch barvení v Kroměříži',
    excerpt: 'Toužíte po luxusním blond odstínu, který působí maximálně přirozeně? Technika AirTouch je skutečným pokladem pro každého, kdo chce zesvětlit vlasy bez zbytečného poškození. Díky této metodě vzniká jemný barevný přechod,...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/10/airtouch-scaled.webp',
    imageAlt: 'Airtouch',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'prodluzovani-vlasu',
    title: 'Prodlužování vlasů kapslovou a tape-in metodou: co si vybrat v Kroměříži',
    excerpt: 'Krásné, husté a dlouhé vlasy je to sen mnoha žen. Díky moderním technologiím si tento sen Ize snadno splnit. Už kvůli tomu nemusíte léta nechat růst vlasy. Specialisté na prodlužování...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/11/hair_extensions.webp',
    imageAlt: 'Prodlužování vlasů v Yara Space & Hair Spa',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'provoz-bez-objednani',
    title: 'Provoz bez objednání: jak funguje živá fronta v Yara Space',
    excerpt: 'Někdy se prostě chcete zastavit ve svém oblíbeném salonu krásy bez telefonátů, bez domlouvání termínů a bez zdlouhavých plánů. Občas je nutné se narychlo připravit na neplánované rande nebo prostě...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/11/dsc_2045-scaled.webp',
    imageAlt: 'Provoz bez objednání: jak funguje živá fronta v Yara Space',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'chemicka-trvala-na-vlasy',
    title: 'Nová služba v Yara Space: chemická trvalá na vlasy',
    excerpt: 'Chcete mít krásné, pružné lokny nebo jemné vlny bez nutnosti každodenní úpravy? Nyní je to možné! Ve studiu Yara Space jsme zařadili do nabídky novou službu trvalou ondulaci vlasů. V...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/10/image_2025-10-19_20-56-54.webp',
    imageAlt: 'Chemická trvalá na vlasy',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'jak-vybrat-dokonalou-vlasovou-peci',
    title: 'Jak vybrat dokonalou vlasovou péči: rady profesionálů kosmetického salonu v Kroměříži',
    excerpt: 'Genetika, nedostatek vitamínů nebo špatný účes – stovky žen se každý den ptají: „Co je s mými vlasy, proč nevypadají jako v reklamě?" Většinu problémů, ať už jde o matnost,...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/08/dsc_6586-scaled.jpeg',
    imageAlt: 'Péče o vlasy v Yara Space & Hair Spa',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'hloubkove-cisteni-vlasu-v-kromerizi-vyhody-postup-a-vysledky',
    title: 'Proč vlasy potřebují hloubkové čištění: Výhody a výsledky',
    excerpt: 'Prach, stylingové přípravky, tvrdá voda, cigaretový kouř a výfukové plyny – to vše postupně znečišťuje vlasy a vlasovou pokožku a hromadí se nejen na povrchu, ale i v stvolech každého...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/08/dsc_6554-scaled.jpeg',
    imageAlt: 'Profesionální péče o vaše vlasy',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'profesionalni-vlasova-kosmetika',
    title: 'Profesionální vlasová kosmetika: jak vybrat produkty pro kadeřníky a pro domácí použití',
    excerpt: 'Krásné lesklé vlasy nejsou jen genetika. Díky moderním přípravkům a správné péči můžete svým vlasům dodat atraktivní vzhled, vyřešit problém vypadávání vlasů, nadměrné suchosti a obnovit strukturu svých kadeří. Profesionální...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/07/makeup.jpg',
    imageAlt: 'Profesionální vlasová kosmetika',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'profesionalni-liceni-na-svatby-a-jine-akce',
    title: 'Profesionální líčení na svatby a jiné akce',
    excerpt: 'Ve výjimečných dnech se chce každá žena cítit dokonale – ať už jde o svatbu, promoci, firemní večírek nebo dlouho očekávané rande. Profesionální make-up pomůže zvýraznit váš vzhled, dodá vaší...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/06/img_9947.jpg',
    imageAlt: 'Profesionální líčení',
    author: 'Yaroslava Vlasova'
  },
  {
    slug: 'manikura-gelovym-lakem-nejmodernejsi-techniky-a-bezpecny-selak',
    title: 'Manikúra gelovým lakem – nejmodernější techniky a bezpečný šelak',
    excerpt: 'S radostí oznamujeme, že Yara Space & Hair Spa v Kroměříži nyní nabízí novou službu - šelakovou manikúru. Shellac manikúra zůstává jednou z nejoblíbenějších kosmetických procedur, která nabízí dlouhotrvající a...',
    image: 'https://yaraspace.cz/wp-content/uploads/2025/06/manikura-scaled.webp',
    imageAlt: 'Manikúra gelovým lakem – nejmodernější techniky a bezpečný šelak',
    author: 'Yaroslava Vlasova'
  }
]
