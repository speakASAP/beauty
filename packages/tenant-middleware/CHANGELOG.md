# Tenant Middleware Package - Changelog

## Version 1.0.1 (2026-01-XX)

### Fixed
- Removed unused `pg` dependency (using passed-in db connection)
- Added documentation about connection pooling behavior
- Clarified tenant state validation behavior for platform-level tables

### Changed
- Improved documentation for `setTenantContext` function
- Added comments about connection pooling and session variables

## Version 1.0.0 (2026-01-XX)

### Added
- Initial implementation
- JWT token validation and tenant context extraction
- Database session tenant binding (RLS support)
- Tenant state validation
- Logging context creation
- Express middleware integration

