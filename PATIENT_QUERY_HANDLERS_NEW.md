# New Patient Query Handlers

## Overview

Added 3 new specialized patient query handlers to the chatbot's Edge Function:

1. **Critical Patients** - Patients with status = "Critical"
2. **IAC Patients** - Integrated Antiretroviral Clinic enrolled patients
3. **Due for Viral Load Test** - Patients overdue for viral load testing (90+ days)

## Handler Details

### 1. Critical Patients - `getCriticalPatients()`

**Purpose:** Identify patients requiring immediate clinical attention

**Query Trigger:**
```
"Show critical patients"
"Critical patients"
"How many critical cases?"
```

**Database Query:**
```sql
SELECT pid, patient_name, status, hiv_status, last_viral_load, last_cd4_count, conditions
FROM patients
WHERE fid = $facilityId
  AND status = 'Critical'
ORDER BY patient_name ASC
LIMIT 500;
```

**Result Columns:**
- Patient ID
- Name
- HIV Status
- Viral Load (shows "Suppressed" if ≤50, otherwise numeric value)
- CD4 Count
- Conditions

**Alert:** Displays critical alert (🚨) with count of critical patients

**Performance:** O(n) - Linear scan of patient status field (recommend index on `(fid, status)`)

---

### 2. IAC Patients - `getIACPatients()`

**Purpose:** Query patients enrolled in the Integrated Antiretroviral Clinic (ART program)

**Query Trigger:**
```
"IAC patients"
"Show IAC"
"Patients in the clinic"
"ART clinic patients"
"Antiretroviral clinic"
```

**Database Query:**
```sql
SELECT pid, patient_name, hiv_status, medication_regimen, last_viral_load, status
FROM patients
WHERE fid = $facilityId
  AND hiv_status = 'Positive'
  AND medication_regimen IS NOT NULL
ORDER BY patient_name ASC
LIMIT 500;
```

**Logic:**
- Fetches all HIV-positive patients
- Filters in-app for those with non-null `medication_regimen` (indicates ART enrollment)

**Result Columns:**
- Patient ID
- Name
- Medication Regimen
- Viral Load (shows "Suppressed ✓" if ≤50, otherwise numeric value)
- Status

**Summary:** Shows count of IAC-enrolled patients with 📋 icon

**Performance:** O(n) - Fetches HIV+ patients, filters in-app (consider adding `is_on_art` field for better performance)

---

### 3. Due for Viral Load Test - `getDueForBleedingTest()`

**Purpose:** Identify patients overdue for viral load testing (lab/bleeding service)

**Query Trigger:**
```
"Due for viral load test"
"Who needs bleeding test?"
"Patients overdue for viral load"
"Due for VL test"
"Overdue for viral load testing"
```

**Database Query:**
```sql
SELECT pid, patient_name, last_viral_load_date, last_viral_load, hiv_status, status
FROM patients
WHERE fid = $facilityId
  AND hiv_status = 'Positive'
  AND last_viral_load_date <= (TODAY - 90 days)
ORDER BY last_viral_load_date ASC
LIMIT 500;
```

**Date Threshold:** 90+ days since last viral load test

**Result Columns:**
- Patient ID
- Name
- Last VL Date (formatted, or "Never" if null)
- Last VL Result (numeric count)
- Days Overdue (calculated dynamically with 🔴 indicator)
- Status

**Calculation:**
```javascript
const daysOverdue = Math.floor(
  (today - lastVLDate) / (1000 * 60 * 60 * 24)
);
```

**Alert:** Warning alert (⚠️) showing count of overdue patients for VL testing

**Performance:** O(n) - Linear scan by date (recommend index on `(fid, hiv_status, last_viral_load_date)`)

---

## Routing Logic in `findBestHandler()`

### Pattern Matching Order

```typescript
// 1. Critical Patients
if (lowerQuery.includes("critical")) {
  return getCriticalPatients
}

// 2. IAC Patients
if (
  lowerQuery.includes("iac") ||
  (lowerQuery.includes("art") && lowerQuery.includes("clinic")) ||
  (lowerQuery.includes("antiretroviral") && lowerQuery.includes("clinic"))
) {
  return getIACPatients
}

// 3. Viral Load/Bleeding Test Due
if (
  (lowerQuery.includes("due") && (lowerQuery.includes("viral") || lowerQuery.includes("bleeding") || lowerQuery.includes("vl"))) ||
  (lowerQuery.includes("overdue") && (lowerQuery.includes("viral") || lowerQuery.includes("bleeding")))
) {
  return getDueForBleedingTest
}
```

---

## Example Queries & Expected Results

### Example 1: Critical Patients
```
User Query: "Show me critical patients"

Handler: getCriticalPatients()
Result:
┌────────────┬──────────────┬────────────┬────────────┬─────────┬────────────┐
│ Patient ID │ Name         │ HIV Status │ Viral Load │ CD4     │ Conditions │
├────────────┼──────────────┼────────────┼────────────┼─────────┼────────────┤
│ PAT0001    │ John Doe     │ Positive   │ 150,000    │ 45      │ TB, HIV    │
│ PAT0045    │ Jane Smith   │ Positive   │ 500,000    │ 20      │ HIV/AIDS   │
└────────────┴──────────────┴────────────┴────────────┴─────────┴────────────┘

Alert: 🚨 2 critical patient(s) require immediate attention
```

### Example 2: IAC Patients
```
User Query: "How many patients are in IAC?"

Handler: getIACPatients()
Result:
┌────────────┬──────────────┬─────────────────────────┬────────────┬────────┐
│ Patient ID │ Name         │ Medication Regimen      │ Viral Load │ Status │
├────────────┼──────────────┼─────────────────────────┼────────────┼────────┤
│ PAT0101    │ Alice Jones  │ EFV-based 3TC/AZT       │ Suppressed │ Active │
│ PAT0102    │ Bob Wilson   │ PI-based DTG/3TC/TAF    │ 45         │ Active │
│ PAT0103    │ Carol Brown  │ INSTI-based DTG/3TC/TAF │ Suppressed │ Active │
└────────────┴──────────────┴─────────────────────────┴────────────┴────────┘

Summary: 📋 3 patient(s) enrolled in IAC program
```

### Example 3: Due for Viral Load Test
```
User Query: "Who is due for viral load test?"

Handler: getDueForBleedingTest()
Result:
┌────────────┬──────────────┬───────────────┬────────────┬──────────────┬────────┐
│ Patient ID │ Name         │ Last VL Date  │ Last VL    │ Days Overdue │ Status │
├────────────┼──────────────┼───────────────┼────────────┼──────────────┼────────┤
│ PAT0201    │ Mary Johnson │ 2025-08-15    │ 42         │ 161 days 🔴  │ Active │
│ PAT0202    │ David Lee    │ 2025-09-20    │ 85         │ 125 days 🔴  │ Active │
│ PAT0203    │ Emma Davis   │ Never         │ N/A        │ 365+ days 🔴 │ Active │
└────────────┴──────────────┴───────────────┴────────────┴──────────────┴────────┘

Alert: ⚠️ 3 patient(s) overdue for viral load testing (90+ days since last test)
```

---

## Existing Handlers (Still Available)

Already supported and not changed:

### Condition-Based
- **Diabetes Patients** - `getDiabetesPatients()`
- **Hypertension Patients** - `getHypertensionPatients()`
- **TB Patients** - `getTuberculosisPatients()`
- **Cancer Patients** - `getCancerPatients()`
- **Heart Disease Patients** - `getHeartDiseasePatients()`
- **Asthma Patients** - `getAsthmaPatients()`
- **CKD Patients** - `getCKDPatients()`
- **Mental Health Patients** - `getMentalHealthPatients()`

### Viral Load Related
- **High Viral Load** - `getHighViralLoadPatients()` (VL > 1000)
- **Undetectable** - `getUndetectablePatients()` (VL ≤ 50)
- **Due for VL Test** - `getDueForViralLoadTest()` (existing, different logic)

### CD4 Related
- **Low CD4** - `getLowCD4Patients()` (CD4 < 200)
- **Due for CD4 Test** - `getDueForCD4Test()`

---

## Database Optimization

### Recommended Indexes

```sql
-- For getCriticalPatients()
CREATE INDEX idx_patients_fid_status 
ON patients(fid, status);

-- For getIACPatients()
CREATE INDEX idx_patients_fid_hiv_regimen 
ON patients(fid, hiv_status) 
WHERE medication_regimen IS NOT NULL;

-- For getDueForBleedingTest()
CREATE INDEX idx_patients_fid_hiv_vldate 
ON patients(fid, hiv_status, last_viral_load_date);
```

### Query Performance Estimates

| Handler | Index | Query Time | Records |
|---------|-------|-----------|---------|
| getCriticalPatients | idx_patients_fid_status | <20ms | 5-50 |
| getIACPatients | idx_patients_fid_hiv_regimen | <30ms | 100-500 |
| getDueForBleedingTest | idx_patients_fid_hiv_vldate | <30ms | 10-200 |

---

## Files Modified

1. **supabase/functions/chatbot-query/index.ts**
   - Added handler: `getCriticalPatients()` (lines 1408-1441)
   - Added handler: `getIACPatients()` (lines 1449-1485)
   - Added handler: `getDueForBleedingTest()` (lines 1493-1535)
   - Updated HANDLERS mapping (lines 89-91)
   - Updated findBestHandler routing (lines 1700-1726)

2. **CHATBOT_USER_GUIDE.md**
   - Added "Patient Risk & Status" query section
   - Added "IAC Program" query section
   - Added "Lab Tests Due" query section
   - Added "Chronic Conditions" query section
   - Updated "Combined Filters" with new examples

---

## Testing Checklist

- [ ] "Critical patients" returns only patients with status = 'Critical'
- [ ] "IAC patients" returns HIV+ patients with medication regimen
- [ ] "Due for viral load" shows patients with last_viral_load_date > 90 days ago
- [ ] Days overdue calculation is accurate
- [ ] Results include appropriate alerts
- [ ] Results paginate correctly (default 50 per page)
- [ ] No results returns appropriate message
- [ ] Response time < 50ms for typical facilities
- [ ] Diabetes/Hypertension queries still work
- [ ] Combined queries work (e.g., "critical hypertension patients")

---

## Future Enhancements

1. **Combine IAC with treatment status** - Show IAC patients with viral suppression metrics
2. **Add "Due for CD4 Test" indicator to IAC patients** - Multi-metric view
3. **Create "Clinical Review" query** - Critical patients + those due for tests
4. **Add due date prediction** - Show upcoming due dates (60+ days away)
5. **Batch action support** - Send messages to all critical/due patients
6. **Trending analysis** - How many new critical cases per month
