-- ============================================================================
-- SAMPLE DATA FOR KITWE HCIV
-- Facility: Kitwe HCIV with one Administrator user and 100 patients with appointments
-- ============================================================================

-- ============================================================================
-- STEP 0: DROP APPOINTMENT DATE CHECK CONSTRAINT (to allow past dates)
-- ============================================================================

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS ck_appointments_valid_date;

-- ============================================================================
-- STEP 0B: ADD VIRAL LOAD COLUMNS TO APPOINTMENTS TABLE
-- ============================================================================

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS viral_load_copies INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS viral_load_status VARCHAR(50);

-- ============================================================================
-- STEP 1: INSERT FACILITY DATA
-- ============================================================================

INSERT INTO facilities (facility_id, facility_name, region)
VALUES ('FAC001', 'Kitwe HCIV', 'Western Uganda')
ON CONFLICT (facility_id) DO NOTHING;

-- Get the fid for use in subsequent inserts
-- Note: In PostgreSQL, you may need to capture the inserted fid

-- ============================================================================
-- STEP 2: INSERT USER DATA (Administrator)
-- ============================================================================

INSERT INTO users (email, username, fullname, user_role, is_active, facility_id, fid, password)
SELECT 
  'bwoyecharles1@gmail.com',
  'bwoye_charles',
  'Bwoye Charles',
  'Administrator',
  true,
  'FAC001',
  f.fid,
  crypt('Ilove*rein8899', gen_salt('bf'))
FROM facilities f
WHERE f.facility_id = 'FAC001'
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- STEP 3: INSERT SAMPLE PATIENTS DATA (100 records)
-- ============================================================================

INSERT INTO patients (
  patient_id, first_name, last_name, age, gender, email, phone_number, 
  status, registered_date, fid
)
SELECT 
  'PAT' || LPAD(i::text, 4, '0'),
  -- Mix of Western and Ugandan first names
  CASE (i % 20)
    WHEN 0 THEN 'John'
    WHEN 1 THEN 'Mary'
    WHEN 2 THEN 'Peter'
    WHEN 3 THEN 'Grace'
    WHEN 4 THEN 'Simon'
    WHEN 5 THEN 'David'
    WHEN 6 THEN 'Sarah'
    WHEN 7 THEN 'Rachel'
    WHEN 8 THEN 'Joseph'
    WHEN 9 THEN 'Daniel'
    WHEN 10 THEN 'Samuel'
    WHEN 11 THEN 'Rebecca'
    WHEN 12 THEN 'Andrew'
    WHEN 13 THEN 'Hannah'
    WHEN 14 THEN 'Michael'
    WHEN 15 THEN 'Elizabeth'
    WHEN 16 THEN 'James'
    WHEN 17 THEN 'Jennifer'
    WHEN 18 THEN 'Joshua'
    ELSE 'Deborah'
  END,
  -- Mix of Ugandan surnames from different regions
  CASE (i % 24)
    -- Central Uganda (Baganda)
    WHEN 0 THEN 'Ssekayiga'
    WHEN 1 THEN 'Nakabugo'
    WHEN 2 THEN 'Kyeyune'
    WHEN 3 THEN 'Ssemanda'
    WHEN 4 THEN 'Nanteza'
    WHEN 5 THEN 'Lubwama'
    -- Western Uganda (Ankole, Kigezi)
    WHEN 6 THEN 'Katushabe'
    WHEN 7 THEN 'Byaruhanga'
    WHEN 8 THEN 'Kasaija'
    WHEN 9 THEN 'Byabato'
    WHEN 10 THEN 'Ssempebwa'
    WHEN 11 THEN 'Kiwanuka'
    -- Northern Uganda (Acholi, Lango)
    WHEN 12 THEN 'Okello'
    WHEN 13 THEN 'Opio'
    WHEN 14 THEN 'Adongo'
    WHEN 15 THEN 'Ekol'
    WHEN 16 THEN 'Odongo'
    WHEN 17 THEN 'Akello'
    -- Eastern Uganda (Bagisu, Busoga, Teso)
    WHEN 18 THEN 'Mudoola'
    WHEN 19 THEN 'Mutua'
    WHEN 20 THEN 'Musyoka'
    WHEN 21 THEN 'Mayanja'
    WHEN 22 THEN 'Matovu'
    ELSE 'Ongwae'
  END,
  25 + (i % 40),
  CASE (i % 2) WHEN 0 THEN 'M' ELSE 'F' END,
  'patient' || i || '@example.com',
  '+256' || (700000000 + i)::text,
  CASE (i % 3)
    WHEN 0 THEN 'Active'
    WHEN 1 THEN 'Inactive'
    ELSE 'Transferred'
  END,
  CURRENT_DATE - (365 + (i % 365))::integer,
  f.fid
FROM generate_series(1, 100) AS t(i)
CROSS JOIN facilities f
WHERE f.facility_id = 'FAC001'
ON CONFLICT (patient_id) DO NOTHING;

-- ============================================================================
-- STEP 4: INSERT SAMPLE APPOINTMENTS DATA (Historical - to populate last_appointment)
-- ============================================================================

INSERT INTO appointments (
  patient_id, patient_name, appointment_date, appointment_time, 
  status, primary_condition, notes, viral_load_copies, viral_load_status, pid
)
SELECT 
  p.patient_id,
  p.first_name || ' ' || p.last_name,
  CURRENT_DATE - (30 + ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 30))::integer,
  '08:00',
  'Completed',
  CASE ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 6)
    WHEN 0 THEN 'HIV Infection'
    WHEN 1 THEN 'Diabetes'
    WHEN 2 THEN 'Hypertension'
    WHEN 3 THEN 'Tuberculosis'
    WHEN 4 THEN 'Malaria'
    ELSE 'HIV Co-infection'
  END,
  'Patient visit for regular checkup and medication review',
  CASE ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 5)
    WHEN 0 THEN 0
    WHEN 1 THEN 500 + (p.pid % 5000)
    WHEN 2 THEN 10000 + (p.pid % 100000)
    WHEN 3 THEN 100000 + (p.pid % 1000000)
    ELSE 1000000 + (p.pid % 10000000)
  END,
  CASE ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 3)
    WHEN 0 THEN 'Detected'
    ELSE 'Not Detected'
  END,
  p.pid
FROM patients p
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4B: INSERT FUTURE APPOINTMENTS DATA (Scheduled after last_appointment)
-- ============================================================================

INSERT INTO appointments (
  patient_id, patient_name, appointment_date, appointment_time, 
  status, primary_condition, notes, viral_load_copies, viral_load_status, pid
)
SELECT 
  p.patient_id,
  p.first_name || ' ' || p.last_name,
  CURRENT_DATE + ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 30)::integer,
  '10:00',
  'Scheduled',
  CASE ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 6)
    WHEN 0 THEN 'HIV Infection'
    WHEN 1 THEN 'Diabetes'
    WHEN 2 THEN 'Hypertension'
    WHEN 3 THEN 'Tuberculosis'
    WHEN 4 THEN 'Malaria'
    ELSE 'HIV Co-infection'
  END,
  'Scheduled appointment for follow-up',
  CASE ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 5)
    WHEN 0 THEN 0
    WHEN 1 THEN 500 + (p.pid % 5000)
    WHEN 2 THEN 10000 + (p.pid % 100000)
    WHEN 3 THEN 100000 + (p.pid % 1000000)
    ELSE 1000000 + (p.pid % 10000000)
  END,
  CASE ((ROW_NUMBER() OVER (ORDER BY p.pid)) % 3)
    WHEN 0 THEN 'Detected'
    ELSE 'Not Detected'
  END,
  p.pid
FROM patients p
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: POPULATE LAST_APPOINTMENT IN APPOINTMENTS TABLE
-- ============================================================================

UPDATE appointments a
SET last_appointment = a.appointment_date
WHERE a.appointment_date IS NOT NULL;

-- ============================================================================
-- STEP 5B: POPULATE VIRAL LOAD DATA IN APPOINTMENTS TABLE
-- ============================================================================

UPDATE appointments a
SET 
  viral_load_copies = CASE (a.aid % 5)
    WHEN 0 THEN 0
    WHEN 1 THEN 500 + (a.aid % 5000)
    WHEN 2 THEN 10000 + (a.aid % 100000)
    WHEN 3 THEN 100000 + (a.aid % 1000000)
    ELSE 1000000 + (a.aid % 10000000)
  END,
  viral_load_status = CASE (a.aid % 3)
    WHEN 0 THEN 'Detected'
    ELSE 'Not Detected'
  END
WHERE viral_load_copies IS NULL OR viral_load_status IS NULL;

-- ============================================================================
-- STEP 6: VERIFY DATA INSERTION
-- ============================================================================

-- Run these queries to verify the data:
-- SELECT COUNT(*) as facility_count FROM facilities;
-- SELECT COUNT(*) as user_count FROM users;
-- SELECT COUNT(*) as patient_count FROM patients;
-- SELECT COUNT(*) as appointment_count FROM appointments;
-- SELECT COUNT(*) as patients_with_last_appointment FROM patients WHERE last_appointment IS NOT NULL;

-- ============================================================================
-- END OF SAMPLE DATA SCRIPT
-- ============================================================================
