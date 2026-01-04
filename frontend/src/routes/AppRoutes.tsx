import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { TenantProvider } from '../contexts/TenantContext';
import { ProtectedRoute } from './ProtectedRoute';
import { Navigation } from '../components/common/Navigation';

// Lazy load auth components
const Login = lazy(() => import('../components/auth/Login').then(m => ({ default: m.Login })));
const TenantSelection = lazy(() => import('../components/auth/TenantSelection').then(m => ({ default: m.TenantSelection })));

// Lazy load common components
const Unauthorized = lazy(() => import('../components/common/Unauthorized').then(m => ({ default: m.Unauthorized })));

// Lazy load POS components
const AppointmentCalendar = lazy(() => import('../components/pos/AppointmentCalendar').then(m => ({ default: m.AppointmentCalendar })));
const VisitManagement = lazy(() => import('../components/pos/VisitManagement').then(m => ({ default: m.VisitManagement })));
const ShiftCloseDashboard = lazy(() => import('../components/pos/ShiftCloseDashboard').then(m => ({ default: m.ShiftCloseDashboard })));
const ClientRegistration = lazy(() => import('../components/pos/ClientRegistration').then(m => ({ default: m.ClientRegistration })));
const BookAppointmentForm = lazy(() => import('../components/pos/BookAppointmentForm').then(m => ({ default: m.BookAppointmentForm })));
const OrderDetails = lazy(() => import('../components/pos/OrderDetails').then(m => ({ default: m.OrderDetails })));
const Checkout = lazy(() => import('../components/pos/Checkout').then(m => ({ default: m.Checkout })));
const PaymentStatus = lazy(() => import('../components/pos/PaymentStatus').then(m => ({ default: m.PaymentStatus })));

// Lazy load Franchise components
const TenantOverview = lazy(() => import('../components/franchise/TenantOverview').then(m => ({ default: m.TenantOverview })));
const KPIDashboard = lazy(() => import('../components/franchise/KPIDashboard').then(m => ({ default: m.KPIDashboard })));
const PricingControl = lazy(() => import('../components/franchise/PricingControl').then(m => ({ default: m.PricingControl })));
const CatalogGovernance = lazy(() => import('../components/franchise/CatalogGovernance').then(m => ({ default: m.CatalogGovernance })));

// Lazy load Public components
const LandingPage = lazy(() => import('../components/public/LandingPage').then(m => ({ default: m.LandingPage })));
const ServiceCatalog = lazy(() => import('../components/public/ServiceCatalog').then(m => ({ default: m.ServiceCatalog })));
const AvailabilityChecker = lazy(() => import('../components/public/AvailabilityChecker').then(m => ({ default: m.AvailabilityChecker })));
const BookingForm = lazy(() => import('../components/public/BookingForm').then(m => ({ default: m.BookingForm })));
const BookingConfirmation = lazy(() => import('../components/public/BookingConfirmation').then(m => ({ default: m.BookingConfirmation })));
const BookingManagement = lazy(() => import('../components/public/BookingManagement').then(m => ({ default: m.BookingManagement })));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create MUI theme with warm colors for beauty salon
const theme = createTheme({
  palette: {
    primary: {
      main: '#d4a574', // Warm terracotta/beige
      light: '#e8b4b8', // Soft rose
      dark: '#c8966a', // Deeper terracotta
    },
    secondary: {
      main: '#f5c6cb', // Soft pink
      light: '#f8d7da', // Light pink
      dark: '#e8b4b8', // Rose
    },
    background: {
      default: '#faf8f5', // Warm off-white
      paper: '#ffffff',
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <CircularProgress />
  </Box>
);

/**
 * App Routes Component
 * 
 * Defines all application routes with code-splitting for optimal performance.
 * 
 * Rules:
 * - Protected routes require tenant context
 * - Role-based access control
 * - Tenant context explicit in routing
 * - Components are lazy-loaded for better initial bundle size
 */
export function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TenantProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes (No Authentication Required) */}
              <Route
                path="/"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LandingPage />
                  </Suspense>
                }
              />
              <Route
                path="/booking"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Box>
                      <Box sx={{ p: 3 }}>
                        <ServiceCatalog />
                      </Box>
                    </Box>
                  </Suspense>
                }
              />
              <Route
                path="/booking/availability"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Box>
                      <Box sx={{ p: 3 }}>
                        <AvailabilityChecker />
                      </Box>
                    </Box>
                  </Suspense>
                }
              />
              <Route
                path="/booking/form"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Box>
                      <Box sx={{ p: 3 }}>
                        <BookingForm />
                      </Box>
                    </Box>
                  </Suspense>
                }
              />
              <Route
                path="/booking/confirm/:token"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Box>
                      <Box sx={{ p: 3 }}>
                        <BookingConfirmation />
                      </Box>
                    </Box>
                  </Suspense>
                }
              />
              <Route
                path="/booking/manage/:token"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Box>
                      <Box sx={{ p: 3 }}>
                        <BookingManagement />
                      </Box>
                    </Box>
                  </Suspense>
                }
              />

              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path="/pos/dashboard"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <AppointmentCalendar />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/book-appointment"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <BookAppointmentForm />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/visits"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <VisitManagement />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/shift-close"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <ShiftCloseDashboard />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/clients/register"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <ClientRegistration />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <OrderDetails />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/checkout/:orderId"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <Checkout />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/payments/:paymentId"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <PaymentStatus />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/franchise/tenants"
                element={
                  <ProtectedRoute requiredRole="franchisor">
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <TenantOverview />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/franchise/kpis"
                element={
                  <ProtectedRoute requiredRole="franchisor">
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <KPIDashboard />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/franchise/pricing"
                element={
                  <ProtectedRoute requiredRole="franchisor">
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <PricingControl />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/franchise/catalog"
                element={
                  <ProtectedRoute requiredRole="franchisor">
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <Suspense fallback={<PageLoader />}>
                          <CatalogGovernance />
                        </Suspense>
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/select-tenant"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <TenantSelection />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/unauthorized"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Unauthorized />
                  </Suspense>
                }
              />
              
              {/* Default route - redirect authenticated users to dashboard, others to landing */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Navigate to="/pos/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch-all: redirect to landing page (public) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TenantProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

