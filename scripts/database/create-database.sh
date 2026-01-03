#!/bin/bash
# Generic Database Creation Script
# Usage: ./scripts/database/create-database.sh <database_name> [db_user] [db_password]
#
# Creates a database for any microservice with full environment variable support.
# Designed for multi-server, multi-domain deployments.
#
# Environment Variables:
#   DB_CONTAINER - Database container name (default: db-server-postgres)
#   DB_SERVER_ADMIN_USER - Admin user for database (default: dbadmin)
#   DOCKER_NETWORK - Docker network name (default: nginx-network)
#   DB_USER - Database user to create (optional, uses admin if not provided)
#   DB_PASSWORD - Password for database user (required if DB_USER is provided)
#
# Examples:
#   # Simple: create database with default admin user
#   ./scripts/database/create-database.sh auth
#
#   # With custom container
#   DB_CONTAINER=my-postgres ./scripts/database/create-database.sh auth
#
#   # Create database with dedicated user
#   ./scripts/database/create-database.sh auth auth_user secure_password
#
#   # Full example with all variables
#   DB_CONTAINER=prod-db \
#   DB_SERVER_ADMIN_USER=postgres \
#   DOCKER_NETWORK=prod-network \
#   ./scripts/database/create-database.sh auth auth_user secure_password

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Get parameters
DB_NAME="$1"
DB_USER="${2:-}"
DB_PASSWORD="${3:-}"

# Validate database name
if [ -z "$DB_NAME" ]; then
    echo "❌ Error: Database name is required"
    echo ""
    echo "Usage:"
    echo "  ./scripts/database/create-database.sh <database_name> [db_user] [db_password]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/database/create-database.sh auth"
    echo "  ./scripts/database/create-database.sh auth auth_user secure_password"
    echo ""
    echo "Environment Variables:"
    echo "  DB_CONTAINER - Database container name (default: db-server-postgres)"
    echo "  DB_SERVER_ADMIN_USER - Admin user (default: dbadmin)"
    echo "  DOCKER_NETWORK - Docker network (default: nginx-network)"
    exit 1
fi

# Database server configuration - all configurable via environment variables
DB_CONTAINER="${DB_CONTAINER:-db-server-postgres}"
ADMIN_USER="${DB_SERVER_ADMIN_USER:-dbadmin}"
NETWORK_NAME="${DOCKER_NETWORK:-nginx-network}"

echo "📊 Creating database: $DB_NAME"
echo "   Container: $DB_CONTAINER"
echo "   Admin User: $ADMIN_USER"
echo "   Network: $NETWORK_NAME"
if [ -n "$DB_USER" ]; then
    echo "   Database User: $DB_USER"
fi
echo ""

# Check if database server is running
if ! docker ps --format "{{.Names}}" | grep -q "^${DB_CONTAINER}$"; then
    echo "❌ Database server container '$DB_CONTAINER' is not running"
    echo "💡 Start it with: cd ~/database-server && ./scripts/start.sh"
    echo ""
    echo "💡 Or set DB_CONTAINER environment variable:"
    echo "   export DB_CONTAINER=my-database-container"
    exit 1
fi

# Check if database already exists
if docker exec "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database $DB_NAME already exists"
    read -p "Do you want to recreate it? This will DELETE all data! (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "❌ Cancelled"
        exit 0
    fi
    echo "🗑️  Dropping existing database..."
    docker exec "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" 2>/dev/null || true
    if [ -n "$DB_USER" ]; then
        docker exec "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres -c "DROP USER IF EXISTS \"$DB_USER\";" 2>/dev/null || true
    fi
fi

# Create database
echo "📝 Creating database $DB_NAME..."
docker exec -i "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres <<-EOSQL
    CREATE DATABASE "$DB_NAME";
EOSQL

# Create dedicated user if provided
if [ -n "$DB_USER" ]; then
    if [ -z "$DB_PASSWORD" ]; then
        echo "❌ Error: DB_PASSWORD is required when creating a dedicated user"
        exit 1
    fi
    
    echo "📝 Creating database user $DB_USER..."
    docker exec -i "$DB_CONTAINER" psql -U "$ADMIN_USER" -d postgres <<-EOSQL
        CREATE USER "$DB_USER" WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
        GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
        ALTER DATABASE "$DB_NAME" OWNER TO "$DB_USER";
EOSQL
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database $DB_NAME created successfully!"
    echo ""
    echo "📍 Connection Information:"
    echo "   Hostname: $DB_CONTAINER (on $NETWORK_NAME)"
    echo "   Database: $DB_NAME"
    if [ -n "$DB_USER" ]; then
        echo "   User: $DB_USER"
        echo "   Password: $DB_PASSWORD"
    else
        echo "   User: $ADMIN_USER (admin user)"
    fi
    echo ""
    echo "💡 For multi-server deployments, configure your microservice .env with:"
    echo "   DB_HOST=$DB_CONTAINER"
    echo "   DB_NAME=$DB_NAME"
    if [ -n "$DB_USER" ]; then
        echo "   DB_USER=$DB_USER"
        echo "   DB_PASSWORD=$DB_PASSWORD"
    else
        echo "   DB_USER=\${DB_USER:-$ADMIN_USER}"
    fi
    echo ""
else
    echo "❌ Failed to create database"
    exit 1
fi
