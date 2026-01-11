-- Alter Patients Table to add clinical_note column
ALTER TABLE "public"."patients" 
ADD COLUMN IF NOT EXISTS "clinical_note" TEXT;

-- You can run UPDATE statements after importing data to populate clinical notes
-- Example:
-- UPDATE "public"."patients" SET "clinical_note" = 'Excellent viral suppression. Continue current ART regimen.' WHERE "patient_id" = 'PAT0001';
