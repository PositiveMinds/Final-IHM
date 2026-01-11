-- ============================================================================
-- MIGRATION: Add last_viral_load_date column to patients table
-- Purpose: Track the date of the patient's most recent viral load test
-- Database: Supabase
-- ============================================================================

-- ============================================================================
-- ALTER TABLE: Add last_viral_load_date column
-- ============================================================================

ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_viral_load_date DATE;

-- ============================================================================
-- STEP 2: Populate last_viral_load_date from appointments table
-- ============================================================================
-- This query finds the most recent viral load test date for each patient

UPDATE patients p
SET last_viral_load_date = (
  SELECT MAX(a.appointment_date)
  FROM appointments a
  WHERE a.patient_id = p.patient_id
    AND a.viral_load_status IS NOT NULL
    AND a.appointment_date IS NOT NULL
)
WHERE EXISTS (
  SELECT 1
  FROM appointments a
  WHERE a.patient_id = p.patient_id
    AND a.viral_load_status IS NOT NULL
    AND a.appointment_date IS NOT NULL
);

-- ============================================================================
-- STEP 3: Create index on last_viral_load_date for query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_patients_last_viral_load_date 
ON patients(last_viral_load_date);

-- ============================================================================
-- STEP 4: Add RLS policy if using row-level security
-- ============================================================================
-- Note: Adjust based on your existing RLS policies

-- Enable RLS (if not already enabled)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the migration:

-- Check if column was added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'patients' AND column_name = 'last_viral_load_date';

-- Count patients with last_viral_load_date populated
-- SELECT COUNT(*) as patients_with_last_vl_date FROM patients WHERE last_viral_load_date IS NOT NULL;

-- Check sample data
-- SELECT patient_id, first_name, last_name, last_viral_load_date FROM patients LIMIT 10;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
