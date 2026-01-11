-- Update patient_type based on registration year
-- "New" = Registered in 2025
-- "Return" = Registered in 2024 or earlier

UPDATE "public"."patients"
SET "patient_type" = CASE
  WHEN EXTRACT(YEAR FROM "patient_registration_date") >= 2025 THEN 'New'
  ELSE 'Return'
END
WHERE TRUE;

-- Verify the results
SELECT "patient_type", COUNT(*) as count FROM "public"."patients" GROUP BY "patient_type" ORDER BY "patient_type";

-- Show breakdown by year
SELECT 
  EXTRACT(YEAR FROM "patient_registration_date") as registration_year,
  "patient_type",
  COUNT(*) as count
FROM "public"."patients"
GROUP BY registration_year, "patient_type"
ORDER BY registration_year DESC, "patient_type";
