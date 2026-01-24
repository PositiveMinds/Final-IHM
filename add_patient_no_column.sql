-- Add patient_no column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS patient_no VARCHAR(50);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_patient_no ON users(patient_no);
