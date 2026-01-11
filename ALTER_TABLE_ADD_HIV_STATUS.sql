-- ============================================================================
-- MIGRATION: Add hiv_status column to patients table
-- Database: Supabase
-- Purpose: Track HIV status as Positive, Negative, or Unknown
-- ============================================================================

-- ============================================================================
-- STEP 1: Create ENUM type for HIV status
-- ============================================================================

CREATE TYPE hiv_status_enum AS ENUM ('Positive', 'Negative', 'Unknown');

-- ============================================================================
-- STEP 2: Add hiv_status column to patients table
-- ============================================================================

ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS hiv_status hiv_status_enum DEFAULT 'Unknown';

-- ============================================================================
-- STEP 3: Populate hiv_status based on major_condition
-- ============================================================================
-- If major_condition contains 'HIV', set to Positive; otherwise Unknown

UPDATE patients
SET hiv_status = CASE 
  WHEN condition LIKE '%HIV%' THEN 'Positive'::hiv_status_enum
  ELSE 'Unknown'::hiv_status_enum
END
WHERE hiv_status = 'Unknown';

-- ============================================================================
-- STEP 4: Create index on hiv_status for query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_patients_hiv_status 
ON patients(hiv_status);

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================

-- Check if column was added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'patients' AND column_name = 'hiv_status';

-- Count patients by HIV status
-- SELECT hiv_status, COUNT(*) as patient_count FROM patients GROUP BY hiv_status;

-- Check sample data
-- SELECT patient_id, first_name, last_name, major_condition, hiv_status FROM patients LIMIT 10;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
