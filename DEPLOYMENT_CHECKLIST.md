# Chatbot NCD Expansion - Deployment Checklist

Complete checklist for deploying the expanded chatbot with 40+ queries.

## 📋 Pre-Deployment

- [ ] Review CHATBOT_QUICK_START.md
- [ ] Review CHATBOT_NCD_EXPANSION.md for database schema
- [ ] Have Supabase dashboard access
- [ ] Have SQL Editor access
- [ ] Backup current database (if applicable)
- [ ] Have facility test data available

## 🚀 Phase 1: Backend Deployment (10 mins)

### Step 1: Deploy Edge Function

**Option A: Supabase Dashboard**
- [ ] Open Supabase project dashboard
- [ ] Navigate to Functions section
- [ ] Click "Create function" 
- [ ] Name it: `chatbot-query`
- [ ] Select TypeScript template
- [ ] Copy entire contents of `supabase-edge-function.js`
- [ ] Paste into function editor
- [ ] Click Deploy
- [ ] Wait for "Deployment successful" message
- [ ] Note the function URL (should be auto-generated)

**Option B: Supabase CLI**
- [ ] Open terminal in project directory
- [ ] Run: `supabase functions new chatbot-query`
- [ ] Replace generated `index.ts` with code from `supabase-edge-function.js`
- [ ] Run: `supabase functions deploy chatbot-query`
- [ ] Verify deployment success

### Step 2: Test Edge Function

- [ ] Go to Supabase Functions dashboard
- [ ] Find `chatbot-query` function
- [ ] Click on it to view details
- [ ] Click "Test" tab
- [ ] Create test request:
  ```json
  {
    "query": "appointments next week",
    "facility_id": 1
  }
  ```
- [ ] Click "Send"
- [ ] Verify successful response (should return table data or message)
- [ ] Check Logs tab for any errors
- [ ] ✅ Edge Function working

## 🗄️ Phase 2: Database Setup (5 mins)

### Step 1: Add Required Columns

- [ ] Open Supabase SQL Editor
- [ ] Run the following SQL:

```sql
-- NCD columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ncd_conditions TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_pressure TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS glucose_level NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS cancer_type TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS ckd_stage NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS tb_status TEXT;

-- Pregnancy columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS pregnancy_status TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS gestational_weeks NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS lmp_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS postnatal_days NUMERIC;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS maternal_complication BOOLEAN;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS complication_type TEXT;

-- Appointment columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_appointment_date DATE;

-- Lab columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS viral_load_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS cd4_date DATE;

-- Complication columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bleeding_event BOOLEAN;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bleeding_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bleeding_severity TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS complication_recorded BOOLEAN;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS complication_date DATE;

-- Adherence columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS adherence_level TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_refill_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_clinic_visit DATE;
```

- [ ] All columns created (check for "success" messages)
- [ ] No errors in SQL execution

### Step 2: Verify Columns Exist

- [ ] Run: `SELECT * FROM patients LIMIT 1;`
- [ ] Verify new columns visible in result
- [ ] ✅ Database schema updated

## 🎨 Phase 3: Frontend Verification (5 mins)

- [ ] Open dashboard.html in text editor
- [ ] Verify this line exists near `</body>`:
  ```html
  <script src="chatbot-handler.js"></script>
  ```
- [ ] Verify `chatbot-handler.js` file exists in same directory as dashboard.html
- [ ] Verify `supabase-config.js` exists and has valid Supabase URL/key
- [ ] ✅ Frontend files in place

## 🧪 Phase 4: Testing (15 mins)

### Step 1: Open Dashboard

- [ ] Open `dashboard.html` in web browser (Chrome/Firefox/Safari)
- [ ] Log in with test facility credentials
- [ ] Page loads without console errors
- [ ] Header shows logged-in user info

### Step 2: Locate Chatbot Button

- [ ] Look for green button in bottom-right corner
- [ ] Button has "AI" badge
- [ ] Button is visible and clickable
- [ ] ✅ Chatbot UI present

### Step 3: Test HIV Queries

- [ ] Click chatbot button → modal opens
- [ ] Test: "Appointments next week"
  - [ ] Returns table with appointments (or "No appointments")
  - [ ] Only facility data shown
- [ ] Test: "Patients on ART"
  - [ ] Returns table with ART patients
- [ ] Test: "High viral loads"
  - [ ] Returns table or "No patients with high viral load"
- [ ] ✅ HIV queries working

### Step 4: Test NCD Queries

- [ ] Test: "Hypertension patients"
  - [ ] Returns table with BP readings
- [ ] Test: "Diabetes patients"
  - [ ] Returns table with glucose levels
- [ ] Test: "Cancer patients"
  - [ ] Returns table or empty message
- [ ] Test: "Asthma"
  - [ ] Returns results
- [ ] ✅ NCD queries working

### Step 5: Test Maternal Queries

- [ ] Test: "Antenatal patients"
  - [ ] Returns pregnant patients + gestational weeks
- [ ] Test: "Postnatal patients"
  - [ ] Returns post-delivery patients
- [ ] Test: "Maternal complications"
  - [ ] Returns complications or empty message
- [ ] ✅ Maternal queries working

### Step 6: Test Lab Queries

- [ ] Test: "Due for viral load testing"
  - [ ] Returns patients needing VL test
- [ ] Test: "Due for CD4 testing"
  - [ ] Returns patients needing CD4
- [ ] Test: "Lab tests overdue"
  - [ ] Returns overdue labs
- [ ] ✅ Lab queries working

### Step 7: Test Appointment Queries

- [ ] Test: "Missed appointments"
  - [ ] Returns defaulters
- [ ] Test: "Due for clinic review"
  - [ ] Returns patients needing review
- [ ] ✅ Appointment queries working

### Step 8: Test Error Handling

- [ ] Test: "xyzabc" (nonsense query)
  - [ ] Returns helpful error message
  - [ ] Suggests valid query categories
- [ ] Test: Empty query (just hit send)
  - [ ] No error, input clears
- [ ] ✅ Error handling working

### Step 9: Test Security

- [ ] Open browser DevTools (F12)
- [ ] Check Network tab
- [ ] Query returns data for current facility ONLY
- [ ] Try to modify facility_id in localStorage
  - [ ] Should only get your facility's data (RLS enforced)
- [ ] ✅ Security verified

### Step 10: Test Mobile

- [ ] Open dashboard on mobile device
- [ ] Chatbot button visible and clickable
- [ ] Modal slides up from bottom
- [ ] Can type and send queries
- [ ] Table results readable on mobile
- [ ] ✅ Mobile responsive

## 📚 Phase 5: Documentation (5 mins)

- [ ] Read CHATBOT_ALL_QUERIES.md
- [ ] Bookmark CHATBOT_INDEX.md
- [ ] Create staff quick reference from CHATBOT_ALL_QUERIES.md
- [ ] Print/share CHATBOT_SUMMARY.txt
- [ ] ✅ Documentation reviewed

## 🎓 Phase 6: Staff Training (Optional)

- [ ] Show staff the green "AI" button
- [ ] Demonstrate 3 sample queries
- [ ] Explain facility data isolation
- [ ] Provide list of 40+ supported queries
- [ ] Answer common questions
- [ ] ✅ Staff trained

## ✅ Post-Deployment Verification

### Performance Check
- [ ] Responses come back < 2 seconds
- [ ] No timeouts observed
- [ ] Smooth animations on modal open/close

### Data Accuracy Check
- [ ] Query results match actual data
- [ ] Only facility data shown (not other facilities)
- [ ] Patient names and IDs correct
- [ ] Dates formatted correctly

### Error Logging Check
- [ ] No JavaScript console errors
- [ ] Supabase function logs show successful queries
- [ ] No "Column not found" errors in logs

### Browser Compatibility Check
- [ ] Chrome: ✅
- [ ] Firefox: ✅
- [ ] Safari: ✅
- [ ] Edge: ✅
- [ ] Mobile browsers: ✅

## 🚨 Troubleshooting (If Needed)

| Issue | Solution |
|-------|----------|
| Chatbot button not visible | Check chatbot-handler.js loaded (F12 Network tab) |
| "Column not found" error | Run ALTER TABLE SQL for missing column |
| No results for NCD queries | Check ncd_conditions column populated with data |
| Edge Function timeout | Check Supabase logs, may need to optimize query |
| CORS error | Verify Supabase CORS config, contact support if needed |
| Mobile not responsive | Clear browser cache, refresh page |

## 📦 Deployment Summary

**Components Deployed:**
- ✅ Edge Function (30 handlers)
- ✅ Frontend Chatbot UI
- ✅ Database schema (11 new columns)
- ✅ Documentation (8 guides)

**Queries Available:**
- ✅ HIV Care (9)
- ✅ NCDs (8)
- ✅ Maternal Health (3)
- ✅ Lab Testing (3)
- ✅ Appointments (3)
- ✅ Complications (2)
- ✅ Adherence (2)
- ✅ Status (1)
- **Total: 40+ queries**

**Security Verified:**
- ✅ Facility-level RLS enforced
- ✅ Server-side pattern matching
- ✅ HTTPS encrypted
- ✅ API keys protected

## 🎉 Deployment Complete!

When all checkboxes above are checked, your chatbot is ready for production use.

**Next Steps:**
1. Monitor chatbot usage patterns
2. Gather staff feedback
3. Add more NCD patterns based on local diseases
4. Plan for Phase 2 enhancements (AI, exports, etc.)

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Facility:** ___________  
**Status:** ☐ Complete ☐ In Progress ☐ Not Started

---

**Questions?** Check the documentation files:
- CHATBOT_QUICK_START.md
- CHATBOT_SETUP_GUIDE.md
- CHATBOT_ALL_QUERIES.md
