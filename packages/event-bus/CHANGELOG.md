# Event Bus Package - Changelog

## Version 1.0.1 (2026-01-XX)

### Fixed

- Fixed `occurred_at` validation to allow current time with 5-second clock skew tolerance
- Improved error logging for event validation failures
- Fixed NATS wildcard subscription pattern handling (`appointment.*` → `events.appointment.>`)
- Updated README with correct API usage examples

### Changed

- Event validation now includes event object in error for debugging
- Subscription patterns now correctly convert to NATS wildcards

## Version 1.0.0 (2026-01-XX)

### Added

- Initial implementation
- Event schema validation (Phase 0 Event Catalog compliance)
- NATS integration
- Event publishing and subscribing
- Mandatory field validation (tenant_id, aggregate_id, etc.)
