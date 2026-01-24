-- Drop facility_id column if it exists
ALTER TABLE users
DROP COLUMN IF EXISTS facility_id;

-- Add pid column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS pid INTEGER REFERENCES patients(pid) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_pid ON users(pid);
