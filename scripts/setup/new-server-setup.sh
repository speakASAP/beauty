#!/bin/bash
# New Server Setup Script
# Usage: ./scripts/setup/new-server-setup.sh
#
# This script helps set up a new server for beauty platform deployment.
# It guides through the setup process and validates configuration.
#
# Environment Variables:
#   DOMAIN_SUFFIX - Domain suffix for this server (e.g., alfares.cz)
#   ADMIN_EMAIL - Email for Let's Encrypt certificates
#   DB_ADMIN_PASSWORD - Database admin password (will prompt if not set)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Beauty Platform - New Server Setup                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    echo "Please install Git first"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Get configuration
echo -e "${YELLOW}Configuration${NC}"
echo "Please provide the following information for this server:"
echo ""

DOMAIN_SUFFIX="${DOMAIN_SUFFIX:-}"
if [ -z "$DOMAIN_SUFFIX" ]; then
    read -p "Domain suffix (e.g., alfares.cz): " DOMAIN_SUFFIX
fi

ADMIN_EMAIL="${ADMIN_EMAIL:-}"
if [ -z "$ADMIN_EMAIL" ]; then
    read -p "Admin email for Let's Encrypt: " ADMIN_EMAIL
fi

DB_ADMIN_PASSWORD="${DB_ADMIN_PASSWORD:-}"
if [ -z "$DB_ADMIN_PASSWORD" ]; then
    read -sp "Database admin password: " DB_ADMIN_PASSWORD
    echo ""
fi

BASE_PATH="${BASE_PATH:-$HOME}"
NETWORK_NAME="${DOCKER_NETWORK:-nginx-network}"

echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo "  Domain Suffix: $DOMAIN_SUFFIX"
echo "  Admin Email: $ADMIN_EMAIL"
echo "  Base Path: $BASE_PATH"
echo "  Network Name: $NETWORK_NAME"
echo ""

read -p "Continue with setup? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Setup cancelled"
    exit 0
fi

echo ""
echo -e "${YELLOW}Setting up Docker network...${NC}"
if ! docker network inspect "$NETWORK_NAME" &> /dev/null; then
    docker network create "$NETWORK_NAME"
    echo -e "${GREEN}✅ Network $NETWORK_NAME created${NC}"
else
    echo -e "${GREEN}✅ Network $NETWORK_NAME already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Clone required repositories:"
echo "   git clone <beauty-repo-url> $BASE_PATH/beauty"
echo "   git clone <nginx-microservice-repo-url> $BASE_PATH/nginx-microservice"
echo "   git clone <database-server-repo-url> $BASE_PATH/database-server"
echo "   git clone <auth-microservice-repo-url> $BASE_PATH/auth-microservice"
echo ""
echo "2. Configure environment files:"
echo "   See docs/deployment/multi-server-deployment.md for details"
echo ""
echo "3. Set up database server:"
echo "   cd $BASE_PATH/database-server"
echo "   # Create .env file with DB_ADMIN_PASSWORD"
echo "   ./scripts/start.sh"
echo ""
echo "4. Create databases:"
echo "   cd $BASE_PATH/beauty"
echo "   DB_CONTAINER=db-server-postgres \\"
echo "   DB_SERVER_ADMIN_USER=dbadmin \\"
echo "   DB_SERVER_ADMIN_PASSWORD='$DB_ADMIN_PASSWORD' \\"
echo "   ./scripts/database/create-database.sh auth"
echo ""
echo "5. Start nginx microservice:"
echo "   cd $BASE_PATH/nginx-microservice"
echo "   # Create .env file with DOMAIN_SUFFIX and ADMIN_EMAIL"
echo "   ./scripts/start-nginx.sh"
echo ""
echo "6. Deploy microservices:"
echo "   cd $BASE_PATH/nginx-microservice"
echo "   ./scripts/blue-green/deploy-smart.sh auth-microservice"
echo ""
echo "7. Verify deployment:"
echo "   cd $BASE_PATH/nginx-microservice"
echo "   ./scripts/start-all-services.sh"
echo ""
echo -e "${GREEN}✅ Setup guide completed${NC}"
echo ""
echo "For detailed instructions, see: docs/deployment/multi-server-deployment.md"
