#!/bin/bash
# Run database migration
# Usage: ./run_migration.sh <migration_file>

set -e

MIGRATION_FILE=${1:-""}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-4101}
DB_NAME=${POSTGRES_DB:-beauty_platform}
DB_USER=${POSTGRES_USER:-beauty_user}
DB_PASSWORD=${POSTGRES_PASSWORD:-beauty_password}

if [ -z "$MIGRATION_FILE" ]; then
  echo "Usage: $0 <migration_file>"
  echo "Example: $0 migrations/002_booking_tokens.sql"
  exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "Running migration: $MIGRATION_FILE"
echo "Database: $DB_NAME@$DB_HOST:$DB_PORT"

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

