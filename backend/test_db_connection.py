#!/usr/bin/env python3
"""
Test database connection and SQLAlchemy setup.
Run: python test_db_connection.py
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env file")
    exit(1)

print(f"Connecting to: {DATABASE_URL.split('@')[1]}")  # Hide credentials

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1 AS test"))
        print("✅ Database connection successful!")
        print(f"✅ Test query result: {result.fetchone()[0]}")

        # Check uuid-ossp extension
        ext = conn.execute(
            text("SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'")
        )
        if ext.fetchone():
            print("✅ uuid-ossp extension available")
        else:
            print("⚠️  uuid-ossp extension NOT found (will be created by migration)")

        # Check existing tables
        tables = conn.execute(
            text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        )
        table_list = [row[0] for row in tables]
        if table_list:
            print(f"📋 Existing tables: {', '.join(table_list)}")
        else:
            print("📋 No tables yet (expected for fresh DB)")

except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit(1)

print("\n✅ Database is ready for Phase 2 (models & migrations)")
