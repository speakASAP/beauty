# Landing Page MVP - Minimal Viable Product Plan

**Status:** 📋 PLANNING  
**Date:** 2026-01-XX  
**Priority:** Critical - Fastest path to launch

---

## Overview

This is a simplified MVP plan focusing on the absolute minimum needed to launch a working landing page with backend integration. This can be completed in 3-4 weeks instead of 8-9 weeks.

---

## MVP Scope

### Must Have (MVP)
1. ✅ Simple landing page (homepage only)
2. ✅ Franchise inquiry form
3. ✅ Lead management service
4. ✅ Basic API gateway
5. ✅ Email notifications

### Nice to Have (Post-MVP)
- Services catalog page
- Appointment booking
- Blog/content management
- Advanced analytics

---

## MVP Implementation Plan

### Week 1: Backend Foundation

#### Day 1-2: API Gateway (Simplified)
**Task:** Create basic API gateway
- Simple Express.js reverse proxy
- Route `/api/public/*` to services
- CORS configuration
- Basic rate limiting

**Files:**
- `services/api-gateway/Dockerfile`
- `services/api-gateway/src/index.js` (simple proxy)
- `services/api-gateway/package.json`

**Time:** 2 days

---

#### Day 3-5: Lead Management Service
**Task:** Create lead management service
- Store franchise inquiries
- Basic CRUD operations
- Email notification on new lead

**Database:**
- Simple `platform.leads` table
- Basic fields: name, email, phone, message, status

**API:**
- `POST /api/public/leads` - Submit lead (public)
- `GET /api/internal/leads` - List leads (franchisor)
- `PATCH /api/internal/leads/:id` - Update status

**Files:**
- `services/lead-management-service/` (full service)
- `scripts/database/migrations/007_leads_schema.sql`

**Time:** 3 days

---

#### Day 5: Email Integration
**Task:** Integrate email notifications
- Use existing NotificationAdapter
- Send email to franchisor on new lead
- Send confirmation email to lead submitter

**Time:** 1 day

---

### Week 2: Landing Page

#### Day 1-3: Landing Page Setup
**Task:** Create Next.js landing page
- Homepage with hero section
- Franchise benefits section
- Testimonials section
- Contact form section
- Basic styling (Tailwind CSS)

**Pages:**
- `/` - Homepage (only page for MVP)

**Files:**
- `website/package.json`
- `website/next.config.js`
- `website/src/app/page.tsx`
- `website/src/components/` (Hero, Benefits, Testimonials, ContactForm)

**Time:** 3 days

---

#### Day 4-5: Contact Form Integration
**Task:** Integrate franchise inquiry form
- Form component with validation
- reCAPTCHA integration
- API integration with lead service
- Success/error handling

**Files:**
- `website/src/components/forms/FranchiseInquiryForm.tsx`
- `website/src/lib/api-client.ts`
- `website/src/lib/api/leads.ts`

**Time:** 2 days

---

### Week 3: Integration & Testing

#### Day 1-2: End-to-End Integration
**Task:** Connect landing page to backend
- Test form submission
- Verify email notifications
- Test lead management
- Fix integration issues

**Time:** 2 days

---

#### Day 3: SEO Basics
**Task:** Basic SEO setup
- Meta tags
- Sitemap
- Robots.txt
- Open Graph tags

**Files:**
- `website/src/app/layout.tsx` (metadata)
- `website/src/app/sitemap.ts`
- `website/public/robots.txt`

**Time:** 1 day

---

#### Day 4-5: Testing & Polish
**Task:** Testing and final polish
- Cross-browser testing
- Mobile responsiveness
- Performance optimization
- Bug fixes

**Time:** 2 days

---

### Week 4: Deployment

#### Day 1-2: Deployment Setup
**Task:** Deploy to production
- Deploy landing page (Vercel)
- Deploy API gateway
- Configure domains
- SSL certificates
- Environment variables

**Time:** 2 days

---

#### Day 3: Monitoring
**Task:** Basic monitoring
- Google Analytics
- Error tracking
- Uptime monitoring

**Time:** 1 day

---

#### Day 4-5: Launch Preparation
**Task:** Final checks and launch
- Final testing
- Content review
- Performance check
- Launch!

**Time:** 2 days

---

## MVP File Structure

```
beauty/
├── services/
│   ├── api-gateway/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       └── index.js
│   └── lead-management-service/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           └── index.js
├── website/
│   ├── package.json
│   ├── next.config.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── sitemap.ts
│   │   ├── components/
│   │   │   ├── Hero.tsx
│   │   │   ├── Benefits.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── forms/
│   │   │       └── FranchiseInquiryForm.tsx
│   │   └── lib/
│   │       ├── api-client.ts
│   │       └── api/
│   │           └── leads.ts
│   └── public/
│       └── robots.txt
└── scripts/
    └── database/
        └── migrations/
            └── 007_leads_schema.sql
```

---

## MVP Success Criteria

### Landing Page
- ✅ Homepage loads and displays correctly
- ✅ Franchise inquiry form works
- ✅ Form submission sends email
- ✅ Mobile responsive
- ✅ Basic SEO (meta tags)

### Backend
- ✅ API Gateway routes requests
- ✅ Lead management service stores leads
- ✅ Email notifications sent
- ✅ Leads visible in admin (franchisor portal)

### End-to-End
- ✅ User can submit franchise inquiry
- ✅ Franchisor receives email notification
- ✅ Lead appears in lead management system
- ✅ No critical errors

---

## Post-MVP Enhancements

After MVP launch, add:
1. Services catalog page
2. Appointment booking widget
3. Blog/content management
4. Advanced analytics
5. A/B testing
6. Multi-language support

---

## Timeline Summary

**MVP Timeline:** 3-4 weeks
- Week 1: Backend (API Gateway + Lead Management)
- Week 2: Landing Page
- Week 3: Integration & Testing
- Week 4: Deployment & Launch

**Full Plan Timeline:** 8-9 weeks (see main plan)

---

**Document Status:** 📋 DRAFT - Ready for Review  
**Last Updated:** 2026-01-XX

