-- ============================================================================
-- DATABASE OPTIMIZATION & RESTRUCTURING
-- Adds foreign keys, indexes, constraints, and optimizes schema
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD PRIMARY KEYS (if not already set)
-- ============================================================================

-- Facilities table - make fid primary key
ALTER TABLE facilities 
ADD PRIMARY KEY (fid);

-- Add unique constraint on facility_id (business key)
ALTER TABLE facilities 
ADD CONSTRAINT uk_facilities_facility_id UNIQUE (facility_id);

-- Patients table - make pid primary key
ALTER TABLE patients 
ADD PRIMARY KEY (pid);

-- Add unique constraint on patient_id (business key)
ALTER TABLE patients 
ADD CONSTRAINT uk_patients_patient_id UNIQUE (patient_id);

-- Users table - make uid primary key
ALTER TABLE users 
ADD PRIMARY KEY (uid);

-- Add unique constraint on email
ALTER TABLE users 
ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Appointments table - make aid primary key
ALTER TABLE appointments 
ADD PRIMARY KEY (aid);

-- ============================================================================
-- STEP 2: ADD FID COLUMNS FOR PROPER FOREIGN KEY RELATIONSHIPS
-- ============================================================================

-- Add fid column to patients table if it doesn't exist
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS fid NUMERIC;

-- Add fid column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS fid NUMERIC;

-- ============================================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS (using fid as FK)
-- ============================================================================

-- Patients depends on Facilities (via fid)
ALTER TABLE patients
ADD CONSTRAINT fk_patients_fid
FOREIGN KEY (fid)
REFERENCES facilities(fid)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Users depends on Facilities (via fid)
ALTER TABLE users
ADD CONSTRAINT fk_users_fid
FOREIGN KEY (fid)
REFERENCES facilities(fid)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Appointments depends on Patients
ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_patient_id
FOREIGN KEY (patient_id)
REFERENCES patients(patient_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ============================================================================
-- STEP 3B: POPULATE FID COLUMNS FROM EXISTING DATA
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

-- Make fid NOT NULL after data population
ALTER TABLE patients
ALTER COLUMN fid SET NOT NULL;

ALTER TABLE users
ALTER COLUMN fid SET NOT NULL;

-- ============================================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Facilities indexes
CREATE INDEX idx_facilities_facility_id ON facilities(facility_id);
CREATE INDEX idx_facilities_region ON facilities(region);

-- Patients indexes
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_fid ON patients(fid);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_registered_date ON patients(registered_date);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone_number);
-- Composite index for common queries
CREATE INDEX idx_patients_fid_status ON patients(fid, status);

-- Users indexes
CREATE INDEX idx_users_fid ON users(fid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_role ON users(user_role);
CREATE INDEX idx_users_username ON users(username);
-- Composite index for login queries
CREATE INDEX idx_users_email_active ON users(email, is_active);

-- Appointments indexes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
-- Composite indexes for common queries
CREATE INDEX idx_appointments_date_status ON appointments(appointment_date, status);
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, appointment_date);

-- ============================================================================
-- STEP 6: ADD CHECK CONSTRAINTS FOR DATA VALIDATION
-- ============================================================================

-- Users - validate user_role
ALTER TABLE users
ADD CONSTRAINT ck_users_valid_role 
CHECK (user_role IN ('Administrator', 'Manager', 'Staff', 'Doctor', 'Nurse', 'Receptionist'));

-- Users - validate is_active is boolean
ALTER TABLE users
ADD CONSTRAINT ck_users_is_active 
CHECK (is_active IN (true, false, NULL));

-- Patients - validate gender
ALTER TABLE patients
ADD CONSTRAINT ck_patients_valid_gender 
CHECK (gender IN ('M', 'F', 'O', NULL));

-- Patients - validate status
ALTER TABLE patients
ADD CONSTRAINT ck_patients_valid_status 
CHECK (status IN ('Active', 'Inactive', 'Transferred', 'Deceased', NULL));

-- Appointments - validate status
ALTER TABLE appointments
ADD CONSTRAINT ck_appointments_valid_status 
CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-show', NULL));

-- Appointments - validate appointment_date is not in past
ALTER TABLE appointments
ADD CONSTRAINT ck_appointments_valid_date 
CHECK (appointment_date >= CURRENT_DATE);

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
  p.art_adherence_percent,
  p.viral_load_status,
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

CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at);

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
