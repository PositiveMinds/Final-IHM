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
  ('facility-kampala-009', 'Kampala Health Center IV', 'Kampala'),
  ('facility-kampala-010', 'Kampala Medical Center', 'Kampala'),
  ('facility-kampala-011', 'Kampala Specialized Hospital', 'Kampala'),
  ('facility-kampala-012', 'Kampala National Hospital', 'Kampala'),
  ('facility-fortportal-001', 'Fort Portal Regional Referral Hospital', 'Fort Portal'),
  ('facility-fortportal-002', 'Fort Portal Health Center IV', 'Fort Portal'),
  ('facility-fortportal-003', 'Fort Portal Medical Center', 'Fort Portal'),
  ('facility-fortportal-004', 'Fort Portal District Hospital', 'Fort Portal'),
  ('facility-fortportal-005', 'Fort Portal Referral Hospital', 'Fort Portal'),
  ('facility-fortportal-006', 'Fort Portal Health Center III', 'Fort Portal'),
  ('facility-fortportal-007', 'Fort Portal Medical Center', 'Fort Portal'),
  ('facility-fortportal-008', 'Fort Portal Referral Hospital', 'Fort Portal'),
  ('facility-fortportal-009', 'Fort Portal District Hospital', 'Fort Portal'),
  ('facility-fortportal-010', 'Fort Portal Medical Center', 'Fort Portal'),
  ('facility-fortportal-011', 'Fort Portal Health Center IV', 'Fort Portal'),
  ('facility-fortportal-012', 'Fort Portal Referral Hospital', 'Fort Portal'),
  ('facility-mbarara-001', 'Mbarara Regional Referral Hospital', 'Mbarara'),
  ('facility-mbarara-002', 'Mbarara Referral Hospital', 'Mbarara'),
  ('facility-mbarara-003', 'Mbarara Health Center IV', 'Mbarara'),
  ('facility-mbarara-004', 'Mbarara Medical Center', 'Mbarara'),
  ('facility-mbarara-005', 'Mbarara District Hospital', 'Mbarara'),
  ('facility-mbarara-006', 'Mbarara Referral Hospital', 'Mbarara'),
  ('facility-mbarara-007', 'Mbarara Health Center III', 'Mbarara'),
  ('facility-mbarara-008', 'Mbarara Referral Hospital', 'Mbarara'),
  ('facility-mbarara-009', 'Mbarara Medical Center', 'Mbarara'),
  ('facility-mbarara-010', 'Mbarara Health Center IV', 'Mbarara'),
  ('facility-mbarara-011', 'Mbarara District Hospital', 'Mbarara'),
  ('facility-mbarara-012', 'Mbarara Referral Hospital', 'Mbarara'),
  ('facility-jinja-001', 'Jinja Regional Referral Hospital', 'Jinja'),
  ('facility-jinja-002', 'Jinja Medical Center', 'Jinja'),
  ('facility-jinja-003', 'Jinja District Hospital', 'Jinja'),
  ('facility-jinja-004', 'Jinja Referral Hospital', 'Jinja'),
  ('facility-jinja-005', 'Jinja Health Center IV', 'Jinja'),
  ('facility-jinja-006', 'Jinja Medical Center', 'Jinja'),
  ('facility-jinja-007', 'Jinja District Hospital', 'Jinja'),
  ('facility-jinja-008', 'Jinja Referral Hospital', 'Jinja'),
  ('facility-jinja-009', 'Jinja Health Center IV', 'Jinja'),
  ('facility-jinja-010', 'Jinja Medical Center', 'Jinja'),
  ('facility-jinja-011', 'Jinja District Hospital', 'Jinja'),
  ('facility-arua-001', 'Arua Regional Referral Hospital', 'Arua'),
  ('facility-arua-002', 'Arua Health Center III', 'Arua'),
  ('facility-arua-003', 'Arua Referral Hospital', 'Arua'),
  ('facility-arua-004', 'Arua Health Center IV', 'Arua'),
  ('facility-arua-005', 'Arua Medical Center', 'Arua'),
  ('facility-arua-006', 'Arua District Hospital', 'Arua'),
  ('facility-arua-007', 'Arua Referral Hospital', 'Arua'),
  ('facility-arua-008', 'Arua Medical Center', 'Arua'),
  ('facility-arua-009', 'Arua Referral Hospital', 'Arua'),
  ('facility-arua-010', 'Arua Health Center III', 'Arua'),
  ('facility-arua-011', 'Arua Medical Center', 'Arua'),
  ('facility-masaka-001', 'Masaka District Hospital', 'Masaka'),
  ('facility-masaka-002', 'Masaka Referral Hospital', 'Masaka'),
  ('facility-masaka-003', 'Masaka Health Center IV', 'Masaka'),
  ('facility-masaka-004', 'Masaka District Hospital', 'Masaka'),
  ('facility-masaka-005', 'Masaka Medical Center', 'Masaka'),
  ('facility-masaka-006', 'Masaka Referral Hospital', 'Masaka'),
  ('facility-masaka-007', 'Masaka Health Center III', 'Masaka'),
  ('facility-masaka-008', 'Masaka Referral Hospital', 'Masaka'),
  ('facility-masaka-009', 'Masaka District Hospital', 'Masaka'),
  ('facility-masaka-010', 'Masaka Referral Hospital', 'Masaka'),
  ('facility-masaka-011', 'Masaka Health Center IV', 'Masaka'),
  ('facility-soroti-001', 'Soroti Regional Referral Hospital', 'Soroti'),
  ('facility-soroti-002', 'Soroti Health Center IV', 'Soroti'),
  ('facility-soroti-003', 'Soroti Medical Center', 'Soroti'),
  ('facility-soroti-004', 'Soroti District Hospital', 'Soroti'),
  ('facility-soroti-005', 'Soroti Health Center III', 'Soroti'),
  ('facility-soroti-006', 'Soroti Referral Hospital', 'Soroti'),
  ('facility-soroti-007', 'Soroti Medical Center', 'Soroti'),
  ('facility-soroti-008', 'Soroti Health Center IV', 'Soroti'),
  ('facility-soroti-009', 'Soroti Referral Hospital', 'Soroti'),
  ('facility-soroti-010', 'Soroti Medical Center', 'Soroti'),
  ('facility-soroti-011', 'Soroti District Hospital', 'Soroti');

-- ===== INSERT SAMPLE PATIENTS (80 records) =====
WITH patient_data AS (
  SELECT 
    'PAT1001' as patient_id, 'James' as first_name, 'Okoro' as last_name, 42 as age, 'M' as gender, '256712345678' as phone_number, 'james.okoro@email.com' as email, 'HIV' as primary_condition, 'Kampala' as region, 'Kampala Regional Referral Hospital' as facility, 'facility-kampala-001' as facility_id_code, 'Active' as status, '95%' as art_adherence_percent, 'Undetectable' as viral_load_status
  UNION ALL SELECT 'PAT1002', 'Mary', 'Mugisha', 38, 'F', '256787654321', 'mary.mugisha@email.com', 'Diabetes', 'Fort Portal', 'Fort Portal Regional Referral Hospital', 'facility-fortportal-001', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1003', 'John', 'Okonkwo', 55, 'M', '256701234567', 'john.okonkwo@email.com', 'Hypertension', 'Mbarara', 'Mbarara Regional Referral Hospital', 'facility-mbarara-001', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1004', 'Grace', 'Kamau', 29, 'F', '256765432109', 'grace.kamau@email.com', 'Maternal Health', 'Jinja', 'Jinja Regional Referral Hospital', 'facility-jinja-001', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1005', 'Peter', 'Adeyemi', 51, 'M', '256778123456', 'peter.adeyemi@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Regional Referral Hospital', 'facility-arua-001', 'Active', '87%', 'Low'
  UNION ALL SELECT 'PAT1006', 'Anna', 'Nkosi', 35, 'F', '256702567890', 'anna.nkosi@email.com', 'HIV', 'Masaka', 'Masaka District Hospital', 'facility-masaka-001', 'Active', '98%', 'Undetectable'
  UNION ALL SELECT 'PAT1007', 'David', 'Mwangi', 47, 'M', '256716789012', 'david.mwangi@email.com', 'Asthma', 'Soroti', 'Soroti Regional Referral Hospital', 'facility-soroti-001', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1008', 'Sarah', 'Mensah', 33, 'F', '256789345678', 'sarah.mensah@email.com', 'Diabetes', 'Kampala', 'Mulago National Referral Hospital', 'facility-kampala-002', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1009', 'Michael', 'Kaunda', 58, 'M', '256705432109', 'michael.kaunda@email.com', 'Hypertension', 'Fort Portal', 'Fort Portal Health Center IV', 'facility-fortportal-002', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1010', 'Rebecca', 'Banda', 41, 'F', '256717890123', 'rebecca.banda@email.com', 'HIV', 'Mbarara', 'Mbarara Referral Hospital', 'facility-mbarara-002', 'Active', '92%', 'Undetectable'
  UNION ALL SELECT 'PAT1011', 'Henry', 'Kibaki', 60, 'M', '256704567890', 'henry.kibaki@email.com', 'Diabetes', 'Jinja', 'Jinja Medical Center', 'facility-jinja-002', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1012', 'Linda', 'Nyerere', 36, 'F', '256718234567', 'linda.nyerere@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Health Center III', 'facility-arua-002', 'Active', '81%', 'Moderate'
  UNION ALL SELECT 'PAT1013', 'Charles', 'Mandela', 52, 'M', '256703456789', 'charles.mandela@email.com', 'HIV', 'Masaka', 'Masaka Referral Hospital', 'facility-masaka-002', 'Active', '96%', 'Undetectable'
  UNION ALL SELECT 'PAT1014', 'Alice', 'Dlamini', 39, 'F', '256719456789', 'alice.dlamini@email.com', 'Asthma', 'Soroti', 'Soroti Health Center IV', 'facility-soroti-002', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1015', 'Robert', 'Achieng', 45, 'M', '256706789012', 'robert.achieng@email.com', 'Maternal Health', 'Kampala', 'Kampala Central Hospital', 'facility-kampala-003', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1016', 'Jane', 'Obi', 31, 'F', '256715678901', 'jane.obi@email.com', 'HIV', 'Fort Portal', 'Fort Portal Medical Center', 'facility-fortportal-003', 'Active', '89%', 'Low'
  UNION ALL SELECT 'PAT1017', 'Paul', 'Senghor', 56, 'M', '256708901234', 'paul.senghor@email.com', 'Hypertension', 'Mbarara', 'Mbarara Health Center IV', 'facility-mbarara-003', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1018', 'Elizabeth', 'Kenyatta', 42, 'F', '256716234567', 'elizabeth.kenyatta@email.com', 'Diabetes', 'Jinja', 'Jinja District Hospital', 'facility-jinja-003', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1019', 'Joseph', 'Habyarimana', 48, 'M', '256707123456', 'joseph.habyarimana@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Referral Hospital', 'facility-arua-003', 'Active', '94%', 'Undetectable'
  UNION ALL SELECT 'PAT1020', 'Margaret', 'Chiluba', 37, 'F', '256720123456', 'margaret.chiluba@email.com', 'HIV', 'Masaka', 'Masaka Health Center IV', 'facility-masaka-003', 'Active', '85%', 'Low'
  UNION ALL SELECT 'PAT1021', 'Thomas', 'Kwame', 54, 'M', '256709234567', 'thomas.kwame@email.com', 'Asthma', 'Soroti', 'Soroti Medical Center', 'facility-soroti-003', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1022', 'Victoria', 'Mensah', 40, 'F', '256721234567', 'victoria.mensah@email.com', 'Diabetes', 'Kampala', 'Kampala Specialized Hospital', 'facility-kampala-004', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1023', 'William', 'Adepoju', 59, 'M', '256710345678', 'william.adepoju@email.com', 'Hypertension', 'Fort Portal', 'Fort Portal District Hospital', 'facility-fortportal-004', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1024', 'Diana', 'Akosua', 34, 'F', '256722345678', 'diana.akosua@email.com', 'HIV', 'Mbarara', 'Mbarara Medical Center', 'facility-mbarara-004', 'Active', '91%', 'Undetectable'
  UNION ALL SELECT 'PAT1025', 'Kenneth', 'Boateng', 49, 'M', '256711456789', 'kenneth.boateng@email.com', 'Maternal Health', 'Jinja', 'Jinja Referral Hospital', 'facility-jinja-004', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1026', 'Patricia', 'Quartey', 36, 'F', '256723456789', 'patricia.quartey@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Health Center IV', 'facility-arua-004', 'Active', '88%', 'Undetectable'
  UNION ALL SELECT 'PAT1027', 'George', 'Osei', 53, 'M', '256712567890', 'george.osei@email.com', 'HIV', 'Masaka', 'Masaka District Hospital', 'facility-masaka-004', 'Active', '83%', 'Moderate'
  UNION ALL SELECT 'PAT1028', 'Helen', 'Ansah', 38, 'F', '256724567890', 'helen.ansah@email.com', 'Diabetes', 'Soroti', 'Soroti District Hospital', 'facility-soroti-004', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1029', 'Samuel', 'Agyeman', 46, 'M', '256713678901', 'samuel.agyeman@email.com', 'Hypertension', 'Kampala', 'Kampala Medical Center', 'facility-kampala-005', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1030', 'Caroline', 'Asiedu', 43, 'F', '256725678901', 'caroline.asiedu@email.com', 'HIV', 'Fort Portal', 'Fort Portal Referral Hospital', 'facility-fortportal-005', 'Active', '97%', 'Undetectable'
  UNION ALL SELECT 'PAT1031', 'Richard', 'Boakye', 57, 'M', '256714789012', 'richard.boakye@email.com', 'Asthma', 'Mbarara', 'Mbarara District Hospital', 'facility-mbarara-005', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1032', 'Sylvia', 'Yeboah', 35, 'F', '256726789012', 'sylvia.yeboah@email.com', 'Maternal Health', 'Jinja', 'Jinja Health Center IV', 'facility-jinja-005', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1033', 'Anthony', 'Anane', 50, 'M', '256715890123', 'anthony.anane@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Medical Center', 'facility-arua-005', 'Active', '86%', 'Low'
  UNION ALL SELECT 'PAT1034', 'Beatrice', 'Mensah', 32, 'F', '256727890123', 'beatrice.mensah@email.com', 'HIV', 'Masaka', 'Masaka Medical Center', 'facility-masaka-005', 'Active', '90%', 'Undetectable'
  UNION ALL SELECT 'PAT1035', 'Christopher', 'Owusu', 55, 'M', '256716901234', 'christopher.owusu@email.com', 'Diabetes', 'Soroti', 'Soroti Health Center III', 'facility-soroti-005', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1036', 'Judith', 'Afara', 44, 'F', '256728901234', 'judith.afara@email.com', 'Hypertension', 'Kampala', 'Kampala Health Center IV', 'facility-kampala-006', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1037', 'Daniel', 'Sarpong', 48, 'M', '256717012345', 'daniel.sarpong@email.com', 'HIV', 'Fort Portal', 'Fort Portal Health Center III', 'facility-fortportal-006', 'Active', '84%', 'Moderate'
  UNION ALL SELECT 'PAT1038', 'Evelyn', 'Arhin', 37, 'F', '256729012345', 'evelyn.arhin@email.com', 'Mixed (HIV+Diabetes)', 'Mbarara', 'Mbarara Referral Hospital', 'facility-mbarara-006', 'Active', '93%', 'Undetectable'
  UNION ALL SELECT 'PAT1039', 'Edward', 'Sowa', 61, 'M', '256718123456', 'edward.sowa@email.com', 'Asthma', 'Jinja', 'Jinja Medical Center', 'facility-jinja-006', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1040', 'Frances', 'Nyarko', 33, 'F', '256730123456', 'frances.nyarko@email.com', 'Maternal Health', 'Arua', 'Arua District Hospital', 'facility-arua-006', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1041', 'Gregory', 'Nti', 52, 'M', '256719234567', 'gregory.nti@email.com', 'HIV', 'Masaka', 'Masaka Referral Hospital', 'facility-masaka-006', 'Active', '99%', 'Undetectable'
  UNION ALL SELECT 'PAT1042', 'Harriet', 'Adarkwa', 40, 'F', '256731234567', 'harriet.adarkwa@email.com', 'Diabetes', 'Soroti', 'Soroti Referral Hospital', 'facility-soroti-006', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1043', 'Isaac', 'Armah', 56, 'M', '256720345678', 'isaac.armah@email.com', 'Hypertension', 'Kampala', 'Kampala National Hospital', 'facility-kampala-007', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1044', 'Iris', 'Boateng', 31, 'F', '256732345678', 'iris.boateng@email.com', 'Mixed (HIV+Diabetes)', 'Fort Portal', 'Fort Portal Medical Center', 'facility-fortportal-007', 'Active', '80%', 'Low'
  UNION ALL SELECT 'PAT1045', 'Jabari', 'Mensah', 47, 'M', '256721456789', 'jabari.mensah@email.com', 'HIV', 'Mbarara', 'Mbarara Health Center III', 'facility-mbarara-007', 'Active', '82%', 'Moderate'
  UNION ALL SELECT 'PAT1046', 'Kayley', 'Quartey', 39, 'F', '256733456789', 'kayley.quartey@email.com', 'Asthma', 'Jinja', 'Jinja District Hospital', 'facility-jinja-007', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1047', 'Leroy', 'Boakye', 54, 'M', '256722567890', 'leroy.boakye@email.com', 'Maternal Health', 'Arua', 'Arua Referral Hospital', 'facility-arua-007', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1048', 'Miriam', 'Asiedu', 36, 'F', '256734567890', 'miriam.asiedu@email.com', 'HIV', 'Masaka', 'Masaka Health Center III', 'facility-masaka-007', 'Active', '88%', 'Undetectable'
  UNION ALL SELECT 'PAT1049', 'Nathan', 'Anane', 59, 'M', '256723678901', 'nathan.anane@email.com', 'Diabetes', 'Soroti', 'Soroti Medical Center', 'facility-soroti-007', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1050', 'Olivia', 'Yeboah', 42, 'F', '256735678901', 'olivia.yeboah@email.com', 'Mixed (HIV+Diabetes)', 'Kampala', 'Kampala Referral Hospital', 'facility-kampala-008', 'Active', '96%', 'Undetectable'
  UNION ALL SELECT 'PAT1051', 'Steven', 'Ackah', 44, 'M', '256736789012', 'steven.ackah@email.com', 'HIV', 'Fort Portal', 'Fort Portal Referral Hospital', 'facility-fortportal-008', 'Active', '91%', 'Undetectable'
  UNION ALL SELECT 'PAT1052', 'Theresa', 'Addai', 38, 'F', '256724789012', 'theresa.addai@email.com', 'Hypertension', 'Mbarara', 'Mbarara Referral Hospital', 'facility-mbarara-008', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1053', 'Uriel', 'Agbo', 58, 'M', '256737890123', 'uriel.agbo@email.com', 'Diabetes', 'Jinja', 'Jinja Referral Hospital', 'facility-jinja-008', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1054', 'Yvonne', 'Akyeampong', 35, 'F', '256725890123', 'yvonne.akyeampong@email.com', 'Mixed (HIV+Diabetes)', 'Arua', 'Arua Medical Center', 'facility-arua-008', 'Active', '87%', 'Undetectable'
  UNION ALL SELECT 'PAT1055', 'Zachary', 'Amartey', 51, 'M', '256738901234', 'zachary.amartey@email.com', 'HIV', 'Masaka', 'Masaka Referral Hospital', 'facility-masaka-008', 'Active', '94%', 'Undetectable'
  UNION ALL SELECT 'PAT1056', 'Abigail', 'Ansah', 41, 'F', '256726901234', 'abigail.ansah@email.com', 'Asthma', 'Soroti', 'Soroti Health Center IV', 'facility-soroti-008', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1057', 'Benjamin', 'Asmah', 46, 'M', '256739012345', 'benjamin.asmah@email.com', 'Maternal Health', 'Kampala', 'Kampala Health Center IV', 'facility-kampala-009', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1058', 'Charlotte', 'Asuah', 37, 'F', '256727012345', 'charlotte.asuah@email.com', 'HIV', 'Fort Portal', 'Fort Portal District Hospital', 'facility-fortportal-009', 'Active', '85%', 'Low'
  UNION ALL SELECT 'PAT1059', 'Douglas', 'Asiamah', 53, 'M', '256740123456', 'douglas.asiamah@email.com', 'Hypertension', 'Mbarara', 'Mbarara Medical Center', 'facility-mbarara-009', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1060', 'Emma', 'Asiedu', 29, 'F', '256728123456', 'emma.asiedu@email.com', 'Mixed (HIV+Diabetes)', 'Jinja', 'Jinja Health Center IV', 'facility-jinja-009', 'Active', '90%', 'Undetectable'
  UNION ALL SELECT 'PAT1061', 'Felix', 'Atieno', 55, 'M', '256741234567', 'felix.atieno@email.com', 'Diabetes', 'Arua', 'Arua Referral Hospital', 'facility-arua-009', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1062', 'Gloria', 'Attakora', 43, 'F', '256729234567', 'gloria.attakora@email.com', 'HIV', 'Masaka', 'Masaka District Hospital', 'facility-masaka-009', 'Active', '89%', 'Undetectable'
  UNION ALL SELECT 'PAT1063', 'Harold', 'Ava', 49, 'M', '256742345678', 'harold.ava@email.com', 'Asthma', 'Soroti', 'Soroti Referral Hospital', 'facility-soroti-009', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1064', 'Iris', 'Awuah', 32, 'F', '256730345678', 'iris.awuah@email.com', 'Maternal Health', 'Kampala', 'Kampala Medical Center', 'facility-kampala-010', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1065', 'Jerome', 'Ayensu', 57, 'M', '256743456789', 'jerome.ayensu@email.com', 'Mixed (HIV+Diabetes)', 'Fort Portal', 'Fort Portal Medical Center', 'facility-fortportal-010', 'Active', '92%', 'Undetectable'
  UNION ALL SELECT 'PAT1066', 'Karen', 'Ayesha', 40, 'F', '256731456789', 'karen.ayesha@email.com', 'HIV', 'Mbarara', 'Mbarara Health Center IV', 'facility-mbarara-010', 'Active', '88%', 'Undetectable'
  UNION ALL SELECT 'PAT1067', 'Leonard', 'Baah', 52, 'M', '256744567890', 'leonard.baah@email.com', 'Hypertension', 'Jinja', 'Jinja Medical Center', 'facility-jinja-010', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1068', 'Lydia', 'Baiden', 36, 'F', '256732567890', 'lydia.baiden@email.com', 'Diabetes', 'Arua', 'Arua Health Center III', 'facility-arua-010', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1069', 'Marcus', 'Bailey', 48, 'M', '256745678901', 'marcus.bailey@email.com', 'Mixed (HIV+Diabetes)', 'Masaka', 'Masaka Referral Hospital', 'facility-masaka-010', 'Active', '86%', 'Moderate'
  UNION ALL SELECT 'PAT1070', 'Naomi', 'Baird', 34, 'F', '256733678901', 'naomi.baird@email.com', 'HIV', 'Soroti', 'Soroti Medical Center', 'facility-soroti-010', 'Active', '87%', 'Undetectable'
  UNION ALL SELECT 'PAT1071', 'Obadiah', 'Baker', 61, 'M', '256746789012', 'obadiah.baker@email.com', 'Asthma', 'Kampala', 'Kampala Specialized Hospital', 'facility-kampala-011', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1072', 'Ophelia', 'Baldwin', 39, 'F', '256734789012', 'ophelia.baldwin@email.com', 'Maternal Health', 'Fort Portal', 'Fort Portal Health Center IV', 'facility-fortportal-011', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1073', 'Percival', 'Banda', 50, 'M', '256747890123', 'percival.banda@email.com', 'HIV', 'Mbarara', 'Mbarara District Hospital', 'facility-mbarara-011', 'Active', '83%', 'Low'
  UNION ALL SELECT 'PAT1074', 'Priscilla', 'Banks', 44, 'F', '256735890123', 'priscilla.banks@email.com', 'Mixed (HIV+Diabetes)', 'Jinja', 'Jinja District Hospital', 'facility-jinja-011', 'Active', '91%', 'Undetectable'
  UNION ALL SELECT 'PAT1075', 'Quincy', 'Bannerman', 56, 'M', '256748901234', 'quincy.bannerman@email.com', 'Hypertension', 'Arua', 'Arua Medical Center', 'facility-arua-011', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1076', 'Rachel', 'Barrera', 31, 'F', '256736901234', 'rachel.barrera@email.com', 'HIV', 'Masaka', 'Masaka Health Center IV', 'facility-masaka-011', 'Active', '95%', 'Undetectable'
  UNION ALL SELECT 'PAT1077', 'Raymond', 'Barros', 47, 'M', '256749012345', 'raymond.barros@email.com', 'Diabetes', 'Soroti', 'Soroti District Hospital', 'facility-soroti-011', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1078', 'Rita', 'Barry', 38, 'F', '256737012345', 'rita.barry@email.com', 'Mixed (HIV+Diabetes)', 'Kampala', 'Kampala National Hospital', 'facility-kampala-012', 'Active', '84%', 'Moderate'
  UNION ALL SELECT 'PAT1079', 'Ronald', 'Barton', 54, 'M', '256750123456', 'ronald.barton@email.com', 'Asthma', 'Fort Portal', 'Fort Portal Referral Hospital', 'facility-fortportal-012', 'Active', 'N/A', 'N/A'
  UNION ALL SELECT 'PAT1080', 'Rosalind', 'Basile', 43, 'F', '256738123456', 'rosalind.basile@email.com', 'HIV', 'Mbarara', 'Mbarara Referral Hospital', 'facility-mbarara-012', 'Active', '89%', 'Undetectable'
)
INSERT INTO public.patients (facility_id, patient_id, first_name, last_name, age, gender, phone_number, email, primary_condition, region, facility, facility_id_code, status, art_adherence_percent, viral_load_status)
SELECT f.id, pd.patient_id, pd.first_name, pd.last_name, pd.age, pd.gender, pd.phone_number, pd.email, pd.primary_condition, pd.region, pd.facility, pd.facility_id_code, pd.status, pd.art_adherence_percent, pd.viral_load_status
FROM patient_data pd
JOIN public.facilities f ON f.facility_id = pd.facility_id_code
ON CONFLICT (patient_id) DO NOTHING;

-- ===== VERIFICATION QUERIES =====
-- Run these to verify the data was imported successfully

SELECT 'Facilities' as table_name, COUNT(*) as record_count FROM public.facilities
UNION ALL
SELECT 'Patients', COUNT(*) FROM public.patients
UNION ALL
SELECT 'Appointments', COUNT(*) FROM public.appointments;
