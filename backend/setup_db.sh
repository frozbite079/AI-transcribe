#!/bin/bash
# PostgreSQL setup script for AI-Transcribe
# Run: sudo bash backend/setup_db.sh

set -e

echo "=== Setting up PostgreSQL for AI-Transcribe ==="

# Database configuration
DB_NAME="ai_transcribe_db"
DB_USER="childlike"
DB_PASS="k2QGj2*4f9N1"

# Create user
echo "Creating user: $DB_USER"
sudo -u postgres psql -p 5433 -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || {
    echo "User already exists, updating password..."
    sudo -u postgres psql -p 5433 -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
}

# Create database
echo "Creating database: $DB_NAME"
sudo -u postgres psql -p 5433 -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || {
    echo "Database already exists, reassigning owner..."
    sudo -u postgres psql -p 5433 -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
}

# Grant privileges
echo "Granting privileges..."
sudo -u postgres psql -p 5433 -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Enable uuid-ossp extension
echo "Enabling uuid-ossp extension..."
sudo -u postgres psql -p 5433 -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\";"

echo ""
echo "=== Setup Complete ==="
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: localhost"
echo "Port: 5433"
echo ""
echo "Test connection with:"
echo "  psql -U $DB_USER -d $DB_NAME -h localhost -p 5433 -W"
