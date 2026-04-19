#!/bin/bash
# PostgreSQL Setup Script for AI-Transcribe
# Run with: sudo bash backend/setup_postgres.sh

set -e  # Exit on error

echo "=== AI-Transcribe PostgreSQL Setup ==="

# Database credentials
DB_NAME="ai_transcribe_db"
DB_USER="childlike"
DB_PASS="k2QGj2*4f9N1"

echo "Creating database user: $DB_USER"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "User already exists"

echo "Creating database: $DB_NAME"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "Database already exists"

echo "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

echo "Enabling uuid-ossp extension..."
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo "=== Setup Complete ==="
echo ""
echo "Connection string:"
echo "postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
echo ""
echo "Test connection:"
echo "  psql -U $DB_USER -d $DB_NAME -h localhost -W"
