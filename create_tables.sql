-- ===== PATIENTS TABLE =====
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
  patient_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  age INT,
  gender CHAR(1) CHECK (gender IN ('M', 'F')),
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for facility_id lookups
CREATE INDEX idx_patients_facility_id ON patients(facility_id);
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_status ON patients(status);

-- ===== APPOINTMENTS TABLE =====
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL,
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
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Create indexes for appointments
CREATE INDEX idx_appointments_facility_id ON appointments(facility_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ===== FACILITIES TABLE (Optional but recommended) =====
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id VARCHAR(50) UNIQUE NOT NULL,
  facility_name VARCHAR(150) NOT NULL,
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for facility_id
ALTER TABLE patients ADD CONSTRAINT fk_patients_facility 
  FOREIGN KEY (facility_id) REFERENCES facilities(id);

ALTER TABLE appointments ADD CONSTRAINT fk_appointments_facility 
  FOREIGN KEY (facility_id) REFERENCES facilities(id);
