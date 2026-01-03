#!/bin/bash
# Tenant Onboarding Script
# Onboards a new tenant via SQL (no code changes required)
#
# Usage:
#   ./scripts/tenant/onboard_tenant.sh "Salon Name" "Address" "+420123456789" "salon@example.com"
#
# Or with environment variables:
#   export TENANT_NAME="Salon Name"
#   export TENANT_ADDRESS="Address"
#   export TENANT_PHONE="+420123456789"
#   export TENANT_EMAIL="salon@example.com"
#   ./scripts/tenant/onboard_tenant.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get tenant information from arguments or environment variables
TENANT_NAME="${1:-${TENANT_NAME}}"
TENANT_ADDRESS="${2:-${TENANT_ADDRESS}}"
TENANT_PHONE="${3:-${TENANT_PHONE}}"
TENANT_EMAIL="${4:-${TENANT_EMAIL}}"

# Validate required fields
if [ -z "$TENANT_NAME" ]; then
  echo "Error: Tenant name is required"
  echo ""
  echo "Usage:"
  echo "  ./scripts/tenant/onboard_tenant.sh \"Salon Name\" [address] [phone] [email]"
  echo ""
  echo "Or with environment variables:"
  echo "  export TENANT_NAME=\"Salon Name\""
  echo "  export TENANT_ADDRESS=\"Address\""
  echo "  export TENANT_PHONE=\"+420123456789\""
  echo "  export TENANT_EMAIL=\"salon@example.com\""
  echo "  ./scripts/tenant/onboard_tenant.sh"
  exit 1
fi

# Get database connection details from environment or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-4101}"
DB_NAME="${DB_NAME:-beauty_platform}"
DB_USER="${DB_USER:-beauty_user}"
DB_PASSWORD="${DB_PASSWORD:-beauty_password}"

# Check if using Docker Compose
if command -v docker-compose &> /dev/null; then
  if docker-compose ps database 2>/dev/null | grep -q "Up"; then
    echo "Using Docker Compose database connection"
    DOCKER_COMPOSE=true
  else
    DOCKER_COMPOSE=false
  fi
else
  DOCKER_COMPOSE=false
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Tenant Onboarding                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Tenant Name: $TENANT_NAME"
echo "Address: ${TENANT_ADDRESS:-<not provided>}"
echo "Phone: ${TENANT_PHONE:-<not provided>}"
echo "Email: ${TENANT_EMAIL:-<not provided>}"
echo ""

# Export variables for SQL script
export PGTENANT_NAME="$TENANT_NAME"
export PGTENANT_ADDRESS="$TENANT_ADDRESS"
export PGTENANT_PHONE="$TENANT_PHONE"
export PGTENANT_EMAIL="$TENANT_EMAIL"

# Run SQL script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_SCRIPT="$SCRIPT_DIR/onboard_tenant.sql"

if [ "$DOCKER_COMPOSE" = true ]; then
  echo "Onboarding tenant via Docker Compose..."
  docker-compose exec -T database psql -U "$DB_USER" -d "$DB_NAME" <<EOF
\set tenant_name '$TENANT_NAME'
\set tenant_address '${TENANT_ADDRESS:-}'
\set tenant_phone '${TENANT_PHONE:-}'
\set tenant_email '${TENANT_EMAIL:-}'
\i $SQL_SCRIPT
EOF
else
  echo "Onboarding tenant via direct database connection..."
  export PGPASSWORD="$DB_PASSWORD"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
\set tenant_name '$TENANT_NAME'
\set tenant_address '${TENANT_ADDRESS:-}'
\set tenant_phone '${TENANT_PHONE:-}'
\set tenant_email '${TENANT_EMAIL:-}'
\i $SQL_SCRIPT
EOF
fi

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Tenant onboarding completed successfully!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Verify tenant is ACTIVE in database"
  echo "  2. Test tenant operations (create appointment, order, etc.)"
  echo "  3. Verify events are published with correct tenant_id"
  echo "  4. Verify BI aggregates are populated"
  exit 0
else
  echo ""
  echo "❌ Tenant onboarding failed!"
  echo "Please check the error messages above."
  exit 1
fi

