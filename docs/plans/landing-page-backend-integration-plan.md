# Landing Page & Backend Integration Plan

**Status:** 📋 PLANNING  
**Date:** 2026-01-XX  
**Priority:** High - Required for public launch

---

## Overview

This plan outlines what needs to be implemented to have a working public-facing landing page connected to the backend platform. This is separate from the internal POS UI and Franchise Portal.

---

## Current State

### ✅ Completed
- **Phase 1:** Backend services (Booking, POS, Payments, Customer, BI, Staff, Inventory)
- **Phase 2:** Internal UI (POS UI for salons, Franchise Portal for franchisor)
- **Backend APIs:** All core domain services operational
- **Multi-tenancy:** Tenant isolation and RLS working
- **Event-driven architecture:** NATS event bus operational

### ❌ Missing
- **Public landing page:** Marketing website for potential franchisees
- **API Gateway:** Public-facing API gateway for lead generation
- **Lead Management:** System to capture and manage franchise inquiries
- **Public API:** Customer-facing APIs (appointment booking, service catalog)
- **SEO & Marketing:** Content management, SEO optimization

---

## Implementation Plan

### Phase: Landing Page & Public Backend Integration

---

## P1. API Gateway Setup

### Objective
Create a public-facing API gateway that:
- Routes public requests to appropriate services
- Handles authentication for public APIs
- Rate limiting and security
- CORS configuration for web frontend

### Tasks

#### P1.1 - API Gateway Service
**Priority:** Critical  
**Estimated Effort:** 3-5 days

**Requirements:**
- Reverse proxy for backend services
- Request routing based on path
- CORS headers for web frontend
- Rate limiting (per IP, per API key)
- Request logging

**Implementation:**
- Use nginx or Node.js/Express gateway
- Route `/api/public/*` to public endpoints
- Route `/api/internal/*` to internal services (with auth)
- Configure CORS for landing page domain

**Files to Create:**
- `services/api-gateway/Dockerfile`
- `services/api-gateway/src/index.js`
- `services/api-gateway/package.json`
- `docker-compose.yml` (add api-gateway service)

**Configuration:**
```javascript
// Example routing
/api/public/catalog/services -> catalog-service
/api/public/appointments -> booking-service (public endpoints)
/api/public/leads -> lead-management-service
/api/internal/* -> requires JWT auth
```

---

#### P1.2 - Public API Endpoints
**Priority:** Critical  
**Estimated Effort:** 5-7 days

**New Endpoints Needed:**

**Catalog Service (Public):**
- `GET /api/public/catalog/services` - List all services (public)
- `GET /api/public/catalog/services/:id` - Get service details
- `GET /api/public/catalog/products` - List products (public)
- `GET /api/public/catalog/products/:id` - Get product details

**Booking Service (Public):**
- `GET /api/public/appointments/availability` - Check availability
- `POST /api/public/appointments/book` - Book appointment (public, no auth required)
- `GET /api/public/appointments/:id/status` - Check appointment status

**Lead Management Service (New):**
- `POST /api/public/leads` - Submit franchise inquiry
- `GET /api/public/leads/:id/status` - Check lead status (with token)

**Implementation:**
- Add public endpoints to existing services
- Or create new public-facing service layer
- No tenant context required for public endpoints
- Rate limiting per IP address

---

#### P1.3 - Authentication for Public APIs
**Priority:** High  
**Estimated Effort:** 2-3 days

**Requirements:**
- Public endpoints: No authentication required
- Appointment booking: Optional email/phone verification
- Lead submission: CAPTCHA protection
- API key for partners (future)

**Implementation:**
- Public endpoints: No auth middleware
- Appointment booking: Email/phone verification token
- Lead submission: reCAPTCHA integration
- Rate limiting: Per IP address

---

## P2. Lead Management System

### Objective
Capture and manage franchise inquiries from the landing page.

### Tasks

#### P2.1 - Lead Management Service
**Priority:** Critical  
**Estimated Effort:** 5-7 days

**Requirements:**
- Store franchise inquiries
- Lead status tracking (new, contacted, qualified, converted)
- Email notifications to franchisor
- Lead assignment to sales team
- Lead analytics

**Database Schema:**
```sql
CREATE TABLE platform.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  investment_range VARCHAR(50),
  experience_level VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(100) DEFAULT 'website',
  notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- `POST /api/public/leads` - Submit lead (public)
- `GET /api/internal/leads` - List leads (franchisor only)
- `GET /api/internal/leads/:id` - Get lead details
- `PATCH /api/internal/leads/:id` - Update lead status
- `POST /api/internal/leads/:id/assign` - Assign to sales rep

**Event Publishing:**
- `lead.submitted` - When new lead created
- `lead.status_changed` - When lead status updated
- `lead.assigned` - When lead assigned to sales rep

**Files to Create:**
- `services/lead-management-service/Dockerfile`
- `services/lead-management-service/src/index.js`
- `services/lead-management-service/package.json`
- `scripts/database/migrations/007_leads_schema.sql`

---

#### P2.2 - Email Notifications
**Priority:** High  
**Estimated Effort:** 2-3 days

**Requirements:**
- Email to franchisor when new lead submitted
- Email to lead submitter (confirmation)
- Email templates
- Integration with notification adapter

**Implementation:**
- Use existing `NotificationAdapter`
- Create email templates
- Subscribe to `lead.submitted` event
- Send confirmation email to lead

---

#### P2.3 - Lead Analytics
**Priority:** Medium  
**Estimated Effort:** 2-3 days

**Requirements:**
- Lead conversion metrics
- Source tracking (website, referral, etc.)
- Lead status distribution
- Time to conversion

**Implementation:**
- Add lead metrics to BI service
- Subscribe to lead events
- Create lead analytics read model

---

## P3. Public Catalog Service

### Objective
Expose service and product catalog to public (no authentication required).

### Tasks

#### P3.1 - Public Catalog Endpoints
**Priority:** Critical  
**Estimated Effort:** 3-5 days

**Requirements:**
- List all services (public, no tenant context)
- Get service details
- List all products (public)
- Get product details
- Service categories
- Pricing display (base prices)

**Implementation:**
- Add public endpoints to catalog service (or create new public catalog service)
- Query global catalog (tenant_id = NULL)
- No authentication required
- Caching for performance

**API Endpoints:**
- `GET /api/public/catalog/services` - List services
- `GET /api/public/catalog/services/:id` - Service details
- `GET /api/public/catalog/services/category/:category` - Services by category
- `GET /api/public/catalog/products` - List products
- `GET /api/public/catalog/products/:id` - Product details

**Files to Modify/Create:**
- `services/catalog-service/src/index.js` (add public endpoints)
- Or `services/public-catalog-service/` (new service)

---

#### P3.2 - Service Categories
**Priority:** Medium  
**Estimated Effort:** 2-3 days

**Requirements:**
- Service categories (Hair, Nails, Beauty, etc.)
- Category-based filtering
- Category display on landing page

**Database Schema:**
```sql
CREATE TABLE catalog.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER,
  tenant_id UUID NULL, -- NULL for global categories
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## P4. Landing Page Website

### Objective
Create a modern, SEO-optimized landing page for the beauty franchise platform.

### Tasks

#### P4.1 - Landing Page Structure
**Priority:** Critical  
**Estimated Effort:** 7-10 days

**Pages Needed:**
1. **Homepage** (`/`)
   - Hero section with value proposition
   - Services overview
   - Franchise benefits
   - Call-to-action (CTA) buttons
   - Testimonials
   - Contact form

2. **Services Page** (`/services`)
   - List all services
   - Service categories
   - Service details
   - Pricing information

3. **Franchise Page** (`/franchise`)
   - Franchise opportunity overview
   - Investment requirements
   - Support provided
   - Success stories
   - Lead form

4. **About Page** (`/about`)
   - Company story
   - Mission and values
   - Team

5. **Contact Page** (`/contact`)
   - Contact form
   - Location information
   - Map integration

**Technology Stack:**
- **Framework:** Next.js 14+ (React, SSR, SEO)
- **Styling:** Tailwind CSS or Material-UI
- **Content:** Markdown or CMS integration
- **Deployment:** Vercel or similar

**Files to Create:**
- `website/package.json`
- `website/next.config.js`
- `website/src/app/page.tsx` (homepage)
- `website/src/app/services/page.tsx`
- `website/src/app/franchise/page.tsx`
- `website/src/app/about/page.tsx`
- `website/src/app/contact/page.tsx`
- `website/src/components/` (reusable components
- `website/src/lib/api-client.ts` (API client for backend)

---

#### P4.2 - SEO Optimization
**Priority:** High  
**Estimated Effort:** 3-5 days

**Requirements:**
- Meta tags (title, description, OG tags)
- Structured data (JSON-LD)
- Sitemap.xml
- Robots.txt
- Open Graph images
- Schema.org markup

**Implementation:**
- Next.js metadata API
- Dynamic meta tags per page
- SEO component library
- Sitemap generation

**Files to Create:**
- `website/src/app/layout.tsx` (metadata)
- `website/src/app/sitemap.ts`
- `website/public/robots.txt`
- `website/src/lib/seo.ts`

---

#### P4.3 - Contact Forms
**Priority:** Critical  
**Estimated Effort:** 3-4 days

**Requirements:**
- Franchise inquiry form
- General contact form
- Form validation
- CAPTCHA protection
- Success/error messages
- Email notifications

**Forms:**
1. **Franchise Inquiry Form:**
   - Name, email, phone
   - Location preference
   - Investment range
   - Experience level
   - Message

2. **General Contact Form:**
   - Name, email, phone
   - Subject, message

**Implementation:**
- React Hook Form for validation
- reCAPTCHA v3 integration
- API integration with lead management service
- Loading states and error handling

**Files to Create:**
- `website/src/components/forms/FranchiseInquiryForm.tsx`
- `website/src/components/forms/ContactForm.tsx`
- `website/src/lib/recaptcha.ts`

---

#### P4.4 - Service Catalog Display
**Priority:** High  
**Estimated Effort:** 4-5 days

**Requirements:**
- Display services from backend
- Service categories
- Service filtering
- Service details page
- Responsive design

**Implementation:**
- Fetch services from `/api/public/catalog/services`
- Category filtering
- Search functionality
- Service detail pages
- Image optimization

**Files to Create:**
- `website/src/components/services/ServiceList.tsx`
- `website/src/components/services/ServiceCard.tsx`
- `website/src/components/services/ServiceDetails.tsx`
- `website/src/app/services/[slug]/page.tsx`

---

#### P4.5 - Appointment Booking Widget (Optional)
**Priority:** Medium  
**Estimated Effort:** 5-7 days

**Requirements:**
- Public appointment booking
- Availability checking
- Service selection
- Date/time selection
- Email/phone verification
- Booking confirmation

**Implementation:**
- Embeddable booking widget
- API integration with booking service
- Calendar component
- Email verification flow

**Files to Create:**
- `website/src/components/booking/BookingWidget.tsx`
- `website/src/components/booking/AvailabilityCalendar.tsx`
- `website/src/app/book/page.tsx`

---

## P5. Content Management

### Objective
Manage website content (pages, blog posts, testimonials).

### Tasks

#### P5.1 - Content Structure
**Priority:** Medium  
**Estimated Effort:** 3-4 days

**Content Types:**
- Static pages (Home, About, Services, Franchise)
- Blog posts (optional)
- Testimonials
- FAQ
- Legal pages (Privacy Policy, Terms of Service)

**Implementation:**
- Markdown files for static content
- Or headless CMS (Contentful, Strapi)
- Content API for dynamic content

**Files to Create:**
- `website/content/pages/` (markdown files)
- `website/src/lib/content.ts` (content loader)

---

#### P5.2 - Testimonials Management
**Priority:** Medium  
**Estimated Effort:** 2-3 days

**Requirements:**
- Display testimonials on homepage
- Testimonial management (franchisor)
- Testimonial approval workflow

**Implementation:**
- Store testimonials in database
- Admin interface for management
- Display on landing page

---

## P6. Integration & Testing

### Objective
Integrate landing page with backend and test end-to-end.

### Tasks

#### P6.1 - API Integration
**Priority:** Critical  
**Estimated Effort:** 3-4 days

**Requirements:**
- API client for landing page
- Error handling
- Loading states
- Retry logic
- Caching strategy

**Implementation:**
- Create API client library
- Environment variables for API URLs
- Error boundary components
- React Query for data fetching

**Files to Create:**
- `website/src/lib/api-client.ts`
- `website/src/lib/api/leads.ts`
- `website/src/lib/api/catalog.ts`
- `website/src/lib/api/booking.ts`

---

#### P6.2 - End-to-End Testing
**Priority:** High  
**Estimated Effort:** 3-5 days

**Test Scenarios:**
1. Submit franchise inquiry form
2. View services catalog
3. Check appointment availability
4. Submit contact form
5. Navigate all pages
6. Mobile responsiveness
7. SEO validation

**Tools:**
- Playwright or Cypress for E2E tests
- Lighthouse for performance/SEO
- BrowserStack for cross-browser testing

**Files to Create:**
- `website/e2e/franchise-inquiry.spec.ts`
- `website/e2e/services-catalog.spec.ts`
- `website/e2e/contact-form.spec.ts`

---

#### P6.3 - Performance Optimization
**Priority:** High  
**Estimated Effort:** 2-3 days

**Requirements:**
- Page load time < 3 seconds
- Lighthouse score > 90
- Image optimization
- Code splitting
- Caching strategy

**Implementation:**
- Next.js Image component
- Dynamic imports
- Service worker for caching
- CDN for static assets

---

## P7. Deployment & Infrastructure

### Objective
Deploy landing page and configure infrastructure.

### Tasks

#### P7.1 - Landing Page Deployment
**Priority:** Critical  
**Estimated Effort:** 2-3 days

**Requirements:**
- Deploy to production
- Custom domain configuration
- SSL certificate
- CDN setup
- Environment variables

**Platform Options:**
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Self-hosted

**Configuration:**
- Production environment variables
- API gateway URL
- reCAPTCHA keys
- Analytics tracking

---

#### P7.2 - API Gateway Deployment
**Priority:** Critical  
**Estimated Effort:** 2-3 days

**Requirements:**
- Deploy API gateway service
- Public domain (api.beautyplatform.cz)
- SSL certificate
- Rate limiting configuration
- Monitoring and logging

**Configuration:**
- CORS for landing page domain
- Rate limiting rules
- Request logging
- Health checks

---

#### P7.3 - Monitoring & Analytics
**Priority:** High  
**Estimated Effort:** 2-3 days

**Requirements:**
- Website analytics (Google Analytics)
- Error tracking (Sentry)
- Performance monitoring
- Lead tracking

**Implementation:**
- Google Analytics 4
- Sentry for error tracking
- Uptime monitoring
- Lead conversion tracking

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- P1.1 - API Gateway Setup
- P1.2 - Public API Endpoints
- P1.3 - Authentication for Public APIs

### Phase 2: Lead Management (Week 2-3)
- P2.1 - Lead Management Service
- P2.2 - Email Notifications
- P2.3 - Lead Analytics

### Phase 3: Catalog (Week 3-4)
- P3.1 - Public Catalog Endpoints
- P3.2 - Service Categories

### Phase 4: Landing Page (Week 4-7)
- P4.1 - Landing Page Structure
- P4.2 - SEO Optimization
- P4.3 - Contact Forms
- P4.4 - Service Catalog Display
- P4.5 - Appointment Booking Widget (optional)

### Phase 5: Content & Integration (Week 7-8)
- P5.1 - Content Structure
- P5.2 - Testimonials Management
- P6.1 - API Integration
- P6.2 - End-to-End Testing

### Phase 6: Deployment (Week 8-9)
- P6.3 - Performance Optimization
- P7.1 - Landing Page Deployment
- P7.2 - API Gateway Deployment
- P7.3 - Monitoring & Analytics

**Total Estimated Time:** 8-9 weeks

---

## Dependencies

### External Services
- **Email Service:** Existing notification adapter
- **reCAPTCHA:** Google reCAPTCHA v3
- **Analytics:** Google Analytics 4
- **Error Tracking:** Sentry (optional)

### Internal Services
- **Catalog Service:** Extend with public endpoints
- **Booking Service:** Extend with public endpoints
- **Notification Service:** For email sending
- **BI Service:** For lead analytics

---

## Success Criteria

### Landing Page
- ✅ Modern, responsive design
- ✅ SEO optimized (Lighthouse score > 90)
- ✅ Fast load times (< 3 seconds)
- ✅ All forms working
- ✅ Service catalog displayed
- ✅ Mobile-friendly

### Backend Integration
- ✅ API Gateway operational
- ✅ Public APIs accessible
- ✅ Lead management working
- ✅ Email notifications sent
- ✅ Rate limiting active
- ✅ CORS configured

### End-to-End
- ✅ Lead submission works
- ✅ Email notifications received
- ✅ Services displayed correctly
- ✅ All pages accessible
- ✅ No console errors

---

## Risk Mitigation

### Risks
1. **API Gateway complexity** - Start simple, iterate
2. **Public API security** - Implement rate limiting and CAPTCHA
3. **SEO requirements** - Use Next.js SSR capabilities
4. **Content management** - Start with markdown, upgrade to CMS later

### Mitigation
- Start with MVP (minimal landing page)
- Iterate based on feedback
- Use proven technologies (Next.js, nginx)
- Implement security best practices

---

## Next Steps

1. **Review and approve this plan**
2. **Prioritize tasks** (MVP vs full features)
3. **Set up development environment**
4. **Start with API Gateway** (P1.1)
5. **Create lead management service** (P2.1)
6. **Build landing page** (P4.1)

---

**Document Status:** 📋 DRAFT - Ready for Review  
**Last Updated:** 2026-01-XX

