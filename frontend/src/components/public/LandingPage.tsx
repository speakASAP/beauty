import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Grid,
  Paper,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Spa,
  Favorite,
  Star,
  CheckCircle,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  Brush,
  Face,
  LocalFlorist,
} from '@mui/icons-material';

interface SalonInfo {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  businessHours?: string;
}

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
  const getMockSalonInfoBySlug = (slug: string): SalonInfo | null => {
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

  // Apply custom theme from tenant config
  const customTheme = useMemo(() => {
    if (!salonInfo?.theme_config) return null;

    const config = salonInfo.theme_config;
    return {
      primary: {
        main: config.primaryColor || '#d4a574',
        light: config.secondaryColor || '#e8b4b8',
        dark: config.primaryColor ? adjustBrightness(config.primaryColor, -20) : '#c8966a',
      },
      secondary: {
        main: config.secondaryColor || '#f5c6cb',
        light: config.secondaryColor ? adjustBrightness(config.secondaryColor, 20) : '#f8d7da',
        dark: config.secondaryColor ? adjustBrightness(config.secondaryColor, -20) : '#e8b4b8',
      },
    };
  }, [salonInfo?.theme_config]);

  // Helper to adjust color brightness
  const adjustBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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

  // If tenant_id is provided and salon info loaded, show salon landing page
  if (tenantId && salonInfo) {
    return <SalonLandingPage salonInfo={salonInfo} />;
  }

  // Otherwise show salon selection form (beautiful version)
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d4a574 0%, #f5c6cb 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(80px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
          }}
        >
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 6, maxWidth: 800 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                color: 'white',
                mb: 2,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              Beauty Franchise Platform
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                fontWeight: 300,
              }}
            >
              Book your appointment online
            </Typography>
          </Box>

          {/* Salon Selection Card */}
          <Card
            sx={{
              maxWidth: 600,
              width: '100%',
              p: 4,
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Spa sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
                  Select Your Salon
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enter your salon ID to continue with online booking
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Salon ID"
                  value={salonId}
                  onChange={(e) => {
                    setSalonId(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter salon UUID"
                  error={!!error}
                  helperText={error || 'Enter the unique identifier for your salon'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleStartBooking}
                disabled={!salonId.trim()}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  },
                }}
                startIcon={<CalendarToday />}
              >
                Start Booking
              </Button>
            </CardContent>
          </Card>

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Need help? Contact your salon directly.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
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
      icon: <Brush />,
      image: 'https://yaraspace.cz/wp-content/uploads/2025/05/brazilian-bleach.webp',
    },
    {
      title: 'Airtouch',
      description: 'Tato moderní technika přínáší maximálně přirozený výsledek: vlasy získávají jas, optický objem a lehkost. Přechody odstínů jsou jemné, měkké a naprosto plynulé.',
      icon: <Face />,
      image: 'https://yaraspace.cz/wp-content/uploads/2025/05/airtouch.webp',
    },
    {
      title: 'Laminování vlasů',
      description: 'Hebké, lesklé, hydratované a posílené vlasy, přesně takový efekt přináší profesionální ošetření! Bez peroxidu, amoniaku a jiných agresivních látek vytváří na každém vlasu hladký a průhledný film.',
      icon: <LocalFlorist />,
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
      icon: <CheckCircle />,
    },
    {
      title: 'Otevřenost',
      description: 'Každá služba začíná konzultací. Vysvětlíme vám postup, cenu i složení používané kosmetiky.',
      icon: <Favorite />,
    },
    {
      title: 'Sebevědomí',
      description: 'Víme, že krása je v jedinečnosti. Pomůžeme vám objevit svůj styl a zdůraznit vaše přednosti.',
      icon: <Star />,
    },
    {
      title: 'Atmosféra',
      description: 'Příjemná hudba, vůně čaje, teplé úsměvy a pohodová konverzace - každý detail vytváří atmosféru.',
      icon: <Spa />,
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section with Background Image */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '60vh', md: '80vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <Box
          component="img"
          src="https://yaraspace.cz/wp-content/uploads/2025/05/yaraspace_intro.webp"
          alt={salonInfo.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
        {/* Overlay with warm colors */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.75) 0%, rgba(245, 198, 203, 0.75) 100%)',
            zIndex: 1,
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                mb: 2,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              {salonInfo.name}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 300,
                opacity: 0.95,
              }}
            >
              {salonInfo.description || 'Vaše krása si zaslouží zazářit. My víme, jak na to.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleBookNow}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 3,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                },
              }}
              startIcon={<CalendarToday />}
            >
              Vytvořit rezervaci
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Contact Info Bar */}
      {(salonInfo.phone || salonInfo.email || salonInfo.address || salonInfo.businessHours) && (
        <Box sx={{ bgcolor: '#d4a574', color: 'white', py: 3 }}>
          <Container maxWidth="lg">
            <Grid container spacing={3} justifyContent="center" alignItems="center">
              {salonInfo.phone && (
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                    <Phone fontSize="small" />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                        Telefonní číslo
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {salonInfo.phone}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {salonInfo.email && (
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                    <Email fontSize="small" />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                        E-mail
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {salonInfo.email}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {salonInfo.businessHours && (
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                    <CalendarToday fontSize="small" />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                        Otevírací doba
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {salonInfo.businessHours}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {salonInfo.address && (
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                    <LocationOn fontSize="small" />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
                        Adresa
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {salonInfo.address}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Services Section */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight={600}>
            Zasvětlujicí techniky
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Profesionální služby pro vaši krásu
          </Typography>
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  {service.image && (
                    <Box
                      component="img"
                      src={service.image}
                      alt={service.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ color: 'primary.main', mb: 2, fontSize: 40 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Why Choose Us Section */}
        <Box sx={{ mb: 10, bgcolor: 'grey.50', borderRadius: 4, p: 6 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight={600}>
            Proč si vybrat právě nás?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {whyChooseUs.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2, fontSize: 48 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials Section */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight={600}>
            Zkušenosti zákazníků
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    height: '100%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mr: 2,
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} sx={{ color: 'warning.main', fontSize: 16 }} />
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ flexGrow: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                    "{testimonial.text}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 4,
            p: 6,
            background: 'linear-gradient(135deg, #d4a574 0%, #f5c6cb 100%)',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
            Připraveni začít?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Rezervujte si termín ještě dnes a objevte svou krásu
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleBookNow}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 3,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
            startIcon={<CalendarToday />}
          >
            Vytvořit rezervaci
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
