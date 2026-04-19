# PostgreSQL Setup Instructions

## Option 1: Run the Setup Script (Easiest)

```bash
cd /home/bhavan/Project/Bgt/AI-transcribe/backend
sudo bash setup_postgres.sh
```

You'll be prompted for your sudo password (your login password).

## Option 2: Manual Commands

If the script fails, run these commands manually:

```bash
# Switch to postgres user and run these SQL commands:
sudo -u postgres psql
```

Inside the PostgreSQL prompt, run:

```sql
CREATE USER childlike WITH PASSWORD 'k2QGj2*4f9N1';
CREATE DATABASE ai_transcribe_db OWNER childlike;
GRANT ALL PRIVILEGES ON DATABASE ai_transcribe_db TO childlike;
\c ai_transcribe_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

## Verify Setup

Test the connection:

```bash
psql -U childlike -d ai_transcribe_db -h localhost -W
# Password: k2QGj2*4f9N1
```

Should see:
```
psql (16.x)
Type "help" for help.
ai_transcribe_db=> \q
```

## Troubleshooting

**Error: "role already exists"**
- User already created. Continue to next step.

**Error: "database already exists"**
- Database already exists. Continue.

**Error: "permission denied"**
- Make sure you're using `sudo` before the commands
- Or your user isn't in the `sudoers` file - ask your sysadmin

**Connection refused**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Start it: `sudo systemctl start postgresql`
