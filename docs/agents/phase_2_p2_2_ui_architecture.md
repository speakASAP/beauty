# P2.2 - UI Architecture

**Status:** ✅ COMPLETE  
**Date:** 2026-01-XX  
**Agent:** Frontend Architect Agent

---

## Overview

P2.2 defines the UI architecture for both Salon (POS UI) and Franchise Portal, ensuring:
- No shared mutable state between tenants
- No backend-specific hacks
- Event-based real-time updates
- Tenant isolation enforced

---

## Architectural Decisions

### 1. SPA vs MPA

**Decision:** **SPA (Single Page Application)**

**Rationale:**
- Better UX for salon operations (fast navigation, no page reloads)
- Real-time event updates easier to implement
- State management more straightforward
- Modern framework support (React, Vue, etc.)

**Implementation:**
- **Salon (POS UI):** SPA with client-side routing
- **Franchise Portal:** SPA with client-side routing
- Both apps can be separate SPAs or modules within one SPA

**Technology Stack:**
- React 18+ (recommended) or Vue 3+ (alternative)
- React Router or Vue Router for routing
- TypeScript for type safety

---

### 2. State Management

**Decision:** **Hybrid Approach: Context/Store + Server State**

**Components:**

#### 2.1 Local UI State (Component State)
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary selections
- **Scope:** Component-level only

#### 2.2 Global UI State (Context/Store)
- Current tenant context (from auth)
- Current user context (from auth)
- UI preferences (theme, language)
- **Scope:** App-level, tenant-scoped

#### 2.3 Server State (React Query / SWR / TanStack Query)
- API responses (appointments, orders, clients, etc.)
- Caching and invalidation
- Optimistic updates (UI-only, not domain logic)
- **Scope:** Tenant-scoped queries

**Rules:**
- ✅ **No shared mutable state between tenants**
- ✅ Server state is tenant-scoped (queries include tenant_id)
- ✅ Global state is tenant-scoped (one tenant per session)
- ✅ No cross-tenant state sharing

**Implementation:**
```typescript
// Example: Tenant-scoped query
const { data: appointments } = useQuery({
  queryKey: ['appointments', tenantId, dateRange],
  queryFn: () => api.getAppointments({ tenantId, ...dateRange })
});
```

---

### 3. API Client Strategy

**Decision:** **Centralized API Client with Tenant Context Injection**

**Architecture:**

#### 3.1 API Client Base

```typescript
// api/client.ts
class ApiClient {
  private baseURL: string;
  private tenantId: string | null;
  private userId: string | null;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  setTenantContext(tenantId: string, userId: string) {
    this.tenantId = tenantId;
    this.userId = userId;
  }
  
  async request(endpoint: string, options: RequestInit) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId!,
      'X-User-ID': this.userId!,
      'X-Correlation-ID': generateUUID(),
      ...options.headers
    };
    
    return fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });
  }
}
```

#### 3.2 Service-Specific Clients

```typescript
// api/booking.ts
export const bookingApi = {
  getAppointments: (params) => apiClient.get('/appointments', { params }),
  bookAppointment: (data) => apiClient.post('/appointments', { body: data }),
  // ...
};

// api/pos.ts
export const posApi = {
  getVisits: (params) => apiClient.get('/visits', { params }),
  startVisit: (data) => apiClient.post('/visits', { body: data }),
  // ...
};
```

**Rules:**
- ✅ All API calls include tenant context headers
- ✅ Correlation ID generated per request
- ✅ Error handling centralized
- ✅ Retry logic for transient failures

---

### 4. Event Subscription Model

**Decision:** **WebSocket (Primary) + Polling (Fallback)**

**Architecture:**

#### 4.1 WebSocket Connection (Primary)

```typescript
// events/websocket.ts
class EventSubscription {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<Function>> = new Map();
  
  connect(natsUrl: string, tenantId: string) {
    // Connect to NATS via WebSocket gateway
    this.ws = new WebSocket(`${natsUrl}/events?tenant_id=${tenantId}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };
  }
  
  subscribe(eventType: string, handler: Function) {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(handler);
  }
  
  private handleEvent(event: Event) {
    const handlers = this.subscriptions.get(event.event_type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }
}
```

**Event Types:**
- `appointment.*` - All appointment events
- `visit.*` - All visit events
- `order.*` - All order events
- `payment.*` - All payment events
- `client.*` - All client events

#### 4.2 Server-Sent Events (SSE) Alternative

```typescript
// events/sse.ts
class SSESubscription {
  private eventSource: EventSource | null = null;
  
  connect(apiUrl: string, tenantId: string) {
    this.eventSource = new EventSource(
      `${apiUrl}/events/stream?tenant_id=${tenantId}`
    );
    
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };
  }
}
```

#### 4.3 Polling (Fallback)

```typescript
// events/polling.ts
class PollingSubscription {
  private interval: number | null = null;
  
  start(apiUrl: string, tenantId: string, intervalMs: number = 5000) {
    this.interval = setInterval(async () => {
      const events = await fetch(`${apiUrl}/events/poll?tenant_id=${tenantId}`);
      events.forEach(event => this.handleEvent(event));
    }, intervalMs);
  }
}
```

**Implementation Strategy:**
1. **Try WebSocket first** (best performance)
2. **Fallback to SSE** if WebSocket unavailable
3. **Fallback to Polling** if SSE unavailable

---

## Tenant Isolation Architecture

### Explicit Tenant Context

**All API calls must include:**
```typescript
headers: {
  'X-Tenant-ID': tenantId,      // From auth context
  'X-User-ID': userId,          // From auth context
  'X-Correlation-ID': uuid,     // Generated per request
}
```

**UI must NEVER:**
- Assume tenant from URL
- Allow implicit tenant switching
- Display cross-tenant data without explicit permission

---

### State Isolation

**Rules:**
- ✅ Each tenant session has isolated state
- ✅ No shared mutable state between tenants
- ✅ Tenant context stored in auth state (not URL)
- ✅ API client scoped to current tenant

**Implementation:**
```typescript
// Store tenant context in auth state
const authStore = {
  tenantId: string | null,
  userId: string | null,
  isFranchisor: boolean
};

// API client uses auth state
apiClient.setTenantContext(authStore.tenantId, authStore.userId);
```

---

## Technology Stack Recommendations

### Core Framework

**React 18+ (Recommended)**
- Component-based architecture
- Hooks for state management
- TypeScript support
- Large ecosystem

**Alternative: Vue 3+**
- Similar benefits
- Different syntax preference

---

### State Management

**TanStack Query (React Query)**
- Server state management
- Caching and invalidation
- Optimistic updates
- Tenant-scoped queries

**Zustand or Redux Toolkit**
- Global UI state (auth, preferences)
- Tenant context storage
- Lightweight and simple

---

### Routing

**React Router v6+**
- Client-side routing
- Protected routes
- Tenant-scoped routes

---

### API Client

**Custom API Client**
- Centralized tenant context injection
- Error handling
- Retry logic
- Request/response interceptors

---

### Event Subscription

**Custom WebSocket Client**
- NATS WebSocket gateway
- Event type subscriptions
- Reconnection logic
- Fallback to SSE/Polling

---

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API clients
│   │   ├── client.ts     # Base API client
│   │   ├── booking.ts    # Booking API
│   │   ├── pos.ts        # POS API
│   │   ├── payments.ts   # Payments API
│   │   ├── customer.ts   # Customer API
│   │   └── bi.ts         # BI API
│   ├── events/           # Event subscriptions
│   │   ├── websocket.ts  # WebSocket client
│   │   ├── sse.ts        # SSE client
│   │   └── polling.ts    # Polling client
│   ├── store/            # State management
│   │   ├── auth.ts       # Auth state (tenant context)
│   │   └── ui.ts         # UI state
│   ├── components/       # React components
│   │   ├── salon/        # Salon (POS UI) components
│   │   └── franchise/    # Franchise Portal components
│   ├── pages/            # Page components
│   │   ├── salon/        # Salon pages
│   │   └── franchise/    # Franchise pages
│   └── hooks/            # Custom hooks
│       ├── useTenant.ts  # Tenant context hook
│       └── useEvents.ts  # Event subscription hook
├── package.json
└── tsconfig.json
```

---

## Security Architecture

### Tenant Context Validation

**Client-Side:**
- Validate tenant context from auth token
- Ensure tenant_id is present before API calls
- Prevent tenant switching without re-authentication

**Server-Side:**
- All APIs validate tenant context (Phase 1)
- RLS policies enforce isolation (Phase 1)
- No client-side security assumptions

---

### Authentication Flow

```
Login
  ↓
Auth Service validates credentials
  ↓
Returns JWT with tenant_id, user_id, roles
  ↓
UI stores JWT and extracts tenant context
  ↓
API client injects tenant context in headers
  ↓
All API calls include tenant context
```

---

## Performance Considerations

### Caching Strategy

**Server State (TanStack Query):**
- Cache API responses per tenant
- Invalidate on events
- Stale-while-revalidate pattern

**Example:**
```typescript
// Cache appointments for 5 minutes
const { data } = useQuery({
  queryKey: ['appointments', tenantId, date],
  queryFn: () => api.getAppointments({ tenantId, date }),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000   // 10 minutes
});
```

---

### Event Processing

**Optimistic Updates:**
- Update UI immediately on user action
- Revert if event indicates failure
- **No domain logic** - only UI state updates

**Example:**
```typescript
// Optimistic update (UI only)
const mutation = useMutation({
  mutationFn: api.bookAppointment,
  onMutate: async (newAppointment) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['appointments']);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['appointments']);
    
    // Optimistically update
    queryClient.setQueryData(['appointments'], (old) => [
      ...old,
      { ...newAppointment, status: 'pending' }
    ]);
    
    return { previous };
  },
  onError: (err, newAppointment, context) => {
    // Revert on error
    queryClient.setQueryData(['appointments'], context.previous);
  },
  onSuccess: () => {
    // Invalidate to refetch
    queryClient.invalidateQueries(['appointments']);
  }
});
```

---

## Error Handling

### API Error Handling

**Centralized Error Handler:**
```typescript
// api/error-handler.ts
export function handleApiError(error: ApiError) {
  if (error.status === 403) {
    // Tenant context invalid
    // Redirect to login or show error
  } else if (error.status === 404) {
    // Resource not found
    // Show not found message
  } else if (error.status >= 500) {
    // Server error
    // Show error message, retry option
  }
}
```

---

### Event Error Handling

**Reconnection Logic:**
```typescript
// events/websocket.ts
class EventSubscription {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    } else {
      // Fallback to polling
      this.fallbackToPolling();
    }
  }
}
```

---

## Validation Checklist

### Architecture Compliance ✅

- ✅ SPA architecture chosen
- ✅ State management strategy defined
- ✅ API client strategy defined
- ✅ Event subscription model defined

### Tenant Isolation Compliance ✅

- ✅ No shared mutable state between tenants
- ✅ Tenant context explicit in all API calls
- ✅ State is tenant-scoped
- ✅ No cross-tenant assumptions

### Backend Compliance ✅

- ✅ No backend-specific hacks
- ✅ Uses standard HTTP APIs
- ✅ Uses standard event format
- ✅ No direct database access

---

## Success Criteria ✅

**P2.2 is COMPLETE when:**

✅ SPA vs MPA decision made  
✅ State management strategy defined  
✅ API client strategy defined  
✅ Event subscription model defined  
✅ Tenant isolation architecture defined  
✅ Technology stack chosen  
✅ Project structure defined  

**Status:** ✅ COMPLETE

---

## Next Steps

After P2.2 completion:

- ⏳ **P2.3** - POS UI Implementation
  - Booking calendar
  - Client card
  - Service selection
  - Checkout

- ⏳ **P2.4** - Franchise Portal Implementation
  - Tenant list
  - Performance dashboards
  - Catalog & pricing

---

**Documentation:** `docs/agents/phase_2_p2_2_ui_architecture.md`  
**Status:** ✅ COMPLETE
