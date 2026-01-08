# Database Schema - Patients & Appointments

## Overview
The combined data has been split into two normalized tables: `patients` and `appointments`. This follows healthcare database best practices.

---

## PATIENTS TABLE

### Purpose
Stores patient demographic and health information.

### Columns
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | ✓ | Primary key (auto-generated) |
| facility_id | UUID | ✓ | Foreign key to facilities table |
| patient_id | VARCHAR(20) | ✓ | Unique patient identifier (e.g., PAT1001) |
| first_name | VARCHAR(100) | ✓ | Patient's first name |
| last_name | VARCHAR(100) | ✓ | Patient's last name |
| age | INT | | Patient's age in years |
| gender | CHAR(1) | | M (Male) or F (Female) |
| phone_number | VARCHAR(20) | | Contact phone number |
| email | VARCHAR(100) | | Email address |
| primary_condition | VARCHAR(100) | | Main health condition (HIV, Diabetes, etc.) |
| region | VARCHAR(100) | | Geographic region |
| facility | VARCHAR(150) | | Primary facility name |
| facility_id_code | VARCHAR(50) | | Facility identifier code |
| status | VARCHAR(50) | | Patient status (Active, Inactive, At Risk, etc.) |
| registered_date | DATE | | Date patient was registered |
| art_adherence_percent | VARCHAR(10) | | ART adherence % (for HIV patients) |
| viral_load_status | VARCHAR(50) | | VL status (Undetectable, Low, Moderate, etc.) |
| created_at | TIMESTAMP | | Record creation timestamp |
| updated_at | TIMESTAMP | | Record last update timestamp |

### Indexes
- `idx_patients_facility_id` - Fast facility lookups
- `idx_patients_patient_id` - Fast patient lookups
- `idx_patients_status` - Fast status filtering

### Sample Data
80 patient records from Eastern and Central Uganda regions

---

## APPOINTMENTS TABLE

### Purpose
Stores appointment scheduling and history information.

### Columns
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | ✓ | Primary key (auto-generated) |
| facility_id | UUID | ✓ | Foreign key to facilities table |
| patient_id | VARCHAR(20) | ✓ | Foreign key to patients table |
| patient_name | VARCHAR(200) | ✓ | Patient's full name (denormalized for display) |
| last_appointment | DATE | | Date of last appointment |
| appointment_date | DATE | ✓ | Scheduled appointment date |
| appointment_time | VARCHAR(20) | | Appointment time (e.g., 9:00 AM) |
| status | VARCHAR(50) | ✓ | Status: Scheduled, Confirmed, Completed, No-Show, Rescheduled, Cancelled |
| primary_condition | VARCHAR(100) | | Health condition for appointment |
| notes | TEXT | | Additional notes about appointment |
| facility | VARCHAR(150) | | Facility name |
| facility_id_code | VARCHAR(50) | | Facility identifier code |
| created_at | TIMESTAMP | | Record creation timestamp |
| updated_at | TIMESTAMP | | Record last update timestamp |

### Constraints
- Foreign key to `patients(patient_id)`
- Status must be one of: Scheduled, Confirmed, Completed, No-Show, Rescheduled, Cancelled

### Indexes
- `idx_appointments_facility_id` - Fast facility lookups
- `idx_appointments_patient_id` - Fast patient lookups
- `idx_appointments_date` - Fast date range queries
- `idx_appointments_status` - Fast status filtering

### Sample Data
80 appointment records linked to patient records

---

## FACILITIES TABLE (Optional but Recommended)

### Purpose
Master list of healthcare facilities.

### Columns
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | ✓ | Primary key |
| facility_id | VARCHAR(50) | ✓ | Unique facility code (e.g., facility-kampala-001) |
| facility_name | VARCHAR(150) | ✓ | Name of facility |
| region | VARCHAR(100) | | Geographic region |
| created_at | TIMESTAMP | | Record creation timestamp |

---

## Data Relationships

```
Facilities (1) ───────── (Many) Patients
    ↓                        ↓
    └────────────────────────┴─────────── (Many) Appointments
```

- One facility has many patients
- One facility has many appointments
- One patient has many appointments
- Patient ID links patients to appointments

---

## CSV Files for Import

### patients_clean.csv
- **File:** c:/Users/kitwe/Desktop/IHM/patients_clean.csv
- **Records:** 80 patients
- **Columns:** patient_id, first_name, last_name, age, gender, phone_number, email, primary_condition, region, facility, facility_id_code, status, art_adherence_percent, viral_load_status

### appointments_clean.csv
- **File:** c:/Users/kitwe/Desktop/IHM/appointments_clean.csv
- **Records:** 80 appointments (one per patient)
- **Columns:** patient_id, patient_name, last_appointment, appointment_date, appointment_time, status, primary_condition, notes, facility, facility_id_code

---

## Setup Instructions for Supabase

### 1. Create Tables Using SQL
Run the SQL from `create_tables.sql` in your Supabase SQL editor.

### 2. Enable RLS (Row-Level Security)
```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
```

### 3. Import Data
- Use the dashboard import tool
- Select "Patient Records" → Upload `patients_clean.csv`
- Select "Appointment Records" → Upload `appointments_clean.csv`

### 4. Verify Data
```sql
SELECT COUNT(*) FROM patients;     -- Should return 80
SELECT COUNT(*) FROM appointments; -- Should return 80
```

---

## Key Differences from Combined CSV

| Aspect | Before | After |
|--------|--------|-------|
| Tables | 1 combined | 2 normalized |
| Patients table columns | Full row per patient | Only patient-specific data |
| Appointments table columns | Full row per appointment | Only appointment-specific data |
| Data duplication | High (patient info repeated per appointment) | Minimal (linked by patient_id) |
| Query flexibility | Limited | High (can query independently) |
| Maintenance | Difficult (update in multiple places) | Easy (single source of truth) |

---

## Query Examples

### Get all appointments for a specific patient
```sql
SELECT a.*, p.phone_number, p.email 
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
WHERE a.patient_id = 'PAT1001';
```

### Get patients with no upcoming appointments
```sql
SELECT p.* FROM patients p
LEFT JOIN appointments a ON p.patient_id = a.patient_id
WHERE a.id IS NULL;
```

### Count patients by condition
```sql
SELECT primary_condition, COUNT(*) as count
FROM patients
GROUP BY primary_condition
ORDER BY count DESC;
```

### Get pending appointments for today
```sql
SELECT * FROM appointments
WHERE appointment_date = CURRENT_DATE
AND status = 'Scheduled';
```
