#!/bin/bash
# Create Auth Database for auth-microservice
# Usage: ./scripts/database/create-auth-database.sh
#
# This script creates the "auth" database required by auth-microservice.
# It should be run on the production server after pulling the codebase.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Default values - can be overridden by environment variables
DB_CONTAINER="${DB_CONTAINER:-db-server-postgres}"
ADMIN_USER="${DB_SERVER_ADMIN_USER:-dbadmin}"
DB_NAME="${DB_NAME:-auth}"

echo "📊 Creating auth database for auth-microservice"
echo "   Database: $DB_NAME"
echo "   Container: $DB_CONTAINER"
echo "   Admin User: $ADMIN_USER"
echo ""

# Check if database server is running
if ! docker ps --format "{{.Names}}" | grep -q "^${DB_CONTAINER}$"; then
    echo "❌ Database server container '$DB_CONTAINER' is not running"
    echo "💡 Start it with: cd ~/database-server && ./scripts/start.sh"
    exit 1
fi

# Check if database already exists
if docker exec "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ Database $DB_NAME already exists"
    exit 0
fi

# Create database
echo "📝 Creating database $DB_NAME..."
docker exec -i "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres <<-EOSQL
    CREATE DATABASE "$DB_NAME";
EOSQL

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database $DB_NAME created successfully!"
    echo ""
    echo "📍 Connection Information:"
    echo "   Hostname: $DB_CONTAINER (on nginx-network)"
    echo "   Database: $DB_NAME"
    echo "   User: $ADMIN_USER (or as configured in auth-microservice .env)"
    echo ""
else
    echo "❌ Failed to create database"
    exit 1
fi
