-- MediaPortal Database Seed Script
-- Database: ephrathahstream
-- Description: Inserts sample/test data for development

-- ===========================================
-- Sample Users
-- ===========================================
-- Password for all sample users: 'password123'
-- Hash generated with bcrypt, 10 rounds: $2b$10$rBV2kKs.qNHJLLPKQnWVhO5Ur4dj2YqV8FqK5L3wGZhCk8cX8f2Ua

-- Clean up existing test data (optional)
-- DELETE FROM users WHERE username IN ('admin', 'john_doe', 'jane_smith', 'bob_audio', 'alice_video');

-- Insert sample users
INSERT INTO users (username, password, "contactNumber", "liveMode", "createdAt", "updatedAt")
VALUES
    -- Admin user with video mode
    (
        'admin',
        '$2b$10$rBV2kKs.qNHJLLPKQnWVhO5Ur4dj2YqV8FqK5L3wGZhCk8cX8f2Ua',
        '+1234567890',
        'video',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- Regular user with audio mode
    (
        'john_doe',
        '$2b$10$rBV2kKs.qNHJLLPKQnWVhO5Ur4dj2YqV8FqK5L3wGZhCk8cX8f2Ua',
        '+1234567891',
        'audio',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- Regular user with video mode
    (
        'jane_smith',
        '$2b$10$rBV2kKs.qNHJLLPKQnWVhO5Ur4dj2YqV8FqK5L3wGZhCk8cX8f2Ua',
        '+1234567892',
        'video',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- User preferring audio
    (
        'bob_audio',
        '$2b$10$rBV2kKs.qNHJLLPKQnWVhO5Ur4dj2YqV8FqK5L3wGZhCk8cX8f2Ua',
        '+1234567893',
        'audio',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ),

    -- User preferring video
    (
        'alice_video',
        '$2b$10$rBV2kKs.qNHJLLPKQnWVhO5Ur4dj2YqV8FqK5L3wGZhCk8cX8f2Ua',
        '+1234567894',
        'video',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (username) DO NOTHING;

-- ===========================================
-- Verify Seed Data
-- ===========================================
SELECT
    id,
    username,
    "contactNumber",
    "liveMode",
    "createdAt"
FROM
    users
ORDER BY
    id;

-- ===========================================
-- Display Information
-- ===========================================
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE 'Total users in database: %', user_count;
    RAISE NOTICE '';
    RAISE NOTICE '📝 Test Credentials:';
    RAISE NOTICE '  Username: admin     | Password: password123 | Mode: video';
    RAISE NOTICE '  Username: john_doe  | Password: password123 | Mode: audio';
    RAISE NOTICE '  Username: jane_smith| Password: password123 | Mode: video';
    RAISE NOTICE '  Username: bob_audio | Password: password123 | Mode: audio';
    RAISE NOTICE '  Username: alice_video| Password: password123 | Mode: video';
END $$;
