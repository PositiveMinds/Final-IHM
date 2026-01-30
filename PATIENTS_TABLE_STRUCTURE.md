# Patients Table Structure

## All Available Fields in the Patients Table

| Field Name | Data Type | Required | Description |
|-----------|-----------|----------|-------------|
| patient_no | TEXT | **YES** | Unique patient identifier/ID |
| first_name | TEXT | **YES** | Patient's first name |
| last_name | TEXT | **YES** | Patient's last name |
| gender | TEXT | **YES** | Male, Female, or Other |
| age | INTEGER | NO | Patient's age |
| phone_number | TEXT | NO | Contact phone number |
| email | TEXT | NO | Email address |
| address | TEXT | NO | Residential address |
| status | TEXT | **YES** | Active, Inactive, Critical, Alert, Transferred |
| hiv_status | TEXT | **YES** | Positive, Negative, Unknown |
| condition | TEXT | NO | Primary condition (HIV, Diabetes, Hypertension, TB, Cancer, Asthma, Heart Disease, Other) |
| patient_type | TEXT | NO | New, Returning, Transferred In |
| patient_registration_date | DATE | NO | When patient was registered (YYYY-MM-DD format) |
| notes | TEXT | NO | Clinical or general notes |
| facility_id_code | TEXT | NO | Facility identifier code |
| fid | TEXT | NO | Facility ID (auto-populated) |
| pid | TEXT | NO | Patient ID reference |
| health_worker_name | TEXT | NO | Name of health worker |
| health_worker_role | TEXT | NO | Role/position of health worker |

### HIV-Related Fields
| Field Name | Data Type | Required | Description |
|-----------|-----------|----------|-------------|
| art_start_date | DATE | NO | When ART started (YYYY-MM-DD format) |
| last_viral_load_date | DATE | NO | Date of last viral load test (YYYY-MM-DD format) |
| viral_load_copies | INTEGER | NO | Viral load count (number of copies) |
| viral_load_status | TEXT | NO | Undetectable, Detectable, Not Done |
| hiv_regimen | TEXT | NO | ARV regimen (e.g., TDF/FTC/EFV, AZT/3TC/EFV, etc.) |
| regimen_start_date | DATE | NO | When current regimen started (YYYY-MM-DD format) |
| regimen_status | TEXT | NO | Active, Changed, Stopped, Not Started |

### Appointment-Related Fields
| Field Name | Data Type | Required | Description |
|-----------|-----------|----------|-------------|
| visit_date | DATE | NO | Date of last visit (YYYY-MM-DD format) |
| next_appointment | DATE | NO | Scheduled next appointment date (YYYY-MM-DD format) |
| appointment_time | TIME | NO | Appointment time (HH:MM format) |
| appointment_type | TEXT | NO | General, Follow-up, Lab Test, Counseling |

### NCD (Non-Communicable Disease) Fields
| Field Name | Data Type | Required | Description |
|-----------|-----------|----------|-------------|
| systolic | INTEGER | NO | Systolic blood pressure (mmHg) |
| diastolic | INTEGER | NO | Diastolic blood pressure (mmHg) |
| glucose_level | DECIMAL | NO | Blood glucose level (mg/dL) |

## Required Fields Summary
When importing or adding a new patient, you MUST provide:
1. **patient_no** - Unique patient ID
2. **first_name** - Patient's first name
3. **last_name** - Patient's last name
4. **gender** - Male, Female, or Other
5. **status** - Active, Inactive, Critical, Alert, or Transferred
6. **hiv_status** - Positive, Negative, or Unknown

All other fields are optional and can be left blank if not available.

## Date Format
All date fields must be in format: **YYYY-MM-DD** (e.g., 2024-01-30)

## CSV Import Notes
- First row must contain column headers
- Fields can be in any order
- Blank cells for optional fields are acceptable
- Only required fields must have values
