# Chatbot NCD & Health Expansion Guide

Expanded the facility chatbot with 30+ new query patterns covering NCDs, maternal health, and patient management.

## New Query Categories Added

### 1. NCDs (Non-Communicable Diseases)

| Query | Keywords | Returns |
|-------|----------|---------|
| Hypertension | "hypertension", "high blood pressure", "HBP" | Patient list with BP readings |
| Diabetes | "diabetes", "diabetic", "glucose", "blood sugar" | Patients with glucose levels |
| Asthma | "asthma", "asthmatic", "chronic respiratory" | Asthma patient list |
| Cancer | "cancer", "oncology", "malignancy", "tumor" | Cancer patients with type |
| Heart Disease | "heart disease", "cardiac", "CVD" | Cardiac patients |
| CKD | "chronic kidney", "CKD", "renal disease" | CKD patients with stage |
| Mental Health | "mental health", "depression", "anxiety" | Mental health patients |
| Tuberculosis | "tuberculosis", "TB", "lung disease" | TB patients with status |

**Example Queries:**
- "Show hypertension patients"
- "Who has diabetes?"
- "Asthma patients"
- "Cancer patients in my facility"

---

### 2. Appointment Management

| Query | Keywords | Returns |
|-------|----------|---------|
| Missed Appointments | "missed appointment", "defaulter", "no show" | Defaulters with last visit |
| Due Appointments | "due appointment", "overdue", "pending" | Overdue patients + days overdue |

**Example Queries:**
- "Show defaulters"
- "Missed appointments"
- "Patients who didn't come"
- "Overdue appointments"

---

### 3. Lab Testing & Monitoring

| Query | Keywords | Returns |
|-------|----------|---------|
| Due VL Testing | "due viral load", "VL test due", "viral testing" | Patients due for testing + last result |
| Due CD4 Testing | "due CD4", "CD4 test due" | CD4 due patients + last count |
| Overdue Labs | "lab overdue", "test overdue" | All lab tests overdue |

**Example Queries:**
- "Patients due for viral load"
- "Who needs CD4 testing?"
- "Lab tests overdue"
- "Due for viral load testing"

---

### 4. Pregnancy & Maternal Health

| Query | Keywords | Returns |
|-------|----------|---------|
| Antenatal | "antenatal", "pregnant", "pregnancy", "maternal care" | Pregnant patients with gestational age |
| Postnatal | "postnatal", "postpartum", "puerperal" | Postnatal patients + days |
| Maternal Complications | "maternal complication", "pregnancy complication", "obstetric" | Complications with type |

**Example Queries:**
- "Antenatal patients"
- "Show pregnant women"
- "Postnatal care patients"
- "Maternal complications"
- "Pregnancy complications"

---

### 5. Complications & Adverse Events

| Query | Keywords | Returns |
|-------|----------|---------|
| Bleeding | "bleeding", "hemorrhage", "hemoptysis" | Bleeding events with severity |
| Complications | "complication", "adverse event", "side effect" | Patients with complications |

**Example Queries:**
- "Bleeding patients"
- "Who has bleeding?"
- "Hemorrhage cases"
- "Patients with complications"
- "Adverse events"

---

### 6. Adherence & Follow-up

| Query | Keywords | Returns |
|-------|----------|---------|
| Poor Adherence | "poor adherence", "non-adherent", "medication adherence" | Poor adherence patients |
| Due for Review | "due review", "clinic review due", "follow-up due" | Patients needing clinic visit |

**Example Queries:**
- "Poor adherence patients"
- "Non-adherent patients"
- "Who's due for clinic review?"
- "Follow-up due"
- "Medication adherence issues"

---

## Database Schema Requirements

For these queries to work, ensure your `patients` table has these columns:

```sql
-- NCD columns
ncd_conditions          (TEXT)    -- JSON or comma-separated
blood_pressure          (TEXT)    -- e.g., "140/90"
glucose_level           (NUMERIC) -- mg/dL
cancer_type             (TEXT)
ckd_stage               (NUMERIC) -- 1-5
tb_status               (TEXT)

-- Pregnancy columns
pregnancy_status        (TEXT)    -- 'Pregnant', 'Postnatal', 'Not pregnant'
gestational_weeks       (NUMERIC)
lmp_date                (DATE)    -- Last Menstrual Period
delivery_date           (DATE)
postnatal_days          (NUMERIC)
maternal_complication   (BOOLEAN)
complication_type       (TEXT)

-- Appointment columns
last_appointment_date   (DATE)

-- Lab columns
viral_load_date         (DATE)
cd4_date                (DATE)

-- Complication columns
bleeding_event          (BOOLEAN)
bleeding_date           (DATE)
bleeding_severity       (TEXT)    -- 'Mild', 'Moderate', 'Severe'
complication_recorded   (BOOLEAN)
complication_date       (DATE)

-- Adherence columns
adherence_level         (TEXT)    -- 'Good', 'Fair', 'Poor'
last_refill_date        (DATE)
last_clinic_visit       (DATE)
```

### If columns don't exist:

Add them to your patients table:

```sql
ALTER TABLE patients ADD COLUMN ncd_conditions TEXT;
ALTER TABLE patients ADD COLUMN blood_pressure TEXT;
ALTER TABLE patients ADD COLUMN glucose_level NUMERIC;
ALTER TABLE patients ADD COLUMN pregnancy_status TEXT;
ALTER TABLE patients ADD COLUMN gestational_weeks NUMERIC;
ALTER TABLE patients ADD COLUMN lmp_date DATE;
ALTER TABLE patients ADD COLUMN adherence_level TEXT;
-- ... etc for other columns
```

---

## Complete Supported Queries (40+)

### HIV & Testing
- "appointments next week" / "appointments today"
- "patients on ART"
- "high viral loads" / "undetectable viral load"
- "new patients this month"
- "critical patients"
- "low CD4 patients"
- "patients due for viral load testing"
- "patients due for CD4 testing"
- "lab tests overdue"

### NCDs
- "hypertension patients" / "high blood pressure"
- "diabetes patients" / "blood sugar"
- "asthma patients"
- "cancer patients"
- "heart disease" / "cardiac patients"
- "chronic kidney disease" / "CKD"
- "mental health patients" / "depression"
- "tuberculosis" / "TB patients"

### Appointments & Follow-up
- "missed appointments" / "defaulters"
- "overdue appointments"
- "due for clinic review"
- "follow-up due"

### Maternal Health
- "antenatal patients" / "pregnant women"
- "postnatal patients"
- "maternal complications"
- "pregnancy complications"

### Complications
- "bleeding patients" / "hemorrhage"
- "patients with complications"
- "adverse events"

### Adherence
- "poor adherence patients"
- "non-adherent patients"
- "medication adherence"

---

## Deployment Steps

### 1. Update Edge Function

Replace code in Supabase Edge Function with updated `supabase-edge-function.js`:

**Via Dashboard:**
- Supabase → Functions → chatbot-query
- Replace entire function code
- Deploy

**Via CLI:**
```bash
supabase functions deploy chatbot-query
```

### 2. Update Frontend (Auto-Done)

`chatbot-handler.js` and `dashboard.html` already updated with new welcome message.

### 3. Add Database Columns

Run SQL in Supabase SQL Editor to add missing columns:

```sql
-- Add NCD columns if not present
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ncd_conditions TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_pressure TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS glucose_level NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS cancer_type TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ckd_stage NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS tb_status TEXT;

-- Add pregnancy columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS pregnancy_status TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS gestational_weeks NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS lmp_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS postnatal_days NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS maternal_complication BOOLEAN;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS complication_type TEXT;

-- Add appointment columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_appointment_date DATE;

-- Add complication columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bleeding_event BOOLEAN;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bleeding_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bleeding_severity TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS complication_recorded BOOLEAN;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS complication_date DATE;

-- Add adherence columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS adherence_level TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_refill_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_clinic_visit DATE;
```

### 4. Test Queries

Open dashboard in browser and try:
- "Show hypertension patients"
- "Antenatal patients"
- "Missed appointments"
- "Due for viral load testing"

---

## Customization

### Add a new NCD type

In `supabase-edge-function.js`, add to `QUERY_PATTERNS`:

```javascript
'arthritis': {
  keywords: ['arthritis', 'rheumatoid', 'joint pain'],
  handler: 'getArthritisPatients'
}
```

Then add handler:

```javascript
async function getArthritisPatients(facilityId, query) {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('pid, patient_name, ncd_conditions, status')
      .eq('fid', facilityId)
      .ilike('ncd_conditions', '%Arthritis%')
      .limit(20)

    if (error) throw error
    
    return {
      type: 'table',
      columns: ['Patient ID', 'Name', 'Condition', 'Status'],
      data: data.map(p => ({
        'Patient ID': p.pid,
        'Name': p.patient_name || 'N/A',
        'Condition': p.ncd_conditions || 'Arthritis',
        'Status': p.status || 'Active'
      }))
    }
  } catch (error) {
    return { type: 'text', message: 'Error: ' + error.message }
  }
}
```

Add to `getHandler()` function:

```javascript
getArthritisPatients,
```

---

## Testing Checklist

- [ ] Edge Function deployed and tested
- [ ] Dashboard loads without errors
- [ ] Chatbot button visible (bottom-right)
- [ ] Chatbot opens/closes smoothly
- [ ] "Show hypertension patients" returns results
- [ ] "Antenatal patients" returns results
- [ ] "Missed appointments" returns results
- [ ] "Due for viral load" returns results
- [ ] Only facility data shown (RLS working)
- [ ] Mobile responsive
- [ ] Error handling works (missing data returns helpful message)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No NCD results | Ensure `ncd_conditions` column populated with test data |
| "Column not found" error | Run ALTER TABLE SQL to add missing columns |
| Maternal queries return nothing | Populate `pregnancy_status`, `gestational_weeks`, `lmp_date` |
| Bleeding queries empty | Set `bleeding_event = true` for test patients |
| Edge Function error | Check Supabase Functions logs for SQL errors |

---

## Files Modified

- ✅ `supabase-edge-function.js` - Added 20 new query handlers
- ✅ `chatbot-handler.js` - Updated welcome message
- ✅ `dashboard.html` - Already includes updated chatbot script

---

## Summary

**New Capabilities:**
- 40+ total supported queries
- 8 NCD types (Hypertension, Diabetes, Asthma, Cancer, Heart Disease, CKD, Mental Health, TB)
- Maternal health monitoring (Antenatal, Postnatal, Complications)
- Lab test tracking (VL, CD4, overdue tests)
- Appointment & adherence management
- Complication tracking (Bleeding, adverse events)

**Security:** All queries enforced by Supabase RLS at facility level.

**Performance:** Pattern-based (no AI API), instant results.

---

**Status:** Ready for deployment  
**Updated:** 2026-01-12
