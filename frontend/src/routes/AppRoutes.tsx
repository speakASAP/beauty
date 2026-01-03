import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { TenantProvider } from '../contexts/TenantContext';
import { ProtectedRoute } from './ProtectedRoute';
import { Navigation } from '../components/common/Navigation';
import { Login } from '../components/auth/Login';
import { TenantSelection } from '../components/auth/TenantSelection';
import { Unauthorized } from '../components/common/Unauthorized';
import { AppointmentCalendar } from '../components/pos/AppointmentCalendar';
import { VisitManagement } from '../components/pos/VisitManagement';
import { ShiftCloseDashboard } from '../components/pos/ShiftCloseDashboard';
import { ClientRegistration } from '../components/pos/ClientRegistration';
import { BookAppointmentForm } from '../components/pos/BookAppointmentForm';
import { OrderDetails } from '../components/pos/OrderDetails';
import { Checkout } from '../components/pos/Checkout';
import { PaymentStatus } from '../components/pos/PaymentStatus';
import { TenantOverview } from '../components/franchise/TenantOverview';
import { KPIDashboard } from '../components/franchise/KPIDashboard';
import { PricingControl } from '../components/franchise/PricingControl';
import { CatalogGovernance } from '../components/franchise/CatalogGovernance';
import { LandingPage } from '../components/public/LandingPage';
import { ServiceCatalog } from '../components/public/ServiceCatalog';
import { AvailabilityChecker } from '../components/public/AvailabilityChecker';
import { BookingForm } from '../components/public/BookingForm';
import { BookingConfirmation } from '../components/public/BookingConfirmation';
import { BookingManagement } from '../components/public/BookingManagement';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * App Routes Component
 * 
 * Defines all application routes.
 * 
 * Rules:
 * - Protected routes require tenant context
 * - Role-based access control
 * - Tenant context explicit in routing
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
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/booking"
                element={
                  <Box>
                    <Box sx={{ p: 3 }}>
                      <ServiceCatalog />
                    </Box>
                  </Box>
                }
              />
              <Route
                path="/booking/availability"
                element={
                  <Box>
                    <Box sx={{ p: 3 }}>
                      <AvailabilityChecker />
                    </Box>
                  </Box>
                }
              />
              <Route
                path="/booking/form"
                element={
                  <Box>
                    <Box sx={{ p: 3 }}>
                      <BookingForm />
                    </Box>
                  </Box>
                }
              />
              <Route
                path="/booking/confirm/:token"
                element={
                  <Box>
                    <Box sx={{ p: 3 }}>
                      <BookingConfirmation />
                    </Box>
                  </Box>
                }
              />
              <Route
                path="/booking/manage/:token"
                element={
                  <Box>
                    <Box sx={{ p: 3 }}>
                      <BookingManagement />
                    </Box>
                  </Box>
                }
              />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route
                path="/pos/dashboard"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <Box sx={{ p: 3 }}>
                        <AppointmentCalendar />
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
                        <BookAppointmentForm />
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
                        <VisitManagement />
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
                        <ShiftCloseDashboard />
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
                        <ClientRegistration />
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
                        <OrderDetails />
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
                        <Checkout />
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
                        <PaymentStatus />
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
                        <TenantOverview />
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
                        <KPIDashboard />
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
                        <PricingControl />
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
                        <CatalogGovernance />
                      </Box>
                    </Box>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/select-tenant"
                element={
                  <ProtectedRoute>
                    <TenantSelection />
                  </ProtectedRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
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

