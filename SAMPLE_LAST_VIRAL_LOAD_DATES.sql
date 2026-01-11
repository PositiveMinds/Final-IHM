-- ============================================================================
-- SAMPLE DATA: Populate last_viral_load_date column with sample dates
-- Database: Supabase
-- ============================================================================

-- Add column if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_viral_load_date DATE;

-- Update with sample dates (last 6 months, random distribution)
UPDATE patients
SET last_viral_load_date = CASE 
  WHEN pid % 10 = 0 THEN CURRENT_DATE - INTERVAL '2 days'
  WHEN pid % 10 = 1 THEN CURRENT_DATE - INTERVAL '15 days'
  WHEN pid % 10 = 2 THEN CURRENT_DATE - INTERVAL '30 days'
  WHEN pid % 10 = 3 THEN CURRENT_DATE - INTERVAL '45 days'
  WHEN pid % 10 = 4 THEN CURRENT_DATE - INTERVAL '60 days'
  WHEN pid % 10 = 5 THEN CURRENT_DATE - INTERVAL '90 days'
  WHEN pid % 10 = 6 THEN CURRENT_DATE - INTERVAL '120 days'
  WHEN pid % 10 = 7 THEN CURRENT_DATE - INTERVAL '150 days'
  WHEN pid % 10 = 8 THEN CURRENT_DATE - INTERVAL '180 days'
  ELSE CURRENT_DATE - INTERVAL '14 days'
END
WHERE pid IS NOT NULL;

-- Verify the data
-- SELECT patient_id, first_name, last_name, last_viral_load_date FROM patients LIMIT 20;
