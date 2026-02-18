import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { publicApi, type SalonInfo } from '../../api/public';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PlatformAuthLinks } from '../auth/PlatformAuthLinks';

// Simple SVG Icons
const SpaIcon = () => (
  <svg className="w-12 h-12 md:w-16 md:h-16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BrushIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.71 4.63l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12l2 2 6.37-6.37c.39-.39.39-1.02 0-1.41zM5 16l-1 5 5-1-1-1-3 3-3-3 3-3-1-1z"/>
  </svg>
);

const FaceIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

const FlowerIcon = () => (
  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const HeartIcon = () => (
  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

/**
 * Modern Public Landing Page Component
 *
 * Beautiful landing page inspired by Yara Space design.
 * Shows salon-specific content when tenant_id is provided,
 * otherwise shows salon selection form.
 *
 * Rules:
 * - No authentication required
 * - Tenant selection explicit
 * - Navigate to booking after tenant selection
 */
export function LandingPage() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenantId = searchParams.get('tenant_id');

  const [salonId, setSalonId] = useState('');
  const [error, setError] = useState('');
  const [salonInfo, setSalonInfo] = useState<SalonInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Load salon info by slug (from URL path) or tenant_id (from query param for backward compatibility)
  useEffect(() => {
    if (tenantSlug) {
      loadSalonInfoBySlug(tenantSlug);
    } else if (tenantId) {
      loadSalonInfo(tenantId);
    }
  }, [tenantSlug, tenantId]);

  const loadSalonInfoBySlug = async (slug: string) => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const apiSalonInfo = await publicApi.getSalonInfoBySlug(slug);
      if (apiSalonInfo) {
        setSalonInfo(apiSalonInfo);
        return;
      }

      // For MVP, use mock data based on slug
      // TODO: Replace with actual API call when tenant info endpoint is ready
      const mockSalonInfo: SalonInfo = getMockSalonInfoBySlug(slug);
      if (mockSalonInfo) {
        setSalonInfo(mockSalonInfo);
        if (mockSalonInfo.id) {
          localStorage.setItem('public_tenant_id', mockSalonInfo.id);
        }
      } else {
        setError(`Salon with URL "${slug}" not found`);
      }
    } catch (err) {
      console.error('Failed to load salon info by slug:', err);
      setError('Failed to load salon information');
    } finally {
      setLoading(false);
    }
  };

  const loadSalonInfo = async (id: string) => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const apiSalonInfo = await publicApi.getSalonInfo(id);
      if (apiSalonInfo) {
        setSalonInfo(apiSalonInfo);
        return;
      }

      // For MVP, use mock data
      // TODO: Replace with actual API call when tenant info endpoint is ready
      const mockSalonInfo: SalonInfo = {
        id,
        name: 'Yara Space & Hair Spa',
        address: 'Križná 169/8, Kroměříž',
        phone: '+420 776 886 466',
        email: 'office@yaraspace.cz',
        businessHours: 'Po–Pá: 09:00–19:00, So: 10:00–16:00',
        description: 'Yara Space & Hair Spa – to je vaše dobrá nálada, sebevědomí a ten pocit, že jste to vy, jen ještě krásnější. Odvážné mikádo, nová energie, dokonalé svatební fotografie. První rande, na kterém se citíte jako královna. Účes, který vám opravdu sluší!',
        theme_config: {
          primaryColor: '#d4a574',
          secondaryColor: '#f5c6cb',
        },
      };
      setSalonInfo(mockSalonInfo);
      localStorage.setItem('public_tenant_id', id);
    } catch (err) {
      console.error('Failed to load salon info:', err);
      setError('Failed to load salon information');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get mock salon info by slug (for MVP)
  const getMockSalonInfoBySlug = (slug: string): SalonInfo => {
    // Map known slugs to mock data
    const mockSalons: Record<string, SalonInfo> = {
      'yaraspace': {
        id: 'af8ad504-0077-4da0-b3c0-7b903f15d944',
        url_slug: 'yaraspace',
        name: 'Yara Space & Hair Spa',
        address: 'Križná 169/8, Kroměříž',
        phone: '+420 776 886 466',
        email: 'office@yaraspace.cz',
        businessHours: 'Po–Pá: 09:00–19:00, So: 10:00–16:00',
        description: 'Yara Space & Hair Spa – to je vaše dobrá nálada, sebevědomí a ten pocit, že jste to vy, jen ještě krásnější. Odvážné mikádo, nová energie, dokonalé svatební fotografie. První rande, na kterém se citíte jako královna. Účes, který vám opravdu sluší!',
        theme_config: {
          primaryColor: '#d4a574',
          secondaryColor: '#f5c6cb',
        },
      },
      'salon-1': {
        id: 'af8ad504-0077-4da0-b3c0-7b903f15d944',
        url_slug: 'salon-1',
        name: 'Salon #1',
        address: 'Križná 169/8, Kroměříž',
        phone: '+420 776 886 466',
        email: 'office@yaraspace.cz',
        businessHours: 'Po–Pá: 09:00–19:00, So: 10:00–16:00',
        description: 'Profesionální kadeřnický salon s moderním přístupem ke kráse.',
        theme_config: {
          primaryColor: '#d4a574',
          secondaryColor: '#f5c6cb',
        },
      },
    };

    return mockSalons[slug] || null;
  };

  const handleStartBooking = () => {
    if (!salonId || !salonId.trim()) {
      setError('Please enter a salon ID');
      return;
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(salonId.trim())) {
      setError('Invalid salon ID format');
      return;
    }

    // Store tenant_id for public booking flow
    localStorage.setItem('public_tenant_id', salonId.trim());

    // Navigate to booking page with tenant_id
    navigate(`/booking?tenant_id=${salonId.trim()}`);
  };

  // Show loading state when fetching salon info
  if (loading && (tenantId || tenantSlug)) {
    return <LoadingSpinner />;
  }

  // If tenant_id is provided and salon info loaded, show salon landing page
  if (tenantId && salonInfo) {
    return <SalonLandingPage salonInfo={salonInfo} />;
  }

  // If tenantSlug is provided and salon info loaded, show salon landing page
  if (tenantSlug && salonInfo) {
    return <SalonLandingPage salonInfo={salonInfo} />;
  }

  // Otherwise show salon selection form (beautiful version)
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-accent via-accent to-[#f5c6cb]">
      {/* Top bar: platform auth (auth-microservice) */}
      <header className="absolute top-0 right-0 left-0 z-10 flex justify-end items-center px-4 py-3">
        <PlatformAuthLinks />
      </header>
      {/* Decorative background elements */}
      <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full bg-white/10 blur-[60px]" />
      <div className="absolute -bottom-[150px] -left-[150px] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]" />

      <div className="container relative py-section-mobile md:py-section-desktop">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          {/* Hero Section */}
          <div className="text-center mb-12 max-w-3xl">
            <h1 className="text-h1-mobile md:text-h1-desktop font-heading font-bold text-white mb-4 drop-shadow-lg">
              Beauty Franchise Platform
            </h1>
            <p className="text-body-mobile md:text-body-desktop font-poppins text-white/90 mb-8">
              Book your appointment online
            </p>
          </div>

          {/* Salon Selection Card */}
          <div className="max-w-[600px] w-full p-8 md:p-12 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4 text-accent">
                <SpaIcon />
              </div>
              <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark mb-2">
                Select Your Salon
              </h2>
              <p className="text-body-mobile md:text-body-desktop font-poppins text-soft">
                Enter your salon ID to continue with online booking
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-body-mobile md:text-body-desktop font-body font-semibold text-dark mb-2">
                Salon ID
              </label>
              <input
                type="text"
                value={salonId}
                onChange={(e) => {
                  setSalonId(e.target.value);
                  setError('');
                }}
                placeholder="Enter salon UUID"
                className={`w-full px-4 py-3 rounded-button border ${
                  error ? 'border-red-500' : 'border-borderLight'
                } bg-base text-dark text-body-mobile md:text-body-desktop font-body focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent`}
              />
              {error ? (
                <p className="mt-2 text-body-mobile md:text-body-desktop font-body text-red-600">{error}</p>
              ) : (
                <p className="mt-2 text-body-mobile md:text-body-desktop font-body text-soft">
                  Enter the unique identifier for your salon
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-button bg-red-50 border border-red-200 text-red-800 text-body-mobile md:text-body-desktop font-body">
                {error}
              </div>
            )}

            <button
              onClick={handleStartBooking}
              disabled={!salonId.trim()}
              className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalendarIcon />
              Start Booking
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-body-mobile md:text-body-desktop font-body text-white/80">
              Need help? Contact your salon directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Salon-Specific Landing Page
 * Beautiful landing page for a specific salon
 */
function SalonLandingPage({ salonInfo }: { salonInfo: SalonInfo }) {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/booking?tenant_id=${salonInfo.id}`);
  };

  const services = [
    {
      title: 'Brazilian Bleach',
      description: 'Technika Brazilian Bleach je jedinečný způsob, jak vytvořit jemný kontrast mezi tmavšími a světlejšími prameny. Diky harmonickému propojení odstín: například tmavě blond a světle karamelové vzniká přírozený, plynulý přechod barev.',
      icon: <BrushIcon />,
      image: 'https://yaraspace.cz/wp-content/uploads/2025/05/brazilian-bleach.webp',
    },
    {
      title: 'Airtouch',
      description: 'Tato moderní technika přínáší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé.',
      icon: <FaceIcon />,
      image: 'https://yaraspace.cz/wp-content/uploads/2025/05/airtouch.webp',
    },
    {
      title: 'Laminování vlasů',
      description: 'Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření! Bez peroxidu, amoniaku a jiných agresivních látek vytváří na každém vlasu hladký a průhledný film.',
      icon: <FlowerIcon />,
      image: 'https://yaraspace.cz/wp-content/uploads/2025/05/laminovani-vlasu.webp',
    },
  ];

  const testimonials = [
    {
      name: 'Tatiana Titorenko',
      text: 'Děkuji za skvělý servis. Skvělá kadeřnice, velmi milá a přátelská, profesionálka ve svém oboru.',
      rating: 5,
    },
    {
      name: 'Tatiana Kravčuk',
      text: 'Kvalita produktů a úroveň provedení práce je vždy na vysoké úrovni!!! Kadeřnice vždy chápe potřeby a přání zákazníka.',
      rating: 5,
    },
    {
      name: 'Marina Vološko',
      text: 'Práce byla provedena na nejvyšší úrovni – velmi pečlivě, kvalitně a s důrazem na detaily. Výsledek předčil všechna očekávání!',
      rating: 5,
    },
  ];

  const whyChooseUs = [
    {
      title: 'Bezpečí',
      description: 'Profesionalita začíná u detailů: dokonale čisté nástroje, bezpečné produkty a ohleduplný přístup.',
      icon: <CheckIcon />,
    },
    {
      title: 'Otevřenost',
      description: 'Každá služba začíná konzultací. Vysvětlíme vám postup, cenu i složení používané kosmetiky.',
      icon: <HeartIcon />,
    },
    {
      title: 'Sebevědomí',
      description: 'Víme, že krása je v jedinečnosti. Pomůžeme vám objevit svůj styl a zdůraznit vaše přednosti.',
      icon: <StarIcon />,
    },
    {
      title: 'Atmosféra',
      description: 'Příjemná hudba, vůně čaje, teplé úsměvy a pohodová konverzace - každý detail vytváří atmosféru.',
      icon: <SpaIcon />,
    },
  ];

  return (
    <div className="bg-light min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        <header className="absolute top-0 right-0 left-0 z-30 flex justify-end items-center px-4 py-3">
          <PlatformAuthLinks className="text-white [&_a]:text-white [&_a:hover]:bg-white/20" />
        </header>
        {/* Background Image */}
        <img
          src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp"
          alt={salonInfo.name}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
        {/* Overlay with warm colors */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/75 to-[#f5c6cb]/75 z-10" />
        <div className="container relative z-20">
          <div className="text-center text-white">
            <h1 className="text-h1-mobile md:text-h1-desktop font-heading font-bold mb-4 drop-shadow-lg">
              {salonInfo.name}
            </h1>
            <p className="text-body-mobile md:text-body-desktop font-poppins mb-8 opacity-95">
              {salonInfo.description || 'Vaše krása si zaslouží zazářit. My víme, jak na to.'}
            </p>
            <button
              onClick={handleBookNow}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <CalendarIcon />
              Vytvořit rezervaci
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info Bar */}
      {(salonInfo.phone || salonInfo.email || salonInfo.address || salonInfo.businessHours) && (
        <div className="bg-accent text-white py-section-mobile md:py-6">
          <div className="container">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {salonInfo.phone && (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <PhoneIcon />
                  <div>
                    <p className="text-body-mobile md:text-body-desktop font-body opacity-90 text-sm">
                      Telefonní číslo
                    </p>
                    <p className="text-body-mobile md:text-body-desktop font-body font-semibold">
                      {salonInfo.phone}
                    </p>
                  </div>
                </div>
              )}
              {salonInfo.email && (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <EmailIcon />
                  <div>
                    <p className="text-body-mobile md:text-body-desktop font-body opacity-90 text-sm">
                      E-mail
                    </p>
                    <p className="text-body-mobile md:text-body-desktop font-body font-semibold">
                      {salonInfo.email}
                    </p>
                  </div>
                </div>
              )}
              {salonInfo.businessHours && (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <CalendarIcon />
                  <div>
                    <p className="text-body-mobile md:text-body-desktop font-body opacity-90 text-sm">
                      Otevírací doba
                    </p>
                    <p className="text-body-mobile md:text-body-desktop font-body font-semibold">
                      {salonInfo.businessHours}
                    </p>
                  </div>
                </div>
              )}
              {salonInfo.address && (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <LocationIcon />
                  <div>
                    <p className="text-body-mobile md:text-body-desktop font-body opacity-90 text-sm">
                      Adresa
                    </p>
                    <p className="text-body-mobile md:text-body-desktop font-body font-semibold">
                      {salonInfo.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container py-section-mobile md:py-section-desktop">
        {/* Services Section */}
        <div className="mb-20 md:mb-24">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark text-center mb-4">
            Zasvětlujicí techniky
          </h2>
          <p className="text-body-mobile md:text-body-desktop font-poppins text-soft text-center mb-12">
            Profesionální služby pro vaši krásu
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="h-full rounded-2xl shadow-lg transition-transform duration-300 overflow-hidden hover:-translate-y-2 hover:shadow-xl"
              >
                {service.image && (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-[200px] object-cover block"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="p-6 md:p-8">
                  <div className="text-accent mb-4">{service.icon}</div>
                  <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-3">
                    {service.title}
                  </h3>
                  <p className="text-body-mobile md:text-body-desktop font-poppins text-soft">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-20 md:mb-24 bg-base border border-borderLight rounded-2xl p-8 md:p-12">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark text-center mb-8">
            Proč si vybrat právě nás?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-4">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-accent mb-4 flex justify-center">{item.icon}</div>
                <h3 className="text-h3-mobile md:text-h3-desktop font-heading font-semibold text-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-body-mobile md:text-body-desktop font-poppins text-soft">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20 md:mb-24">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-dark text-center mb-8">
            Zkušenosti zákazníků
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 md:p-8 rounded-2xl h-full shadow-lg bg-base border border-borderLight flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white text-xl font-semibold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-body-mobile md:text-body-desktop font-body font-semibold text-dark">
                      {testimonial.name}
                    </p>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-body-mobile md:text-body-desktop font-body italic text-soft flex-grow">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-accent to-[#f5c6cb] rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-h2-mobile md:text-h2-desktop font-heading font-semibold text-white mb-4">
            Připraveni začít?
          </h2>
          <p className="text-body-mobile md:text-body-desktop font-poppins mb-8 opacity-90">
            Rezervujte si termín ještě dnes a objevte svou krásu
          </p>
          <button
            onClick={handleBookNow}
            className="btn bg-white text-accent hover:bg-light flex items-center gap-2 mx-auto"
          >
            <CalendarIcon />
            Vytvořit rezervaci
          </button>
        </div>
      </div>
    </div>
  );
}
