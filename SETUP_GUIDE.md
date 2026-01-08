# Supabase Setup Guide

## Step 1: Create Tables in Supabase

1. Go to your Supabase project: https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `supabase_setup.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

This will create:
- ✓ `facilities` table with 72 facility records
- ✓ `patients` table (empty, ready for import)
- ✓ `appointments` table (empty, ready for import)
- ✓ All necessary indexes and foreign keys

---

## Step 2: Verify Table Creation

Run these queries one at a time to verify:

```sql
-- Check facilities
SELECT COUNT(*) as facility_count FROM public.facilities;

-- Check patients (should be 0 initially)
SELECT COUNT(*) as patients_count FROM public.patients;

-- Check appointments (should be 0 initially)
SELECT COUNT(*) as appointments_count FROM public.appointments;
```

**Expected Results:**
- facility_count: 72
- patients_count: 0
- appointments_count: 0

---

## Step 3: Import Patient Data

1. Go to Dashboard → **Import Data** section
2. Select **Patient Records**
3. Upload: `patients_clean.csv`
4. Review preview
5. Click **Import Data**

Wait for completion message.

---

## Step 4: Import Appointment Data

1. Go to Dashboard → **Import Data** section
2. Select **Appointment Records**
3. Upload: `appointments_clean.csv`
4. Review preview
5. Click **Import Data**

Wait for completion message.

---

## Step 5: Verify Data Import

Run these queries:

```sql
-- Count all records
SELECT COUNT(*) as total_patients FROM public.patients;
SELECT COUNT(*) as total_appointments FROM public.appointments;

-- Check a sample patient
SELECT * FROM public.patients LIMIT 1;

-- Check a sample appointment
SELECT * FROM public.appointments LIMIT 1;

-- Verify foreign key relationship
SELECT p.patient_id, p.first_name, a.appointment_date, a.status
FROM public.patients p
LEFT JOIN public.appointments a ON p.patient_id = a.patient_id
LIMIT 10;
```

**Expected Results:**
- total_patients: 80
- total_appointments: 80
- Foreign key relationships intact

---

## Files Reference

| File | Purpose |
|------|---------|
| `supabase_setup.sql` | **Main SQL file to run in Supabase** |
| `patients_clean.csv` | Patient data for import |
| `appointments_clean.csv` | Appointment data for import |
| `DATABASE_SCHEMA.md` | Detailed schema documentation |
| `SETUP_GUIDE.md` | This guide |

---

## If Something Goes Wrong

### Error: "relation already exists"
This means the tables were already created. You can either:
- Drop and recreate: Run `DROP TABLE IF EXISTS appointments, patients, facilities CASCADE;` then rerun the setup
- Or start fresh with a new Supabase project

### Error: "Foreign key constraint violation"
Make sure you import patients BEFORE appointments (patients must exist first).

### Data not appearing in dashboard
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh the page
3. Log out and log back in
4. Check that your facility_id is set correctly in the session

---

## Next Steps

After tables are created and data is imported:

1. **Update Dashboard** - The import tool should now fetch from Supabase
2. **Test Queries** - Use the dashboard to view patients and appointments
3. **Enable RLS** (Optional) - Add Row Level Security policies for multi-facility access
4. **Create Backups** - Export your data regularly

---

## RLS Setup (Optional - for Multi-Facility Support)

If you want to limit access by facility, run these in SQL Editor:

```sql
-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their facility's data
-- (Requires auth.uid() column in patients table)
-- This requires additional user/facility mapping
```

---

## Query Examples

### Get all patients with their next appointments
```sql
SELECT 
  p.patient_id,
  p.first_name || ' ' || p.last_name as patient_name,
  p.primary_condition,
  a.appointment_date,
  a.appointment_time,
  a.status
FROM public.patients p
LEFT JOIN public.appointments a ON p.patient_id = a.patient_id
ORDER BY a.appointment_date;
```

### Find patients with high viral load
```sql
SELECT * FROM public.patients
WHERE viral_load_status = 'High'
OR viral_load_status = 'Moderate'
ORDER BY patient_id;
```

### Count appointments by status
```sql
SELECT status, COUNT(*) as count
FROM public.appointments
GROUP BY status
ORDER BY count DESC;
```

### Get upcoming appointments (next 7 days)
```sql
SELECT * FROM public.appointments
WHERE appointment_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
AND status IN ('Scheduled', 'Confirmed')
ORDER BY appointment_date;
```

---

## Support

If you encounter issues:
1. Check Supabase logs (Project → Logs)
2. Verify CSV column headers match expected format
3. Ensure facility_id_code values exist in facilities table
4. Check import-data.js for validation logic

