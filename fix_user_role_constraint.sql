-- Drop the old constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS ck_users_valid_role;

-- Add new constraint with all roles (existing + new)
ALTER TABLE users
ADD CONSTRAINT ck_users_valid_role CHECK (user_role IN ('Admin', 'Staff', 'patient', 'Nurse', 'Doctor', 'Administrator'));
