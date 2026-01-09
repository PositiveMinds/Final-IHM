# Appointments Import Guide

## Appointments Table Structure

Based on the HealthFlow database schema, the appointments table contains the following fields:

| Field | Type | Required | Format | Description |
|-------|------|----------|--------|-------------|
| `patient_id` | Number | ✅ Yes | Integer | Patient's unique ID in the system |
| `appointment_date` | Date | ✅ Yes | YYYY-MM-DD | Date of the appointment |
| `appointment_time` | Time | ✅ Yes | HH:MM | Time of the appointment (24-hour format) |
| `appointment_type` | Text | ✅ Yes | See options | Type/category of appointment |
| `status` | Text | ✅ Yes | See options | Current status of appointment |

---

## Appointment Type Options

Valid values for `appointment_type`:
- `Regular` - Regular checkup
- `Follow-up` - Follow-up visit
- `Lab` - Lab test/procedure
- `Consultation` - Consultation with specialist

---

## Appointment Status Options

Valid values for `status`:
- `Scheduled` - Appointment is scheduled
- `Completed` - Appointment has been completed
- `Cancelled` - Appointment has been cancelled

---

## CSV Format Examples

### Minimal Valid Example
```csv
patient_id,appointment_date,appointment_time,appointment_type,status
1,2024-01-25,09:00,Regular,Scheduled
2,2024-01-25,10:30,Follow-up,Scheduled
```

### Complete Example with Various Types and Statuses
```csv
patient_id,appointment_date,appointment_time,appointment_type,status
1,2024-01-25,09:00,Regular,Scheduled
2,2024-01-25,10:30,Follow-up,Scheduled
3,2024-01-25,14:00,Lab,Scheduled
4,2024-01-26,09:15,Regular,Scheduled
5,2024-01-26,11:00,Consultation,Scheduled
6,2024-01-26,14:30,Lab,Completed
7,2024-01-27,08:30,Regular,Scheduled
8,2024-01-27,13:00,Follow-up,Cancelled
9,2024-01-27,15:30,Consultation,Completed
10,2024-01-28,09:00,Lab,Scheduled
```

---

## Date and Time Formatting

### Date Format: YYYY-MM-DD
- **Valid:** `2024-01-25`, `2024-02-01`, `2024-12-31`
- **Invalid:** `01/25/2024`, `25-01-2024`, `1-25-2024`

### Time Format: HH:MM (24-hour)
- **Valid:** `09:00`, `10:30`, `14:00`, `16:45`, `23:59`
- **Invalid:** `9:00` (must be padded), `2:30 PM`, `14:00:00` (seconds not allowed)

---

## How to Create the CSV File

### Using Excel/Spreadsheet:
1. Create columns: patient_id, appointment_date, appointment_time, appointment_type, status
2. Fill in your appointment data
3. Ensure dates are in YYYY-MM-DD format
4. Export as CSV (.csv)

### Using a Text Editor:
```
patient_id,appointment_date,appointment_time,appointment_type,status
1,2024-01-25,09:00,Regular,Scheduled
2,2024-01-25,10:30,Follow-up,Scheduled
```

---

## Validation Rules

### Required Fields
All five columns must be present and filled:
- ❌ Missing `patient_id` - Import fails
- ❌ Empty `appointment_date` - Import fails
- ❌ Empty `appointment_time` - Import fails
- ❌ Missing `appointment_type` - Import fails
- ❌ Missing `status` - Import fails

### Data Validation
- **patient_id:** Must be a valid patient ID in your system
- **appointment_date:** Must be YYYY-MM-DD format
- **appointment_time:** Must be HH:MM format (24-hour)
- **appointment_type:** Must be one of: Regular, Follow-up, Lab, Consultation
- **status:** Must be one of: Scheduled, Completed, Cancelled

### File Validation
- **File Format:** Must be CSV (.csv)
- **File Size:** Maximum 5MB
- **Column Count:** Exactly 5 columns required
- **No Empty Rows:** Empty rows are skipped
- **Column Headers:** Must match exactly (case-sensitive)

---

## Common Issues and Solutions

### Issue: "Missing required columns" Error
**Problem:** Column names don't match exactly
**Solution:** 
- Check spelling: `patient_id` not `patientid`
- Case-sensitive: `appointment_date` not `Appointment_Date`
- Compare with example: `patient_id,appointment_date,appointment_time,appointment_type,status`

### Issue: "Invalid date format" Error
**Problem:** Date is not in YYYY-MM-DD format
**Solution:**
- Convert from `01/25/2024` to `2024-01-25`
- Use Excel's TEXT function: `=TEXT(A1,"YYYY-MM-DD")`

### Issue: "Invalid time format" Error
**Problem:** Time is not in HH:MM format
**Solution:**
- Convert from `2:30 PM` to `14:30`
- Pad single digits: `9:00` → `09:00`
- Remove seconds: `14:30:00` → `14:30`

### Issue: "Patient not found" Error
**Problem:** patient_id doesn't exist in the database
**Solution:**
- Verify patient_id is correct
- Check that patients have been imported first
- Create missing patients in the system first

### Issue: "Invalid appointment type" Error
**Problem:** appointment_type value is not recognized
**Solution:**
- Use exact values: Regular, Follow-up, Lab, or Consultation
- Check capitalization matches exactly
- Don't use full descriptions like "Lab Test" - use just "Lab"

### Issue: "Invalid status" Error
**Problem:** status value is not recognized
**Solution:**
- Use exact values: Scheduled, Completed, or Cancelled
- Check capitalization matches exactly
- Don't use variations like "scheduled" (lowercase)

---

## Best Practices

### Data Preparation
1. **Verify patient_ids exist** before importing appointments
2. **Use future dates** for scheduled appointments
3. **Use past dates** for completed appointments
4. **Be consistent** with appointment type naming
5. **Check for duplicates** before importing

### Import Process
1. **Start small** - Import 5-10 appointments first
2. **Use preview** - Always review before confirming
3. **Batch imports** - Don't import thousands at once
4. **Monitor errors** - Pay attention to error messages
5. **Keep backup** - Keep original CSV file

### Quality Control
1. **Verify imported data** in dashboard
2. **Check record count** matches CSV
3. **Spot check** several appointments
4. **Verify relationships** (appointments link to patients)
5. **Test with different statuses** (Scheduled, Completed, Cancelled)

---

## Sample Files

### File: appointments_sample.csv
Located in your project directory, contains 20 sample appointment records with:
- Mix of appointment types (Regular, Follow-up, Lab, Consultation)
- Mix of statuses (Scheduled, Completed, Cancelled)
- Dates spanning multiple weeks
- Times throughout the day

Use this file as a template for your own data.

---

## Importing Appointments

### Step 1: Prepare Your CSV
Create or download a CSV file with the 5 required columns

### Step 2: Go to Dashboard
Open the HealthFlow dashboard

### Step 3: Data Management Tab
Scroll down to "Data Management" section

### Step 4: Import Appointments Tab
Click the "Import Appointments" tab

### Step 5: Select File
Click "Select CSV File" and choose your appointments CSV

### Step 6: Review Preview
Check the preview table showing first 5 records

### Step 7: Confirm Import
Click "Confirm Import" to import all records

### Step 8: Verify Results
Check the success message and verify in dashboard

---

## Advanced Topics

### Bulk Updates
To update existing appointments:
1. Export current appointments
2. Modify the records
3. Create new CSV with updates
4. Import as new appointments (creates duplicates)
5. Delete old records manually if needed

### Batch Processing
Large files are processed in batches:
- **Batch Size:** 50 appointments per batch
- **Processing Time:** ~30-60 seconds per 500 appointments
- **Error Handling:** Errors tracked per batch

### Database Schema
The appointments table is structured as:
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  appointment_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Troubleshooting Checklist

Before importing, verify:
- [ ] CSV file is properly formatted
- [ ] All 5 required columns present
- [ ] No empty required fields
- [ ] Dates are YYYY-MM-DD format
- [ ] Times are HH:MM format
- [ ] appointment_type values are valid
- [ ] status values are valid
- [ ] patient_ids exist in database
- [ ] File size is under 5MB
- [ ] No duplicate appointments

---

## Support

For issues with appointment imports:

1. **Check this guide** first for common issues
2. **Review error message** shown in dialog
3. **Verify CSV format** matches examples
4. **Test with sample file** first
5. **Contact support** if problems persist

---

## Related Documentation

- **DATA_IMPORT_GUIDE.md** - General import guide
- **appointments_sample.csv** - Sample data file
- **sample_appointments_extended.csv** - Extended sample (30 records)
- **Dashboard** - Data Management > Import Appointments

---

**Version:** 1.0  
**Last Updated:** January 2024  
**Status:** Ready for Use
