# Dashboard & Patient Management Setup Guide

## Overview

Three complete modules have been created:

1. **Dashboard** - Main facility dashboard with overview, statistics, and navigation
2. **Patient Management** - Full-featured patient management system
3. **Logout Functionality** - Secure logout with session management

## Files Created

### 1. Dashboard Module
- **dashboard.html** - Main dashboard interface (already existed, updated)
- **dashboard.js** - Dashboard logic, session checking, logout handler
  - Session validation on page load
  - User info display
  - Logout functionality with confirmation
  - Section navigation

### 2. Patient Management Module
- **patients.html** - Patient management interface
  - Patient list view
  - Search and filter functionality
  - Add/edit/delete patients
  - Patient details modal
  - Status and condition filters

- **patients.js** - Patient management logic
  - CRUD operations (Create, Read, Update, Delete)
  - Local storage persistence (demo version)
  - Patient search and filtering
  - Age calculation
  - Logout functionality

## Features

### Dashboard
✅ Session authentication check (redirects to login if not authenticated)
✅ User information display
✅ Logout button with confirmation dialog
✅ Multiple sections (Overview, Appointments, HIV Management, Reports, Settings)
✅ Statistics cards
✅ Patient list
✅ Quick access to patient management

### Patient Management
✅ Add new patients with form validation
✅ Search patients by name, ID, or phone
✅ Filter by status (Active, At Risk, Inactive)
✅ Filter by condition (HIV, Diabetes, Hypertension, Maternal Health)
✅ View patient details
✅ Edit patient information
✅ Delete patients
✅ Auto-generated patient IDs
✅ Age calculation from DOB
✅ Responsive card-based design
✅ Local storage for data persistence

### Logout
✅ Confirmation dialog before logout
✅ Session data clearance
✅ Redirect to login page
✅ Success message
✅ Works from both dashboard and patients pages

## How to Use

### 1. Access Dashboard
- After successful login, user is redirected to `dashboard.html`
- Session is automatically validated
- User information displays in top-right corner
- Click menu items to navigate sections

### 2. Manage Patients
- Click "Patients" in sidebar (links to `patients.html`)
- View all patients with quick info cards
- Use search bar to find specific patients
- Use filters to narrow results
- Click "Add Patient" to register new patient
- Click "View", "Edit", or "Delete" buttons on patient cards

### 3. Logout
- Click "Logout" button in top-right corner
- Confirm logout in dialog
- Session is cleared and user returns to login page

## Data Structure

### Patient Object
```javascript
{
  id: "PT-001",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1985-03-15",
  gender: "Male",
  phoneNumber: "+256 700 123 456",
  email: "john@example.com",
  primaryCondition: "HIV",
  status: "Active",
  notes: "Patient notes here",
  registeredDate: "2025-12-01"
}
```

## Navigation Flow

```
login.html → dashboard.html → patients.html
              ↓                    ↓
          (logout)            (logout)
              ↓                    ↓
          login.html          login.html
```

## Session Management

### Storage Locations
- **sessionStorage**: `healthflow_session` - User data (cleared on browser close)
- **localStorage**: `healthflow_email` - Email (if "Remember me" was checked)
- **localStorage**: `healthflow_patients` - Patient data (for demo)

### Session Data
```javascript
{
  id: UUID,
  email: "user@facility.com",
  facilityName: "Facility Name",
  facilityId: "facility-slug-xxxx",
  userRole: "Administrator",
  loginTime: "2025-01-08T..."
}
```

## Testing

### Test Login & Dashboard
1. Open `login.html`
2. Register new user OR login with:
   - Email: `demo@facility.com`
   - Password: `Demo123!`
3. Should redirect to `dashboard.html`
4. Check user info displays correctly
5. Test logout button

### Test Patient Management
1. From dashboard, click "Patients" or navigate to `patients.html`
2. View sample patients (pre-loaded)
3. Test search by entering name or ID
4. Test filters
5. Click "Add Patient" and fill form
6. Click "View" to see details
7. Click "Edit" to modify patient
8. Click "Delete" to remove patient
9. Test logout from patients page

### Test Session Security
1. Open `dashboard.html` directly without logging in
2. Should redirect to `login.html`
3. Logout and try to access dashboard
4. Should redirect to login

## Current Data Storage

For **demo/testing only**, patients are stored in `localStorage`. To integrate with Supabase:

Update `patients.js` to replace these functions:

```javascript
// Replace loadPatients() with Supabase query
async function loadPatients() {
  const session = sessionStorage.getItem('healthflow_session');
  const userData = JSON.parse(session);
  
  const { data, error } = await supabaseClient
    .from('patients')
    .select('*')
    .eq('facility_id', userData.facilityId);
  
  if (error) console.error('Error loading patients:', error);
  patients = data || [];
  displayPatients(patients);
}

// Replace savePatients() with Supabase insert/update
async function savePatients() {
  // Use supabaseClient.from('patients').upsert(patient)
}
```

## Database Schema (When Using Supabase)

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  FOREIGN KEY (facility_id) REFERENCES users(facility_id)
);

CREATE INDEX idx_patients_facility ON patients(facility_id);
```

## Future Enhancements

- [ ] Integrate with Supabase for cloud storage
- [ ] Patient medical history tracking
- [ ] Appointment scheduling
- [ ] Lab results management
- [ ] Export patient data to PDF
- [ ] Bulk patient import from CSV
- [ ] Patient communication (SMS/WhatsApp)
- [ ] Advanced analytics and reports
- [ ] Two-factor authentication
- [ ] Audit logging
- [ ] Role-based access control

## Troubleshooting

**Dashboard redirects to login:**
- Session data was not properly saved during login
- Check login.js creates session correctly

**Patient data not saving:**
- localStorage might be disabled
- Check browser console for errors
- Clear browser cache and try again

**Logout not working:**
- Check that `handleLogout()` function is called
- Verify sessionStorage is being cleared
- Check browser console for errors

**Patient search not finding results:**
- Ensure search term matches patient name, ID, or phone
- Search is case-insensitive
- Check if filters are limiting results

**Modal not opening:**
- Verify Bootstrap 5 is loaded
- Check browser console for JavaScript errors
- Ensure modal HTML has correct ID

## Support

For issues or questions:
1. Check browser console (F12 → Console)
2. Check the relevant .js file for error messages
3. Verify all required scripts are loaded
4. Ensure Supabase credentials are correct (if using Supabase)
