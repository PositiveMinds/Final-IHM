-- Add patient_type column to patients table for categorizing new vs return patients
ALTER TABLE "public"."patients"
ADD COLUMN IF NOT EXISTS "patient_type" VARCHAR(50) DEFAULT 'New';

-- Update patient_type based on registration history
-- For this demo:
-- - Patients registered recently (this month) = "New"
-- - Patients registered in previous months = "Return"
UPDATE "public"."patients"
SET "patient_type" = CASE
  WHEN "patient_registration_date" >= DATE_TRUNC('month', CURRENT_DATE) THEN 'New'
  ELSE 'Return'
END
WHERE "patient_type" IS NULL OR "patient_type" = 'New';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_type ON "public"."patients"("patient_type");

-- Verify the updates
SELECT "patient_type", COUNT(*) as count FROM "public"."patients" GROUP BY "patient_type";
