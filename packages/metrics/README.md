# @beauty/metrics

Basic metrics collection package for beauty platform (no external dependencies).

## Features

- HTTP request metrics
- Database query metrics
- Event processing metrics
- Business metrics (orders, revenue, appointments)
- Tenant-scoped metrics
- In-memory storage (can be extended to send to logging service)

## Usage

```javascript
import { metricsMiddleware, getMetrics } from '@beauty/metrics';

// Add metrics middleware
app.use(metricsMiddleware('booking-service'));

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(getMetrics());
});
```

## Metrics Structure

```json
{
  "http": {
    "total": 1000,
    "recent_requests": [...],
    "recent_errors": [...],
    "error_count": 5
  },
  "db": {
    "total": 500,
    "recent_queries": [...],
    "recent_errors": [...],
    "error_count": 2
  },
  "events": {
    "total": 200,
    "published_count": 100,
    "consumed_count": 100,
    "error_count": 0
  },
  "business": {
    "orders": 50,
    "revenue": 50000,
    "appointments": 100,
    "clients": 200
  },
  "service_health": {
    "booking-service": {
      "healthy": true,
      "timestamp": "2026-01-XX..."
    }
  }
}
```
