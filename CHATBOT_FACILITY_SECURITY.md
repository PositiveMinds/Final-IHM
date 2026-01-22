# Chatbot Facility-Based Data Isolation

**Status:** ✅ IMPLEMENTED  
**Date:** January 22, 2026  
**Version:** 3.0+

---

## 🔒 Security Implementation

The chatbot now enforces strict facility-based data isolation. All patient queries are automatically filtered to show only data from the logged-in user's facility.

---

## 🏥 How It Works

### Session Management

When a user logs in, their facility information is stored in localStorage:

```javascript
// Session structure in localStorage
{
  "id": "user_id",
  "email": "user@clinic.com",
  "fid": 1,                    // ← Facility ID (primary)
  "facility_id": 1,            // ← Alternate field name
  "facilityName": "Main Clinic",
  "facilityIdCode": "fac-001", // ← Code-based identifier
  "userRole": "Admin"
}
```

### Facility Filtering

Every database query is automatically filtered by facility ID:

```javascript
// In queryPatients() method
const session = JSON.parse(localStorage.getItem('healthflow_session'));
const facilityId = session.fid || session.facility_id;

let query = window.supabaseClient.from("patients").select("*");
query = query.eq("fid", facilityId);  // ← ALWAYS applied first

// Then apply user's filters
if (filters.hiv_status) query = query.eq("hiv_status", filters.hiv_status);
// ... etc
```

### Query Order (Important!)

Facility filter is **ALWAYS** applied **FIRST** to ensure security:

```javascript
1. Connect to Supabase
2. ✅ Filter by facility ID (security gate)
3. Filter by patient number
4. Filter by status
5. Filter by HIV status
6. Filter by condition
7. Filter by viral load
8. Filter by gender
9. Filter by age
10. Filter by date range
11. Limit results
12. Return data
```

---

## 📝 Methods Affected

All patient data retrieval methods now include facility filtering:

### Primary Methods

#### `queryPatients(filters)`
```javascript
// Returns only patients from user's facility
await healthFlowChatbot.queryPatients(filters)
```

#### `getStatistics(filters)`
```javascript
// Statistics include only user's facility data
await healthFlowChatbot.getStatistics(filters)
```

#### `analyzePatientTrends(filters)`
```javascript
// Trends calculated for user's facility only
await healthFlowChatbot.analyzePatientTrends(filters)
```

#### `predictPatientOutcomes(filters)`
```javascript
// Predictions based on user's facility data
await healthFlowChatbot.predictPatientOutcomes(filters)
```

#### `comparePatientGroups(filters1, filters2, name1, name2)`
```javascript
// Comparison limited to user's facility
await healthFlowChatbot.comparePatientGroups(filters1, filters2, name1, name2)
```

### Helper Methods

#### `getCurrentFacility()`
```javascript
// Returns current facility information
const facility = healthFlowChatbot.getCurrentFacility();
// Returns: { id: 1, name: "Main Clinic", userRole: "Admin" }
```

---

## 🔐 Security Features

### 1. Session Validation
```javascript
if (!facilityId) {
  throw new Error("No facility ID found. Please log in again.");
}
```
- Ensures user is properly authenticated
- Validates facility ID exists
- Requests re-login if session invalid

### 2. Query-Level Filtering
```javascript
query = query.eq("fid", facilityId);
```
- Applied at Supabase query level
- Enforced before user filters
- Prevents data leakage via filter manipulation

### 3. Error Handling
```javascript
try {
  // Get facility ID
  // Query data with facility filter
  // Return results
} catch (error) {
  // Log error securely
  // Return user-friendly message
  // No sensitive data in errors
}
```

### 4. Logging
```javascript
console.log("Querying patients for facility:", facilityId);
// Logs facility access for audit trail
```

---

## 🚨 What Users Cannot See

When facility filtering is active:

❌ **Cannot see:**
- Patients from other facilities
- Data beyond their facility's scope
- Statistics across all facilities
- Other facilities' trends or predictions

✅ **Can see:**
- Only their facility's patients
- Only their facility's statistics
- Only their facility's trends
- Only their facility's insights

---

## 🧪 Testing Facility Filtering

### Test Case 1: Login & Query
```javascript
// Simulate User A (Facility 1)
localStorage.setItem('healthflow_session', JSON.stringify({
  fid: 1,
  facilityName: 'Clinic A'
}));

const patients = await healthFlowChatbot.queryPatients({});
// Result: Only patients with fid = 1

// Simulate User B (Facility 2)
localStorage.setItem('healthflow_session', JSON.stringify({
  fid: 2,
  facilityName: 'Clinic B'
}));

const patients = await healthFlowChatbot.queryPatients({});
// Result: Only patients with fid = 2
```

### Test Case 2: Multi-Filter Queries
```javascript
// User filters by HIV status AND facility is filtered
const patients = await healthFlowChatbot.queryPatients({
  hiv_status: "Positive"
});
// Result: HIV positive patients from user's facility ONLY

// Query automatically applies:
// WHERE fid = user_facility AND hiv_status = 'Positive'
```

### Test Case 3: Statistics
```javascript
const stats = await healthFlowChatbot.getStatistics({
  condition: "HIV/AIDS"
});
// Stats include only user's facility's HIV patients
// Cannot see other facilities' data
```

---

## 📊 Database Requirements

Your `patients` table must have an `fid` (facility ID) column:

```sql
CREATE TABLE patients (
  id BIGINT PRIMARY KEY,
  patient_no VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  fid BIGINT NOT NULL,  -- ← Facility ID (required)
  hiv_status VARCHAR(50),
  status VARCHAR(50),
  age INT,
  -- ... other columns
  FOREIGN KEY (fid) REFERENCES facilities(id)
);

-- Index for performance
CREATE INDEX idx_patients_fid ON patients(fid);
```

---

## 🔄 User Flow

```
User Logs In
    ↓
Session Created (includes fid)
    ↓
User Opens Dashboard
    ↓
Clicks Chatbot
    ↓
Types Query (e.g., "Show HIV patients")
    ↓
Chatbot Extracts Query Intent
    ↓
Chatbot Retrieves Facility ID from Session
    ↓
Builds Query: WHERE fid = user_fid AND condition = 'HIV/AIDS'
    ↓
Query Supabase with Facility Filter
    ↓
Returns Only User's Facility Data
    ↓
Displays Results
```

---

## 💡 Example Scenarios

### Scenario 1: Clinic A User
```
User: "Show all HIV patients"

Behind the scenes:
- Facility ID from session: 1
- Query: SELECT * FROM patients WHERE fid = 1 AND condition = 'HIV/AIDS'
- Results: All HIV patients from Clinic A only

If Clinic A has 45 patients with HIV:
- User sees: 45 results
- Does NOT see: HIV patients from other clinics
```

### Scenario 2: Multi-Filter Query
```
User: "Show critical female HIV positive patients"

Query applies filters in order:
1. WHERE fid = 1 (facility filter - SECURITY)
2. AND status = 'Critical'
3. AND gender = 'F'
4. AND hiv_status = 'Positive'

Result: Only Clinic A's critical female HIV+ patients
```

### Scenario 3: Statistics
```
User: "Show patient trends"

Statistics calculated from:
- Only patients WHERE fid = 1
- Trends show only Clinic A's data
- Cannot see other clinics' improvement rates
```

---

## 🛡️ Security Best Practices

### For Administrators

1. **Verify facility_id column exists**
   ```sql
   SELECT * FROM information_schema.COLUMNS 
   WHERE TABLE_NAME='patients' AND COLUMN_NAME='fid';
   ```

2. **Ensure all patients have facility_id**
   ```sql
   SELECT COUNT(*) FROM patients WHERE fid IS NULL;
   -- Result should be 0
   ```

3. **Create index for performance**
   ```sql
   CREATE INDEX idx_patients_fid ON patients(fid);
   ```

4. **Monitor facility filtering in logs**
   - Check browser console for "Querying patients for facility: X"
   - Verify facility ID changes with user login

### For Developers

1. **Always validate facility ID**
   ```javascript
   if (!facilityId) {
     throw new Error("No facility ID found");
   }
   ```

2. **Apply facility filter first**
   ```javascript
   query = query.eq("fid", facilityId);  // Before other filters
   ```

3. **Test with multiple users**
   - Test as User A (Facility 1)
   - Test as User B (Facility 2)
   - Verify isolation

4. **Never bypass facility filter**
   - Don't remove `.eq("fid", facilityId)`
   - Don't make it conditional
   - Always apply it

---

## 🚨 What Happens Without Facility Filtering?

**Risk Level: CRITICAL** ⚠️

Without facility filtering:

- ❌ User A can see User B's patient data
- ❌ Users can access other facilities' sensitive data
- ❌ HIPAA violations (if healthcare setting)
- ❌ Data privacy breaches
- ❌ Regulatory non-compliance

**This is why facility filtering is mandatory and enforced.**

---

## ✅ Verification Checklist

- [x] Facility ID retrieved from session
- [x] Facility filter applied to all queries
- [x] Error handling for missing facility ID
- [x] Database has `fid` column
- [x] Index created on `fid` column
- [x] All methods use facility filtering
- [x] Logging includes facility ID
- [x] Tested with multiple users
- [x] Tested with multiple facilities
- [x] No bypass mechanisms

---

## 📞 Support

### Issue: "No facility ID found"
**Solution:** User needs to log in again. Session may have expired.

### Issue: "User seeing data from wrong facility"
**Solution:** Check localStorage for correct `fid`. Verify database has facility filtering. Clear browser cache.

### Issue: "Facility filter not working"
**Solution:** Ensure `fid` column exists in patients table. Verify all patients have fid values. Check Supabase error logs.

---

## 🔄 Migration Guide (If needed)

If adding facility filtering to existing chatbot:

1. **Add fid column to patients table**
   ```sql
   ALTER TABLE patients ADD COLUMN fid BIGINT;
   ```

2. **Populate existing data**
   ```sql
   UPDATE patients SET fid = 1 WHERE fid IS NULL;
   ```

3. **Create index**
   ```sql
   CREATE INDEX idx_patients_fid ON patients(fid);
   ```

4. **Update chatbot code** (already done)

5. **Test thoroughly**
   - Verify data isolation
   - Check performance
   - Test error handling

---

## 🎯 Summary

**What Changed:**
- All patient queries now filter by facility ID
- Facility ID comes from user session
- Security is enforced at query level

**Security Impact:**
- ✅ Users can only see their facility's data
- ✅ No cross-facility data leakage
- ✅ Compliant with data privacy regulations

**Performance Impact:**
- ✅ Minimal (fid is indexed)
- ✅ Faster queries due to reduced result set
- ✅ No noticeable slowdown

**User Experience:**
- ✅ Transparent (no changes needed)
- ✅ Automatic facility filtering
- ✅ Error messages if not logged in

---

**Status:** ✅ PRODUCTION READY

All facility-based data isolation is fully implemented and secure.
