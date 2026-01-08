# Supabase Integration Guide

## Dashboard & Patient Management with Supabase

Your dashboard and patient management system now pull data directly from Supabase.

## Setup Steps

### 1. Create Patients Table

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  facility_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone_number TEXT,
  email TEXT,
  primary_condition TEXT,
  status TEXT DEFAULT 'Active',
  notes TEXT,
  registered_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patients_facility ON patients(facility_id);
CREATE INDEX idx_patients_phone ON patients(phone_number);
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
```

### 2. Verify Supabase Config

Your `supabase-config.js` should have:
- ✅ Correct Supabase URL
- ✅ Valid Anon Public Key

**File:** `c:/Users/kitwe/Desktop/IHM/supabase-config.js`

```javascript
const SUPABASE_URL = 'https://tnhbrekxxlenmziyefwx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xb_u65YWSqSuwmP1lMUbqQ_NohminIi';
```

### 3. Insert Sample Patients

To populate with test data, run this SQL:

```sql
INSERT INTO patients (patient_id, facility_id, first_name, last_name, date_of_birth, gender, phone_number, email, primary_condition, status, notes, registered_date)
VALUES
  ('PT-001', 'facility-demo-xxxxx', 'Peter', 'Njoroge', '1985-03-15', 'Male', '+256 700 123 456', 'peter@example.com', 'HIV', 'Active', 'Viral load suppressed', '2025-12-01'),
  ('PT-002', 'facility-demo-xxxxx', 'Mary', 'Karanja', '1990-07-22', 'Female', '+256 700 234 567', 'mary@example.com', 'Diabetes', 'Active', 'Regular follow-ups', '2025-11-15'),
  ('PT-003', 'facility-demo-xxxxx', 'James', 'Ochieng', '1978-11-08', 'Male', '+256 700 345 678', 'james@example.com', 'Hypertension', 'At Risk', 'BP slightly elevated', '2025-10-20');
```

**Note:** Replace `facility-demo-xxxxx` with the actual `facility_id` from your registered facility.

## Features Implemented

### Dashboard (`dashboard.html` + `dashboard.js`)
✅ **Live Statistics from Supabase:**
  - Total Patients count
  - Active Patients count
  - At Risk Patients count
  - HIV Patients count
  
✅ **Recent Patients Table:**
  - Shows last 5 registered patients
  - Name, age, condition, status
  - Click "View" to see details
  
✅ **Session Management:**
  - Session validation on load
  - Redirect to login if not authenticated
  - User info display
  - Logout functionality

### Patient Management (`patients.html` + `patients.js`)
✅ **CRUD Operations:**
  - **Create**: Add new patients (inserts to Supabase)
  - **Read**: View all patients filtered by facility
  - **Update**: Edit patient info (updates in Supabase)
  - **Delete**: Remove patients (deletes from Supabase)

✅ **Search & Filter:**
  - Search by name, patient ID, phone
  - Filter by status (Active, At Risk, Inactive)
  - Filter by condition (HIV, Diabetes, Hypertension, Maternal Health)

✅ **Patient Details:**
  - Auto-generated patient IDs (PT-001, PT-002, etc.)
  - Age calculation from DOB
  - Contact information
  - Condition and status tracking
  - Notes field

## Data Flow

```
Login → Dashboard
  ↓
  └─ Loads facility_id from session
     ↓
     └─ Queries Supabase patients table
        WHERE facility_id = current_facility
        ↓
        └─ Updates stat cards & patient table

Patients Page
  ↓
  └─ Loads all patients for facility
     ↓
     └─ Add/Edit/Delete → Supabase inserts/updates/deletes
        ↓
        └─ Reloads patient list
```

## Database Queries Used

### Load Dashboard Stats
```javascript
// Total patients
SELECT COUNT(*) FROM patients WHERE facility_id = ?

// Active patients
SELECT COUNT(*) FROM patients WHERE facility_id = ? AND status = 'Active'

// At Risk patients
SELECT COUNT(*) FROM patients WHERE facility_id = ? AND status = 'At Risk'

// HIV patients
SELECT COUNT(*) FROM patients WHERE facility_id = ? AND primary_condition = 'HIV'

// Recent patients
SELECT * FROM patients WHERE facility_id = ? ORDER BY created_at DESC LIMIT 5
```

### Load Patient List
```javascript
// All facility patients
SELECT * FROM patients WHERE facility_id = ? ORDER BY created_at DESC

// With filters
SELECT * FROM patients 
WHERE facility_id = ? 
AND (first_name LIKE ? OR last_name LIKE ? OR patient_id LIKE ?)
AND (status = ? OR status = ?)
ORDER BY created_at DESC
```

### Add Patient
```javascript
INSERT INTO patients (
  patient_id, facility_id, first_name, last_name, 
  date_of_birth, gender, phone_number, email, 
  primary_condition, status, notes
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

## Testing Workflow

### 1. Test Dashboard
1. Login with valid credentials
2. Navigate to Dashboard
3. Check stat cards show correct numbers
4. Check recent patients table
5. Click "View" on a patient
6. Logout

### 2. Test Patient Management
1. From Dashboard, click "Patients" in sidebar
2. Verify all patients load
3. Test search:
   - Enter patient name
   - Enter patient ID
   - Enter phone number
4. Test filters:
   - Filter by status
   - Filter by condition
   - Combine filters
5. Test Add Patient:
   - Click "Add Patient"
   - Fill form (all required fields)
   - Click "Save Patient"
   - Verify new patient appears in list
6. Test Edit Patient:
   - Click "Edit" on a patient card
   - Change name/status/notes
   - Click "Save Changes"
   - Verify updates
7. Test Delete Patient:
   - Click "Delete" on a patient card
   - Confirm deletion
   - Verify patient removed from list
8. Logout

## Troubleshooting

### Dashboard shows "0" for all stats
**Cause**: No patients in database for your facility_id
**Solution**: Insert sample patients with correct facility_id

### "Database connection failed" error
**Cause**: Supabase client not initialized
**Solution**: Check:
  - `supabase-config.js` loads before other scripts
  - Supabase URL is correct
  - Anon key is valid and not redacted

### Patients page shows "No patients found"
**Cause**: Either no patients exist or facility_id doesn't match
**Solution**:
  - Check patients table has records
  - Verify facility_id in database matches session data
  - Check browser console for errors

### Can't add/edit/delete patients
**Cause**: RLS policies might be blocking operations
**Solution**: Ensure RLS is disabled on patients table
```sql
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
```

### Search/filters not working
**Cause**: JavaScript error in filtering logic
**Solution**: Check browser console (F12)

## Security Notes

### Current Setup (Development)
- ⚠️ RLS disabled for easier testing
- ⚠️ Using anon key (less secure)
- ⚠️ Client-side filtering

### Production Recommendations
1. **Enable RLS** - Add policies:
```sql
CREATE POLICY "Users can only see their facility patients" 
ON patients FOR SELECT 
USING (facility_id = current_user_id);
```

2. **Use API Key** - Replace anon key with restricted key

3. **Add Authentication** - Use Supabase Auth instead of custom session

4. **Validate Input** - Server-side validation on all operations

5. **Encrypt Sensitive Data** - Phone numbers, emails, health data

6. **Add Audit Logging** - Track all patient data changes

## Performance Tips

### Optimize Queries
- Use indexes on `facility_id` and `phone_number` ✅
- Add pagination for large datasets
- Cache stats on dashboard

### Reduce API Calls
- Load dashboard stats once on page load
- Batch operations where possible
- Use real-time subscriptions for live updates

## Next Steps

1. ✅ Test with sample data
2. ✅ Verify all CRUD operations work
3. ✅ Test with real facility data
4. ✅ Implement RLS for production
5. ✅ Add audit logging
6. ✅ Create automated backups
7. ✅ Set up monitoring alerts

## File Structure

```
IHM/
├── dashboard.html          (Dashboard UI)
├── dashboard.js            (Dashboard logic + Supabase queries)
├── patients.html           (Patient management UI)
├── patients.js             (Patient CRUD + Supabase queries)
├── supabase-config.js      (Supabase client init)
├── login.html              (Login page)
├── login.js                (Login logic)
├── register.html           (Registration page)
├── register.js             (Registration logic)
└── styles.css              (Global styles)
```

## Support

For issues:
1. Check browser console (F12 → Console tab)
2. Check Network tab for failed requests
3. Verify Supabase credentials in config
4. Check database table exists
5. Verify RLS is disabled (for development)
