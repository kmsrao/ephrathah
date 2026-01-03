-- MediaPortal Database Setup Script
-- Database: ephrathahstream
-- Description: Creates database and tables for the MediaPortal application

-- ===========================================
-- 1. Create Database (if not exists)
-- ===========================================
-- Run this command separately if needed:
-- CREATE DATABASE ephrathahstream;

-- Connect to the database first:
-- \c ephrathahstream;

-- ===========================================
-- 2. Create Schema
-- ===========================================
CREATE SCHEMA IF NOT EXISTS public;

-- ===========================================
-- 3. Create Users Table
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "contactNumber" VARCHAR(255) NOT NULL,
    "liveMode" VARCHAR(50) NOT NULL DEFAULT 'audio',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 4. Create Indexes
-- ===========================================
-- Index on username for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index on createdAt for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");

-- ===========================================
-- 5. Add Constraints
-- ===========================================
-- Check constraint for liveMode to only allow 'audio' or 'video'
ALTER TABLE users
ADD CONSTRAINT chk_live_mode
CHECK ("liveMode" IN ('audio', 'video'));

-- ===========================================
-- 6. Create Function for Updated At Trigger
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===========================================
-- 7. Create Trigger for Auto-updating updatedAt
-- ===========================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 8. Create Prisma Migrations Table (for Prisma tracking)
-- ===========================================
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    id VARCHAR(36) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMP(3),
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP(3),
    started_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_steps_count INTEGER NOT NULL DEFAULT 0
);

-- ===========================================
-- 9. Sample Data (Optional - for testing)
-- ===========================================
-- Uncomment to insert sample users
-- Password is 'password123' hashed with bcrypt (10 rounds)
/*
INSERT INTO users (username, password, "contactNumber", "liveMode")
VALUES
    ('admin', '$2b$10$K8pN7qHYZJYXGxB0Xw9rE.vP9rqQF7LkFZ3xZ4tYvF7ZwY5XqK5qG', '+1234567890', 'video'),
    ('john_doe', '$2b$10$K8pN7qHYZJYXGxB0Xw9rE.vP9rqQF7LkFZ3xZ4tYvF7ZwY5XqK5qG', '+0987654321', 'audio')
ON CONFLICT (username) DO NOTHING;
*/

-- ===========================================
-- 10. Verify Installation
-- ===========================================
-- Check if tables were created successfully
SELECT
    table_name,
    table_type
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name = 'users';

-- Display users table structure
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'users'
ORDER BY
    ordinal_position;

-- ===========================================
-- Success Message
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Database: ephrathahstream';
    RAISE NOTICE 'Schema: public';
    RAISE NOTICE 'Tables created: users';
END $$;
