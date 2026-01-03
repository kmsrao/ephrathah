#!/bin/bash
# MediaPortal Database Quick Start Script
# This script sets up the entire database with one command

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="ephrathahstream"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  MediaPortal Database Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check if PostgreSQL is running
echo -e "${YELLOW}[1/5]${NC} Checking PostgreSQL connection..."
if ! psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c '\q' 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to PostgreSQL${NC}"
    echo "Please make sure PostgreSQL is running and you have the correct credentials."
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Step 2: Create database
echo -e "${YELLOW}[2/5]${NC} Creating database '$DB_NAME'..."
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME;"
echo -e "${GREEN}✓ Database created${NC}"
echo ""

# Step 3: Run setup script
echo -e "${YELLOW}[3/5]${NC} Creating tables, indexes, and triggers..."
psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "$(dirname "$0")/setup.sql" > /dev/null
echo -e "${GREEN}✓ Database structure created${NC}"
echo ""

# Step 4: Ask about seed data
echo -e "${YELLOW}[4/5]${NC} Do you want to add sample data for testing? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -f "$(dirname "$0")/seed.sql"
    echo -e "${GREEN}✓ Sample data added${NC}"
else
    echo -e "${BLUE}⊘ Skipped sample data${NC}"
fi
echo ""

# Step 5: Verify setup
echo -e "${YELLOW}[5/5]${NC} Verifying setup..."
TABLE_COUNT=$(psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';")
USER_COUNT=$(psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;")

echo -e "${GREEN}✓ Setup verified${NC}"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Database setup completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Database: ${GREEN}$DB_NAME${NC}"
echo -e "Tables created: ${GREEN}$TABLE_COUNT${NC}"
echo -e "Users in database: ${GREEN}$USER_COUNT${NC}"
echo ""
echo -e "Connection string:"
echo -e "${BLUE}postgresql://$DB_USER:PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your backend/.env file with the database connection string"
echo "2. Run: npm run dev (from project root)"
echo "3. Access the application at http://localhost:4200"
echo ""
