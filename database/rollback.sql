-- MediaPortal Database Rollback Script
-- Database: ephrathahstream
-- Description: Drops all tables and cleans up the database

-- WARNING: This script will delete ALL data!
-- Use with caution!

-- ===========================================
-- Display Warning
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE '⚠️  WARNING: This will delete all data from the database!';
    RAISE NOTICE '⚠️  Press Ctrl+C to cancel or wait 5 seconds to continue...';
    PERFORM pg_sleep(5);
END $$;

-- ===========================================
-- 1. Drop Triggers
-- ===========================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- ===========================================
-- 2. Drop Functions
-- ===========================================
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ===========================================
-- 3. Drop Tables (with CASCADE to drop dependent objects)
-- ===========================================
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- ===========================================
-- 4. Drop Indexes (if they weren't dropped with tables)
-- ===========================================
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_created_at;

-- ===========================================
-- 5. Verify Cleanup
-- ===========================================
SELECT
    table_name
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- ===========================================
-- Success Message
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database cleanup completed!';
    RAISE NOTICE 'All tables, triggers, and functions have been removed.';
END $$;
