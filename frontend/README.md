# Beauty Franchise Platform - Frontend

POS UI and Franchise Portal for the Beauty Franchise Platform.

## Architecture

- **Framework:** React 18 + TypeScript
- **State Management:** Context API + React Query
- **Routing:** React Router v6
- **HTTP Client:** Axios with tenant context interceptor
- **UI Components:** Material-UI (MUI)
- **Build Tool:** Vite

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and service endpoints
│   ├── contexts/         # React Context providers (Tenant, Auth)
│   ├── components/      # React components
│   │   ├── common/       # Shared components
│   │   ├── pos/          # POS-specific components
│   │   ├── franchise/    # Franchise portal components
│   │   └── auth/         # Auth components
│   ├── hooks/            # Custom React hooks
│   ├── routes/           # Route definitions and guards
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main app component
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Principles

1. **No Business Logic in UI** - UI only sends commands and renders projections
2. **Explicit Tenant Context** - tenant_id explicit in all API calls
3. **Event-Driven UX** - React to events/projections, no immediate consistency assumptions

## Related Documentation

- [Phase 2 UX Flows](../../docs/agents/phase_2_ux_flows.md)
- [Phase 2 UI Architecture](../../docs/agents/phase_2_ui_architecture.md)
- [SYNC H Validation](../../docs/agents/phase_2_sync_h_validation.md)

