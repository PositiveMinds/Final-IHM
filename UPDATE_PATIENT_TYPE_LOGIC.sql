-- Update patient_type based on "New" = registered in last 3 months
-- "Return" = registered more than 3 months ago

UPDATE "public"."patients"
SET "patient_type" = CASE
  WHEN "patient_registration_date" >= CURRENT_DATE - INTERVAL '3 months' THEN 'New'
  ELSE 'Return'
END
WHERE TRUE;

-- Verify the results
SELECT "patient_type", COUNT(*) as count FROM "public"."patients" GROUP BY "patient_type" ORDER BY "patient_type";

-- Show breakdown by registration date ranges
SELECT 
  CASE 
    WHEN "patient_registration_date" >= CURRENT_DATE - INTERVAL '3 months' THEN 'Last 3 months (New)'
    ELSE 'More than 3 months ago (Return)'
  END as category,
  COUNT(*) as count
FROM "public"."patients"
GROUP BY category;
