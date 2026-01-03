#!/bin/bash
# Run database migration via Docker
# Usage: ./run_migration_docker.sh <migration_file>

set -e

MIGRATION_FILE=${1:-""}
CONTAINER_NAME=${CONTAINER_NAME:-beauty-database}
DB_NAME=${POSTGRES_DB:-beauty_platform}
DB_USER=${POSTGRES_USER:-beauty_user}

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
echo "Container: $CONTAINER_NAME"
echo "Database: $DB_NAME"

# Copy migration file to container and run it
docker cp "$MIGRATION_FILE" "$CONTAINER_NAME:/tmp/migration.sql"

docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/migration.sql

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully"
  docker exec "$CONTAINER_NAME" rm /tmp/migration.sql
else
  echo "❌ Migration failed"
  exit 1
fi

