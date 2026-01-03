# Phase 2 - UI Architecture

**Date:** 2026-01-XX  
**Agent:** Frontend Architect Agent  
**Status:** ✅ COMPLETE

---

## Overview

This document defines the UI architecture for POS UI (Salon-level) and Franchise Portal (Central management). The architecture ensures tenant isolation, event-driven UX, and replaceability.

**Key Principles:**
- UI is disposable, domain is eternal
- No business logic in UI
- Explicit tenant context everywhere
- Event-driven, no immediate consistency assumptions

---

## Architecture Decisions

### 1. Application Type: SPA (Single Page Application)

**Decision:** ✅ **SPA** for both POS UI and Franchise Portal

**Rationale:**
- Better UX for salon staff (fast navigation)
- Real-time updates easier to implement
- State management simpler
- Modern development experience

**Exception:**
- Public booking website (future) may use MPA for SEO

**Technology:**
- React (recommended) or Vue.js
- React Router for navigation
- Code splitting for performance

---

### 2. State Management: Context API + React Query

**Decision:** ✅ **Context API** for tenant/auth state + **React Query** for server state

**Rationale:**
- Context API sufficient for tenant context (small, rarely changes)
- React Query handles:
  - API caching
  - Background refetching
  - Optimistic updates
  - Error handling
- No need for Redux (overkill for this use case)

**State Structure:**

```typescript
// Tenant Context (Context API)
interface TenantContext {
  tenantId: string | null;
  userId: string | null;
  role: 'franchisor' | 'owner' | 'staff' | 'client';
  jwtToken: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
}

// Server State (React Query)
- appointments: QueryClient
- visits: QueryClient
- orders: QueryClient
- payments: QueryClient
- clients: QueryClient
- analytics: QueryClient
```

**Tenant Isolation:**
- Each tenant context is isolated
- No shared mutable state between tenants
- Tenant context cleared on tenant switch

---

### 3. API Client Strategy: Axios with Tenant Interceptor

**Decision:** ✅ **Axios** with automatic tenant context injection

**Implementation:**

```typescript
// api-client.ts
import axios from 'axios';
import { useTenantContext } from './contexts/TenantContext';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:4110',
  timeout: 10000,
});

// Tenant context interceptor
apiClient.interceptors.request.use((config) => {
  const tenantId = getTenantId(); // From context or localStorage
  const jwtToken = getJwtToken(); // From context or localStorage
  
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }
  
  if (jwtToken) {
    config.headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  
  config.headers['X-Correlation-ID'] = generateCorrelationId();
  
  return config;
});

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Tenant context violation - redirect to login
      clearTenantContext();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Tenant Context Injection:**
- Automatic via Axios interceptor
- Extracted from JWT token or explicit selection
- Never implicit or assumed

---

### 4. Event Subscription Model: Polling (MVP) → WebSocket (Future)

**Decision:** ✅ **Polling** for MVP, **WebSocket** for production

**Rationale:**
- Polling is simpler to implement and debug
- No WebSocket infrastructure needed initially
- Can upgrade to WebSocket later without UI changes
- React Query supports polling out of the box

**Implementation (Polling):**

```typescript
// useEventSubscription.ts
import { useQuery } from '@tanstack/react-query';
import { useTenantContext } from './contexts/TenantContext';

export function useAppointments() {
  const { tenantId } = useTenantContext();
  
  return useQuery({
    queryKey: ['appointments', tenantId],
    queryFn: () => apiClient.get('/appointments'),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!tenantId, // Only fetch if tenant context exists
  });
}
```

**Future WebSocket Implementation:**

```typescript
// useWebSocketSubscription.ts (Future)
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenantContext } from './contexts/TenantContext';

export function useWebSocketSubscription() {
  const { tenantId } = useTenantContext();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!tenantId) return;
    
    const ws = new WebSocket(`ws://api/events?tenant_id=${tenantId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Invalidate relevant queries based on event type
      if (data.event_type === 'appointment.booked') {
        queryClient.invalidateQueries(['appointments', tenantId]);
      }
      if (data.event_type === 'order.closed') {
        queryClient.invalidateQueries(['orders', tenantId]);
      }
      // ... handle other event types
    };
    
    return () => ws.close();
  }, [tenantId, queryClient]);
}
```

**Event Handling:**
- React Query automatically refetches on event
- UI updates reactively
- No optimistic updates (event-driven only)

---

## Technology Stack

### Core Framework
- **React 18+** (recommended)
  - Modern hooks API
  - Concurrent features
  - Server components (future)

### State Management
- **React Context API** - Tenant/auth state
- **React Query (TanStack Query)** - Server state
- **Zustand** (optional) - Local UI state if needed

### Routing
- **React Router v6** - Client-side routing
- Route guards for tenant context
- Role-based route access

### HTTP Client
- **Axios** - API client with interceptors
- Automatic tenant context injection
- Error handling

### UI Components
- **Material-UI (MUI)** or **Ant Design** - Component library
- Custom components for tenant-aware UI
- Responsive design

### Build Tool
- **Vite** (recommended) or **Create React App**
- Fast development
- Code splitting
- Environment variables

### TypeScript
- **TypeScript** - Type safety
- API contract types
- Event schema types

---

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance with interceptors
│   │   ├── booking.ts              # Booking API endpoints
│   │   ├── pos.ts                  # POS API endpoints
│   │   ├── payments.ts             # Payments API endpoints
│   │   ├── customer.ts             # Customer API endpoints
│   │   ├── analytics.ts            # BI API endpoints
│   │   └── auth.ts                 # Auth API endpoints
│   ├── contexts/
│   │   ├── TenantContext.tsx       # Tenant context provider
│   │   └── AuthContext.tsx         # Auth context provider
│   ├── components/
│   │   ├── common/                 # Shared components
│   │   ├── pos/                    # POS-specific components
│   │   ├── franchise/              # Franchise portal components
│   │   └── auth/                   # Auth components
│   ├── hooks/
│   │   ├── useTenantContext.ts     # Tenant context hook
│   │   ├── useEventSubscription.ts  # Event subscription hook
│   │   └── useApi.ts                # API hooks (React Query)
│   ├── routes/
│   │   ├── AppRoutes.tsx            # Route definitions
│   │   ├── ProtectedRoute.tsx       # Route guard
│   │   └── TenantRoute.tsx         # Tenant-aware route
│   ├── types/
│   │   ├── api.ts                   # API contract types
│   │   ├── events.ts                # Event schema types
│   │   └── domain.ts                # Domain types
│   ├── utils/
│   │   ├── tenant.ts                # Tenant utilities
│   │   └── validation.ts            # Input validation
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Tenant Isolation Strategy

### 1. Tenant Context Provider

```typescript
// contexts/TenantContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TenantContextType {
  tenantId: string | null;
  userId: string | null;
  role: string | null;
  jwtToken: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  clearContext: () => void;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Load tenant context from JWT on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      const payload = parseJWT(token);
      setJwtToken(token);
      setTenantId(payload.tenant_id);
      setUserId(payload.user_id);
      setRole(payload.role);
    }
  }, []);

  const switchTenant = async (newTenantId: string) => {
    // Clear all queries for old tenant
    queryClient.clear();
    
    // Get new JWT for new tenant
    const response = await authApi.switchTenant(newTenantId);
    const newToken = response.data.token;
    
    // Update context
    setJwtToken(newToken);
    setTenantId(newTenantId);
    localStorage.setItem('jwt_token', newToken);
    
    // Invalidate all queries to refetch with new tenant
    queryClient.invalidateQueries();
  };

  const clearContext = () => {
    setTenantId(null);
    setJwtToken(null);
    setUserId(null);
    setRole(null);
    queryClient.clear();
    localStorage.removeItem('jwt_token');
  };

  return (
    <TenantContext.Provider value={{
      tenantId,
      userId,
      role,
      jwtToken,
      switchTenant,
      clearContext,
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext must be used within TenantProvider');
  }
  return context;
}
```

### 2. Route Guards

```typescript
// routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useTenantContext } from '../contexts/TenantContext';

export function ProtectedRoute({ children, requiredRole }: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { tenantId, role, jwtToken } = useTenantContext();

  if (!jwtToken || !tenantId) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
}
```

### 3. Query Key Isolation

```typescript
// All React Query keys include tenantId
const queryKeys = {
  appointments: (tenantId: string) => ['appointments', tenantId],
  orders: (tenantId: string) => ['orders', tenantId],
  payments: (tenantId: string) => ['payments', tenantId],
  // ... etc
};

// Usage
const { data } = useQuery({
  queryKey: queryKeys.appointments(tenantId!),
  queryFn: () => bookingApi.getAppointments(),
});
```

---

## API Client Implementation

### Base API Client

```typescript
// api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - inject tenant context
    this.client.interceptors.request.use((config) => {
      const tenantId = this.getTenantId();
      const jwtToken = this.getJwtToken();
      const correlationId = this.generateCorrelationId();

      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }

      if (jwtToken) {
        config.headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      config.headers['X-Correlation-ID'] = correlationId;

      return config;
    });

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          // Tenant context violation
          this.handleTenantViolation();
        }
        return Promise.reject(error);
      }
    );
  }

  private getTenantId(): string | null {
    // Get from context or localStorage
    return localStorage.getItem('tenant_id');
  }

  private getJwtToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleTenantViolation() {
    // Clear context and redirect to login
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('tenant_id');
    window.location.href = '/login';
  }

  get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient(
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:4110'
);
```

### Service-Specific API Clients

```typescript
// api/booking.ts
import { apiClient } from './client';

export const bookingApi = {
  getAppointments: (params?: { date?: string; master_id?: string }) => {
    return apiClient.get('/appointments', { params });
  },

  bookAppointment: (data: {
    client_id: string;
    master_id: string;
    service_id: string;
    starts_at: string;
    duration_minutes: number;
  }) => {
    return apiClient.post('/appointments', data);
  },

  confirmAppointment: (id: string, confirmation_method?: string) => {
    return apiClient.post(`/appointments/${id}/confirm`, { confirmation_method });
  },

  startAppointment: (id: string) => {
    return apiClient.post(`/appointments/${id}/start`);
  },

  completeAppointment: (id: string) => {
    return apiClient.post(`/appointments/${id}/complete`);
  },

  cancelAppointment: (id: string, reason?: string) => {
    return apiClient.post(`/appointments/${id}/cancel`, { reason });
  },
};
```

---

## Event-Driven UX Patterns

### 1. Command → Event → UI Update

```typescript
// Component pattern
function AppointmentBooking() {
  const { tenantId } = useTenantContext();
  const queryClient = useQueryClient();
  const { mutate: bookAppointment, isLoading } = useMutation({
    mutationFn: bookingApi.bookAppointment,
    onSuccess: () => {
      // Invalidate queries to refetch (event will update backend)
      queryClient.invalidateQueries(['appointments', tenantId]);
      // Show success message
    },
    onError: (error) => {
      // Show error message
    },
  });

  const handleBook = () => {
    bookAppointment({
      client_id: '...',
      master_id: '...',
      service_id: '...',
      starts_at: '...',
      duration_minutes: 60,
    });
  };

  return (
    <button onClick={handleBook} disabled={isLoading}>
      {isLoading ? 'Booking...' : 'Book Appointment'}
    </button>
  );
}
```

### 2. Polling for Real-Time Updates

```typescript
// useAppointments hook
export function useAppointments() {
  const { tenantId } = useTenantContext();

  return useQuery({
    queryKey: ['appointments', tenantId],
    queryFn: () => bookingApi.getAppointments(),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!tenantId,
  });
}
```

### 3. Optimistic Updates (Event-Driven Only)

```typescript
// NO optimistic updates - wait for events
// UI shows loading state until event confirms
function OrderCheckout() {
  const { mutate: closeOrder, isLoading } = useMutation({
    mutationFn: posApi.closeOrder,
    onSuccess: () => {
      // Invalidate to refetch (event will update backend)
      queryClient.invalidateQueries(['orders', tenantId]);
    },
  });

  return (
    <div>
      {isLoading && <Spinner />}
      <button onClick={() => closeOrder(orderId)}>
        Process Payment
      </button>
    </div>
  );
}
```

---

## Security Considerations

### 1. JWT Token Storage
- Store in `localStorage` (MVP)
- Consider `httpOnly` cookies for production
- Token expiration handling

### 2. Tenant Context Validation
- Always validate tenant context on mount
- Clear context on 403 errors
- Redirect to login on tenant violation

### 3. Role-Based Access Control
- Check roles on route level
- Hide UI elements based on role
- Backend is source of truth (never trust client)

### 4. Input Validation
- Validate all inputs client-side
- Backend validates server-side (never trust client)
- Sanitize user inputs

---

## Performance Considerations

### 1. Code Splitting
```typescript
// Lazy load routes
const POSDashboard = lazy(() => import('./pages/POSDashboard'));
const FranchisePortal = lazy(() => import('./pages/FranchisePortal'));
```

### 2. Query Caching
- React Query handles caching automatically
- Cache invalidation on tenant switch
- Stale-while-revalidate pattern

### 3. Polling Optimization
- Poll only active views
- Reduce polling frequency on inactive tabs
- Use WebSocket when available

---

## Non-Negotiable Rules

### 1. No Business Logic in UI
- ❌ No pricing calculations
- ❌ No booking rules
- ❌ No inventory rules
- ✅ Only command sending and projection rendering

### 2. Explicit Tenant Context
- ❌ No implicit tenant switching
- ❌ No cross-tenant data access
- ✅ tenant_id explicit in all API calls
- ✅ Tenant context cleared on switch

### 3. Event-Driven UX
- ❌ No immediate consistency assumptions
- ✅ React to events/projections
- ✅ Handle event delays gracefully
- ✅ Show loading states appropriately

### 4. No Backend-Specific Hacks
- ❌ No direct database access
- ❌ No bypassing API layer
- ✅ Use only defined API endpoints
- ✅ Respect event contracts

---

## Migration Path

### MVP (Phase 2)
- SPA with React
- Polling for events
- Context API + React Query
- Axios for API client

### Production (Phase 3+)
- Upgrade to WebSocket for real-time
- Add service worker for offline support
- Implement advanced caching strategies
- Add monitoring and error tracking

---

## Next Steps

1. ✅ UI Architecture defined
2. ⏳ Proceed to SYNC H - UX Freeze validation
3. ⏳ P2.3, P2.4, P2.5 - UI Implementation

---

**Document Status:** ✅ COMPLETE  
**Next Phase:** SYNC H - UX Freeze

