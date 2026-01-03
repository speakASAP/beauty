#!/bin/bash
# P1.7 - Run All Validation Scripts
# Executes all P1.7 validation tests: contract validation, tenant isolation, and failure scenarios

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     P1.7 Validation & Hardening - Complete Suite          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Results
PASSED=0
FAILED=0

# Test 1: Contract Validation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Contract Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if node scripts/validation/p1_7_contract_validation.js; then
  echo -e "${GREEN}✅ Contract Validation: PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Contract Validation: FAILED${NC}"
  ((FAILED++))
fi
echo ""

# Test 2: Tenant Isolation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Tenant Isolation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if node scripts/validation/p1_7_tenant_isolation.js; then
  echo -e "${GREEN}✅ Tenant Isolation: PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Tenant Isolation: FAILED${NC}"
  ((FAILED++))
fi
echo ""

# Test 3: Failure Scenarios
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Failure Scenarios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if node scripts/validation/p1_7_failure_scenarios.js; then
  echo -e "${GREEN}✅ Failure Scenarios: PASSED${NC}"
  ((PASSED++))
else
  echo -e "${RED}❌ Failure Scenarios: FAILED${NC}"
  ((FAILED++))
fi
echo ""

# Final Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     P1.7 Validation & Hardening - Final Summary           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ P1.7 Validation & Hardening: ALL TESTS PASSED${NC}"
  echo ""
  echo "All validation tests completed successfully:"
  echo "  ✅ Contract validation"
  echo "  ✅ Tenant isolation"
  echo "  ✅ Failure scenarios"
  echo ""
  exit 0
else
  echo -e "${RED}❌ P1.7 Validation & Hardening: SOME TESTS FAILED${NC}"
  echo ""
  echo "Some validation tests failed. Please review the errors above."
  echo ""
  exit 1
fi

