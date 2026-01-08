-- ===== SUPABASE DATABASE SETUP =====
-- Copy and paste this entire script into Supabase SQL Editor
-- Then run it to create all tables and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== FACILITIES TABLE =====
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(50) UNIQUE NOT NULL,
  facility_name VARCHAR(150) NOT NULL,
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for facility lookups
CREATE INDEX IF NOT EXISTS idx_facilities_facility_id ON public.facilities(facility_id);

-- ===== PATIENTS TABLE =====
CREATE TABLE IF NOT EXISTS public.patients (
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

-- Create indexes for patients table
CREATE INDEX IF NOT EXISTS idx_patients_facility_id ON public.patients(facility_id);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_primary_condition ON public.patients(primary_condition);

-- ===== APPOINTMENTS TABLE =====
CREATE TABLE IF NOT EXISTS public.appointments (
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

-- Create indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_facility_id ON public.appointments(facility_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

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
  ('facility-soroti-011', 'Soroti District Hospital', 'Soroti')
ON CONFLICT (facility_id) DO NOTHING;

-- ===== VERIFY SETUP =====
-- Run these queries to verify everything was created successfully
-- SELECT COUNT(*) as facility_count FROM public.facilities;
-- SELECT COUNT(*) as patients_count FROM public.patients;
-- SELECT COUNT(*) as appointments_count FROM public.appointments;
