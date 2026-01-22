# Patients Table Complete Schema

## Database Table Structure

Based on the sample data and migrations, the `patients` table contains the following fields:

### Core Identity Fields
| Field | Type | Description |
|-------|------|-------------|
| `pid` | INTEGER (Primary Key) | Auto-increment internal ID |
| `patient_no` | VARCHAR | Unique patient identifier (e.g., PAT0001) |
| `fid` | INTEGER (Foreign Key) | Facility ID - links to facilities table |

### Personal Information
| Field | Type | Description |
|-------|------|-------------|
| `first_name` | VARCHAR | Patient's first name |
| `last_name` | VARCHAR | Patient's last name |
| `age` | INTEGER | Patient's age |
| `gender` | VARCHAR | Patient's gender (M/F/Other) |
| `email` | VARCHAR | Patient's email address |
| `phone_number` | VARCHAR | Patient's phone number |
| `address` | VARCHAR | Patient's residential address |

### Facility & Health Worker Information
| Field | Type | Description |
|-------|------|-------------|
| `facility_id_code` | VARCHAR | Facility identifier code (e.g., FAC001) |
| `facility_phone` | VARCHAR | Facility phone number |
| `facility_email` | VARCHAR | Facility email |
| `health_worker_name` | VARCHAR | Name of assigned health worker |
| `health_worker_role` | VARCHAR | Role of health worker (e.g., Physician, Clinical Officer, Health Counselor) |

### Clinical Information
| Field | Type | Description |
|-------|------|-------------|
| `major_condition` | VARCHAR | Primary medical condition (HIV/AIDS, Diabetes, Hypertension, TB, etc.) |
| `condition` | VARCHAR | Alternative condition field |
| `status` | VARCHAR | Patient status (Active, Inactive, Transferred, Critical, Alert) |
| `hiv_status` | VARCHAR | HIV test result (Positive, Negative, Unknown) |

### Viral Load & HIV-Specific
| Field | Type | Description |
|-------|------|-------------|
| `viral_load_copies` | INTEGER | Viral load count (number of copies) |
| `viral_load_status` | VARCHAR | Viral load status (Detectable, Undetectable) |
| `last_viral_load_date` | DATE | Date of last viral load test |

### Non-Communicable Disease (NCD) Fields
| Field | Type | Description |
|-------|------|-------------|
| `ncd_conditions` | TEXT | NCD conditions (Diabetes, Hypertension, Cancer, etc.) |
| `blood_pressure` | VARCHAR | Blood pressure reading (e.g., 120/80) |
| `glucose_level` | NUMERIC | Fasting glucose level |

### ART (Antiretroviral Therapy)
| Field | Type | Description |
|-------|------|-------------|
| `art_start_date` | DATE | Date ART was started |
| `patient_registration_date` | DATE | Date patient registered in system |

### Appointment & Visit Information
| Field | Type | Description |
|-------|------|-------------|
| `registered_date` | DATE | Patient registration date |
| `visist_date` | DATE | Last visit date (note: typo in DB - "visist") |
| `next_appointment` | DATE | Next scheduled appointment date |
| `appointment_time` | TIME | Appointment time |

### Clinical Notes & Documentation
| Field | Type | Description |
|-------|------|-------------|
| `notes` | TEXT | General clinical notes |
| `clinical_note` | TEXT | Detailed clinical notes |

### System Fields
| Field | Type | Description |
|-------|------|-------------|
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

---

## Summary Statistics
- **Total Fields**: 40+
- **Key Sections**: 10
  1. Core Identity (3 fields)
  2. Personal Information (7 fields)
  3. Facility & Health Worker (5 fields)
  4. Clinical Information (4 fields)
  5. Viral Load & HIV (3 fields)
  6. NCD Fields (3 fields)
  7. ART & Dates (2 fields)
  8. Appointments & Visits (4 fields)
  9. Clinical Notes (2 fields)
  10. System Fields (2 fields)

---

## Current Form Implementation

The Add/Edit Patient forms now include sections for:
- ✓ Patient Identification (patient_no, first_name, last_name)
- ✓ Demographics (age, gender, phone, address)
- ✓ Clinical Information (condition, hiv_status, last_viral_load_date)
- ✓ NCD Section (ncd_conditions, blood_pressure, glucose_level)
- ✓ Current Status (status)
- ✓ Additional Information (notes)

### Fields NOT in current form (can be added if needed):
- email
- facility_id_code
- facility_phone
- facility_email
- health_worker_name
- health_worker_role
- viral_load_copies (raw count)
- viral_load_status
- art_start_date
- patient_registration_date
- visist_date (last visit)
- next_appointment
- appointment_time
- clinical_note (separate from notes)

