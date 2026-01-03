#!/bin/bash
# Create Database for Microservice
# Usage: ./scripts/database/create-auth-database.sh [database_name]
#
# This script creates a database for a microservice.
# It can be used for any microservice database (auth, logging, etc.)
# Environment variables can override defaults for multi-server deployments.
#
# Examples:
#   ./scripts/database/create-auth-database.sh auth
#   ./scripts/database/create-auth-database.sh logging
#   DB_CONTAINER=my-db-server ./scripts/database/create-auth-database.sh auth

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Get database name from argument or environment variable, default to "auth"
DB_NAME="${1:-${DB_NAME:-auth}}"

# Database server configuration - all configurable via environment variables
DB_CONTAINER="${DB_CONTAINER:-db-server-postgres}"
ADMIN_USER="${DB_SERVER_ADMIN_USER:-dbadmin}"
NETWORK_NAME="${DOCKER_NETWORK:-nginx-network}"

echo "📊 Creating database for microservice"
echo "   Database: $DB_NAME"
echo "   Container: $DB_CONTAINER"
echo "   Admin User: $ADMIN_USER"
echo "   Network: $NETWORK_NAME"
echo ""

# Check if database server is running
if ! docker ps --format "{{.Names}}" | grep -q "^${DB_CONTAINER}$"; then
    echo "❌ Database server container '$DB_CONTAINER' is not running"
    echo "💡 Start it with: cd ~/database-server && ./scripts/start.sh"
    echo ""
    echo "💡 Or set DB_CONTAINER environment variable to your database container name:"
    echo "   export DB_CONTAINER=my-database-container"
    exit 1
fi

# Check if database already exists
if docker exec "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
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
    echo "   Hostname: $DB_CONTAINER (on $NETWORK_NAME)"
    echo "   Database: $DB_NAME"
    echo "   User: $ADMIN_USER (or as configured in microservice .env)"
    echo ""
    echo "💡 For multi-server deployments, configure your microservice .env with:"
    echo "   DB_HOST=$DB_CONTAINER"
    echo "   DB_NAME=$DB_NAME"
    echo "   DB_USER=\${DB_USER:-$ADMIN_USER}"
    echo ""
else
    echo "❌ Failed to create database"
    exit 1
fi
