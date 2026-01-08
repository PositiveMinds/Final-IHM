-- ===== ALTER USERS TABLE - KEEP ONLY ESSENTIAL COLUMNS =====
-- This migration removes unnecessary columns from the users table
-- Keeps: uuid (id), email, password, facility_id, user_role, is_active, created_at, username, fullname

-- Step 1: Add username and fullname columns if they don't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS fullname VARCHAR(150);

-- Step 2: Drop unnecessary columns (facility_name and updated_at)
ALTER TABLE public.users
DROP COLUMN IF EXISTS facility_name;

ALTER TABLE public.users
DROP COLUMN IF EXISTS updated_at;

-- Step 3: Verify the final structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;

-- Final users table structure should have:
-- id (UUID) - primary key
-- email (VARCHAR 255)
-- password (VARCHAR 255)
-- facility_id (VARCHAR 50)
-- user_role (VARCHAR 50)
-- is_active (BOOLEAN)
-- created_at (TIMESTAMP)
-- username (VARCHAR 100)
-- fullname (VARCHAR 150)

-- ===== SESSION DATA STORED ON LOGIN =====
-- The following data is stored in sessionStorage when a user logs in:
-- id - User UUID from users table
-- email - User email
-- fullname - User full name
-- username - Auto-generated username (e.g., @john + facility code)
-- facilityName - Facility name (from old facility_name column, now deprecated)
-- facilityId - Facility UUID (lookup from facilities table)
-- facilityIdCode - Facility code (e.g., facility-kampala-001)
-- facilityRegion - Facility region (from facilities table)
-- userRole - User role (Administrator, Manager, Staff, etc.)
-- isActive - Whether user account is active
-- loginTime - Login timestamp in ISO format
