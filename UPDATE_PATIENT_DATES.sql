-- Add missing columns to patients table
ALTER TABLE "public"."patients" 
ADD COLUMN IF NOT EXISTS "patient_registration_date" DATE,
ADD COLUMN IF NOT EXISTS "art_start_date" DATE;

-- Update patient registration dates and ART start dates for all patients
-- Patient Registration Date = registered_date
-- ART Start Date = 2-3 weeks after registration for HIV/AIDS patients

-- KITWE HCIV (fid = 1)
UPDATE "public"."patients" SET "patient_registration_date" = '2025-06-01', "art_start_date" = '2025-06-15' WHERE "patient_no" = 'PAT1233';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-08', "art_start_date" = '2025-01-22' WHERE "patient_no" = 'PAT0001';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-07', "art_start_date" = '2025-01-21' WHERE "patient_no" = 'PAT0002';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-06', "art_start_date" = NULL WHERE "patient_no" = 'PAT0003';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-05', "art_start_date" = NULL WHERE "patient_no" = 'PAT0004';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-04', "art_start_date" = NULL WHERE "patient_no" = 'PAT0005';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-03', "art_start_date" = NULL WHERE "patient_no" = 'PAT0006';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-02', "art_start_date" = NULL WHERE "patient_no" = 'PAT0007';
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-01', "art_start_date" = NULL WHERE "patient_no" = 'PAT0008';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-31', "art_start_date" = NULL WHERE "patient_no" = 'PAT0009';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-30', "art_start_date" = NULL WHERE "patient_no" = 'PAT0010';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-29', "art_start_date" = '2025-01-12' WHERE "patient_no" = 'PAT0011';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-25', "art_start_date" = '2025-01-08' WHERE "patient_no" = 'PAT0012';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-20', "art_start_date" = '2025-01-03' WHERE "patient_no" = 'PAT0013';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-15', "art_start_date" = '2024-12-29' WHERE "patient_no" = 'PAT0014';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-10', "art_start_date" = '2024-12-24' WHERE "patient_no" = 'PAT0015';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-05', "art_start_date" = '2024-12-19' WHERE "patient_no" = 'PAT0016';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-30', "art_start_date" = '2024-12-14' WHERE "patient_no" = 'PAT0017';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-25', "art_start_date" = '2024-12-09' WHERE "patient_no" = 'PAT0018';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-20', "art_start_date" = '2024-12-04' WHERE "patient_no" = 'PAT0019';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-15', "art_start_date" = '2024-11-29' WHERE "patient_no" = 'PAT0020';

-- FORT PORTAL RRH (fid = 2)
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-29', "art_start_date" = '2025-01-12' WHERE "patient_no" = 'PAT0021';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-28', "art_start_date" = '2025-01-11' WHERE "patient_no" = 'PAT0022';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-27', "art_start_date" = '2025-01-10' WHERE "patient_no" = 'PAT0023';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-26', "art_start_date" = '2025-01-09' WHERE "patient_no" = 'PAT0024';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-25', "art_start_date" = '2025-01-08' WHERE "patient_no" = 'PAT0025';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-24', "art_start_date" = '2025-01-07' WHERE "patient_no" = 'PAT0026';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-23', "art_start_date" = '2025-01-06' WHERE "patient_no" = 'PAT0027';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-22', "art_start_date" = '2025-01-05' WHERE "patient_no" = 'PAT0028';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-21', "art_start_date" = '2025-01-04' WHERE "patient_no" = 'PAT0029';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-20', "art_start_date" = '2025-01-03' WHERE "patient_no" = 'PAT0030';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-15', "art_start_date" = '2024-12-29' WHERE "patient_no" = 'PAT0031';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-10', "art_start_date" = '2024-12-24' WHERE "patient_no" = 'PAT0032';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-05', "art_start_date" = '2024-12-19' WHERE "patient_no" = 'PAT0033';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-30', "art_start_date" = '2024-12-14' WHERE "patient_no" = 'PAT0034';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-25', "art_start_date" = '2024-12-09' WHERE "patient_no" = 'PAT0035';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-20', "art_start_date" = '2024-12-04' WHERE "patient_no" = 'PAT0036';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-15', "art_start_date" = '2024-11-29' WHERE "patient_no" = 'PAT0037';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-10', "art_start_date" = '2024-11-24' WHERE "patient_no" = 'PAT0038';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-05', "art_start_date" = '2024-11-19' WHERE "patient_no" = 'PAT0039';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-30', "art_start_date" = '2024-11-13' WHERE "patient_no" = 'PAT0040';

-- MUBENDE HCIV (fid = 3)
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-19', "art_start_date" = '2025-01-02' WHERE "patient_no" = 'PAT0041';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-18', "art_start_date" = '2025-01-01' WHERE "patient_no" = 'PAT0042';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-17', "art_start_date" = '2024-12-31' WHERE "patient_no" = 'PAT0043';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-16', "art_start_date" = '2024-12-30' WHERE "patient_no" = 'PAT0044';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-15', "art_start_date" = '2024-12-29' WHERE "patient_no" = 'PAT0045';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-14', "art_start_date" = '2024-12-28' WHERE "patient_no" = 'PAT0046';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-13', "art_start_date" = '2024-12-27' WHERE "patient_no" = 'PAT0047';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-12', "art_start_date" = '2024-12-26' WHERE "patient_no" = 'PAT0048';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-11', "art_start_date" = '2024-12-25' WHERE "patient_no" = 'PAT0049';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-10', "art_start_date" = '2024-12-24' WHERE "patient_no" = 'PAT0050';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-08', "art_start_date" = '2024-12-22' WHERE "patient_no" = 'PAT0051';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-01', "art_start_date" = '2024-12-15' WHERE "patient_no" = 'PAT0052';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-25', "art_start_date" = '2024-12-09' WHERE "patient_no" = 'PAT0053';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-20', "art_start_date" = '2024-12-04' WHERE "patient_no" = 'PAT0054';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-15', "art_start_date" = '2024-11-29' WHERE "patient_no" = 'PAT0055';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-10', "art_start_date" = '2024-11-24' WHERE "patient_no" = 'PAT0056';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-05', "art_start_date" = '2024-11-19' WHERE "patient_no" = 'PAT0057';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-30', "art_start_date" = '2024-11-13' WHERE "patient_no" = 'PAT0058';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-25', "art_start_date" = '2024-11-08' WHERE "patient_no" = 'PAT0059';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-20', "art_start_date" = '2024-11-03' WHERE "patient_no" = 'PAT0060';

-- KASESE DISTRICT HOSPITAL (fid = 4)
UPDATE "public"."patients" SET "patient_registration_date" = '2025-01-01', "art_start_date" = '2025-01-15' WHERE "patient_no" = 'PAT0061';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-25', "art_start_date" = '2025-01-08' WHERE "patient_no" = 'PAT0062';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-20', "art_start_date" = '2025-01-03' WHERE "patient_no" = 'PAT0063';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-15', "art_start_date" = '2024-12-29' WHERE "patient_no" = 'PAT0064';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-10', "art_start_date" = '2024-12-24' WHERE "patient_no" = 'PAT0065';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-05', "art_start_date" = '2024-12-19' WHERE "patient_no" = 'PAT0066';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-30', "art_start_date" = '2024-12-14' WHERE "patient_no" = 'PAT0067';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-25', "art_start_date" = '2024-12-09' WHERE "patient_no" = 'PAT0068';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-20', "art_start_date" = '2024-12-04' WHERE "patient_no" = 'PAT0069';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-15', "art_start_date" = '2024-11-29' WHERE "patient_no" = 'PAT0070';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-10', "art_start_date" = '2024-11-24' WHERE "patient_no" = 'PAT0071';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-05', "art_start_date" = '2024-11-19' WHERE "patient_no" = 'PAT0072';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-30', "art_start_date" = '2024-11-13' WHERE "patient_no" = 'PAT0073';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-25', "art_start_date" = '2024-11-08' WHERE "patient_no" = 'PAT0074';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-20', "art_start_date" = '2024-11-03' WHERE "patient_no" = 'PAT0075';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-15', "art_start_date" = '2024-10-29' WHERE "patient_no" = 'PAT0076';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-10', "art_start_date" = '2024-10-24' WHERE "patient_no" = 'PAT0077';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-05', "art_start_date" = '2024-10-19' WHERE "patient_no" = 'PAT0078';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-09-30', "art_start_date" = '2024-10-14' WHERE "patient_no" = 'PAT0079';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-09-25', "art_start_date" = '2024-10-09' WHERE "patient_no" = 'PAT0080';

-- BUNDIBUGYO HCIV (fid = 5)
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-28', "art_start_date" = '2025-01-11' WHERE "patient_no" = 'PAT0081';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-15', "art_start_date" = '2024-12-29' WHERE "patient_no" = 'PAT0082';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-10', "art_start_date" = '2024-12-24' WHERE "patient_no" = 'PAT0083';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-12-05', "art_start_date" = '2024-12-19' WHERE "patient_no" = 'PAT0084';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-30', "art_start_date" = '2024-12-14' WHERE "patient_no" = 'PAT0085';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-25', "art_start_date" = '2024-12-09' WHERE "patient_no" = 'PAT0086';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-20', "art_start_date" = '2024-12-04' WHERE "patient_no" = 'PAT0087';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-15', "art_start_date" = '2024-11-29' WHERE "patient_no" = 'PAT0088';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-10', "art_start_date" = '2024-11-24' WHERE "patient_no" = 'PAT0089';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-11-05', "art_start_date" = '2024-11-19' WHERE "patient_no" = 'PAT0090';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-30', "art_start_date" = '2024-11-13' WHERE "patient_no" = 'PAT0091';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-25', "art_start_date" = '2024-11-08' WHERE "patient_no" = 'PAT0092';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-20', "art_start_date" = '2024-11-03' WHERE "patient_no" = 'PAT0093';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-15', "art_start_date" = '2024-10-29' WHERE "patient_no" = 'PAT0094';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-10', "art_start_date" = '2024-10-24' WHERE "patient_no" = 'PAT0095';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-10-05', "art_start_date" = '2024-10-19' WHERE "patient_no" = 'PAT0096';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-09-30', "art_start_date" = '2024-10-14' WHERE "patient_no" = 'PAT0097';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-09-25', "art_start_date" = '2024-10-09' WHERE "patient_no" = 'PAT0098';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-09-20', "art_start_date" = '2024-10-04' WHERE "patient_no" = 'PAT0099';
UPDATE "public"."patients" SET "patient_registration_date" = '2024-09-15', "art_start_date" = '2024-09-29' WHERE "patient_no" = 'PAT0100';

-- January 2026 New Registrations
-- KITWE HCIV (fid = 1)
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-11', "art_start_date" = '2026-01-25' WHERE "patient_no" = 'PAT0101';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-10', "art_start_date" = '2026-01-24' WHERE "patient_no" = 'PAT0102';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-09', "art_start_date" = '2026-01-23' WHERE "patient_no" = 'PAT0103';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-08', "art_start_date" = '2026-01-22' WHERE "patient_no" = 'PAT0104';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-07', "art_start_date" = '2026-01-21' WHERE "patient_no" = 'PAT0105';

-- FORT PORTAL RRH (fid = 2)
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-11', "art_start_date" = '2026-01-25' WHERE "patient_no" = 'PAT0106';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-10', "art_start_date" = '2026-01-24' WHERE "patient_no" = 'PAT0107';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-09', "art_start_date" = '2026-01-23' WHERE "patient_no" = 'PAT0108';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-06', "art_start_date" = '2026-01-20' WHERE "patient_no" = 'PAT0109';

-- MUBENDE HCIV (fid = 3)
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-11', "art_start_date" = '2026-01-25' WHERE "patient_no" = 'PAT0110';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-09', "art_start_date" = '2026-01-23' WHERE "patient_no" = 'PAT0111';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-08', "art_start_date" = '2026-01-22' WHERE "patient_no" = 'PAT0112';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-05', "art_start_date" = '2026-01-19' WHERE "patient_no" = 'PAT0113';

-- KASESE DISTRICT HOSPITAL (fid = 4)
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-11', "art_start_date" = '2026-01-25' WHERE "patient_no" = 'PAT0114';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-10', "art_start_date" = '2026-01-24' WHERE "patient_no" = 'PAT0115';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-07', "art_start_date" = '2026-01-21' WHERE "patient_no" = 'PAT0116';

-- BUNDIBUGYO HCIV (fid = 5)
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-10', "art_start_date" = '2026-01-24' WHERE "patient_no" = 'PAT0117';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-08', "art_start_date" = '2026-01-22' WHERE "patient_no" = 'PAT0118';
UPDATE "public"."patients" SET "patient_registration_date" = '2026-01-06', "art_start_date" = '2026-01-20' WHERE "patient_no" = 'PAT0119';
