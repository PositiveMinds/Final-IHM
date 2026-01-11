-- ============================================================================
-- UPDATE: Set facility_email for Kitwe HCIV patients
-- Database: Supabase
-- ============================================================================

UPDATE patients
SET facility_email = 'bwoyecharles1@gmail.com'
WHERE fid = 1;

-- ============================================================================
-- VERIFICATION: Check the update
-- ============================================================================

-- SELECT fid, facility_email, COUNT(*) as patient_count 
-- FROM patients 
-- WHERE fid = 1
-- GROUP BY fid, facility_email;
