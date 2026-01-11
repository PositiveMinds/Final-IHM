-- Fix patient_type categorization for all patients
-- This will properly categorize NEW vs RETURN based on registration date

-- First, update ALL patients based on their registration date
UPDATE "public"."patients"
SET "patient_type" = CASE
  WHEN "patient_registration_date" >= DATE_TRUNC('month', CURRENT_DATE) THEN 'New'
  ELSE 'Return'
END
WHERE TRUE;  -- Update ALL rows, not just NULL or 'New'

-- Verify the results
SELECT "patient_type", COUNT(*) as count FROM "public"."patients" GROUP BY "patient_type" ORDER BY "patient_type";

-- Check the date range of registrations
SELECT 
  MIN("patient_registration_date") as earliest_registration,
  MAX("patient_registration_date") as latest_registration,
  CURRENT_DATE as today
FROM "public"."patients";
