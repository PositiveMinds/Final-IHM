-- ============================================================================
-- DATABASE OPTIMIZATION & RESTRUCTURING
-- Adds foreign keys, indexes, constraints, and optimizes schema
-- ============================================================================

-- ============================================================================
-- STEP 0: DROP VIEWS (to allow column type changes)
-- ============================================================================

DROP VIEW IF EXISTS v_appointments_full CASCADE;
DROP VIEW IF EXISTS v_users_with_facility CASCADE;
DROP VIEW IF EXISTS v_patients_with_facility CASCADE;

-- ============================================================================
-- STEP 1: ADD AUTO-INCREMENT TO EXISTING PRIMARY KEYS
-- ============================================================================

-- Facilities - change fid to INTEGER and add auto-increment (if not already identity)
ALTER TABLE facilities ALTER COLUMN fid TYPE INTEGER;
DO $$ BEGIN
  ALTER TABLE facilities ALTER COLUMN fid ADD GENERATED ALWAYS AS IDENTITY;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Patients - change pid to INTEGER and add auto-increment (if not already identity)
ALTER TABLE patients ALTER COLUMN pid TYPE INTEGER;
DO $$ BEGIN
  ALTER TABLE patients ALTER COLUMN pid ADD GENERATED ALWAYS AS IDENTITY;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Users - change uid to INTEGER and add auto-increment (if not already identity)
ALTER TABLE users ALTER COLUMN uid TYPE INTEGER;
DO $$ BEGIN
  ALTER TABLE users ALTER COLUMN uid ADD GENERATED ALWAYS AS IDENTITY;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Appointments - change aid to INTEGER and add auto-increment (if not already identity)
ALTER TABLE appointments ALTER COLUMN aid TYPE INTEGER;
DO $$ BEGIN
  ALTER TABLE appointments ALTER COLUMN aid ADD GENERATED ALWAYS AS IDENTITY;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Add unique constraint on facility_id (business key)
DO $$ BEGIN
  ALTER TABLE facilities ADD CONSTRAINT uk_facilities_facility_id UNIQUE (facility_id);
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Add unique constraint on patient_id (business key)
DO $$ BEGIN
  ALTER TABLE patients ADD CONSTRAINT uk_patients_patient_id UNIQUE (patient_id);
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Add unique constraint on email
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ============================================================================
-- STEP 1B: REMOVE UNWANTED COLUMNS FROM PATIENTS TABLE
-- ============================================================================

-- Remove viral_load_status from patients (now in appointments)
ALTER TABLE patients DROP COLUMN IF EXISTS viral_load_status CASCADE;

-- Remove art_adherence_percent from patients (now in appointments)
ALTER TABLE patients DROP COLUMN IF EXISTS art_adherence_percent CASCADE;

-- Remove region from patients table (region is facility-level, not patient-level)
ALTER TABLE patients DROP COLUMN IF EXISTS region CASCADE;

-- Remove primary_condition from patients (now in appointments)
ALTER TABLE patients DROP COLUMN IF EXISTS primary_condition CASCADE;

-- Remove art_adherence_percent from appointments (not needed)
ALTER TABLE appointments DROP COLUMN IF EXISTS art_adherence_percent CASCADE;

-- ============================================================================
-- STEP 2: ADD FID AND PID COLUMNS FOR PROPER FOREIGN KEY RELATIONSHIPS
-- ============================================================================

-- Add fid column to patients table if it doesn't exist
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS fid INTEGER;

-- Add fid column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS fid INTEGER;

-- Add pid column to appointments table if it doesn't exist
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS pid INTEGER;

-- Add viral_load_copies column to appointments table if it doesn't exist
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS viral_load_copies INTEGER;

-- Add viral_load_status column to appointments table if it doesn't exist
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS viral_load_status VARCHAR(50);

-- Add address column to patients table if it doesn't exist
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS address VARCHAR(255);

-- ============================================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS (using fid and pid as FK)
-- ============================================================================

-- Patients depends on Facilities (via fid)
DO $$ BEGIN
  ALTER TABLE patients ADD CONSTRAINT fk_patients_fid
  FOREIGN KEY (fid) REFERENCES facilities(fid)
  ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Users depends on Facilities (via fid)
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT fk_users_fid
  FOREIGN KEY (fid) REFERENCES facilities(fid)
  ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Appointments depends on Patients (via patient_id)
DO $$ BEGIN
  ALTER TABLE appointments ADD CONSTRAINT fk_appointments_patient_id
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Appointments depends on Patients (via pid)
DO $$ BEGIN
  ALTER TABLE appointments ADD CONSTRAINT fk_appointments_pid
  FOREIGN KEY (pid) REFERENCES patients(pid)
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ============================================================================
-- STEP 3B: POPULATE FID AND PID COLUMNS FROM EXISTING DATA
-- ============================================================================

-- Update patients fid from facility_id_code reference
UPDATE patients p
SET fid = f.fid
FROM facilities f
WHERE p.facility_id_code = f.facility_id
AND (p.fid IS NULL OR p.fid = 0);

-- Update users fid from facility_id reference
UPDATE users u
SET fid = f.fid
FROM facilities f
WHERE u.facility_id = f.facility_id
AND (u.fid IS NULL OR u.fid = 0);

-- Update appointments pid from patient_id reference
UPDATE appointments a
SET pid = p.pid
FROM patients p
WHERE a.patient_id = p.patient_id
AND (a.pid IS NULL OR a.pid = 0);

-- Make fid NOT NULL after data population
ALTER TABLE patients
ALTER COLUMN fid SET NOT NULL;

ALTER TABLE users
ALTER COLUMN fid SET NOT NULL;

-- Make pid NOT NULL after data population
ALTER TABLE appointments
ALTER COLUMN pid SET NOT NULL;

-- ============================================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Facilities indexes
CREATE INDEX IF NOT EXISTS idx_facilities_facility_id ON facilities(facility_id);
CREATE INDEX IF NOT EXISTS idx_facilities_region ON facilities(region);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_fid ON patients(fid);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_registered_date ON patients(registered_date);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone_number);
-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_patients_fid_status ON patients(fid, status);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_fid ON users(fid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
-- Composite index for login queries
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON appointments(patient_id, appointment_date);

-- ============================================================================
-- STEP 6: ADD CHECK CONSTRAINTS FOR DATA VALIDATION
-- ============================================================================

-- Users - validate user_role
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT ck_users_valid_role 
  CHECK (user_role IN ('Administrator', 'Manager', 'Staff', 'Doctor', 'Nurse', 'Receptionist'));
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Users - validate is_active is boolean
DO $$ BEGIN
  ALTER TABLE users ADD CONSTRAINT ck_users_is_active 
  CHECK (is_active IN (true, false, NULL));
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Patients - validate gender
DO $$ BEGIN
  ALTER TABLE patients ADD CONSTRAINT ck_patients_valid_gender 
  CHECK (gender IN ('M', 'F', 'O', NULL));
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Patients - validate status
DO $$ BEGIN
  ALTER TABLE patients ADD CONSTRAINT ck_patients_valid_status 
  CHECK (status IN ('Active', 'Inactive', 'Transferred', 'Deceased', NULL));
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Appointments - validate status
DO $$ BEGIN
  ALTER TABLE appointments ADD CONSTRAINT ck_appointments_valid_status 
  CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show', NULL));
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Appointments - validate appointment_date is not null
-- (Removed check for future dates to allow past appointments for historical records)

-- ============================================================================
-- STEP 7: ADD DEFAULT VALUES AND CONSTRAINTS
-- ============================================================================

-- Set default timestamps
ALTER TABLE facilities
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE patients
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE appointments
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

-- Set default is_active to true
ALTER TABLE users
ALTER COLUMN is_active SET DEFAULT true;

-- ============================================================================
-- STEP 8: CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Patients with Facility Information
CREATE OR REPLACE VIEW v_patients_with_facility AS
SELECT 
  p.pid,
  p.patient_id,
  p.first_name,
  p.last_name,
  p.age,
  p.gender,
  p.email,
  p.phone_number,
  p.status,
  p.registered_date,
  f.fid,
  f.facility_id,
  f.facility_name,
  f.region
FROM patients p
LEFT JOIN facilities f ON p.facility_id_code = f.facility_id;

-- View: Users with Facility Information
CREATE OR REPLACE VIEW v_users_with_facility AS
SELECT 
  u.uid,
  u.email,
  u.username,
  u.fullname,
  u.user_role,
  u.is_active,
  u.created_at,
  f.fid,
  f.facility_id,
  f.facility_name,
  f.region
FROM users u
LEFT JOIN facilities f ON u.facility_id = f.facility_id;

-- View: Appointments with Patient and Facility Information
CREATE OR REPLACE VIEW v_appointments_full AS
SELECT 
  a.aid,
  a.patient_id,
  a.patient_name,
  a.appointment_date,
  a.appointment_time,
  a.status,
  a.primary_condition,
  a.notes,
  a.created_at,
  p.pid,
  p.first_name,
  p.last_name,
  p.email AS patient_email,
  p.phone_number AS patient_phone,
  p.facility_id_code,
  f.fid,
  f.facility_id,
  f.facility_name,
  f.region
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.patient_id
LEFT JOIN facilities f ON p.facility_id_code = f.facility_id;

-- ============================================================================
-- STEP 9: AUDIT & LOGGING (OPTIONAL)
-- ============================================================================

-- Create audit table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_data JSONB,
  new_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);

-- ============================================================================
-- STEP 10: VERIFY CONSTRAINTS (Run after applying)
-- ============================================================================

-- To verify constraints were applied, run:
-- SELECT constraint_name, constraint_type
-- FROM information_schema.table_constraints
-- WHERE table_name IN ('facilities', 'patients', 'users', 'appointments');

-- To verify indexes were created, run:
-- SELECT indexname 
-- FROM pg_indexes 
-- WHERE tablename IN ('facilities', 'patients', 'users', 'appointments');

-- ============================================================================
-- END OF OPTIMIZATION SCRIPT
-- ============================================================================
