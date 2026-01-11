-- ============================================================================
-- MIGRATION: Add appointment_type column to patients table
-- Database: Supabase
-- Purpose: Track appointment type as ART Refill, VL Testing, IAC, General, Other
-- ============================================================================

-- ============================================================================
-- STEP 1: Create ENUM type for appointment_type
-- ============================================================================

CREATE TYPE appointment_type_enum AS ENUM ('ART Refill', 'VL Testing', 'IAC', 'General', 'Other');

-- ============================================================================
-- STEP 2: Add appointment_type column to patients table
-- ============================================================================

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS appointment_type appointment_type_enum DEFAULT 'General';

-- ============================================================================
-- STEP 3: Populate appointment_type with sample data
-- ============================================================================
-- Randomly distribute appointment types based on patient ID

UPDATE patients
SET appointment_type = CASE 
  WHEN pid % 5 = 0 THEN 'ART Refill'::appointment_type_enum
  WHEN pid % 5 = 1 THEN 'VL Testing'::appointment_type_enum
  WHEN pid % 5 = 2 THEN 'IAC'::appointment_type_enum
  WHEN pid % 5 = 3 THEN 'General'::appointment_type_enum
  ELSE 'Other'::appointment_type_enum
END
WHERE pid IS NOT NULL;

-- ============================================================================
-- STEP 4: Create index on appointment_type for query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_patients_appointment_type 
ON patients(appointment_type);

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================

-- Check if column was added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'patients' AND column_name = 'appointment_type';

-- Count patients by appointment type
-- SELECT appointment_type, COUNT(*) as patient_count FROM patients GROUP BY appointment_type;

-- Check sample data
-- SELECT patient_id, first_name, last_name, appointment_type, next_appointment FROM patients LIMIT 10;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
