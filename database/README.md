# Database Setup Guide

This directory contains SQL scripts for setting up the MediaPortal database.

## Files

- `setup.sql` - Complete database setup script with tables, indexes, and triggers
- `rollback.sql` - Script to drop all tables and clean up the database

## Setup Methods

### Method 1: Using the SQL Script (Manual)

This method uses the manual SQL script to create the database and tables.

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE ephrathahstream;"

# 2. Run the setup script
psql -U postgres -d ephrathahstream -f database/setup.sql
```

### Method 2: Using Prisma Migrations (Recommended)

This method uses Prisma to manage database migrations automatically.

```bash
# From the project root
npm run prisma:migrate

# This will:
# - Create the database tables
# - Track migration history
# - Keep schema in sync with your code
```

## Database Structure

### Users Table

| Column        | Type         | Constraints                    |
|--------------|--------------|--------------------------------|
| id           | SERIAL       | PRIMARY KEY                    |
| username     | VARCHAR(255) | NOT NULL, UNIQUE               |
| password     | VARCHAR(255) | NOT NULL                       |
| contactNumber| VARCHAR(255) | NOT NULL                       |
| liveMode     | VARCHAR(50)  | NOT NULL, DEFAULT 'audio'      |
| createdAt    | TIMESTAMP(3) | NOT NULL, DEFAULT CURRENT_TIME |
| updatedAt    | TIMESTAMP(3) | NOT NULL, DEFAULT CURRENT_TIME |

### Indexes

- `idx_users_username` - Index on username for faster login queries
- `idx_users_created_at` - Index on createdAt for sorting

### Constraints

- `chk_live_mode` - Ensures liveMode is either 'audio' or 'video'
- `users_username_key` - Unique constraint on username

### Triggers

- `update_users_updated_at` - Automatically updates the updatedAt field when a user record is modified

## Connection Details

The application connects using these environment variables (from `.env`):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ephrathahstream?schema=public"
```

## Verification

After running the setup, verify the installation:

```bash
# Connect to database
psql -U postgres -d ephrathahstream

# List all tables
\dt

# Describe users table
\d users

# Count users
SELECT COUNT(*) FROM users;
```

## Troubleshooting

### Database already exists
If you get an error that the database already exists:
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS ephrathahstream;"
psql -U postgres -c "CREATE DATABASE ephrathahstream;"
```

### Permission denied
Make sure your PostgreSQL user has the necessary permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE ephrathahstream TO postgres;
```

### Reset everything
To start fresh:
```bash
cd backend
npm run prisma:migrate reset
```
This will drop the database, recreate it, and run all migrations.
