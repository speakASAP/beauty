#!/bin/bash

# P2.6 - Run All Validation Tests
# 
# Executes all Phase 2 validation tests.

set -e

echo "=== P2.6 - Phase 2 Validation & Hardening ==="
echo ""

# Check if services are running
echo "Checking if services are running..."
if ! curl -f http://localhost:4110/health > /dev/null 2>&1; then
  echo "⚠️  Warning: Services may not be running"
  echo "   Start services with: docker-compose up"
  echo ""
fi

# Run validation tests
echo "Running tenant isolation tests..."
node scripts/validation/p2_6_tenant_isolation.js

echo ""
echo "Running role-based access tests..."
node scripts/validation/p2_6_role_based_access.js

echo ""
echo "Running event-driven UX tests..."
node scripts/validation/p2_6_event_driven_ux.js

echo ""
echo "Running UX abuse scenario tests..."
node scripts/validation/p2_6_ux_abuse.js

echo ""
echo "=== All P2.6 Validation Tests Complete ==="
