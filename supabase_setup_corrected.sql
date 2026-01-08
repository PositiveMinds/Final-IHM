-- ===== COMPLETE SUPABASE SETUP WITH SAMPLE DATA =====
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- This will create tables and automatically insert all sample data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== DROP EXISTING TABLES (if any) =====
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.facilities CASCADE;

-- ===== FACILITIES TABLE =====
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(50) UNIQUE NOT NULL,
  facility_name VARCHAR(150) NOT NULL,
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facilities_facility_id ON public.facilities(facility_id);

-- ===== PATIENTS TABLE =====
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID,
  patient_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INT,
  gender CHAR(1) CHECK (gender IN ('M', 'F', NULL)),
  phone_number VARCHAR(20),
  email VARCHAR(100),
  primary_condition VARCHAR(100),
  region VARCHAR(100),
  facility VARCHAR(150),
  facility_id_code VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active',
  registered_date DATE DEFAULT CURRENT_DATE,
  art_adherence_percent VARCHAR(10),
  viral_load_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_facility FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL
);

CREATE INDEX idx_patients_facility_id ON public.patients(facility_id);
CREATE INDEX idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_primary_condition ON public.patients(primary_condition);

-- ===== APPOINTMENTS TABLE =====
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID,
  patient_id VARCHAR(20) NOT NULL,
  patient_name VARCHAR(200) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR(20),
  last_appointment DATE,
  status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'No-Show', 'Rescheduled', 'Cancelled')),
  primary_condition VARCHAR(100),
  notes TEXT,
  facility VARCHAR(150),
  facility_id_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_facility FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL
);

CREATE INDEX idx_appointments_facility_id ON public.appointments(facility_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- ===== INSERT SAMPLE FACILITIES =====
INSERT INTO public.facilities (facility_id, facility_name, region)
VALUES
  ('facility-kampala-001', 'Kampala Regional Referral Hospital', 'Kampala'),
  ('facility-kampala-002', 'Mulago National Referral Hospital', 'Kampala'),
  ('facility-kampala-003', 'Kampala Central Hospital', 'Kampala'),
  ('facility-kampala-004', 'Kampala Specialized Hospital', 'Kampala'),
  ('facility-kampala-005', 'Kampala Medical Center', 'Kampala'),
  ('facility-kampala-006', 'Kampala Health Center IV', 'Kampala'),
  ('facility-kampala-007', 'Kampala National Hospital', 'Kampala'),
  ('facility-kampala-008', 'Kampala Referral Hospital', 'Kampala'),
  ('facility-fortportal-001', 'Fort Portal Regional Referral Hospital', 'Fort Portal'),
  ('facility-fortportal-002', 'Fort Portal Health Center IV', 'Fort Portal'),
  ('facility-fortportal-003', 'Fort Portal Medical Center', 'Fort Portal'),
  ('facility-fortportal-004', 'Fort Portal District Hospital', 'Fort Portal'),
  ('facility-fortportal-005', 'Fort Portal Referral Hospital', 'Fort Portal'),
  ('facility-mbarara-001', 'Mbarara Regional Referral Hospital', 'Mbarara'),
  ('facility-mbarara-002', 'Mbarara Referral Hospital', 'Mbarara'),
  ('facility-mbarara-003', 'Mbarara Health Center IV', 'Mbarara'),
  ('facility-mbarara-004', 'Mbarara Medical Center', 'Mbarara'),
  ('facility-mbarara-005', 'Mbarara District Hospital', 'Mbarara'),
  ('facility-mbarara-006', 'Mbarara Referral Hospital', 'Mbarara'),
  ('facility-jinja-001', 'Jinja Regional Referral Hospital', 'Jinja'),
  ('facility-jinja-002', 'Jinja Medical Center', 'Jinja'),
  ('facility-jinja-003', 'Jinja District Hospital', 'Jinja'),
  ('facility-jinja-004', 'Jinja Referral Hospital', 'Jinja'),
  ('facility-arua-001', 'Arua Regional Referral Hospital', 'Arua'),
  ('facility-arua-002', 'Arua Health Center III', 'Arua'),
  ('facility-arua-003', 'Arua Referral Hospital', 'Arua'),
  ('facility-arua-004', 'Arua Health Center IV', 'Arua'),
  ('facility-masaka-001', 'Masaka District Hospital', 'Masaka'),
  ('facility-masaka-002', 'Masaka Referral Hospital', 'Masaka'),
  ('facility-masaka-003', 'Masaka Health Center IV', 'Masaka'),
  ('facility-masaka-004', 'Masaka District Hospital', 'Masaka'),
  ('facility-masaka-005', 'Masaka Medical Center', 'Masaka'),
  ('facility-masaka-006', 'Masaka Referral Hospital', 'Masaka'),
  ('facility-soroti-001', 'Soroti Regional Referral Hospital', 'Soroti'),
  ('facility-soroti-002', 'Soroti Health Center IV', 'Soroti'),
  ('facility-soroti-003', 'Soroti Medical Center', 'Soroti'),
  ('facility-soroti-004', 'Soroti District Hospital', 'Soroti');

-- ===== INSERT SAMPLE PATIENTS WITH PROPER FACILITY IDs =====
INSERT INTO public.patients (facility_id, patient_id, first_name, last_name, age, gender, phone_number, email, primary_condition, region, facility, facility_id_code, status, registered_date, art_adherence_percent, viral_load_status)
SELECT 
  f.id as facility_id,
  patient_data.patient_id,
  patient_data.first_name,
  patient_data.last_name,
  patient_data.age,
  patient_data.gender,
  patient_data.phone_number,
  patient_data.email,
  patient_data.primary_condition,
  patient_data.region,
  patient_data.facility,
  patient_data.facility_id_code,
  patient_data.status,
  patient_data.registered_date,
  patient_data.art_adherence_percent,
  patient_data.viral_load_status
FROM (
  SELECT 
    'PAT1001' as patient_id, 'James' as first_name, 'Okoro' as last_name, 42 as age, 'M' as gender, '256712345678' as phone_number, 'james.okoro@email.com' as email, 'HIV' as primary_condition, 'Kampala' as region, 'Kampala Regional Referral Hospital' as facility, 'facility-kampala-001' as facility_id_code, 'Active' as status, '2023-01-15'::DATE as registered_date, '95%' as art_adherence_percent, 'Undetectable' as viral_load_status
  UNION ALL SELECT 'PAT1002', 'Mary', 'Mugisha', 38, 'F', '256787654321', 'mary.mugisha@email.com', 'Diabetes', 'Fort Portal', 'Fort Portal Regional Referral Hospital', 'facility-fortportal-001', 'Active', '2023-02-20'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1003', 'John', 'Okonkwo', 55, 'M', '256701234567', 'john.okonkwo@email.com', 'Hypertension', 'Mbarara', 'Mbarara Regional Referral Hospital', 'facility-mbarara-001', 'Active', '2023-03-10'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1004', 'Grace', 'Kamau', 29, 'F', '256765432109', 'grace.kamau@email.com', 'Maternal Health', 'Jinja', 'Jinja Regional Referral Hospital', 'facility-jinja-001', 'Active', '2023-01-25'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1005', 'Peter', 'Adeyemi', 51, 'M', '256778123456', 'peter.adeyemi@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Regional Referral Hospital', 'facility-arua-001', 'Active', '2023-02-05'::DATE, '87%', 'Low'
  UNION ALL SELECT 'PAT1006', 'Anna', 'Nkosi', 35, 'F', '256702567890', 'anna.nkosi@email.com', 'HIV', 'Masaka', 'Masaka District Hospital', 'facility-masaka-001', 'Active', '2023-03-15'::DATE, '98%', 'Undetectable'
  UNION ALL SELECT 'PAT1007', 'David', 'Mwangi', 47, 'M', '256716789012', 'david.mwangi@email.com', 'Asthma', 'Soroti', 'Soroti Regional Referral Hospital', 'facility-soroti-001', 'Active', '2023-01-30'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1008', 'Sarah', 'Mensah', 33, 'F', '256789345678', 'sarah.mensah@email.com', 'Diabetes', 'Kampala', 'Mulago National Referral Hospital', 'facility-kampala-002', 'Active', '2023-02-14'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1009', 'Michael', 'Kaunda', 58, 'M', '256705432109', 'michael.kaunda@email.com', 'Hypertension', 'Fort Portal', 'Fort Portal Health Center IV', 'facility-fortportal-002', 'Active', '2023-03-05'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1010', 'Rebecca', 'Banda', 41, 'F', '256717890123', 'rebecca.banda@email.com', 'HIV', 'Mbarara', 'Mbarara Referral Hospital', 'facility-mbarara-002', 'Active', '2023-01-20'::DATE, '92%', 'Undetectable'
  UNION ALL SELECT 'PAT1011', 'Henry', 'Kibaki', 60, 'M', '256704567890', 'henry.kibaki@email.com', 'Diabetes', 'Jinja', 'Jinja Medical Center', 'facility-jinja-002', 'Active', '2023-02-28'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1012', 'Linda', 'Nyerere', 36, 'F', '256718234567', 'linda.nyerere@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Health Center III', 'facility-arua-002', 'Active', '2023-03-20'::DATE, '81%', 'Moderate'
  UNION ALL SELECT 'PAT1013', 'Charles', 'Mandela', 52, 'M', '256703456789', 'charles.mandela@email.com', 'HIV', 'Masaka', 'Masaka Referral Hospital', 'facility-masaka-002', 'Active', '2023-01-05'::DATE, '96%', 'Undetectable'
  UNION ALL SELECT 'PAT1014', 'Alice', 'Dlamini', 39, 'F', '256719456789', 'alice.dlamini@email.com', 'Asthma', 'Soroti', 'Soroti Health Center IV', 'facility-soroti-002', 'Active', '2023-02-10'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1015', 'Robert', 'Achieng', 45, 'M', '256706789012', 'robert.achieng@email.com', 'Maternal Health', 'Kampala', 'Kampala Central Hospital', 'facility-kampala-003', 'Active', '2023-03-12'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1016', 'Jane', 'Obi', 31, 'F', '256715678901', 'jane.obi@email.com', 'HIV', 'Fort Portal', 'Fort Portal Medical Center', 'facility-fortportal-003', 'Active', '2023-01-18'::DATE, '89%', 'Low'
  UNION ALL SELECT 'PAT1017', 'Paul', 'Senghor', 56, 'M', '256708901234', 'paul.senghor@email.com', 'Hypertension', 'Mbarara', 'Mbarara Health Center IV', 'facility-mbarara-003', 'Active', '2023-02-22'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1018', 'Elizabeth', 'Kenyatta', 42, 'F', '256716234567', 'elizabeth.kenyatta@email.com', 'Diabetes', 'Jinja', 'Jinja District Hospital', 'facility-jinja-003', 'Active', '2023-03-08'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1019', 'Joseph', 'Habyarimana', 48, 'M', '256707123456', 'joseph.habyarimana@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Referral Hospital', 'facility-arua-003', 'Active', '2023-01-28'::DATE, '94%', 'Undetectable'
  UNION ALL SELECT 'PAT1020', 'Margaret', 'Chiluba', 37, 'F', '256720123456', 'margaret.chiluba@email.com', 'HIV', 'Masaka', 'Masaka Health Center IV', 'facility-masaka-003', 'Active', '2023-02-16'::DATE, '85%', 'Low'
  UNION ALL SELECT 'PAT1021', 'Thomas', 'Kwame', 54, 'M', '256709234567', 'thomas.kwame@email.com', 'Asthma', 'Soroti', 'Soroti Medical Center', 'facility-soroti-003', 'Active', '2023-03-22'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1022', 'Victoria', 'Mensah', 40, 'F', '256721234567', 'victoria.mensah@email.com', 'Diabetes', 'Kampala', 'Kampala Specialized Hospital', 'facility-kampala-004', 'Active', '2023-01-12'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1023', 'William', 'Adepoju', 59, 'M', '256710345678', 'william.adepoju@email.com', 'Hypertension', 'Fort Portal', 'Fort Portal District Hospital', 'facility-fortportal-004', 'Active', '2023-02-18'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1024', 'Diana', 'Akosua', 34, 'F', '256722345678', 'diana.akosua@email.com', 'HIV', 'Mbarara', 'Mbarara Medical Center', 'facility-mbarara-004', 'Active', '2023-03-01'::DATE, '91%', 'Undetectable'
  UNION ALL SELECT 'PAT1025', 'Kenneth', 'Boateng', 49, 'M', '256711456789', 'kenneth.boateng@email.com', 'Maternal Health', 'Jinja', 'Jinja Referral Hospital', 'facility-jinja-004', 'Active', '2023-01-22'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1026', 'Patricia', 'Quartey', 36, 'F', '256723456789', 'patricia.quartey@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Health Center IV', 'facility-arua-004', 'Active', '2023-02-11'::DATE, '88%', 'Undetectable'
  UNION ALL SELECT 'PAT1027', 'George', 'Osei', 53, 'M', '256712567890', 'george.osei@email.com', 'HIV', 'Masaka', 'Masaka District Hospital', 'facility-masaka-004', 'Active', '2023-03-19'::DATE, '83%', 'Moderate'
  UNION ALL SELECT 'PAT1028', 'Helen', 'Ansah', 38, 'F', '256724567890', 'helen.ansah@email.com', 'Diabetes', 'Soroti', 'Soroti District Hospital', 'facility-soroti-004', 'Active', '2023-01-08'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1029', 'Samuel', 'Agyeman', 46, 'M', '256713678901', 'samuel.agyeman@email.com', 'Hypertension', 'Kampala', 'Kampala Medical Center', 'facility-kampala-005', 'Active', '2023-02-24'::DATE, 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1030', 'Caroline', 'Asiedu', 43, 'F', '256725678901', 'caroline.asiedu@email.com', 'HIV', 'Fort Portal', 'Fort Portal Referral Hospital', 'facility-fortportal-005', 'Active', '2023-03-27'::DATE, '97%', 'Undetectable'
) AS patient_data
LEFT JOIN public.facilities f ON f.facility_id = patient_data.facility_id_code;

-- ===== INSERT SAMPLE APPOINTMENTS =====
INSERT INTO public.appointments (facility_id, patient_id, patient_name, appointment_date, appointment_time, status, primary_condition, facility, facility_id_code, notes)
SELECT 
  f.id as facility_id,
  appt_data.patient_id,
  appt_data.patient_name,
  appt_data.appointment_date,
  appt_data.appointment_time,
  appt_data.status,
  appt_data.primary_condition,
  appt_data.facility,
  appt_data.facility_id_code,
  appt_data.notes
FROM (
  SELECT 'PAT1001' as patient_id, 'James Okoro' as patient_name, '2024-01-15'::DATE as appointment_date, '10:00 AM' as appointment_time, 'Scheduled' as status, 'HIV' as primary_condition, 'Kampala Regional Referral Hospital' as facility, 'facility-kampala-001' as facility_id_code, 'Regular check-up' as notes
  UNION ALL SELECT 'PAT1002', 'Mary Mugisha', '2024-01-16'::DATE, '2:00 PM', 'Confirmed', 'Diabetes', 'Fort Portal Regional Referral Hospital', 'facility-fortportal-001', 'Blood glucose monitoring'
  UNION ALL SELECT 'PAT1003', 'John Okonkwo', '2024-01-17'::DATE, '9:30 AM', 'Completed', 'Hypertension', 'Mbarara Regional Referral Hospital', 'facility-mbarara-001', 'Medication review'
  UNION ALL SELECT 'PAT1004', 'Grace Kamau', '2024-01-18'::DATE, '11:00 AM', 'Scheduled', 'Maternal Health', 'Jinja Regional Referral Hospital', 'facility-jinja-001', 'Pregnancy check'
  UNION ALL SELECT 'PAT1005', 'Peter Adeyemi', '2024-01-19'::DATE, '3:00 PM', 'No-Show', 'Mixed (HIV+Diabetes)', 'Arua Regional Referral Hospital', 'facility-arua-001', 'Missed appointment'
  UNION ALL SELECT 'PAT1006', 'Anna Nkosi', '2024-01-20'::DATE, '10:30 AM', 'Scheduled', 'HIV', 'Masaka District Hospital', 'facility-masaka-001', 'Viral load test'
  UNION ALL SELECT 'PAT1007', 'David Mwangi', '2024-01-21'::DATE, '1:00 PM', 'Scheduled', 'Asthma', 'Soroti Regional Referral Hospital', 'facility-soroti-001', 'Respiratory assessment'
  UNION ALL SELECT 'PAT1008', 'Sarah Mensah', '2024-01-22'::DATE, '2:30 PM', 'Confirmed', 'Diabetes', 'Mulago National Referral Hospital', 'facility-kampala-002', 'HbA1c test'
  UNION ALL SELECT 'PAT1009', 'Michael Kaunda', '2024-01-23'::DATE, '9:00 AM', 'Scheduled', 'Hypertension', 'Fort Portal Health Center IV', 'facility-fortportal-002', 'BP monitoring'
  UNION ALL SELECT 'PAT1010', 'Rebecca Banda', '2024-01-24'::DATE, '11:30 AM', 'Completed', 'HIV', 'Mbarara Referral Hospital', 'facility-mbarara-002', 'CD4 count check'
) AS appt_data
LEFT JOIN public.facilities f ON f.facility_id = appt_data.facility_id_code;

-- ===== VERIFY DATA =====
-- Run these queries to verify the data was inserted correctly
-- SELECT COUNT(*) as total_facilities FROM public.facilities;
-- SELECT COUNT(*) as total_patients FROM public.patients;
-- SELECT COUNT(*) as total_appointments FROM public.appointments;
