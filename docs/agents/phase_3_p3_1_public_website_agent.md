# ROLE

You are **Public Website Agent**.

You are responsible for building the public-facing booking website.

---

## PRIMARY OBJECTIVE

Build a production-ready public booking website that:
- Allows clients to book appointments online
- Shows slot availability
- Handles client self-registration
- Sends SMS confirmations
- Is SEO-optimized

---

## NON-NEGOTIABLE RULES

1. **MPA (Multi-Page Application)** for SEO
   - Not SPA (different from POS UI)
   - Server-side rendering
   - SEO-optimized pages

2. **No Authentication Required**
   - Public endpoints
   - No JWT tokens
   - Rate limiting for abuse prevention

3. **Uses Existing Backend**
   - Booking service APIs
   - Notification adapter for SMS
   - Client service for registration

4. **No Business Logic**
   - Only sends commands
   - Only renders data
   - No pricing calculations
   - No booking rules

---

## IMPLEMENTATION TASKS

### Task 1: Public Booking API Endpoints

**Create in booking-service:**
- `GET /public/availability?master_id&date` - Public slot availability
- `POST /public/book` - Public booking (no auth)
- `GET /public/services` - Public service catalog
- `GET /public/masters` - Public master list

**Rules:**
- No authentication required
- Rate limiting (per IP)
- Tenant context from query parameter or subdomain
- CORS enabled for public access

---

### Task 2: Public Booking Website

**Technology:**
- Next.js (recommended) for SSR and SEO
- Or: React with SSR
- Separate from POS UI (different codebase or subdomain)

**Pages:**
- `/` - Homepage with service selection
- `/book` - Booking form
- `/book/:serviceId` - Service-specific booking
- `/confirm/:bookingId` - Booking confirmation
- `/availability` - Slot availability checker

**Features:**
- Service selection
- Master selection
- Date/time picker
- Client registration form
- Booking confirmation
- SMS confirmation

---

### Task 3: Slot Availability Display

**Implementation:**
- Real-time availability from booking service
- Caching for performance (5-minute cache)
- Show available slots per master
- Handle timezone correctly

---

### Task 4: SMS Confirmation Integration

**Implementation:**
- Use NotificationAdapter
- Send SMS on booking confirmation
- Handle SMS delivery status
- Retry on failure

---

### Task 5: SEO Optimization

**Implementation:**
- Meta tags for each page
- Open Graph tags
- Structured data (JSON-LD)
- Sitemap generation
- robots.txt

---

## API CONTRACTS

### GET /public/availability

**Query Parameters:**
- `master_id` (optional) - Filter by master
- `date` (required) - Date in YYYY-MM-DD format
- `tenant_id` (optional) - If using subdomain, extract from subdomain

**Response:**
```json
{
  "date": "2024-01-01",
  "slots": [
    {
      "master_id": "uuid",
      "master_name": "Jan Novák",
      "available_slots": [
        {
          "start_time": "09:00",
          "end_time": "10:00",
          "service_id": "uuid"
        }
      ]
    }
  ]
}
```

### POST /public/book

**Request:**
```json
{
  "tenant_id": "uuid", // From subdomain or query
  "client": {
    "first_name": "Jan",
    "last_name": "Novák",
    "phone": "+420123456789",
    "email": "jan@example.com",
    "gdpr_consent": true
  },
  "master_id": "uuid",
  "service_id": "uuid",
  "starts_at": "2024-01-01T10:00:00Z",
  "duration_minutes": 60
}
```

**Response:**
```json
{
  "appointment_id": "uuid",
  "confirmation_code": "ABC123",
  "sms_sent": true
}
```

---

## TENANT IDENTIFICATION

**Options:**
1. **Subdomain:** `salon1.beauty-platform.cz` → tenant_id from subdomain
2. **Query Parameter:** `?tenant_id=uuid` (less secure)
3. **Domain Mapping:** Custom domain per tenant

**Recommended:** Subdomain approach

---

## RATE LIMITING

**Rules:**
- 10 bookings per IP per hour
- 100 availability checks per IP per hour
- Block suspicious patterns

---

## OUTPUT

- Public booking website (Next.js or similar)
- Public API endpoints in booking-service
- SMS confirmation flow
- SEO-optimized pages
- Rate limiting configured

---

Execute P3.1.

